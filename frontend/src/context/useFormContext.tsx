"use client";
import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

// 1. Make the main context type generic
interface FormContextType<T> {
  formValues: T;
  updateFormValues: (updatedData: Partial<T>) => void;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
}

// 2. Use <any> here as a placeholder for the generic context
const FormContext = createContext<FormContextType<any> | null>(null);

// 3. Make the Provider props generic
interface FormProviderProps<T> {
  children: ReactNode;
  initialValues: T;
}

// 4. Make the Provider function generic
export function FormProvider<T extends Record<string, any>>({ children, initialValues }: FormProviderProps<T>) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState<T>(initialValues);

  const updateFormValues = (updatedData: Partial<T>) => {
    setFormValues(prevValues => ({
      ...prevValues,
      ...updatedData,
    }));
  };

  return (
    <FormContext.Provider value={{ currentStep, setCurrentStep, formValues, updateFormValues }}>
      {children}
    </FormContext.Provider>
  );
}

// 5. Make the hook generic
export function useFormContext<T>() {
  const context = useContext(FormContext as React.Context<FormContextType<T> | null>);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
