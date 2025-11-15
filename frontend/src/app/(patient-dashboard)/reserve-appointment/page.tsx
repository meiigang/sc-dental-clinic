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

interface Service {
  id: number;
  name: string;
  price: number;
  description: string;
}

const reservationInitialState = {
  date: new Date(),
  selectedTime: undefined,
  selectedService: null as Service | null,
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
      {/* Show Previous button on steps 2 and 3 */}
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
      {currentStep < 3 && (
        <Button
          className="bg-blue-primary hover:bg-blue-dark text-white rounded-lg px-6 py-2"
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={isNextDisabled}
        >
          Next
        </Button>
      )}
      {currentStep === 3 && onFinalSubmit && (
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

        //BACKEND CALL
        onFinalSubmit={async () => {
          try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token){
              throw new Error("You must be logged in to make an appointment.");
            }

            const payload = {
              service_id: formValues.selectedService?.id,
              appointment_date: formValues.date,
              appointment_time: formValues.selectedTime,
            };

            // --- FRONTEND LOG ---
            // Log the payload right before sending it to the backend.
            console.log("Frontend: Sending reservation payload:", payload);

            const res = await fetch("http://localhost:4000/api/reservation/reserve-appointment", {
              method:"POST",
              headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(payload),
            });

            // --- DEBUGGING STEP ---
            // If the response is not OK, log the raw text to see the HTML error page
            if (!res.ok){
              const errorText = await res.text();
              console.error("Backend returned an error page:", errorText);
              throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();
            updateFormValues({ reservationStatus: "success", errorMessage: "" });

          } catch (error: any) {
            console.error("onFinalSubmit Error:", error);
            updateFormValues({ reservationStatus: "failed", errorMessage: error.message });
          } finally {
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
      <main className="min-h-screen bg-white">
        {/* Page Title */}
        <div className="text-center mt-14 px-4 sm:px-6">
          <h1 className="mb-10 text-3xl sm:text-4xl font-bold text-blue-dark">Reserve Appointment</h1>
        </div>

        {/* Content Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-16">
            {/* Stepper */}
            <div className="flex justify-center my-5">
              <Stepper steps={stepTitles} />
            </div>

            {/* Form Steps */}
            <ReserveAppointmentSteps />
          </div>
        </div>
      </main>
    </FormProvider>
  );
}
