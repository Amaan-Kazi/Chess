import {Button} from "@/components/ui/button"
import Navbar from "@/components/navbar"
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
              <div className="flex flex-col justify-evenly">
                <Card>
                  <CardHeader>
                    <CardTitle>Play Online</CardTitle>
                    <CardDescription>Play against other players online</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Play with Bot</CardTitle>
                    <CardDescription>Play against a bot with customizable difficulty</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
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

        {/* <Drawer>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>

            <DrawerFooter>
              <Button>Submit</Button>

              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer> */}
      </div>
    </>
  );
}
// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings