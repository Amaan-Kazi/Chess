import React, { ReactNode, ReactElement } from "react";


export const WideButtonImage: React.FC<{ src: string, alt?: string, className?: string }> = ({ src, alt, className }) => {
  return (
    <div className="w-16 aspect-square flex items-center justify-center rounded-md">
      <img src={src} alt={alt} className={`w-full h-full object-cover rounded-md ${className}`} />
    </div>
  )
};

export const WideButtonTitle: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`text-left text-3xl font-bold text-white ${className}`}>{children}</div>
  );
};

export const WideButtonDescription: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`text-left text-sm text-white ${className}`}>{children}</div>
  );
};



interface WideButtonProps {
  onClick: () => void;
  className?: string;
  highlighted?: boolean;

  children?: [
    ReactElement<typeof WideButtonImage> | undefined,
    ReactElement<typeof WideButtonTitle> | undefined,
    ReactElement<typeof WideButtonDescription> | undefined
  ];
}

export const WideButton: React.FC<WideButtonProps> = ({ onClick, children, className, highlighted = false }) => {
  const [image, title, description] = children || [];

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center p-4 w-full max-w-lg rounded-lg
        ${ highlighted && "bg-[hsl(90,42%,51%)] hover:bg-[hsl(84,55%,60%)] shadow-[0px_4px_0px_rgba(69,117,60,1)]"}
        ${!highlighted && "bg-[hsl(30,3%,26%)]  hover:bg-[hsl(45,3%,29%)]  shadow-[0px_4px_0px_rgba(0,0,0,0.1)]"}
        ${className}
      `}
    >
      {image}
      <div className="flex-1 ml-4">
        {title}
        {description}
      </div>
    </button>
  );
};


/*

USAGE:
WideButtonTitle is mandatory
others are optional
order must be same

<WideButton className="" onClick={() => {}}>
  <WideButtonImage className=""><img /></WideButtonImage>
  <WideButtonTitle className="">Title</WideButtonTitle>
  <WideButtonDescription className="">Description</WideButtonDescription>
</WideButton>

*/
