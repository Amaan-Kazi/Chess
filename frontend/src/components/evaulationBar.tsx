export default function EvaluationBar({ visible, variant, evaluation, mateIn, className }: { visible: boolean, variant: "vertical" | "horizontal", evaluation?: number, mateIn?: number | null, className?: string }) {
  evaluation = evaluation === undefined ? 0 : evaluation;
  mateIn     = mateIn     === undefined ? null : mateIn;
  
  const whitePercentage = Math.trunc((evaluation + 10) / 20 * 100); 
  const blackPercentage = 100 - whitePercentage;
  
  if (visible) return (
    <div className={` flex
      ${variant === "vertical"   && "w-8 h-full"}
      ${variant === "horizontal" && "h-8 w-full"}
      ${className}
    `}>
      <div 
        className={`
          bg-evaluationBar-black text-evaluationBar-white flex justify-start items-center text-xs
          ${variant === "vertical"   && "flex-col"}
          ${variant === "horizontal" && "flex-row"}
        `}
        style={ variant === "vertical" ? {
            height: `${blackPercentage}%`,
            transition: "height 0.75s ease-in-out"
          } : {
            width: `${blackPercentage}%`,
            transition: "width 0.75s ease-in-out"
          }
        }
      >
        {evaluation < 0 && (
          mateIn !== null ?
            mateIn === 0 ? <p className={`${variant==="horizontal" && "px-2"}`}>0-1</p>
            : <p className={`${variant==="horizontal" && "px-2"}`}>{`M${Math.abs(mateIn)}`}</p>
          : <p className={`${variant==="horizontal" && "px-2"}`}>{`${Math.abs(evaluation).toFixed(1)}`}</p>
        )}
      </div>

      <div
        className={`
          bg-evaluationBar-white text-evaluationBar-black flex justify-end items-center text-xs
          ${variant === "vertical"   && "flex-col"}
          ${variant === "horizontal" && "flex-row"}
        `}
        style={ variant === "vertical" ? {
            height: `${whitePercentage}%`,
            transition: "height 0.75s ease-in-out"
          } : {
            width: `${whitePercentage}%`,
            transition: "width 0.75s ease-in-out"
          }
        }
      >
        {evaluation > 0 && (
          mateIn !== null ?
            mateIn === 0 ? <p className={`${variant==="horizontal" && "px-2"}`}>1-0</p>
            : <p className={`${variant==="horizontal" && "px-2"}`}>{`M${Math.abs(mateIn)}`}</p>
          : <p className={`${variant==="horizontal" && "px-2"}`}>{`${Math.abs(evaluation).toFixed(1)}`}</p>
        )}
      </div>
    </div>
  );
  else return null;
}
