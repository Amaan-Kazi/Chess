"use client";
import { useState, useEffect, useRef }             from "react";
import { ChevronLeft, ChevronRight, Share2, Flag } from "lucide-react";
import Game from "@/chess/game";

import Navbar        from "@/components/navbar";
import ChessBoard    from "@/components/chessBoard";
import PlayerDetails from "@/components/playerDetails";
import EvaluationBar from "@/components/evaulationBar";
import { ActionBar, ActionBarButton }                    from "@/components/actionBar";
import { PromotionModal, GameEndModal, GameShareModal }  from "@/components/modals";
import { Panel, PanelContent, PanelBottom, PanelButton } from "@/components/panel";
import { HorizontalMoveNotations, TabularMoveNotaions }  from "@/components/moveNotations";

import { useMediaQuery } from "react-responsive";


export default function PassAndPlay() {
  const isSmallScreen = useMediaQuery({ maxWidth: 1279 });
  const [game, setGame] = useState(new Game(undefined));
  const [version, setVersion] = useState(0); // manually trigger re renders
  const [settings, setSettings] = useState({white: 'White', black: 'Black', boardRotates: isSmallScreen, flipPiece: false, allowUndo: true});
  
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);
  const [gameEndModalClosed, setGameEndModalClosed] = useState(false);
  const [gameShareModalOpen, setGameShareModalOpen] = useState(false);
  
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

  // add stockfish to game for evaluation only when loaded client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      let worker: Worker | undefined;

      try {
        worker = new Worker("/stockfish.js");
      }
      catch (error) {
        console.log(error);
        worker = undefined;
      }

      const gameInstance = new Game(worker);
      setGame(gameInstance);

      return () => {
        worker?.terminate(); // Clean up worker on unmount
      };
    }
  }, []);

  // load game settings from local storage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("PassAndPlay") || "{}").settings;
    
    if (savedSettings !== undefined) setSettings(savedSettings);
    else setSettings({white: 'White', black: 'Black', boardRotates: isSmallScreen, flipPiece: false, allowUndo: true});

    game.whitePlayer = savedSettings.white;
    game.blackPlayer = savedSettings.black;

    console.log(settings);
    setGame(game);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // forward or backward moves using arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showPromotionModal === true) return; // Dont allow when promotion modal is open
      
      const now = Date.now();
      if (now - lastPeek.current < 60) return; // Enforce cooldown

      if (event.key === "ArrowLeft") {
        game.backward();
        setVersion((v) => v + 1);
      }
      else if (event.key === "ArrowRight") {
        game.forward();
        setVersion((v) => v + 1);
      }

      lastPeek.current = now;
    };

    // Add event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const promotion = (piece: "Queen" | "Knight" | "Rook" | "Bishop") => {
    const pieceCode = {
      "Queen":  300,
      "Knight": 301,
      "Rook":   302,
      "Bishop": 303,
    };

    game.select([promotionTarget![0], promotionTarget![1], pieceCode[piece]]);
    setVersion(version + 1);

    setShowPromotionModal(false);
    setPromotionTarget(null);
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar activePage="Pass And Play"/>

      <HorizontalMoveNotations
        className="lg:hidden border-y-2 border-border"
        notations={game.moveNotations}
        moveNo={game.moveNo}
        peek={(index: number) => {
          game.peek(index);
          setVersion(version+1);
        }}
      />

      <EvaluationBar
        visible={game.state !== "ongoing"}
        variant="horizontal"
        className="lg:hidden w-full border-0 border-b-2 border-border"
        evaluation={evaluation}
        mateIn={mateIn}
      />


      {/* Main */}
      <main className="flex min-h-[calc(100vh-60px-40px-60px)] max-h-[calc(100vh-60px-40px-60px)] lg:min-h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)] justify-center items-center">
        <EvaluationBar
          visible={game.state !== "ongoing"}
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
          flex flex-col items-center lg:items-normal
          w-[min(100%,calc(90/100*(100vh-60px-40px-60px)))]
          lg:w-[min(100%,calc(90/100*(100vh-60px)))]
        ">
          <PlayerDetails
            variant="player"
            name={game.blackPlayer}
            
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
            grid={game.board.grid}
            idGrid={game.board.idGrid}
            turn={game.board.turn}

            prevMove={game.board.prevMove}
            selection={game.selection}
            validMoves={game.validMoves}

            isCheck={game.board.isCheck(game.board.turn)}

            onclick={click}
            className="
              m-2 lg:mx-2 select-none shadow-xl
              w-[min(96%,calc(90/100*(100vh-60px-40px-60px-60px)))]
              lg:w-[min(90%,calc(90/100*(100vh-60px)))]
            "
          />

          <PlayerDetails
            variant="player"
            name={game.whitePlayer}

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
            <PanelButton tooltip="Export PGN/FEN" onClick={() => {setGameShareModalOpen(true); setVersion(version + 1);}}><Share2 strokeWidth={3} /></PanelButton>
            <PanelButton tooltip="Backward" onClick={() => {game.backward(); setVersion(version + 1);}}><ChevronLeft  strokeWidth={5} /></PanelButton>
            <PanelButton tooltip="Forward"  onClick={() => {game.forward();  setVersion(version + 1);}}><ChevronRight strokeWidth={5} /></PanelButton>
          </PanelBottom>
        </Panel>
      </main>


      <ActionBar
        className="lg:hidden h-[60px]"
      >
        <ActionBarButton className="border-r-2 border-border">
          <Flag />
        </ActionBarButton>

        <ActionBarButton onClick={() => {setGameShareModalOpen(true); setVersion(version + 1);}} className="border-r-2 border-border">
          <Share2 />
        </ActionBarButton>

        <ActionBarButton onClick={() => {game.backward(); setVersion(version + 1);}} className="border-r-2 border-border">
          <ChevronLeft strokeWidth={3} className="scale-110" />
        </ActionBarButton>

        <ActionBarButton onClick={() => {game.forward();  setVersion(version + 1);}}>
          <ChevronRight strokeWidth={3} className="scale-110"/>
        </ActionBarButton>
      </ActionBar>


      <GameShareModal
        FEN={game.board.FEN()}
        PGN={game.PGN(game.whitePlayer, game.blackPlayer)}
        isOpen={gameShareModalOpen}
        onOpenChange={() => {setGameShareModalOpen(false)}}
        className="shadow-lg border-border border-2"
      />

      <GameEndModal
        isOpen={game.state !== "ongoing" && !gameEndModalClosed}
        onOpenChange={() => {setGameEndModalClosed(true)}}
        title={game.state.toUpperCase()}
        description={game.stateDescription}
      />

      <PromotionModal 
        isOpen={showPromotionModal}
        onSelection={(piece: "Queen" | "Knight" | "Rook" | "Bishop") => {promotion(piece)}}
        turn={game.board.turn}
      />
    </div>
  )
}
