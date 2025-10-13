import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/useFormContext";

const timeSlots = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour = Math.floor(totalMinutes / 60) + 9;
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});
const bookedDates = Array.from({ length: 3 }, (_, i) => new Date(2025, 5, 17 + i));

export default function DateTimeForm() {
  const { formValues, updateFormValues } = useFormContext<any>();
  const date = formValues.date ?? new Date();
  const selectedTime = formValues.selectedTime;

  return (
    <div className="bg-blue-light rounded-xl p-12">
      <p className="mb-4 text-xl font-bold text-blue-dark">Select Date and Preferred Time</p>
      <div className="flex items-start">
        <div className="bg-background rounded-lg p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={d => updateFormValues({ date: d })}
            defaultMonth={date}
            disabled={bookedDates}
            showOutsideDays={false}
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{ booked: "[&>button]:line-through opacity-100" }}
            className="p-0 [--cell-size:--spacing(10)]"
            formatters={{
              formatWeekdayName: date => date.toLocaleString('en-US', { weekday: 'short' })
            }}
          />
        </div>
        <div className="inset-y-0 gap-8 border-t h-90 md:w-48 md:border-t-0 md:border-l">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-6">
              {timeSlots.map(time => {
                const [h, m] = time.split(":");
                const dateObj = new Date();
                dateObj.setHours(Number(h), Number(m), 0, 0);
                const formatted = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                return (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => updateFormValues({ selectedTime: time })}
                    className="w-full shadow-none"
                  >
                    {formatted}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t md:flex-row mt-6">
        <div className="flex items-center gap-2 text-sm">
          {date && selectedTime ? (
            <span>
              Your appointment reservation will be on{' '}
              <span className="font-medium">
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
              {' '}at <span className="font-medium">
                {selectedTime
                  ? (() => {
                    const [h, m] = selectedTime.split(":");
                    const dateObj = new Date();
                    dateObj.setHours(Number(h), Number(m), 0, 0);
                    return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                  })()
                  : ""}
              </span>.
            </span>
          ) : (
            <>Select a date and time for your reservation.</>
          )}
        </div>
      </div>
    </div>
  );
}