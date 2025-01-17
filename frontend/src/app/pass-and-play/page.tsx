"use client"
import { useState, useEffect, useRef } from "react";
import "../../../public/fonts.css"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Table, TableHeader, TableHead, TableBody, TableRow, TableCell} from "@/components/ui/table"
import Navbar from "@/components/navbar"

import {ChevronLeft, ChevronRight} from "lucide-react"

import Game from "@/chess/game"
import ChessBoard from "@/components/board"

export default function PassAndPlay() {
  const [game, setGame] = useState(new Game(null));
  const [version, setVersion] = useState(0); // manually trigger re renders
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);
  const [dialogClosed, setDialogClosed] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [evaluation, setEvaluation] = useState(game.evaluation);

  // Update evaluation whenever game updates
  useEffect(() => {
    const interval = setInterval(() => {
      if(evaluation > 1000) console.log("Evaluation: ", evaluation); // since it currently has no use
      setEvaluation(game.evaluation);
    }, 100); // Adjust frequency as needed

    return () => clearInterval(interval);
  }, [game]);

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

      <div className="flex justify-center gap-6 2xl:gap-12 h-[90%] items-center">
        <div className="w-10 hidden lg:block" style={{height:"min(90vw, 75vh)", maxHeight: "75vh"}}>
          <div 
            className={`bg-black`}
            style={{
              height: `${100 - Math.trunc((game.evaluation + 10) / 20 * 100)}%`,
              transition: "height 0.3 ease"
            }}
          ></div>
          <div
            className={`bg-white`}
            style={{
              height: `${Math.trunc((game.evaluation + 10) / 20 * 100)}%`,
              transition: "height 0.3 ease"
            }}
          ></div>
        </div>
        
        <ChessBoard game={game} onclick={click} style={{
          aspectRatio: "1 / 1",     // Maintain square aspect ratio
          width: "min(90vw, 75vh)", // Ensure it fits within both width and height
          maxWidth: "90vw",         // Avoid overflowing horizontally
          maxHeight: "75vh",        // Avoid overflowing vertically
        }} />

        <Card className="hidden lg:flex lg:flex-col lg:justify-center w-[25%] h-[85%] rounded-sm border-none shadow-2xl">
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
                    const moves: {white?: string, black?: string}[] = [];
                    let whiteMove = true;

                    game.moveNotations.map((notation) => {
                      if (whiteMove) moves.push({white: notation});
                      else           moves[moves.length - 1].black = notation;
                      whiteMove = !whiteMove;
                    })
                    return (moves.map((obj, index) => {
                      return (
                        <TableRow key={`move-${index+1}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{obj.white}</TableCell>
                          {obj.black && <TableCell>{obj.black}</TableCell>}
                        </TableRow>
                      );
                    }))
                  })()
                  }
                </TableBody>
              </Table>
            </div>
            <div className="h-[12.5%] bg-card-foreground flex justify-around items-center text-foreground font-bold text-lg p-0">
              <Button className="h-[45%] w-[25%]">
                <ChevronLeft />
              </Button>
              <Button className="h-[45%] w-[25%]">
                <ChevronRight />
              </Button>
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
