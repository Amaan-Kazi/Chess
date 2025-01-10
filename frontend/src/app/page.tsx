"use client";
import { useState, useEffect } from "react";
// import { useMediaQuery } from 'react-responsive';

import Game from "@/chess/game"
import Board from "@/chess/board"
import ChessBoard from "@/components/board";
import {WideButton, WideButtonDescription, WideButtonImage, WideButtonTitle} from "@/components/wideButton";
import Navbar from "@/components/navbar"

export default function Home() {
  const [game, setGame] = useState(new Game(null));
  const [fenArray, setFenArray] = useState([]);
  const [move, setMove] = useState(0);
  // const [selection, setSelection] = useState("null");
  // const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Fetch the JSON file from the public folder
    fetch("/chess/games/1.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load JSON file");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Loaded Game: ", data.name);
        setFenArray(data.FEN); // Extract the FEN array
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
            <WideButton onClick={() => {console.log("Clicked")}} highlighted={true} className="my-2 lg:my-3">
              <WideButtonImage src="/images/move.png"/>
              <WideButtonTitle>Play Online</WideButtonTitle>
              <WideButtonDescription>Play against another online player</WideButtonDescription>
            </WideButton>

            <WideButton onClick={() => {console.log("Clicked")}} highlighted={false} className="my-2 lg:my-3">
              <WideButtonImage src="/images/robot.png"/>
              <WideButtonTitle>Play Computer</WideButtonTitle>
              <WideButtonDescription>Play against a customizable bot</WideButtonDescription>
            </WideButton>

            <WideButton onClick={() => {console.log("Clicked")}} highlighted={false} className="my-2 lg:my-3">
              <WideButtonImage src="/images/phone.png"/>
              <WideButtonTitle>Pass and Play</WideButtonTitle>
              <WideButtonDescription>Play on the same device</WideButtonDescription>
            </WideButton>
          </div>
        </div>
        <div className="hidden xl:flex xl:flex-col xl:justify-center">
          <ChessBoard game={game} onclick={click} style={{
            aspectRatio: "1 / 1",     // Maintain square aspect ratio
            width: "min(40vw, 60vh)", // Ensure it fits within both width and height
          }} />
        </div>
      </div>
      <div></div>
    </div>
  );
}

// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings