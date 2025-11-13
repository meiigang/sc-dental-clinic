import React from "react";
import Tooth from "./Tooth";

const UPPER_TEMPORARY_TEETH = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const LOWER_TEMPORARY_TEETH = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const TOOTH_IMG_WIDTH = 20; // Smaller than permanent teeth
const TOOTH_IMG_HEIGHT = 25; // Smaller than permanent teeth

const CENTER_X = 180;
const CENTER_Y_UPPER = 110; // Position inside the permanent upper arch
const CENTER_Y_LOWER = 290; // Position inside the permanent lower arch
const SVG_WIDTH = CENTER_X * 2;
const SVG_HEIGHT = 390;

// parabola coefficient for arches (smaller value = wider arch)
const aUpper = 0.018;
const aLower = 0.018;

// parabola coefficient for numbers (smaller value = wider arch)
const aUpperNumbers = 0.012;
const aLowerNumbers = 0.012;

// Spacing for teeth positioning (smaller = tighter)
const FRONT_TEETH_SPACING = 15;
const BACK_TEETH_SPACING = 8;

// Spacing for number positioning (separate from teeth)
const FRONT_NUMBERS_SPACING = 28;
const BACK_NUMBERS_SPACING = 4; // edge

// Distance of numbers from teeth
const NUMBER_OFFSET_UPPER = 10;
const NUMBER_OFFSET_LOWER = 42;

export default function TemporaryTeeth({
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
    let numberLeftX = centerX - TOOTH_IMG_WIDTH / 2;
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

  const upperPositions = getArchPositions(UPPER_TEMPORARY_TEETH, CENTER_X, aUpper, CENTER_Y_UPPER, true);
  const lowerPositions = getArchPositions(LOWER_TEMPORARY_TEETH, CENTER_X, -aLower, CENTER_Y_LOWER, false);

  return (
    <g> {/* Use <g> since this will be inside the main SVG */}
      {/* Upper temporary arch */}
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
            width={TOOTH_IMG_WIDTH}
            height={TOOTH_IMG_HEIGHT}
          />
          <text
            x={numberX}
            y={numberY}
            textAnchor="middle"
            fontSize="10" // Smaller font for temporary teeth
            fill="#666" // Different color to distinguish from permanent teeth
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedTooth(num)}
          >
            {num}
          </text>
        </g>
      ))}
      {/* Lower temporary arch */}
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
            width={TOOTH_IMG_WIDTH}
            height={TOOTH_IMG_HEIGHT}
          />
          <text
            x={numberX}
            y={numberY}
            textAnchor="middle"
            fontSize="10" // Smaller font for temporary teeth
            fill="#666" // Different color to distinguish from permanent teeth
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedTooth(num)}
          >
            {num}
          </text>
        </g>
      ))}
    </g>
  );
}