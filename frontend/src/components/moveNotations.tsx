import { useRef, useEffect } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";

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
    <div ref={ref} className={`bg-secondary dark:bg-[#181716] h-[40px] w-full flex items-center overflow-x-scroll flex-nowrap ${className}`}>
      {moves.map((obj, index) => {
        return (
          <div className="flex mx-2 font-robotoMono flex-shrink-0" key={`move-${index+1}`}>
            <div className="px-1 min-w-[20px] flex-shrink-0">{index + 1}.</div>
  
            <p
              className={`px-1 whitespace-nowrap ${obj.isWhiteMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white`}
              onClick={() => {
                peek?.(((index + 1) * 2) - 1);
              }}
            >{obj.white}</p>
  
            {obj.black && (
              <p
                className={`px-1 whitespace-nowrap ${obj.isBlackMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white`}
                onClick={() => {
                  peek?.((index + 1) * 2);
                }}
              >{obj.black}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TabularMoveNotaions({notations, moveNo, peek, className}: MoveNotationsProps) {
  const ref = useRef<HTMLTableElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
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
  })
  
  return (
    <div ref={ref} className={`overflow-y-scroll ${className}`}>
      <Table className="font-robotoMono">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]"><p>Move</p></TableHead>
            <TableHead className="w-[40%]"><p className="px-2">White</p></TableHead>
            <TableHead className="w-[40%]"><p className="px-2">Black</p></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {moves.map((obj, index) => {
            return (
              <TableRow key={`move-${index+1}`}>
                <TableCell className="font-robotoMono w-[20%] pl-2">{index + 1}</TableCell>
                
                <TableCell className="w-[40%]">
                  <p
                    className={`${obj.isWhiteMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white w-fit px-3`}
                    onClick={() => {
                      peek?.(((index + 1) * 2) - 1);
                    }}
                  >{obj.white}</p>
                </TableCell>
                
                {obj.black ? <TableCell className="w-[40%]">
                  <p 
                    className={`${obj.isBlackMove && "bg-gray-700 hover:bg-gray-700 text-white"} hover:cursor-pointer hover:bg-gray-500 hover:text-white w-fit px-3`}
                    onClick={() => {
                      peek?.((index + 1) * 2);
                    }}
                  >{obj.black}</p>
                </TableCell> : <TableCell></TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
