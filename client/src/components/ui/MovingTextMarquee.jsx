// src/components/ui/MovingTextMarquee.jsx
import React from 'react';

const MovingTextMarquee = ({
  line1 = "Solar & Energy Systems • Advanced Engineering & Automation • Cooling Solutions • Heavy & General Engineering",
  line2 = "Hybrid & Off-Grid Systems | Eco-Friendly Energy for Homes & Businesses | Contact Us Today!",
  speed = 28,
  bgColor = "bg-white",
  textColor = "text-gray-900",
}) => {
  return (
    <section
      className={`${bgColor} ${textColor} py-10 md:py-14 lg:py-16 overflow-hidden border-t border-gray-200`}
    >
      {/* Line 1 – left to right */}
      <div className="relative w-full mb-6 md:mb-8 lg:mb-10">
        <div
          className="inline-flex flex-nowrap whitespace-nowrap animate-marquee-left font-sans font-light tracking-wider text-5xl md:text-7xl lg:text-8xl leading-none"
          style={{ animationDuration: `${speed}s` }}
        >
          <span className="px-16 lg:px-24">
            {line1}       {line1}      
          </span>
        </div>
      </div>

      {/* Line 2 – right to left */}
      <div className="relative w-full">
        <div
          className="inline-flex flex-nowrap whitespace-nowrap animate-marquee-right font-sans font-light tracking-wider text-4xl md:text-6xl lg:text-7xl leading-none"
          style={{ animationDuration: `${speed + 10}s` }}
        >
          <span className="px-16 lg:px-24">
            {line2}     {line2}    
          </span>
        </div>
      </div>
    </section>
  );
};

export default MovingTextMarquee;