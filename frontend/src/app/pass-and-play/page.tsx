"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Share2, Flag }  from "lucide-react";

import Game from "@/chess/game";
import Engine from "@/chess/engine";

import useSettings from "@/hooks/use-settings";

import Navbar        from "@/components/navbar";
import ChessBoard    from "@/components/chessBoard";
import PlayerDetails from "@/components/playerDetails";
import EvaluationBar from "@/components/evaulationBar";
import { ActionBar, ActionBarButton }                    from "@/components/actionBar";
import { PromotionModal, GameEndModal, GameShareModal }  from "@/components/modals";
import { Panel, PanelContent, PanelBottom, PanelButton } from "@/components/panel";
import { HorizontalMoveNotations, TabularMoveNotaions }  from "@/components/moveNotations";


export default function PassAndPlay() {
  const [, setVersion] = useState(0); // manually trigger re renders

  const update = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  const gameRef    = useRef<Game>(new Game(update, false));
  const [settings] = useSettings("pass_and_play", gameRef);
  const game: Game = gameRef.current;
  
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<number[] | null>(null);
  const [gameEndModalClosed, setGameEndModalClosed] = useState(false);
  const [gameShareModalOpen, setGameShareModalOpen] = useState(false);

  const lastPeek = useRef(0);

  // add stockfish to game for evaluation only when loaded client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      let worker: Worker | undefined;

      async function initEngine() {
        try {
          worker = new Worker("/stockfish-2.js");
          game.engine = new Engine(worker, 10, 1, () => {
            game.engine?.print();
            update();
          });
          await game.engine.init();
        }
        catch (error) {
          console.log(error);
          worker = undefined;
        }
      }

      initEngine();

      return () => {
        // Cleanup worker and engine on unmount
        game.engine = undefined;
        worker?.terminate();
      };
    }
  }, [update, game]);

  // forward or backward moves using arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showPromotionModal === true) return; // Dont allow when promotion modal is open
      
      const now = Date.now();
      if (now - lastPeek.current < 60) return; // Enforce cooldown

      if      (event.key === "ArrowLeft")  gameRef.current.backward();
      else if (event.key === "ArrowRight") gameRef.current.forward();

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
  };

  const promotion = (piece: "Queen" | "Knight" | "Rook" | "Bishop") => {
    const pieceCode = {
      "Queen":  300,
      "Knight": 301,
      "Rook":   302,
      "Bishop": 303,
    };

    game.select([promotionTarget![0], promotionTarget![1], pieceCode[piece]]);

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
        peek={game.peek.bind(game)}
      />

      <EvaluationBar
        visible={game.state !== "ongoing"}
        variant="horizontal"
        className="lg:hidden w-full border-0 border-b-2 border-border"
        evaluation={game.engine?.evaluation[0]}
        mateIn={game.engine?.mateIn[0]}
      />


      {/* Main */}
      <main
        className="
          flex min-h-[calc(100vh-60px-40px-60px)]
          max-h-[calc(100vh-60px-40px-60px)]
          lg:min-h-[calc(100vh-60px)]
          lg:max-h-[calc(100vh-60px)]
          justify-center items-center
        "
      >
        <EvaluationBar
          visible={game.state !== "ongoing"}
          variant="vertical"
          className="
            hidden lg:block shadow-lg border-border border-2
            h-[min(100vw,calc(81/100*(100vh-60px-40px-60px)))]
            lg:h-[min(100vw,calc(81/100*(100vh-60px)))]
          "
          evaluation={game.engine?.evaluation[0]}
          mateIn={game.engine?.mateIn[0]}
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
              w-[min(96%,calc(80/100*(100vh-60px-40px-60px)))]
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

            isRotated={settings.boardRotates && game.board.turn === 'b'}
            isFlipped={false}

            onclick={click}
            className="
              lg:mx-2 select-none shadow-xl
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
              w-[min(96%,calc(80/100*(100vh-60px-40px-60px)))]
              lg:w-[min(90%,calc(90/100*(100vh-60px)))]
            "
          />
        </div>


        {/* Side Panel */}
        <Panel title="Pass And Play" className="hidden lg:flex w-[27.5%] 2xl:w-[30%] h-[96%] border-border border-2 shadow-lg">
          <PanelContent>
            <TabularMoveNotaions
              className="h-full text-foreground border-t-2"
              notations={game.moveNotations}
              moveNo={game.moveNo}
              peek={game.peek.bind(game)}
            />
          </PanelContent>

          <PanelBottom>
            <PanelButton tooltip="Resign"><Flag strokeWidth={3} /></PanelButton>
            <PanelButton tooltip="Export PGN/FEN" onClick={() => {setGameShareModalOpen(true);}}><Share2 strokeWidth={3} /></PanelButton>
            <PanelButton tooltip="Backward" onClick={game.backward.bind(game)}><ChevronLeft  strokeWidth={5} /></PanelButton>
            <PanelButton tooltip="Forward"  onClick={game.forward.bind(game) }><ChevronRight strokeWidth={5} /></PanelButton>
          </PanelBottom>
        </Panel>
      </main>


      <ActionBar
        className="lg:hidden h-[60px]"
      >
        <ActionBarButton className="border-r-2 border-border">
          <Flag />
        </ActionBarButton>

        <ActionBarButton onClick={() => {setGameShareModalOpen(true);}} className="border-r-2 border-border">
          <Share2 />
        </ActionBarButton>

        <ActionBarButton onClick={game.backward.bind(game)} className="border-r-2 border-border">
          <ChevronLeft strokeWidth={3} className="scale-110" />
        </ActionBarButton>

        <ActionBarButton onClick={game.forward.bind(game)}>
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
