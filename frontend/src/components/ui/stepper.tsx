import React from "react";
import { useFormContext } from "@/context/useFormContext";

interface StepperProps {
  steps: string[];
}

export const Stepper = ({ steps }: StepperProps) => {
  const { currentStep } = useFormContext();

  return (
    <div className="w-full my-3 flex overflow-x-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex flex-col items-center relative">
          {/* Line to the left (except first) */}
          {index !== 0 && (
            <div className="absolute left-0 top-5 w-1/2 h-1 bg-blue-900 z-0" />
          )}
          {/* Circle */}
          <div
            className={`flex items-center justify-center rounded-full w-10 h-10 font-bold z-10 border-4
              ${currentStep === index + 1
                ? "bg-blue-dark text-white border-blue-dark"
                : index + 1 < currentStep
                ? "bg-white text-blue-dark border-blue-dark"
                : "bg-white text-blue-dark border-blue-dark"}
            `}
          >
            {index + 1}
          </div>
          {/* Line to the right (except last) */}
          {index !== steps.length - 1 && (
            <div className="absolute right-0 top-5 w-1/2 h-1 bg-blue-900 z-0" />
          )}
          {/* Label */}
          <span className="text-blue-dark text-sm text-center w-28 break-words whitespace-normal mt-2 ">
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};
