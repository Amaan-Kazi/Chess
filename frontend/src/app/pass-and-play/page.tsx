"use client"
import { useState, useEffect, useRef } from "react";
import "../../../public/fonts.css"
import {ChevronLeft, ChevronRight, Share2, Flag} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import Navbar from "@/components/navbar"
import Game from "@/chess/game"
import ChessBoard from "@/components/board"


export default function PassAndPlay() {
  const [game, setGame] = useState(new Game(null));
  const [version, setVersion] = useState(0); // manually trigger re renders
  
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);
  const [dialogClosed, setDialogClosed] = useState(false);
  
  const [evaluation, setEvaluation] = useState(game.evaluation);
  const [mateIn, setMateIn] = useState(game.mateIn);

  // Update evaluation whenever game updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEvaluation(game.evaluation);
      setMateIn(game.mateIn);
    }, 100); // Re render every 100ms

    return () => clearInterval(interval);
  }, [game]);

  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tableRef.current) {
      // Scroll to the bottom after each move
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [version]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize the Stockfish worker
      let worker: Worker | null;
      try {
        worker = new Worker("/stockfish.js");
      } catch (error) {
        console.log(error);
        worker = null;
      }

      // Pass the worker to the Game class
      const gameInstance = new Game(worker);

      // Set the game instance in state
      setGame(gameInstance);

      return () => {
        worker?.terminate(); // Clean up worker on unmount
      };
    }
  }, []);

  const click = (row: number, col: number) => {
    // Pawn Promotion
    if (game.selection !== null) {
      if (row === (game.board.turn === 'w' ? 0 : 7) && game.board.grid[game.selection![0]][game.selection![1]] === (game.board.turn === 'w' ? 'P' : 'p')) {
        for (const [r, c] of game.validMoves) {
          if (r === row && c === col) {
            setPromotionTarget([row, col]);
            setShowPromotionModal(true);
            return;
          }
        }
      }
    }

    game.select([row, col, 999]);
    setVersion(version + 1);
  };

  const promotion = (piece: string) => {
    const pieceCode = {
      "Queen":  300,
      "Knight": 301,
      "Rook":   302,
      "Bishop": 303,
    };

    game.select([promotionTarget![0], promotionTarget![1], pieceCode[piece as keyof typeof pieceCode]]);
    setVersion(version + 1);

    setShowPromotionModal(false);
    setPromotionTarget(null);
  }

  return (
    <div className="block h-screen max-h-screen">
      <Navbar activePage="Pass And Play"/>
      
      {/* Promotion Modal */}
      <div className={`absolute z-10 flex w-screen h-[90%] justify-center items-center shadow-md ${!showPromotionModal && "hidden"}`}>
        <Card className="max-w-[80%]">
          <CardHeader>
            <CardTitle className="text-foreground">Pawn Promotion</CardTitle>
            <CardDescription>Select a piece to promote to</CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Queen")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wq' : 'bq'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Knight")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wn' : 'bn'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Rook")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wr' : 'br'}.png`}
                alt="Chess Piece"
              />
            </Button>
            <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {promotion("Bishop")}}>
              <img
                src={`/chess/pieces/${game.board.turn === 'w' ? 'wb' : 'bb'}.png`}
                alt="Chess Piece"
              />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center h-[90%] items-center">
        <div className="w-[30px] hidden lg:block shadow-md" style={{height:"min(90vw, 75vh)", maxHeight: "75vh"}}>
          <div 
            className={`bg-[hsl(34,6%,24%)] text-white flex flex-col justify-start items-center text-xs`}
            style={{
              height: `${100 - Math.trunc((game.evaluation + 10) / 20 * 100)}%`,
              transition: "height 0.75s ease-in-out"
            }}
          >
            {evaluation < 0 && (mateIn !== null ? mateIn === 0 ? <p>0-1</p> : <p>{`M${mateIn}`}</p> : <p>{`${Math.abs(evaluation).toFixed(1)}`}</p>)}
          </div>
          <div
            className={`bg-white text-black flex flex-col justify-end items-center text-xs`}
            style={{
              height: `${Math.trunc((game.evaluation + 10) / 20 * 100)}%`,
              transition: "height 0.75s ease-in-out"
            }}
          >
            {evaluation > 0 && (mateIn !== null ? mateIn === 0 ? <p>1-0</p> : <p>{`M${mateIn}`}</p> : <p>{`${Math.abs(evaluation).toFixed(1)}`}</p>)}
          </div>
        </div>
        
        <ChessBoard game={game} onclick={click} style={{
          aspectRatio: "1 / 1",     // Maintain square aspect ratio
          width: "min(90vw, 75vh)", // Ensure it fits within both width and height
          maxWidth: "90vw",         // Avoid overflowing horizontally
          maxHeight: "75vh",        // Avoid overflowing vertically
        }} />

        <Card className="hidden ml-10 lg:flex lg:flex-col lg:justify-center w-[25%] h-[84%] rounded-sm border-none shadow-2xl">
          <CardTitle className="p-2 bg-card-foreground flex justify-center items-center text-foreground font-bold text-lg">Pass And Play</CardTitle>
          <CardContent className="h-full p-0 w-full">
            <div className="h-[25%] w-full text-foreground">Chart</div>
            {/* Limit algebraic notation to 25% if chat box below */}
            <div ref={tableRef} className="h-[62.5%] max-h-[62.5%] text-foreground overflow-y-scroll border-t-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Move</TableHead>
                    <TableHead>White</TableHead>
                    <TableHead>Black</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {( () => {
                    const moves: {white?: string, black?: string, isWhiteMoveCurrent?: boolean, isBlackMoveCurrent?: boolean}[] = [];
                    let whiteMove = true;

                    game.moveNotations.map((notation, index) => {
                      if (whiteMove) {
                        let isWhiteMoveCurrent = false;
                        if (index === game.moveNo - 1) isWhiteMoveCurrent = true;

                        moves.push({white: notation, isWhiteMoveCurrent});
                      }
                      else {
                        let isBlackMoveCurrent = false;
                        if (index === game.moveNo - 1) isBlackMoveCurrent = true;
                        
                        moves[moves.length - 1].black = notation;
                        moves[moves.length - 1].isBlackMoveCurrent = isBlackMoveCurrent;
                      }
                      whiteMove = !whiteMove;
                    })
                    return (moves.map((obj, index) => {
                      return (
                        <TableRow key={`move-${index+1}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <p
                              className={`${obj.isWhiteMoveCurrent && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white w-fit px-3`}
                              onClick={() => {
                                game.peek(((index + 1) * 2) - 1);
                                setVersion(version + 1)
                              }}
                            >{obj.white}</p>
                          </TableCell>
                          {obj.black && <TableCell>
                            <p 
                              className={`${obj.isBlackMoveCurrent && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white w-fit px-3`}
                              onClick={() => {
                                game.peek((index + 1) * 2);
                                setVersion(version + 1)
                              }}
                            >{obj.black}</p>
                          </TableCell>}
                        </TableRow>
                      );
                    }))
                  })()
                  }
                </TableBody>
              </Table>
            </div>
            <div className="h-[12.5%] bg-card-foreground flex justify-center gap-3 items-center text-foreground font-bold text-lg p-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="px-6 2xl:px-8" variant="outline" size="lg">
                      <Flag strokeWidth={3} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resign</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="px-6 2xl:px-8" variant="outline" size="lg">
                      <Share2 strokeWidth={3} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export PGN/FEN</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="px-6 2xl:px-8" variant="outline" size="lg" onClick={() => {game.backward(); setVersion(version + 1);}}>
                      <ChevronLeft strokeWidth={5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Backward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="px-6 2xl:px-8" variant="outline" size="lg" onClick={() => {game.forward(); setVersion(version + 1);}}>
                      <ChevronRight strokeWidth={5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Forward</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={game.state !== "ongoing" && !dialogClosed} onOpenChange={() => {setDialogClosed(true)}}>
        <DialogContent className="w-[90%] md:max-w-[50%] lg:max-w-[35%] px-10">
          <DialogHeader>
            <DialogTitle className="text-5xl font-academiaM54 tracking-wider font-thin text-center">{game.state.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-center text-3xl text-primary">{game.stateDescription}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
