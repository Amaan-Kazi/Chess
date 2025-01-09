"use client";
// import { useState } from "react";
// import { useMediaQuery } from 'react-responsive';

import {WideButton, WideButtonDescription, WideButtonImage, WideButtonTitle} from "@/components/wideButton";
import Navbar from "@/components/navbar"

export default function Home() {
  // const [selection, setSelection] = useState("null");
  // const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar activePage="Home"/>
      <div className="flex justify-center md:justify-evenly w-[90%] m-auto">
        <div>
          <h1 className="text-3xl md:text-6xl font-bold text-center my-20 w-fit">Play chess with anyone,<br/>in your browser</h1>
          <WideButton onClick={() => {console.log("Clicked")}} highlighted={true} className="my-5">
            <WideButtonImage src="/images/move.png"/>
            <WideButtonTitle>Play Online</WideButtonTitle>
            <WideButtonDescription>Play against another online player</WideButtonDescription>
          </WideButton>

          <WideButton onClick={() => {console.log("Clicked")}} highlighted={false} className="my-5">
            <WideButtonImage src="/images/robot.png"/>
            <WideButtonTitle>Play Computer</WideButtonTitle>
            <WideButtonDescription>Play against a customizable bot</WideButtonDescription>
          </WideButton>

          <WideButton onClick={() => {console.log("Clicked")}} highlighted={false} className="my-5">
            <WideButtonImage src="/images/phone.png"/>
            <WideButtonTitle>Pass and Play</WideButtonTitle>
            <WideButtonDescription>Play on the same device</WideButtonDescription>
          </WideButton>
        </div>
        <div className="hidden md:block">Chess Board</div>
      </div>
      <div></div>
    </div>
  );
}

// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings