import React from "react";
import Tooth from "./Tooth";

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const TOOTH_IMG_WIDTH = 32;
const TOOTH_IMG_HEIGHT = 40;

const CENTER_X = 180;
const CENTER_Y_UPPER = 0;
const CENTER_Y_LOWER = 500;
const SVG_WIDTH = CENTER_X * 2;
const SVG_HEIGHT = 550;

// parabola coefficient for arches (smaller value = wider arch)
const aUpper = 0.007;
const aLower = 0.007;

// parabola coefficient for numbers (smaller value = wider arch)
const aUpperNumbers = 0.005;
const aLowerNumbers = 0.005;

// Spacing for teeth positioning
const FRONT_TEETH_SPACING = 27;
const BACK_TEETH_SPACING = 8;

// Spacing for number positioning (separate from teeth)
const FRONT_NUMBERS_SPACING = 32;  // Spacing for center numbers
const BACK_NUMBERS_SPACING = 15;    // Spacing for end numbers

// Distance of numbers from center line
const NUMBER_OFFSET_UPPER = 10;
const NUMBER_OFFSET_LOWER = 35;

export default function Teeth({
  selectedTooth,
  setSelectedTooth,
}: {
  selectedTooth: number | null;
  setSelectedTooth: (tooth: number) => void;
}) {
  function getParabolaY(x: number, centerX: number, a: number, centerY: number) {
    return a * Math.pow(x - centerX, 2) + centerY;
  }

  function getArchPositions(teeth: number[], centerX: number, a: number, centerY: number, isUpper: boolean) {
    const positions: { x: number; y: number; num: number; numberX: number; numberY: number }[] = [];
    const numTeeth = teeth.length;
    
    // Calculate spacing for teeth positions
    const teethSpacings: number[] = [];
    for (let i = 0; i < numTeeth / 2; i++) {
      const distanceFromCenter = i / (numTeeth / 2 - 1);
      const spacing = FRONT_TEETH_SPACING - (FRONT_TEETH_SPACING - BACK_TEETH_SPACING) * distanceFromCenter;
      teethSpacings.push(spacing);
    }

    // Calculate spacing for number positions (separate from teeth)
    const numberSpacings: number[] = [];
    for (let i = 0; i < numTeeth / 2; i++) {
      const distanceFromCenter = i / (numTeeth / 2 - 1);
      const spacing = FRONT_NUMBERS_SPACING - (FRONT_NUMBERS_SPACING - BACK_NUMBERS_SPACING) * distanceFromCenter;
      numberSpacings.push(spacing);
    }

    // Calculate x positions for teeth
    const teethXPositions: number[] = [];
    let leftX = centerX - TOOTH_IMG_WIDTH;
    for (let i = numTeeth / 2 - 1; i >= 0; i--) {
      teethXPositions[i] = leftX;
      if (i > 0) {
        leftX -= teethSpacings[numTeeth / 2 - 1 - i];
      }
    }
    
    let rightX = centerX;
    for (let i = numTeeth / 2; i < numTeeth; i++) {
      teethXPositions[i] = rightX;
      if (i < numTeeth - 1) {
        rightX += teethSpacings[i - numTeeth / 2];
      }
    }

    // Calculate x positions for numbers (separate calculation)
    const numberXPositions: number[] = [];
    let numberLeftX = centerX - TOOTH_IMG_WIDTH / 2; // Center the number on tooth
    for (let i = numTeeth / 2 - 1; i >= 0; i--) {
      numberXPositions[i] = numberLeftX;
      if (i > 0) {
        numberLeftX -= numberSpacings[numTeeth / 2 - 1 - i];
      }
    }
    
    let numberRightX = centerX + TOOTH_IMG_WIDTH / 2;
    for (let i = numTeeth / 2; i < numTeeth; i++) {
      numberXPositions[i] = numberRightX;
      if (i < numTeeth - 1) {
        numberRightX += numberSpacings[i - numTeeth / 2];
      }
    }

    // Generate final positions
    for (let i = 0; i < numTeeth; i++) {
      const toothX = teethXPositions[i];
      const toothCenterX = toothX + TOOTH_IMG_WIDTH / 2;
      const toothY = getParabolaY(toothCenterX, centerX, a, centerY);
      
      // Calculate number position using separate spacing and parabola
      const numberX = numberXPositions[i];
      const numberA = isUpper ? aUpperNumbers : aLowerNumbers;
      const numberY = isUpper ? 
        getParabolaY(numberX, centerX, numberA, centerY - NUMBER_OFFSET_UPPER) :
        getParabolaY(numberX, centerX, -numberA, centerY + NUMBER_OFFSET_LOWER);

      positions.push({
        x: toothX,
        y: toothY,
        num: teeth[i],
        numberX: numberX,
        numberY: numberY,
      });
    }
    return positions;
  }

  const upperPositions = getArchPositions(UPPER_TEETH, CENTER_X, aUpper, CENTER_Y_UPPER, true);
  const lowerPositions = getArchPositions(LOWER_TEETH, CENTER_X, -aLower, CENTER_Y_LOWER, false);

  return (
    <div style={{background: "bg-blue-light", width: "31%" }}>
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Upper arch */}
        {upperPositions.map(({ x, y, num, numberX, numberY }) => (
          <g key={num}>
            <Tooth
              number={num}
              positionX={x}
              positionY={y}
              onChange={() => {}}
              onClick={() => setSelectedTooth(num)}
              selected={selectedTooth === num}
              showNumber={false}
            />
            <text
              x={numberX}
              y={numberY}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight="bold"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedTooth(num)}
            >
              {num}
            </text>
          </g>
        ))}
        {/* Lower arch */}
        {lowerPositions.map(({ x, y, num, numberX, numberY }) => (
          <g key={num}>
            <Tooth
              number={num}
              positionX={x}
              positionY={y}
              onChange={() => {}}
              onClick={() => setSelectedTooth(num)}
              selected={selectedTooth === num}
              showNumber={false}
            />
            <text
              x={numberX}
              y={numberY}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight="bold"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedTooth(num)}
            >
              {num}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}