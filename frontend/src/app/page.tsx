import {Button} from "@/components/ui/button"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <>
      <Navbar activePage="Home"/>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Welcome to the Page</h1>
        <p>This is styled with ShadCN/UI themes.</p>
        <Button>Hello World</Button>
      </div>
    </>
  );
}
// select play, play with bot, play online
// drawer, side thing, select settings
// store settings in local storage
// use settings from local storage in game, if not found then default settings