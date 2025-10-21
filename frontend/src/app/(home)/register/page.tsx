"use client";
import { FormProvider, useFormContext } from "@/context/useFormContext";
import { Stepper } from "@/components/ui/stepper";
import AccountInfoForm from "@/components/patientForms/accountInfoForm";
import PersonalInfoForm from "@/components/patientForms/personalInfoForm";
import DentalHistoryForm from "@/components/patientForms/dentalHistoryForm";
import MedicalHistoryForm from "@/components/patientForms/medicalHistoryForm";
import { accountInfoSchema, personalSchema, dentistSchema, medicalSchema } from "@/components/patientForms/formSchemas/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define the shape of your form data here
const registrationInitialState = {
  accountInfo: undefined as z.infer<typeof accountInfoSchema> | undefined,
  personalInfo: undefined as z.infer<typeof personalSchema> | undefined,
  dentalHistory: undefined as z.infer<typeof dentistSchema> | undefined,
  medicalHistory: undefined as z.infer<typeof medicalSchema> | undefined,
};

// Define a type for the shape
type RegistrationFormState = typeof registrationInitialState;

export default function Register() {
  const stepTitles = [
    "Account Information",
    "Personal Information",
    "Dental History",
    "Medical History",
    "Review & Submit",
  ];

  return (
    // Pass the initial state to the provider
    <FormProvider initialValues={registrationInitialState}>
      <main>
        <div className="page-container mx-20 py-20 space-y-6 min-h-screen">
          <div className="flex justify-center">
            <h1 className="text-5xl font-bold text-blue-dark">Register</h1>
          </div>
          <div className="flex justify-center my-5">
            <Stepper steps={stepTitles}/>
          </div>
          <RegisterSteps />
        </div>
      </main>
    </FormProvider>
  );
}

function RegisterSteps() {
  // Tell the hook what shape to expect!
  const { currentStep, setCurrentStep, formValues, updateFormValues } = useFormContext<RegistrationFormState>();
  const router = useRouter();

  const steps = [
    {
      title: "Account Information",
      component: (
        <AccountInfoForm
          initialValues={formValues.accountInfo}
          onSubmit={data => {
            updateFormValues({ accountInfo: data });
            setCurrentStep(currentStep + 1);
          }}
        />
      ),
    },
    {
      title: "Personal Information",
      component: (
        <PersonalInfoForm
          initialValues={formValues.personalInfo}
          onPrev={() => setCurrentStep(currentStep - 1)}
          onSubmit={data => {
            updateFormValues({ personalInfo: data });
            setCurrentStep(currentStep + 1);
          }}
          mode="register"
        />
      ),
    },
    {
      title: "Dental History",
      component: (
        <DentalHistoryForm
          initialValues={formValues.dentalHistory}
          onPrev={() => setCurrentStep(currentStep - 1)}
          onSubmit={data => {
            updateFormValues({ dentalHistory: data });
            setCurrentStep(currentStep + 1);
          }}
          mode="register"
        />
      ),
    },
    {
      title: "Medical History",
      component: (
        <MedicalHistoryForm
          initialValues={formValues.medicalHistory}
          onPrev={() => setCurrentStep(currentStep - 1)}
          onSubmit={data => {
            updateFormValues({ medicalHistory: data });
            setCurrentStep(currentStep + 1);
          }}
          mode="register"
        />
      ),
    },
    {
      title: "Review & Submit",
      component: (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-blue-dark text-center">Review Your Information</h2>
          
          {/* Account Info Review */}
          <AccountInfoForm
            initialValues={formValues.accountInfo}
            onSubmit={() => {}}
            readOnly={true}
          />

          {/* Personal Info Review */}
          <PersonalInfoForm
            initialValues={formValues.personalInfo}
            readOnly={true}
          />

          {/* Dental History Review */}
          <DentalHistoryForm
            initialValues={formValues.dentalHistory}
            readOnly={true}
          />

          {/* Medical History Review */}
          <MedicalHistoryForm
            initialValues={formValues.medicalHistory}
            readOnly={true}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
            <Button
              className="bg-blue-dark hover:bg-blue-darker text-white px-6 py-2 rounded"
              onClick={async () => {
                try {
                  const res = await fetch ("http://localhost:4000/api/users/register/full", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formValues),
                  });

                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Registration failed.");
                  }

                  //Upon successful registration:
                  alert("Registration successful!");
                  router.push("/login");

                } 
                
                catch (error: any) {
                  console.error("Final submission error:", error);
                  alert(`Error: ${error.message}`);
                }

              }}
            >
              Submit
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return <div className="mt-8">{steps[currentStep - 1]?.component}</div>;
}