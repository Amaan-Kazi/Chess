/* eslint-disable react-hooks/rules-of-hooks */ // eslint bug workaround: https://github.com/facebook/react/issues/31687
import { useEffect, useState, useRef } from "react";

interface PlayerDetailsInterface {
  variant: "player" | "bot" | "online",
  name: string,
  
  grid: (string | null)[][],
  color: 'w' | 'b',
  isActive: boolean,
  
  timer?: number[],
  className?: string
}

export default function PlayerDetails({variant, name, grid, color, isActive, className}: PlayerDetailsInterface) {
  const nameRef = useRef<HTMLDivElement | null>(null);
  const [nameFontSize, setNameFontSize] = useState(20); // Default size
  const [advantageFontSize, setAdvantageFontSize] = useState(20);

  useEffect(() => {
    const resizeText = () => {
      if (nameRef.current) {
        const height = nameRef.current.clientHeight;
        setNameFontSize(height * 1); // Scale factor (adjust as needed)
        setAdvantageFontSize((height * (3 / 2)) * 0.6);
      }
    };

    resizeText();
    window.addEventListener("resize", resizeText);
    return () => window.removeEventListener("resize", resizeText);
  }, []);
  
  const imgSrc = {
    player: "images/user-image.svg",
    bot:    "chess/pieces/wk.png",
    online: "chess/pieces/wn.png"
  };

  function pieceColor(pos: number[]): 'w' | 'b' | null {
    const [row, col] = pos;

    const piece = grid[row][col];
    if (!piece) return null;

    if (piece === piece.toLowerCase() && piece !== piece.toUpperCase()) return 'b';
    if (piece === piece.toUpperCase() && piece !== piece.toLowerCase()) return 'w';

    return null;
  }

  const pieceValue = {
    k: 10000,
    q: 9,
    r: 5,
    b: 3,
    n: 3,
    p: 1
  };

  const capturedPieces = {
    white: {
      wp: 8,
      wb: 2,
      wn: 2,
      wr: 2,
      wq: 1,
      wk: 1,
    },
    black: {
      bp: 8,
      bb: 2,
      bn: 2,
      br: 2,
      bq: 1,
      bk: 1,
    }
  };

  let whiteValue = 0;
  let blackValue = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = grid[i][j];

      if (piece !== null) {
        const color = pieceColor([i, j]);

        if (color === 'w') {
          if (capturedPieces.white[`w${piece!.toLowerCase()}` as keyof typeof capturedPieces.white] > 0) {
            capturedPieces.white[`w${piece!.toLowerCase()}` as keyof typeof capturedPieces.white] -= 1;
          }
          whiteValue += pieceValue[piece!.toLowerCase() as keyof typeof pieceValue];
        }
        else {
          if (capturedPieces.black[`b${piece!.toLowerCase()}` as keyof typeof capturedPieces.black] > 0) {
            capturedPieces.black[`b${piece!.toLowerCase()}` as keyof typeof capturedPieces.black] -= 1;
          }
          blackValue += pieceValue[piece!.toLowerCase() as keyof typeof pieceValue];
        }
      }
    }
  }

  const enemyPiecesCaptured = color === 'w' ? capturedPieces.black : capturedPieces.white;

  let advantage = 0;
  let advantagedPlayer = null;

  if (whiteValue > blackValue) {
    advantage = whiteValue - blackValue;
    advantagedPlayer = 'w';
  }
  if (blackValue > whiteValue) {
    advantage = blackValue - whiteValue;
    advantagedPlayer = 'b';
  }

  return (
    <div className={`flex items-center ${className}`}>
      
      {/* Left Image */}
      <div className="h-full aspect-square flex items-center justify-center rounded-md mr-2">
        <img src={imgSrc[variant]} alt={variant} className="w-full h-full object-cover rounded-sm" />
      </div>

      {/* Right */}
      <div className="flex-1 h-full items-center justify-center">
        
        {/* Name [primary color if active turn]*/}
        <div
          ref={nameRef}
          className={`h-[40%] text-left font-bold font-robotoMono ${isActive && "text-primary"}`}
          style={{
            fontSize: nameFontSize,
            lineHeight: "1"
          }}
        >
          {name}
        </div>
        
        <div className="h-[60%] flex justify-start">
          {/* Captured Pieces */}
          {Object.entries(enemyPiecesCaptured).map((key) => {
            if (key[1] <= 0) return null;
            return <div
              key={`${key[0]}`}
              className="flex -ml-1 first:ml-0"
            >
              {Array.from({length:key[1]}).map((value, index) => {
                return <img
                  alt={`${key[0]}`}
                  key={`${key[0]}-${index}-${value}`}
                  src={`chess/pieces/${key[0]}.png`}
                  className="h-full w-auto -ml-[15px] lg:-ml-[15px] 2xl:-ml-[22px] first:ml-0"
                />
              })}
            </div>
          })}

          {/* Advantage Value */}
          <div className="flex flex-col justify-center items-center">
            {advantagedPlayer === color && <div
              className="h-fit font-robotoMono text-playerDetails-advantage font-bold"
              style={{
                fontSize: advantageFontSize,
                lineHeight: "1"
              }}
            >
              +{advantage}
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
