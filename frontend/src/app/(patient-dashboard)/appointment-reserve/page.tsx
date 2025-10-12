'use client'
import { useState } from 'react'
import { CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import ServicesAccordion from '@/components/services-accordion'

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
  type: string;
  status: "Available" | "Unavailable";
};

const AppointmentReservation = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>()
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const totalMinutes = i * 15
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  const bookedDates = Array.from({ length: 3 }, (_, i) => new Date(2025, 5, 17 + i))
  const router = useRouter();

  return (
    <main>
      <div className=" text-center mt-14">
        <h1 className="mb-10 text-3xl font-bold text-blue-dark">Reserve Appointment</h1>
      </div>
    
      <div className="px-96 mb-20 space-y-16">
        <div className="bg-blue-light rounded-xl p-12">
          <div className="space-y-6">
            <p className="mb-4 text-xl font-bold text-blue-dark">Select Date and Preferred Time</p>
            <div className="flex items-start">
              {/* Calendar */}
              <div className="bg-background rounded-lg p-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  defaultMonth={date}
                  disabled={bookedDates}
                  showOutsideDays={false}
                  modifiers={{
                    booked: bookedDates
                  }}
                  modifiersClassNames={{
                    booked: "[&>button]:line-through opacity-100"
                  }}
                  className="p-0 [--cell-size:--spacing(10)]"
                  formatters={{
                    formatWeekdayName: date => {
                      return date.toLocaleString('en-US', { weekday: 'short' })
                    }
                  }}
                />
              </div>
              {/* Time slots */}
              <div className="inset-y-0 gap-8 border-t h-90 md:w-48 md:border-t-0 md:border-l">
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-2 p-6">
                    {timeSlots.map(time => {
                      // Convert 'HH:mm' to 12-hour format with am/pm
                      const [h, m] = time.split(":");
                      const dateObj = new Date();
                      dateObj.setHours(Number(h), Number(m), 0, 0);
                      const formatted = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
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
            {/* Date and Preferred Time Confirmation */}
            <div className="flex flex-col gap-4 border-t md:flex-row">
              <div className="flex items-center gap-2 text-sm">
                {date && selectedTime ? (
                  <>
                    {/* <CircleCheckIcon className="size-5 stroke-green-600 dark:stroke-green-400" /> */}
                    <span>
                      Your appointment reservation will be on{' '}
                      <span className="font-medium">
                        {' '}
                        {date?.toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}{' '}
                      </span>
                      at <span className="font-medium">
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
                  </>
                ) : (
                  <>Select a date and time for your reservation.</>
                )}
              </div>
            </div>
            {/* Previous and Next Buttons */}
            <div className="flex justify-between">
              <Button disabled className="md:w-auto" variant="default">
                Previous
              </Button>
              <Button disabled={!date && !selectedTime} className="md:ml-auto md:w-auto" variant="default">
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-blue-light rounded-xl p-12 space-y-8">
          <div className="w-full">
            <p className="mb-4 text-xl font-bold text-blue-dark">Select Service</p>
            <ServicesAccordion
              selectedService={selectedService}
              setSelectedService={setSelectedService}
            />
          </div>
          {/* Previous and Next Buttons */}
          <div className="flex justify-between">
            <Button className="md:w-auto" variant="default">
              Previous
            </Button>
            <Button disabled={!selectedService} className="md:ml-auto md:w-auto" variant="default">
              Next
            </Button>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-blue-light rounded-xl p-12 space-y-8">
          <p className="text-2xl font-bold text-blue-dark">Appointment Details</p>
          <div className="flex flex-col gap-4">
            <div className="flex gap-12 items-center">
              <p className="font-medium text-blue-dark w-16">Date</p>
              <Input value={date?.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })} className="bg-white max-w-88" readOnly />
            </div>
            <div className="flex gap-12 items-center">
              <p className="font-medium text-blue-dark w-16">Preferred Time</p>
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
              <p className="font-medium text-blue-dark w-16">Service</p>
              <Input value={selectedService?.name ?? ''} className="bg-white max-w-88" readOnly />
            </div>
            <div className="flex gap-12 items-center">
              <p className="font-medium text-blue-dark w-16">Price</p>
              <Input value={`₱${selectedService?.price ?? ''}${selectedService?.unit ?? ''}`} className="bg-white max-w-88" readOnly />
            </div>
          </div>
          {/* Previous and Next Buttons */}
          <div className="flex justify-between">
            <Button variant="default" className="md:w-auto">
              Previous
            </Button>
            <Button variant="default" className="md:ml-auto md:w-auto">
              Confirm Reservation
            </Button>
          </div>
        </div>

        {/* Successful Reservation */}
        <div className="bg-blue-light rounded-xl p-12 space-y-8">
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
        </div>
      </div>
    </main>
  )
}

export default AppointmentReservation