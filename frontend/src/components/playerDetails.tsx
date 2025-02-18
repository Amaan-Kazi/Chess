import { useEffect, useState, useRef } from "react";

interface PlayerDetailsInterface {
  variant: "player" | "bot" | "online",
  name: string,
  capturedPieces: string[],
  timer?: number[],
  isActive: boolean,
  className?: string
}

export default function PlayerDetails({variant, name, capturedPieces, timer, isActive, className}: PlayerDetailsInterface) {
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
        <div className="text-left h-1/4">{capturedPieces}</div>
      </div>
    </div>
  );
}
