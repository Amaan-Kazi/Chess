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

export default function PlayerDetails({variant, name, grid, color, isActive, timer, className}: PlayerDetailsInterface) {
  const nameRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(20); // Default size

  console.log(timer);

  useEffect(() => {
    const resizeText = () => {
      if (nameRef.current) {
        const height = nameRef.current.clientHeight;
        setFontSize(height * 1); // Scale factor (adjust as needed)
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

  let whiteValue = 0;
  let blackValue = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = grid[i][j];

      if (piece !== null) {
        const color = pieceColor([i, j]);

        if (color === 'w') whiteValue += pieceValue[piece!.toLowerCase() as keyof typeof pieceValue];
        else               blackValue += pieceValue[piece!.toLowerCase() as keyof typeof pieceValue];
      }
    }
  }

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
          className={`h-1/2 text-left font-bold ${isActive && "text-primary"}`}
          style={{
            fontSize: fontSize,
            lineHeight: "1"
          }}
        >
          {name}
        </div>
        
        {/* Captured Pieces */}
        <div className="h-1/4 flex justify-start">
          {advantagedPlayer === color && <p>+{advantage}</p>}
        </div>
      </div>
    </div>
  );
}
