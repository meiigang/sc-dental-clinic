import React, { useState } from "react";
import Tooth from "./Tooth";

const TEETH_PER_ROW = 16;
const TOOTH_WIDTH = 32; // px
const TOOTH_HEIGHT = 40; // px
const GAP = 8; // px

export default function Teeth({
  selectedTooth,
  setSelectedTooth,
}: {
  selectedTooth: number | null;
  setSelectedTooth: (tooth: number) => void;
}) {
  // Arrange teeth in two rows
  const upperTeeth = Array.from({ length: TEETH_PER_ROW }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: TEETH_PER_ROW }, (_, i) => i + 17);

  // Dummy onChange handler (implement as needed)
  const handleToothChange = (number: number, state: any) => {};

  return (
    <svg
      width={TEETH_PER_ROW * (TOOTH_WIDTH + GAP)}
      height={2 * (TOOTH_HEIGHT + GAP)}
      style={{ display: "block" }}
    >
      {/* Upper jaw */}
      {upperTeeth.map((num, idx) => (
        <Tooth
          key={num}
          number={num}
          positionX={idx * (TOOTH_WIDTH + GAP)}
          positionY={0}
          onChange={handleToothChange}
          onClick={() => setSelectedTooth(num)}
          selected={selectedTooth === num}
        />
      ))}
      {/* Lower jaw */}
      {lowerTeeth.map((num, idx) => (
        <Tooth
          key={num}
          number={num}
          positionX={idx * (TOOTH_WIDTH + GAP)}
          positionY={TOOTH_HEIGHT + GAP}
          onChange={handleToothChange}
          onClick={() => setSelectedTooth(num)}
          selected={selectedTooth === num}
        />
      ))}
    </svg>
  );
}