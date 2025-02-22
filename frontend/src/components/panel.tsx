import { ReactNode, ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";


export function PanelContent({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={`h-[87.5%] max-h-[87.5%] ${className}`}>
      {children}
    </div>
  );
}

export function PanelBottom({ children, className }: { children: ReactElement<typeof PanelButton>[], className?: string }) {
  return (
    <div className={`h-[12.5%] bg-navbar flex justify-center gap-3 items-center text-foreground font-bold text-lg p-0 ${className}`}>
      {children}
    </div>
  );
}

export function PanelButton({ children, tooltip, onClick, className }: { children: ReactElement, tooltip?: string, onClick?: () => void, className?: string }) {
  if (tooltip) return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className={`px-6 2xl:px-8 ${className}`} variant="outline" size="lg" onClick={onClick}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  else return (
    <Button className={`px-6 2xl:px-8 ${className}`} variant="outline" size="lg">
      {children}
    </Button>
  );
}

interface PanelProps {
  title:string,
  className?: string
  children: [
    ReactElement<typeof PanelContent>,
    ReactElement<typeof PanelBottom>
  ]
}

export function Panel({ title, children, className }: PanelProps) {
  const [ content, bottom ] = children;
  
  return (
    <Card className={`h-full flex flex-col justify-center rounded-sm ${className}`}>
      <CardTitle className="h-[8%] 2xl:h-[6%] p-2 bg-navbar flex justify-center items-center text-foreground font-bold text-lg tracking-wide">{title}</CardTitle>

      <CardContent className="h-[92%] 2xl:h-[94%] w-full p-0 bg-background shadow-inner">
        {content}
        {bottom}
      </CardContent>
    </Card>
  );
}
