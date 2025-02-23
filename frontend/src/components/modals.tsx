import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PromotionModal({ isOpen, turn, onSelection, className }: { isOpen: boolean, turn: 'w' | 'b', onSelection: (piece: "Queen" | "Knight" | "Rook" | "Bishop") => void, className?: string }) {
  return (
    <div className={`absolute z-50 flex w-screen h-screen justify-center items-center shadow-md ${!isOpen && "hidden"}`}>
      <Card className={`max-w-[80%] ${className}`}>
        <CardHeader>
          <CardTitle className="text-foreground">Pawn Promotion</CardTitle>
          <CardDescription>Select a piece to promote to</CardDescription>
        </CardHeader>
        
        <CardContent className="flex">
          <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {onSelection("Queen")}}>
            <img
              src={`/chess/pieces/${turn === 'w' ? 'wq' : 'bq'}.png`}
              alt="Queen"
            />
          </Button>
        
          <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {onSelection("Knight")}}>
            <img
              src={`/chess/pieces/${turn === 'w' ? 'wn' : 'bn'}.png`}
              alt="Knight"
            />
          </Button>
        
          <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {onSelection("Rook")}}>
            <img
              src={`/chess/pieces/${turn === 'w' ? 'wr' : 'br'}.png`}
              alt="Rook"
            />
          </Button>
        
          <Button className = "bg-red w-14 h-14 m-1 aspect-square" variant={"outline"} onClick={() => {onSelection("Bishop")}}>
            <img
              src={`/chess/pieces/${turn === 'w' ? 'wb' : 'bb'}.png`}
              alt="Bishop"
            />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function GameEndModal({ isOpen, title, description, onOpenChange, className } : { isOpen: boolean, title: string, description: string, onOpenChange: () => void, className?: string }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[90%] md:max-w-[50%] lg:max-w-[35%] px-10 ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-5xl font-academiaM54 tracking-wider font-thin text-center">{title}</DialogTitle>
          <DialogDescription className="text-center text-3xl text-primary">{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
