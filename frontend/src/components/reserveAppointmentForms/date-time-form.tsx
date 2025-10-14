import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/useFormContext";
import { useState, useEffect } from "react"; // Import hooks
import { format } from "date-fns"; // Import format

// FIX: Generate time slots as UTC strings
const timeSlots = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 15; // Start from 9:00 AM
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export default function DateTimeForm() {
  const { formValues, updateFormValues } = useFormContext<any>();
  const date = formValues.date ?? new Date();
  const selectedTime = formValues.selectedTime;

  // --- STATE FOR BACKEND DATA ---
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // --- FETCH BOOKED DATES FOR THE CALENDAR ---
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const res = await fetch(`http://localhost:4000/api/availability/booked-dates?year=${year}&month=${month}`);
        if (!res.ok) throw new Error("Failed to fetch booked dates");
        const data = await res.json();
        const dates = data.bookedDates.map((d: string) => new Date(d + 'T00:00:00')); // Ensure correct date parsing
        setBookedDates(dates);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBookedDates();
  }, [date]); // Re-fetch if the user changes the month in the calendar

  // --- FETCH UNAVAILABLE SLOTS WHEN A DATE IS SELECTED ---
  useEffect(() => {
    if (!date) return;

    const fetchUnavailableSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        const res = await fetch(`http://localhost:4000/api/availability/unavailable-slots?date=${dateString}`);
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        setUnavailableSlots(data.unavailableSlots || []);
      } catch (error) {
        console.error(error);
        setUnavailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchUnavailableSlots();
  }, [date]); // Re-runs every time the 'date' changes

  return (
    <div className="bg-blue-light rounded-xl p-12">
      <p className="mb-4 text-xl font-bold text-blue-dark">Select Date and Preferred Time</p>
      <div className="flex items-start">
        <div className="bg-background rounded-lg p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={d => updateFormValues({ date: d, selectedTime: undefined })} // Reset time on new date
            defaultMonth={date}
            disabled={bookedDates} // Use state for disabled dates
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
              {isLoadingSlots ? <p className="p-2 text-sm text-center">Loading...</p> :
                timeSlots.map(time => {
                  // `time` is a UTC-based string like "09:00".
                  // `unavailableSlots` from the backend is also a list of UTC-based strings.
                  const isBooked = unavailableSlots.includes(time);
                  
                  const [h, m] = time.split(":");
                  const hour = parseInt(h, 10);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  const formatted = `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;

                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => updateFormValues({ selectedTime: time })}
                      disabled={isBooked}
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
                      // --- FIX: Use the same simple formatting logic here ---
                      const [h, m] = selectedTime.split(":");
                      const hour = parseInt(h, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                      return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
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