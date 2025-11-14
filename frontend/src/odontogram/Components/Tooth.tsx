import React, { useEffect, useReducer, useRef } from 'react'
import './Tooth.css'

type ToothProps = {
  number: number;
  positionX: number;
  positionY: number;
  onChange: (number: number) => void;
  onClick: () => void;
  selected: boolean;
  showNumber?: boolean;
  width?: number;
  height?: number;
  isModified?: boolean;
};

const Tooth: React.FC<ToothProps> = ({
  number,
  positionX,
  positionY,
  onChange,
  onClick,
  selected,
  showNumber = true,
  width = 32,
  height = 40,
  isModified = false,
}) => {
  // Tooth position
  const translate = `translate(${positionX},${positionY})`;

  // Conditionally determine the image path
  const imagePath = isModified
    ? `/images/teeth-colored/tooth${number}.png` // Path to colored teeth
    : `/images/teeth/tooth${number}.png`; // Original image path

  return (
    <g
      className={`tooth${selected ? " selected" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      transform={translate}
    >
      <image
        href={imagePath}
        x="0"
        y="0"
        width={width}
        height={height}
        style={{ pointerEvents: "all" }}
      />
      {/* Conditionally render the number on the tooth if showNumber is true */}
      {showNumber && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize="10"
          fill="blue"
          style={{ pointerEvents: "none" }}
        >
          {number}
        </text>
      )}
    </g>
  );
};

export default Tooth;