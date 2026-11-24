// This is file of your component
// You can use any dependencies from npm; we import them automatically in package.json

import { cn } from "@/lib/utils";
import React from "react";

export interface DemoBgProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  gridColor?: string;
  squareSize?: number;
}

export default function Component({
  children,
  className,
  gridColor = "#e2e8f0",
  squareSize = 24,
  ...props
}: DemoBgProps) {
  return (
    <div className={cn("min-h-screen w-full bg-[#f8fafc] relative", className)} {...props}>
      {/* Top Fade Grid Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${squareSize}px ${squareSize}px`,
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />
      {/* Content/Components */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

