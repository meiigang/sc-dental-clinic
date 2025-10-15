import React, { useEffect, useReducer, useRef } from 'react'
import './Tooth.css'

type ToothProps = {
  number: number;
  positionX: number;
  positionY: number;
  onChange: (number: number, state: ToothState) => void;
  onClick: () => void;
  selected: boolean;
};

type Cavities = {
  center: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type ToothState = {
  Cavities: Cavities;
  Extract: number;
  Crown: number;
  Filter: number;
  Fracture: number;
};

type Action =
  | { type: 'crown'; value: number }
  | { type: 'extract'; value: number }
  | { type: 'filter'; value: number }
  | { type: 'fracture'; value: number }
  | { type: 'carie'; value: number; zone: keyof Cavities | 'all' }
  | { type: 'clear' };

function setCavities(prevState: ToothState, zone: keyof Cavities | 'all', value: number): Cavities {
  if (zone === "all") {
    return {
      center: value,
      top: value,
      bottom: value,
      left: value,
      right: value
    };
  } else {
    return {
      ...prevState.Cavities,
      [zone]: value
    };
  }
}

function reducer(toothState: ToothState, action: Action): ToothState {
  switch (action.type) {
    case 'crown':
      return { ...toothState, Crown: action.value };
    case 'extract':
      return { ...toothState, Extract: action.value };
    case 'filter':
      return { ...toothState, Filter: action.value };
    case 'fracture':
      return { ...toothState, Fracture: action.value };
    case 'carie':
      return { ...toothState, Cavities: setCavities(toothState, action.zone, action.value) };
    case 'clear':
      return initialState;
    default:
      throw new Error();
  }
}

const initialState: ToothState = {
  Cavities: {
    center: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  Extract: 0,
  Crown: 0,
  Filter: 0,
  Fracture: 0
};

const Tooth: React.FC<ToothProps> = ({ number, positionX, positionY, onChange, onClick, selected }) => {
  const [toothState, dispatch] = useReducer(reducer, initialState);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    onChange(number, toothState);
  }, [toothState, onChange, number]);

  // You can keep these for future use, but they're not used without context menu:
  // const doneSubMenu = ...
  // const todoSubMenu = ...
  // const menuConfig = ...

  const getClassNamesByZone = (zone: keyof Cavities) => {
    if (toothState.Cavities) {
      if (toothState.Cavities[zone] === 1) {
        return 'to-do';
      } else if (toothState.Cavities[zone] === 2) {
        return 'done';
      }
    }
    return '';
  };

  // Tooth position
  const translate = `translate(${positionX},${positionY})`;

  function drawToothActions() {
    let otherFigures: React.ReactNode = null;
    if (toothState.Extract > 0) {
      otherFigures = (
        <g stroke={toothState.Extract === 1 ? "red" : "blue"}>
          <line x1="0" y1="0" x2="20" y2="20" strokeWidth="2" />
          <line x1="0" y1="20" x2="20" y2="0" strokeWidth="2" />
        </g>
      );
    }
    if (toothState.Fracture > 0) {
      otherFigures = (
        <g stroke={toothState.Fracture === 1 ? "red" : "blue"}>
          <line x1="0" y1="10" x2="20" y2="10" strokeWidth="2"></line>
        </g>
      );
    }
    if (toothState.Filter > 0) {
      otherFigures = (
        <g stroke={toothState.Filter === 1 ? "red" : "blue"}>
          <line x1="0" y1="20" x2="20" y2="0" strokeWidth="2" />
        </g>
      );
    }
    if (toothState.Crown > 0) {
      otherFigures = (
        <circle
          cx="10"
          cy="10"
          r="10"
          fill="none"
          stroke={toothState.Crown === 1 ? "red" : "blue"}
          strokeWidth="2"
        />
      );
    }
    return otherFigures;
  }

  return (
    <svg
      className={`tooth${selected ? " selected" : ""}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`Tooth ${number}`}
      style={{ cursor: "pointer" }}
    >
      <g transform={translate}>
        <polygon
          points="0,0 20,0 15,5 5,5"
          className={getClassNamesByZone('top')}
        />
        <polygon
          points="5,15 15,15 20,20 0,20"
          className={getClassNamesByZone('bottom')}
        />
        <polygon
          points="15,5 20,0 20,20 15,15"
          className={getClassNamesByZone('left')}
        />
        <polygon
          points="0,0 5,5 5,15 0,20"
          className={getClassNamesByZone('right')}
        />
        <polygon
          points="5,5 15,5 15,15 5,15"
          className={getClassNamesByZone('center')}
        />
        {drawToothActions()}
        <text
          x="6"
          y="30"
          stroke="navy"
          fill="navy"
          strokeWidth="0.1"
          className="tooth"
        >
          {number}
        </text>
      </g>
    </svg>
  );
};

export default Tooth;