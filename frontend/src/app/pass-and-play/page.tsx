"use client";
import { useState, useEffect, useRef }             from "react";
import { ChevronLeft, ChevronRight, Share2, Flag } from "lucide-react";

import { Button }                                                              from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent }           from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Navbar        from "@/components/navbar";
import Game          from "@/chess/game";
import ChessBoard    from "@/components/board";
import PlayerDetails from "@/components/playerDetails";
import EvaluationBar from "@/components/evaulationBar";
import { Panel, PanelContent, PanelBottom, PanelButton } from "@/components/panel";
import { HorizontalMoveNotations, TabularMoveNotaions } from "@/components/moveNotations";


export default function PassAndPlay() {
  const [game, setGame] = useState(new Game(null));
  const [version, setVersion] = useState(0); // manually trigger re renders
  const [settings, setSettings] = useState({white: 'White', black: 'Black', flipBoard: true, flipPiece: false, allowUndo: true});
  
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);
  const [dialogClosed, setDialogClosed] = useState(false);
  
  const [evaluation, setEvaluation] = useState(game.evaluation);
  const [mateIn, setMateIn] = useState(game.mateIn);

  const lastPeek = useRef(0);

  // Update evaluation whenever game updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEvaluation(game.evaluation);
      setMateIn(game.mateIn);
    }, 100); // Re render every 100ms

    return () => clearInterval(interval);
  }, [game]);

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
      setGame(gameInstance);

      return () => {
        worker?.terminate(); // Clean up worker on unmount
      };
    }
  }, []);

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("PassAndPlay") || "{}").settings;
    
    if (savedSettings !== undefined) setSettings(savedSettings);
    else setSettings({white: 'White', black: 'Black', flipBoard: true, flipPiece: false, allowUndo: true});
    
    console.log(savedSettings);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastPeek.current < 150) return; // Enforce cooldown

      if (event.key === "ArrowLeft") {
        game.backward();
        setVersion(version+1);
      } else if (event.key === "ArrowRight") {
        game.forward();
        setVersion(version+1);
      }

      lastPeek.current = now;
    };

    // Add event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, version]); // Dependency ensures it updates if `game` changes

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
    <div className="flex flex-col h-screen">
      <Navbar activePage="Pass And Play"/>

      <HorizontalMoveNotations
        className="lg:hidden"
        notations={game.moveNotations}
        moveNo={game.moveNo}
        peek={(index: number) => {
          game.peek(index);
          setVersion(version+1);
        }}
      />

      {/* Promotion Modal */}
      <div className={`absolute z-50 flex w-screen h-screen justify-center items-center shadow-md ${!showPromotionModal && "hidden"}`}>
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


      {/* Main */}
      <main className="flex min-h-[calc(100vh-60px-40px-60px)] max-h-[calc(100vh-60px-40px-60px)] lg:min-h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)] justify-center items-center">
        <EvaluationBar
          variant="vertical"
          className="
            hidden lg:block shadow-lg border-border border-2
            h-[min(100vw,calc(81/100*(100vh-60px-40px-60px)))]
            lg:h-[min(100vw,calc(81/100*(100vh-60px)))]
          "
          evaluation={evaluation}
          mateIn={mateIn}
        />
        
        <div className="
          w-[min(100%,calc(90/100*(100vh-60px-40px-60px)))]
          lg:w-[min(100%,calc(90/100*(100vh-60px)))]
        ">
          <PlayerDetails
            variant="player"
            name={settings.black}
            
            grid={game.board.grid}
            color='b'
            isActive={game.board.turn === 'b'}

            className="
              m-2
              h-[calc(6/100*(100vh-60px))]
              w-[min(96%,calc(90/100*(100vh-60px-40px-60px)))]
              lg:w-[min(90%,calc(90/100*(100vh-60px)))]
            "
          />
          
          <ChessBoard
            game={game}
            onclick={click}
            className="
              m-2 lg:mx-2 select-none shadow-xl
              w-[min(96%,calc(90/100*(100vh-60px-40px-60px)))]
              lg:w-[min(90%,calc(90/100*(100vh-60px)))]
            "
          />

          <PlayerDetails
            variant="player"
            name={settings.white}

            grid={game.board.grid}
            isActive={game.board.turn === 'w'}
            color='w'

            className="
              m-2
              h-[calc(6/100*(100vh-60px))]
              w-[min(96%,calc(90/100*(100vh-60px-40px-60px)))]
              lg:w-[min(90%,calc(90/100*(100vh-60px)))]
            "
          />
        </div>


        {/* Side Panel */}
        <Panel title="Pass And Play" className="hidden lg:flex w-[25%] h-[81.75%] max-h-[81.75%] border-border border-2 shadow-lg">
          <PanelContent>
            <TabularMoveNotaions
              className="h-full text-foreground border-t-2"
              notations={game.moveNotations}
              moveNo={game.moveNo}
              peek={(index: number) => {
                game.peek(index);
                setVersion(version+1);
              }}
            />
          </PanelContent>

          <PanelBottom>
            <PanelButton tooltip="Resign"><Flag strokeWidth={3} /></PanelButton>
            <PanelButton tooltip="Export PGN/FEN"><Share2 strokeWidth={3} /></PanelButton>
            <PanelButton tooltip="Backward" onClick={() => {game.backward(); setVersion(version + 1);}}><ChevronLeft strokeWidth={5} /></PanelButton>
            <PanelButton tooltip="Forward"  onClick={() => {game.forward();  setVersion(version + 1);}}><ChevronRight strokeWidth={5} /></PanelButton>
          </PanelBottom>
        </Panel>
      </main>


      {/* Game End Dialog */}
      <Dialog open={game.state !== "ongoing" && !dialogClosed} onOpenChange={() => {setDialogClosed(true)}}>
        <DialogContent className="w-[90%] md:max-w-[50%] lg:max-w-[35%] px-10">
          <DialogHeader>
            <DialogTitle className="text-5xl font-academiaM54 tracking-wider font-thin text-center">{game.state.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-center text-3xl text-primary">{game.stateDescription}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>


      <div className="lg:hidden bg-secondary dark:bg-[#181716] h-[60px] flex items-center overflow-x-scroll">
        Menu
      </div>
    </div>
  )
}
