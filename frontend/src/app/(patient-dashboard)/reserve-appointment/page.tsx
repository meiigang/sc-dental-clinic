'use client'
import { FormProvider, useFormContext } from "@/context/useFormContext"
import { Stepper } from "@/components/ui/stepper"
import DateTimeForm from "@/components/reserveAppointmentForms/date-time-form"
import ServiceForm from "@/components/reserveAppointmentForms/service-form"
import AppointmentDetailsForm from "@/components/reserveAppointmentForms/appointment-details-form"
import ReservationStatusForm from "@/components/reserveAppointmentForms/reservation-status-form"
import { Button } from "@/components/ui/button"

const stepTitles = [
  "Select Date & Preferred Time",
  "Select Service",
  "Confirm Details",
  "Reservation Status",
];

const reservationInitialState = {
  date: new Date(),
  selectedTime: undefined,
  selectedService: null,
  reservationStatus: null as "success" | "failed" | null,
  errorMessage: "",
};

type ReservationFormState = typeof reservationInitialState;

function NavigationButtons({
  currentStep,
  setCurrentStep,
  totalSteps,
  onFinalSubmit,
  isNextDisabled,
  isPrevDisabled,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  onFinalSubmit?: () => void;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-4 mt-8">
      {currentStep > 1 && currentStep < totalSteps && (
        <Button
          variant="outline"
          className="bg-blue-light hover:bg-blue-accent text-blue-dark hover:text-blue-dark rounded-lg px-6 py-2"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={isPrevDisabled}
        >
          Previous
        </Button>
      )}
      {/* Show "Next" on steps 1 and 2 */}
      {currentStep < totalSteps - 1 && (
        <Button
          className="bg-blue-primary hover:bg-blue-dark text-white rounded-lg px-6 py-2"
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={isNextDisabled}
        >
          Next
        </Button>
      )}
      {/* Show "Confirm Reservation" only on step 3 */}
      {currentStep === totalSteps - 1 && onFinalSubmit && (
        <Button
          className="bg-blue-primary hover:bg-blue-dark text-white rounded-lg px-6 py-2"
          onClick={onFinalSubmit}
        >
          Confirm Reservation
        </Button>
      )}
    </div>
  );
}

function ReserveAppointmentSteps() {
  const { currentStep, setCurrentStep, formValues, updateFormValues } = useFormContext<ReservationFormState>();

  return (
    <div className="mt-8">
      {currentStep === 1 && <DateTimeForm />}
      {currentStep === 2 && <ServiceForm />}
      {currentStep === 3 && <AppointmentDetailsForm />}
      {currentStep === 4 && <ReservationStatusForm />}
      <NavigationButtons
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        totalSteps={4}
        isNextDisabled={
          (currentStep === 1 && (!formValues.date || !formValues.selectedTime)) ||
          (currentStep === 2 && !formValues.selectedService)
        }
        onFinalSubmit={async () => {
          try {
            // Replace with your actual reservation API call
            // await reserveAppointment({ ...formValues });
            updateFormValues({ reservationStatus: "success" });
            setCurrentStep(4);
          } catch (err: any) {
            updateFormValues({
              errorMessage: err.message || "Unknown error",
              reservationStatus: "failed",
            });
            setCurrentStep(4);
          }
        }}
      />
    </div>
  );
}

export default function ReserveAppointment() {
  return (
    <FormProvider initialValues={reservationInitialState}>
      <main>
        <div className="text-center mt-14">
          <h1 className="mb-10 text-3xl font-bold text-blue-dark">Reserve Appointment</h1>
        </div>
        <div className="px-96 mb-20 space-y-16">
          <div className="flex justify-center my-5">
            <Stepper steps={stepTitles} />
          </div>
          <ReserveAppointmentSteps />
        </div>
      </main>
    </FormProvider>
  );
}