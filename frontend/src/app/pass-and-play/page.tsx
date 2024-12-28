"use client"
import Navbar from "@/components/navbar"

export default function PassAndPlay() {
  const click = (row: number, col: number) => {
    console.log(`Square clicked: Row ${row}, Col ${col}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar activePage="Pass And Play"/>

      <div className="flex flex-1 justify-center items-center">
        {/* Chess Board */}
        <div
          className="grid grid-cols-8 grid-rows-8 aspect-square m-5"
          style={{
            aspectRatio: "1 / 1",     // Maintain square aspect ratio
            width: "min(90vw, 75vh)", // Ensure it fits within both width and height
            maxWidth: "90vw",         // Avoid overflowing horizontally
            maxHeight: "75vh",        // Avoid overflowing vertically
          }}
        >
          {Array.from({ length: 8 * 8 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isDarkSquare = (row + col) % 2 === 1;

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => click(row, col)}
                className={`flex justify-center items-center ${
                  isDarkSquare ? "bg-gray-700" : "bg-gray-300"
                }`}
                style={{ width: "100%", height: "100%" }}
              >
                {/* Optional: Add content or text here */}
              </div>
            );
          })}
        </div>
      </div>

      <div>Hello World<br/>Bye World</div>
    </div>
  )
}
