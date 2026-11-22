import React from "react";

export interface BirdLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: "brand" | "light" | "gold" | "monochrome";
}

/**
 * Alvion Peaceful Bird Logo
 * An elegant, graceful avian mark symbolizing permissionless freedom,
 * lightness, and serene financial flight (non-aggressive dove/swift motif).
 */
export const AlvionBirdLogo: React.FC<BirdLogoProps> = ({
  size = 28,
  variant = "brand",
  className = "",
  style,
  ...props
}) => {
  const getFills = () => {
    switch (variant) {
      case "light":
        return {
          primary: "#F4F7F2",
          secondary: "rgba(235, 240, 230, 0.85)",
          accent: "rgba(229, 192, 123, 0.65)",
        };
      case "gold":
        return {
          primary: "#E5C07B",
          secondary: "rgba(229, 192, 123, 0.7)",
          accent: "rgba(229, 192, 123, 0.4)",
        };
      case "monochrome":
        return {
          primary: "currentColor",
          secondary: "currentColor",
          accent: "currentColor",
        };
      case "brand":
      default:
        return {
          primary: "#23412E",
          secondary: "rgba(35, 65, 46, 0.72)",
          accent: "rgba(35, 65, 46, 0.45)",
        };
    }
  };

  const fills = getFills();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="Alvion Bird Logo"
      {...props}
    >
      <defs>
        <linearGradient id="birdGrad" x1="6" y1="38" x2="42" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={fills.primary} stopOpacity="0.85" />
          <stop offset="60%" stopColor={fills.primary} />
          <stop offset="100%" stopColor={fills.primary} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Far/Secondary Wing - Soft curved lift */}
      <path
        d="M23 21C26.5 14.5 32 9.5 40 7C36.8 12.8 34.5 18 29 22C26.5 23.8 24 23.5 23 21Z"
        fill={fills.accent}
      />

      {/* Primary Sweeping Wing - Fluid aerodynamic curvature */}
      <path
        d="M13 28C17 28 21.5 25.8 25.5 22.5C30.2 18.7 34.5 12.5 38 5C32.2 10.2 27 16.5 22.8 20.2C19.2 23.4 15.5 25 11 25.2C8.2 25.3 9 27.5 13 28Z"
        fill="url(#birdGrad)"
      />

      {/* Torso & Serene Head - Gentle curved throat and peaceful beak */}
      <path
        d="M19 23.5C23 23 27 24.8 30.8 24.8C34.2 24.8 37.8 23.8 41 21.8C38.8 24.6 35.8 26.8 32.5 27.8C28.5 29 24.5 28.5 20 26.5C16.5 25 12.8 25.2 9.5 27C11.5 25 15 23.8 19 23.5Z"
        fill={fills.secondary}
      />

      {/* Flowing Tail Feathers */}
      <path
        d="M11 26.2C8 28.5 6 32.5 5 37.5C8.2 34.2 12.5 31.2 15.5 29C13.5 28 12.2 27 11 26.2Z"
        fill={fills.secondary}
      />
      <path
        d="M13.5 27.2C10.5 30.5 9.5 35 9.5 39.5C12.5 35.8 15.8 32.5 18 29.8C16 28.8 14.5 28 13.5 27.2Z"
        fill={fills.accent}
      />
    </svg>
  );
};

export default AlvionBirdLogo;

