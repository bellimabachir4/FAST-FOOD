import React from "react";

interface FlavistaLogoProps {
  className?: string;
  logoUrl?: string; // If a custom logoUrl from localStorage is provided and is NOT the default, we render the img instead.
}

export default function FlavistaLogo({ className = "w-full h-full", logoUrl }: FlavistaLogoProps) {
  // If the admin has uploaded an actual custom logo image, use that instead
  const isCustomLogo = logoUrl && 
    logoUrl !== "/src/assets/images/flavista_logo.jpg" && 
    !logoUrl.includes("flavista_logo");

  if (isCustomLogo) {
    return (
      <img
        src={logoUrl}
        alt="Flavista Custom Logo"
        className={`${className} object-cover rounded-full bg-white`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Solid Black Circular Background */}
      <circle cx="250" cy="250" r="240" fill="black" />

      {/* Speed movement trails (to the left of the flame) */}
      <g fill="#FF8A00">
        {/* Detached speed dots */}
        <circle cx="105" cy="202" r="10" />
        <circle cx="95" cy="225" r="12" />

        {/* Speed lines merging into flame body */}
        <rect x="145" y="168" width="75" height="13" rx="6.5" />
        <rect x="122" y="195" width="105" height="15" rx="7.5" />
        <rect x="132" y="222" width="65" height="14" rx="7" />
        <rect x="150" y="248" width="60" height="13" rx="6.5" />
      </g>

      {/* Stylized Burger graphic on the right */}
      <g stroke="#FF8A00" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Top Bun */}
        <path d="M325 195 C325 165, 395 165, 395 195 Z" fill="none" />
        
        {/* Seeds on top bun */}
        <ellipse cx="345" cy="182" rx="2" ry="1" fill="#FF8A00" stroke="none" />
        <ellipse cx="360" cy="177" rx="1.5" ry="1.5" fill="#FF8A00" stroke="none" />
        <ellipse cx="372" cy="184" rx="2" ry="1" fill="#FF8A00" stroke="none" />
        
        {/* Cheese/Sauce dripping wave */}
        <path d="M322 205 Q335 212, 345 204 T370 205 T398 203" />
        
        {/* Burger Patty */}
        <rect x="323" y="215" width="72" height="10" rx="5" fill="#FF8A00" stroke="none" />
        
        {/* Bottom Bun */}
        <path d="M325 235 C325 250, 395 250, 395 235" />
        <line x1="325" y1="235" x2="395" y2="235" />
      </g>

      {/* Centerpiece: Cute Orange Flame Character */}
      {/* High quality bezier curve defining a droplet/flame shape */}
      <path
        d="M 250 65 
           C 278 115, 315 155, 315 210 
           C 315 252, 285 282, 250 282 
           C 215 282, 185 252, 185 210 
           C 185 155, 222 115, 250 65 Z"
        fill="#FF8A00"
      />

      {/* Flame Inner Highlight/Tongue */}
      <path
        d="M 250 100
           C 268 135, 292 165, 292 205
           C 292 232, 272 254, 250 254
           C 228 254, 208 232, 208 205
           C 208 165, 232 135, 250 100 Z"
        fill="#FFA726"
        opacity="0.25"
      />

      {/* Cute sleeping / friendly face elements */}
      <g fill="none" stroke="black" strokeWidth="6" strokeLinecap="round">
        {/* Left eye (sleeping/drooping) */}
        <ellipse cx="230" cy="208" rx="20" ry="15" fill="black" />
        <ellipse cx="230" cy="214" rx="20" ry="9" fill="#FF8A00" stroke="none" />
        <ellipse cx="230" cy="208" rx="20" ry="15" />
        {/* Left Eyebrow */}
        <path d="M 210 188 Q 230 178 245 188" stroke="black" strokeWidth="8" />

        {/* Right eye (sleeping/drooping) */}
        <ellipse cx="270" cy="208" rx="20" ry="15" fill="black" />
        <ellipse cx="270" cy="214" rx="20" ry="9" fill="#FF8A00" stroke="none" />
        <ellipse cx="270" cy="208" rx="20" ry="15" />
        {/* Right Eyebrow */}
        <path d="M 255 188 Q 270 178 290 188" stroke="black" strokeWidth="8" />

        {/* Cheerful mouth/smile */}
        <path d="M 235 240 Q 250 262 265 240" fill="black" stroke="black" strokeWidth="4" />
        <path d="M 240 245 Q 250 257 260 245" fill="#FF8A00" stroke="none" />
      </g>

      {/* 4. Text Brand "Flav'ista" & Tagline */}
      <g>
        {/* Main Brand Text in elegant white */}
        <text
          x="248"
          y="375"
          fill="white"
          fontSize="64"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="-1"
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontWeight: 900 }}
        >
          Flav'ista
        </text>

        {/* The prominent orange dot of the 'i' */}
        {/* Overlaying exactly on top of 'i' dot location (around x=265, y=320) */}
        <circle cx="264" cy="320" r="13" fill="#FF8A00" />

        {/* Tagline text: "Savor the difference!" */}
        <text
          x="250"
          y="415"
          fill="#FF8A00"
          fontSize="22"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="0.5"
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontWeight: 700 }}
        >
          Savor the difference!
        </text>
      </g>
    </svg>
  );
}
