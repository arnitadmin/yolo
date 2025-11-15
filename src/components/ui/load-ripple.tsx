"use client";

import * as React from "react";

export const LoadRipple: React.FC = () => {
  return (
    <div className="relative h-[250px] aspect-square">
      {/* Ripple circles */}
      <span className="absolute inset-[40%] rounded-full border border-primary/80 animate-[ripple_2s_infinite_ease-in-out] bg-gradient-to-tr from-primary/10 to-primary/5 backdrop-blur-sm z-[98]" />
      <span className="absolute inset-[30%] rounded-full border border-primary/60 animate-[ripple_2s_infinite_ease-in-out_0.2s] bg-gradient-to-tr from-primary/10 to-primary/5 backdrop-blur-sm z-[97]" />
      <span className="absolute inset-[20%] rounded-full border border-primary/40 animate-[ripple_2s_infinite_ease-in-out_0.4s] bg-gradient-to-tr from-primary/10 to-primary/5 backdrop-blur-sm z-[96]" />
      <span className="absolute inset-[10%] rounded-full border border-primary/30 animate-[ripple_2s_infinite_ease-in-out_0.6s] bg-gradient-to-tr from-primary/10 to-primary/5 backdrop-blur-sm z-[95]" />
      <span className="absolute inset-0 rounded-full border border-primary/20 animate-[ripple_2s_infinite_ease-in-out_0.8s] bg-gradient-to-tr from-primary/10 to-primary/5 backdrop-blur-sm z-[94]" />
    </div>
  );
};

