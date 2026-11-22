import { cn } from "@/lib/utils";
import React from "react";

export interface RedGridBgProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  squareSize?: number;
  borderColor?: string;
  glow?: boolean;
}

export const RedGridBg: React.FC<RedGridBgProps> = ({
  children,
  className,
  squareSize = 38,
  borderColor = "rgba(220, 38, 38, 0.22)",
  glow = true,
  ...props
}) => {
  return (
    <div className={cn("relative w-full h-full", className)} {...props}>
      {/* Red Border Squares Grid Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${borderColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${borderColor} 1px, transparent 1px)
            ${glow ? `, radial-gradient(circle 700px at 50% 150px, rgba(220, 38, 38, 0.08), transparent)` : ""}
          `,
          backgroundSize: `${squareSize}px ${squareSize}px, ${squareSize}px ${squareSize}px, 100% 100%`,
        }}
      />
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default RedGridBg;

