import { ReactElement, ReactNode } from "react";

export function ActionBarButton({ children, onClick, className }: { children: ReactNode, onClick?: () => void, className?: string }) {
  return (
    <div className={`flex flex-1 h-full justify-center items-center ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function ActionBar({ children, className }: { children: ReactElement<typeof ActionBarButton>[] | ReactElement<typeof ActionBarButton>, className?: string }) {
  return (
    <div className={`bg-navbar flex items-center ${className}`}>
      {children}
    </div>
  );
}
