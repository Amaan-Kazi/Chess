import { useRef, useEffect } from "react";

interface MoveNotationsProps {
  notations: string[],
  moveNo: number,
  peek?: (index: number) => void,
  className?: string
}

export function HorizontalMoveNotations({notations, moveNo, peek, className}: MoveNotationsProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth;
  }, [moveNo]);

  const moves: {white?: string, black?: string, isWhiteMove?: boolean, isBlackMove?: boolean}[] = [];
  let whiteMove = true;

  notations.map((notation, index) => {
    if (whiteMove) {
      let isWhiteMove = false;
      if (index === moveNo - 1) isWhiteMove = true;

      moves.push({white: notation, isWhiteMove});
    }
    else {
      let isBlackMove = false;
      if (index === moveNo - 1) isBlackMove = true;
      
      moves[moves.length - 1].black = notation;
      moves[moves.length - 1].isBlackMove = isBlackMove;
    }
    whiteMove = !whiteMove;
  });
  
  return (
    <div ref={ref} className={`bg-secondary dark:bg-[#181716] h-[40px] w-full flex items-center overflow-x-scroll ${className}`}>
      {moves.map((obj, index) => {
        return (
          <div className="flex mx-2" key={`move-${index+1}`}>
            <div className="px-1">{index + 1}.</div>
            
            <p
              className={`${obj.isWhiteMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white px-1 font-robotoMono`}
              onClick={() => {
                peek?.(((index + 1) * 2) - 1);
              }}
            >{obj.white}</p>

            {obj.black && <p
              className={`${obj.isBlackMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white px-1 font-robotoMono`}
              onClick={() => {
                peek?.((index + 1) * 2);
              }}
            >{obj.black}</p>}
          </div>
        );
      })}
    </div>
  );
}
