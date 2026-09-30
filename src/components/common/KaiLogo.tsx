import React from "react";

interface KaiLogoProps {
  className?: string;
  size?: number;
}

export function KaiLogo({ className = "w-8 h-8", size }: KaiLogoProps) {
  return (
    <img
      src="/kai-alert-logo.png"
      alt="KAI Alert Mascot"
      className={`object-contain rounded-xl ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
}

