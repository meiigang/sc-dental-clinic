import React from "react";
import { useFormContext } from "@/context/useFormContext";

const steps = ["Personal info", "Address info", "Payment info"];

const Stepper = () => {
  const { currentStep } = useFormContext();
  return (
    <div className="flex justify-between h-auto items-center my-3">
      {steps.map((step, index) => (
        <div
          key={index}
          className={` stepper ${currentStep === index + 1 && "active"} ${
            index + 1 < currentStep && "complete"
          }`}
        >
          <div className="step">{index + 1}</div>
          <p className="text-blue-dark text-sm">{step}</p>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
