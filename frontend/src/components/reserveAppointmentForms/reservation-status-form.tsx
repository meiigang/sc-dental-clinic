import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/useFormContext";
import { useRouter } from "next/navigation";

export default function ReservationStatusForm() {
  const { formValues } = useFormContext<any>();
  const { reservationStatus, errorMessage, date } = formValues;
  const router = useRouter();

  {/* TO DO: implement backend for successful reservation */}
  return (
    <div className="bg-blue-light rounded-xl p-12 space-y-8">
      {reservationStatus === "success" ? (
        <>
          <p className="text-2xl font-bold text-blue-dark">Reservation Successful</p>
          <p>Your appointment on {date?.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })} has been successfully reserved!</p>
          <p>Kindly wait until the dentist confirms an official time range for your appointment.</p>
          <Button variant="default" onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </Button>
        </>
      ) : (
        <>
          {/* error message if reservation fails (backend confirmation) */}
          <p className="text-2xl font-bold text-red-600">Reservation Failed</p>
          <p>{errorMessage || "An error occurred while reserving your appointment. Please try again."}</p>
          <Button variant="default" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </>
      )}
    </div>
  );
}