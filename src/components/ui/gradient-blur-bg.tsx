import { cn } from "@/lib/utils";
import React, { useState } from "react";

export interface GradientBlurBgProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  gridColor?: string;
  squareSize?: number;
  glowColor?: string;
}

export const Component: React.FC<GradientBlurBgProps> = ({
  children,
  className,
  gridColor = "#f0f0f0",
  squareSize,
  glowColor = "#d5c5ff",
  ...props
}) => {
  const [count, setCount] = useState(0);

  const backgroundSize = squareSize
    ? `${squareSize}px ${squareSize}px, ${squareSize}px ${squareSize}px, 100% 100%`
    : "96px 64px, 96px 64px, 100% 100%";

  return (
    <div className={cn("min-h-screen w-full bg-white relative", className)} {...props}>
      {/* Gradient Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px),
            radial-gradient(circle 800px at 100% 200px, ${glowColor}, transparent)
          `,
          backgroundSize,
        }}
      />
      {/* Content/Components */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export const GradientBlurBg = Component;
export default Component;

