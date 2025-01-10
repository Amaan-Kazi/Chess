"use client";
import { useState } from "react";
// import { useMediaQuery } from 'react-responsive';

import Game from "@/chess/game"
import ChessBoard from "@/components/board";
import {WideButton, WideButtonDescription, WideButtonImage, WideButtonTitle} from "@/components/wideButton";
import Navbar from "@/components/navbar"

export default function Home() {
  const [game] = useState(new Game(null));
  // const [selection, setSelection] = useState("null");
  // const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const click = (row: number, col: number) => {console.log(`clicked ${row}, ${col}`)}

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar activePage="Home"/>
      <div className="flex justify-center md:justify-evenly w-[95%] m-auto xl:scale-105">
        <div className="flex flex-col justify-around items-center">
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
        <div className="hidden xl:block">
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