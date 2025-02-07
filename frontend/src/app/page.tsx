"use client";
import { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive';

import Game from "@/chess/game"
import Board from "@/chess/board"
import ChessBoard from "@/components/board";
import { WideButton, WideButtonDescription, WideButtonImage, WideButtonTitle } from "@/components/wideButton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from "@/components/ui/sheet"
import Navbar from "@/components/navbar";
import { PassAndPlayForm } from "@/components/forms"

export default function Home() {
  const [game, setGame] = useState(new Game(null));
  const [fenArray, setFenArray] = useState([]);
  const [move, setMove] = useState(0);

  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const [selected, setSelected] = useState(0);
  
  const [turnedOver, setTurnedOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  function handleSelection(selection: number) {
    if (!isAnimating || isSmallScreen) {
      // turn over if currently looking at board
      if (selected == 0 && selection !== selected) {
        setIsAnimating(true);
        setTurnedOver(true);
      }
      else if (selection === 0) {
        setIsAnimating(true);
        setTurnedOver(false);
      }

      setSelected(selection);
    }
  }

  useEffect(() => {
    // Fetch the JSON file from the public folder
    fetch("/chess/games.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load JSON file");
        }
        return response.json();
      })
      .then((data) => {
        // randomize game
        const index = Math.floor(Math.random() * data.games.length);
        console.log("Loaded Game: ", data.games[index].name);
        setFenArray(data.games[index].FEN); // Extract the FEN array
      })
      .catch((error) => {
        console.error("Error loading FEN array:", error);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (fenArray.length != 0) {
        game.board = new Board(undefined, fenArray[move < fenArray.length ? move : fenArray.length - 1]);
        setGame(game);
        setMove(move + 1);
      } else {setMove(move+1)}
    }, Math.floor(Math.random() * (2000 - 500 + 1)) + 500);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [move]);

  const click = (row: number, col: number) => {console.log(`clicked ${row}, ${col}`)}

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar activePage="Home"/>
      <div className="flex justify-center md:justify-evenly w-[95%] m-auto xl:ml-0 2xl:ml-auto xl:scale-105">
        <div className="flex flex-col justify-around items-center xl:scale-75 2xl:scale-100">
          <h1 className="text-3xl md:text-6xl font-bold text-center mb-16 w-fit">Play <span className="text-primary">chess</span> with anyone<br/>in your <span className="text-primary">browser</span></h1>
          
          <div className="flex flex-col w-full items-center">
            <WideButton onClick={() => { handleSelection(1) }} highlighted={true} className="my-2 lg:my-3">
              <WideButtonImage src="/images/move.png"/>
              <WideButtonTitle>Play Online</WideButtonTitle>
              <WideButtonDescription>Play against another online player</WideButtonDescription>
            </WideButton>

            <WideButton onClick={() => { handleSelection(2) }} highlighted={false} className="my-2 lg:my-3">
              <WideButtonImage src="/images/robot.png"/>
              <WideButtonTitle>Play Computer</WideButtonTitle>
              <WideButtonDescription>Play against a customizable bot</WideButtonDescription>
            </WideButton>

            <WideButton onClick={() => { handleSelection(3) }} highlighted={false} className="my-2 lg:my-3">
              <WideButtonImage src="/images/phone.png"/>
              <WideButtonTitle>Pass and Play</WideButtonTitle>
              <WideButtonDescription>Play on the same device</WideButtonDescription>
            </WideButton>
          </div>
        </div>
        <div className="hidden xl:flex xl:flex-col xl:justify-center">
          <ChessBoard game={game} onclick={click} turnedOver={turnedOver} setIsAnimating={setIsAnimating} style={{
            aspectRatio: "1 / 1",     // Maintain square aspect ratio
            width: "min(40vw, 60vh)", // Ensure it fits within both width and height
            position: "relative",
            zIndex: 1,
          }}>
            <div>
              {selected === 3 && <PassAndPlayForm />}
              <Sheet open={selected === 3 && isSmallScreen} onOpenChange={() => { handleSelection(0) }} >
                <SheetContent className="w-full border-0">
                  <SheetHeader className="hidden">
                    <SheetTitle>Pass And Play</SheetTitle>
                    <SheetDescription>Settings for Pass And Play</SheetDescription>
                  </SheetHeader>

                  <div className="flex flex-col h-full justify-center">
                    <PassAndPlayForm />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </ChessBoard>
          {/* <div style={{position: "absolute", zIndex: 0}}>Test 1</div> */}
        </div>
      </div>
    </div>
  );
}

// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings