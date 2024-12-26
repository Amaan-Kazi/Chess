"use client";
import { useState } from "react";
import { useMediaQuery } from 'react-responsive';

import Navbar from "@/components/navbar"
// import {Button} from "@/components/ui/button"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { PassAndPlayForm } from "@/components/forms"

export default function Home() {
  const [selection, setSelection] = useState("null");
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  return (
    <>
      <Navbar activePage="Home"/>
      <div className="container mx-auto flex justify-evenly">
        <Card className="m-10 min-h-96">
          <CardHeader>
            <CardTitle><p className="text-4xl md:text-6xl">Game Mode</p></CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-10">
              <Card
                className="cursor-pointer"
                onClick={() => setSelection("Play Online")}
              >
                <CardHeader>
                  <CardTitle>Play Online</CardTitle>
                  <CardDescription>Play against other players online</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer"
                onClick={() => setSelection("Play With Bot")}
              >
                <CardHeader>
                  <CardTitle>Play with Bot</CardTitle>
                  <CardDescription>Play against a bot with customizable difficulty</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer"
                onClick={() => setSelection("Pass And Play")}
              >
                <CardHeader>
                  <CardTitle>Pass and Play</CardTitle>
                  <CardDescription>Play against another player locally</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        {/* Hidden on small screen and replaced by drawer */}
        <Card className="hidden md:block w-6/12">
          <CardHeader>
            <CardTitle><p className="text-4xl">Settings</p></CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>

          <CardContent>
            {selection === "Pass And Play" && <PassAndPlayForm />}
          </CardContent>
        </Card>

        <Drawer open={(selection !== "null") && (isSmallScreen == true)} onOpenChange={() => {if (selection !== "null") setSelection("null");}}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selection} - Game Settings</DrawerTitle>
              <DrawerDescription>This is the drawer description</DrawerDescription>
            </DrawerHeader>

            <div className="flex justify-center mb-4">
              <div className="w-4/5">
                {selection === "Pass And Play" && <PassAndPlayForm />}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings