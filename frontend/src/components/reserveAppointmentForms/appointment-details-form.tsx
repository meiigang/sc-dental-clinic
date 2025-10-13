import { Input } from "@/components/ui/input";
import { useFormContext } from "@/context/useFormContext";

export default function AppointmentDetailsForm() {
  const { formValues } = useFormContext<any>();
  const { date, selectedTime, selectedService } = formValues;

  return (
    <div className="bg-blue-light rounded-xl p-12">
      <p className="text-xl font-bold text-blue-dark">Appointment Reservation Details</p>
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-12 items-center">
          <p className="font-medium text-blue-dark w-32">Date</p>
          <Input value={date?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })} className="bg-white max-w-88" readOnly />
        </div>
        <div className="flex gap-12 items-center">
          <p className="font-medium text-blue-dark w-32">Preferred Time</p>
          <Input
            value={
              selectedTime
                ? (() => {
                  const [h, m] = selectedTime.split(":");
                  const dateObj = new Date();
                  dateObj.setHours(Number(h), Number(m), 0, 0);
                  return dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                })()
                : ""
            }
            className="bg-white max-w-88"
            readOnly
          />
        </div>
        <div className="flex gap-12 items-center">
          <p className="font-medium text-blue-dark w-32">Service</p>
          <Input value={selectedService?.name ?? ''} className="bg-white max-w-88" readOnly />
        </div>
        <div className="flex gap-12 items-center">
          <p className="font-medium text-blue-dark w-32">Price</p>
          <Input value={`₱${selectedService?.price ?? ''}${selectedService?.unit ?? ''}`} className="bg-white max-w-88" readOnly />
        </div>
      </div>
    </div>
  );
}