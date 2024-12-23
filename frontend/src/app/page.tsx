"use client";
import { useState } from "react";

import Navbar from "@/components/navbar"
import {Button} from "@/components/ui/button"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Settings() {
  return (
    <>Hello World</>
  );
}

export default function Home() {
  const [selection, setSelection] = useState("null");

  const selectionChange = () => {
    if (selection !== "null") setSelection("null");
  }

  return (
    <>
      <Navbar activePage="Home"/>
      <div className="container mx-auto flex justify-evenly">
        <div>
          <Card className="m-10 min-h-96">
            <CardHeader>
              <CardTitle><p className="text-4xl md:text-6xl">Game Mode</p></CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-10">
                <Card
                  className="cursor-pointer"
                  onClick={() => setSelection("PlayOnline")}
                >
                  <CardHeader>
                    <CardTitle>Play Online</CardTitle>
                    <CardDescription>Play against other players online</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer"
                  onClick={() => setSelection("PlayWithBot")}
                >
                  <CardHeader>
                    <CardTitle>Play with Bot</CardTitle>
                    <CardDescription>Play against a bot with customizable difficulty</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer"
                  onClick={() => setSelection("PassAndPlay")}
                >
                  <CardHeader>
                    <CardTitle>Pass and Play</CardTitle>
                    <CardDescription>Play against another player locally</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:block">
          {/* Game Settings */}
          {/* Hidden on small screen and replaced by drawer */}
          
          <Card>
            <CardHeader>
              <CardTitle><p className="text-4xl">Settings</p></CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>

            <CardContent>
              <p>Card Content</p>
            </CardContent>

            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>

        <Drawer open={selection !== "null"} onOpenChange={selectionChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>This is the drawer title</DrawerTitle>
              <DrawerDescription>This is the drawer description</DrawerDescription>
            </DrawerHeader>
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