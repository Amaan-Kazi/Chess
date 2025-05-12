import React, { ReactElement, useRef, useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

interface SquareInterface {
  row: number, 
  col: number,

  isRotated: boolean,
  isFlipped: boolean,
  
  turnedOver?: boolean,
  isValidMove: boolean,
  isDarkSquare: boolean

  backgroundColor: string,
  pieceKey: string | null,

  onclick: (row: number, col: number) => void,
  setIsAnimating?:(bool: boolean) => void,
}

function Square({row, col, isRotated, isFlipped, turnedOver, isValidMove, isDarkSquare, backgroundColor, pieceKey, onclick, setIsAnimating}: SquareInterface) {
  const {setNodeRef} = useDroppable({
    id: `square-${row}-${col}`
  });

  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <motion.div
      key={`square-${row}-${col}`}
      ref={setNodeRef}
      onClick={() => {if (!turnedOver) onclick(row, col)}}
      className={`
        relative flex justify-center items-center z-10 ${backgroundColor}
        ${(row == 0 && col == 0) ? isFlipped ? "rounded-br-sm" : "rounded-tl-sm" : ""}
        ${(row == 0 && col == 7) ? isFlipped ? "rounded-bl-sm" : "rounded-tr-sm" : ""}
        ${(row == 7 && col == 0) ? isFlipped ? "rounded-tr-sm" : "rounded-bl-sm" : ""}
        ${(row == 7 && col == 7) ? isFlipped ? "rounded-tl-sm" : "rounded-br-sm" : ""}
      `}
      animate={{
        rotateX: turnedOver ? 180 : 0,
        rotateY: turnedOver ? 180 : 0,
        opacity: turnedOver ? 0   : 100,
        visibility: turnedOver ? "hidden" : "visible",
      }}
      onAnimationComplete={() => {
        if (row == 7 && col == 7) {setIsAnimating?.(false)}
      }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
        delay: (row + col) * 0.1, // Creates a staggered effect
      }}
      style={{
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Overlay a semi-transparent circle */}
      {isValidMove && !pieceKey && (
        <div
          className="absolute rounded-full"
          style={{
            width: "35%",
            height: "35%",
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Semi-transparent black circle
          }}
        />
      )}

      {/* Overlay a semi-transparent donut if there's a piece */}
      {isValidMove && pieceKey && (
        <div
          className="absolute rounded-full"
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            boxShadow: "inset 0 0 0 5px rgba(0, 0, 0, 0.2)", // Semi-transparent donut effect
          }}
        />
      )}

      { isRotated
        ? isFlipped
          ? row == 7 && <div className={`rotate-180 absolute -top-px    left-px  text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{cols[col]}</div>
          : row == 0 && <div className={`rotate-180 absolute -top-px    left-px  text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{cols[col]}</div>
        : isFlipped
          ? row == 0 && <div className={`rotate-0   absolute -bottom-px right-px text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{cols[col]}</div>
          : row == 7 && <div className={`rotate-0   absolute -bottom-px right-px text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{cols[col]}</div>
      }
      { isRotated
        ? isFlipped
          ? col == 0 && <div className={`rotate-180 absolute -bottom-px right-px text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{rows[row]}</div>
          : col == 7 && <div className={`rotate-180 absolute -bottom-px right-px text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{rows[row]}</div>
        : isFlipped
          ? col == 7 && <div className={`rotate-0   absolute -top-px    left-px  text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{rows[row]}</div>
          : col == 0 && <div className={`rotate-0   absolute -top-px    left-px  text-xs md:text-sm font-semibold ${isDarkSquare ? "text-board-light" : "text-board-dark"}`}>{rows[row]}</div>
      }
    </motion.div>
  );
}


interface PieceInterface {
  row: number,
  col: number,

  idGrid: Uint8Array,
  piece: string,

  isRotated: boolean,
  isFlipped: boolean,

  isDragged: boolean,
  squareSize: number,
  turnedOver?: boolean
}

function Piece({row, col, idGrid, piece, isRotated, isFlipped, isDragged, squareSize, turnedOver}: PieceInterface) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `square-${row}-${col}`,
  });

  const top  = isFlipped ? (7 - row) * squareSize : row * squareSize;
  const left = isFlipped ? (7 - col) * squareSize : col * squareSize;

  const pieces = {
    p: "bp",
    n: "bn",
    b: "bb",
    r: "br",
    q: "bq",
    k: "bk",
    P: "wp",
    N: "wn",
    B: "wb",
    R: "wr",
    Q: "wq",
    K: "wk",
  };

  return (
    <motion.div
      key={`${idGrid[row * 8 + col]}`}
      ref={setNodeRef}
      className="absolute z-50 touch-none"

      style={{
        width:  squareSize,
        height: squareSize,
        top,
        left,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}

      animate={{
        top,
        left,
        opacity: turnedOver ? 0 : 1
      }}

      transition={{
        duration: isDragged ? 0 : 0.05,
        ease: "linear"
      }}

      {...listeners}
      {...attributes}
    >
      <img
        src={`chess/pieces/${pieces[piece as keyof typeof pieces]}.png`}
        alt={piece}

        className={isRotated ? "rotate-180" : ""}

        style={{
          width:  squareSize,
          height: squareSize,
        }}
      />
    </motion.div>
  );
}


interface BoardInterface {
  grid: (string | null)[][],
  idGrid: Uint8Array,
  turn: 'w' | 'b',

  prevMove: number[][],
  selection: number[] | null,
  validMoves: number[][],
  isCheck: boolean,

  onclick: (row: number, col: number) => void,
  
  turnedOver?: boolean,
  setIsAnimating?:(bool: boolean) => void,

  isRotated: boolean,
  isFlipped: boolean,
  
  className?: string,
  style?: React.CSSProperties,
  children?: ReactElement
};

export default function ChessBoard({ grid, idGrid, turn, prevMove, selection, validMoves, isCheck, onclick, turnedOver, setIsAnimating, isRotated, isFlipped, className, style, children }: BoardInterface) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(0);
  const isDragRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {setMounted(true)}, []);

  useEffect(() => {
    const resize = () => {
      if (boardRef.current) {
        setSquareSize(boardRef.current.offsetWidth / 8);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    
    return () => window.removeEventListener("resize", resize);
  }, [mounted]);

  const click = (row: number, col: number) => {
    if (isDragRef.current) return;
    onclick(row, col);
  }
  
  return (
    <DndContext
      onDragStart={(event) => {
        const [, row, col] = String(event.active.id).split("-");
        isDragRef.current = true;
        onclick(Number(row), Number(col));
      }}
      onDragEnd={(event) => {
        if (event.over){
          const [, row, col] = String(event.over.id).split("-");
          onclick(Number(row), Number(col));
        }
        
        // Reset on next tick to not interfere with the onclick
        setTimeout(() => { isDragRef.current = false }, 0);
      }}
    >
      <div
        ref={boardRef}
        className={`relative grid grid-cols-8 grid-rows-8 aspect-square ${className}`}
        style={style}
      >
        {Array.from({ length: 8 * 8 }).map((_, index) => {
          const row = isFlipped ? 7 - Math.floor(index / 8) : Math.floor(index / 8);
          const col = isFlipped ? 7 - (index % 8) : index % 8;
          const isDarkSquare = (row + col) % 2 === 1;
          const pieceKey = grid[row][col];

          // Check if the current square is a valid move
          const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
          let isSelected = false;
          let isPrevMove = false;

          if (selection) {
            const [r, c] = selection;
            isSelected = (r === row) && (c === col);
          }

          if (prevMove.length !== 0) {
            const [from, to]     = prevMove;
            const [rFrom, cFrom] = from;
            const [rTo, cTo]     = to;
            isPrevMove = (rFrom === row && cFrom === col) || (rTo === row && cTo === col);
          }

          let backgroundColor = "";
          
          if      (isDarkSquare  && !(isSelected || isPrevMove)) backgroundColor = "bg-board-dark"; // Dark Square
          else if (!isDarkSquare && !(isSelected || isPrevMove)) backgroundColor = "bg-board-light"; // Light square

          if (isCheck && ((grid[row][col] === 'K' && turn === 'w') || (grid[row][col] === 'k' && turn === 'b'))) {
            // King Check
            if (isDarkSquare) backgroundColor = "bg-board-dark-danger";
            else              backgroundColor = "bg-board-light-danger";
          }
          
          if      (isDarkSquare  &&  (isSelected || isPrevMove)) backgroundColor = "bg-board-dark-highlighted"; // Dark Highlited Square
          else if (!isDarkSquare &&  (isSelected || isPrevMove)) backgroundColor = "bg-board-light-highlighted"; // Light Highlighted Square

          return <Square
            key={`square-container-${row}-${col}`}
            row={row}
            col={col}

            isRotated={isRotated}
            isFlipped={isFlipped}

            turnedOver={turnedOver}
            isDarkSquare={isDarkSquare}
            isValidMove={isValidMove}

            backgroundColor={backgroundColor}
            pieceKey={pieceKey}

            onclick={click}
            setIsAnimating={setIsAnimating}
          />
        })}


        {/* Animated Piece Layer */}
        <div className="absolute top-0 left-0 w-full h-full">
          <AnimatePresence>
            {grid.flatMap((gridRow, row) => {
              if (!mounted) return null;

              return gridRow.map((piece, col) => {
                if (!piece) return null;
                
                return <Piece
                  key={idGrid[row * 8 + col]}
                  row={row}
                  col={col}

                  piece={piece}
                  idGrid={idGrid}

                  isRotated={isRotated}
                  isFlipped={isFlipped}

                  isDragged={isDragRef.current}
                  squareSize={squareSize}
                  turnedOver={turnedOver}
                />
              });
            })}
          </AnimatePresence>
        </div>


        {/* Hidden Layer [Revealed by turn over] */}
        <div className={`absolute ${turnedOver ? "z-100 visible" : "z-0 hidden"} w-full h-full p-3 flex flex-col justify-center`}>
          {children}
        </div>
      </div>
    </DndContext>
  )
}
