'use client'

import { useState, useEffect } from "react"
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import Odontogram from "@/odontogram/Components/Odontogram"
import SalesBilling from "./SalesBilling"
import { format } from 'date-fns';

// --- FIX: Update the service type to include all necessary fields ---
type AppointmentData = {
  id: number;
  patient: {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
  } | null;
  service: {
    id: number; // Add id
    service_name: string;
    price: number; // Add price
  } | null;
  start_time: string;
};

type LogAppointmentProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  appointment: AppointmentData & { status?: string } | null; // Add status to the type
  onCancelLog: () => void
  onLogSuccess: () => void;
}

export function LogAppointment({ open, onOpenChange, appointment, onCancelLog, onLogSuccess }: LogAppointmentProps) {
  const [page, setPage] = useState<"odontogram" | "billing">("odontogram")
  const [dentalLog, setDentalLog] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FIX: Fetch existing log data when the modal opens for a completed appointment ---
  useEffect(() => {
    const fetchLogIfNeeded = async () => {
      if (open && appointment && appointment.status === 'completed') {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const response = await fetch(`/api/appointments/${appointment.id}/log`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch dental log.');
          }
          const existingLog = await response.json();
          setDentalLog(existingLog); // Pre-populate the dentalLog state
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message || "Failed to fetch dental log.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLogIfNeeded();

    // Reset state when modal opens
    if (open) {
      setPage("odontogram");
      setError(null);
      // Clear previous data unless it's a completed appointment
      if (appointment?.status !== 'completed') {
        setDentalLog(null);
        setInvoiceData(null);
      }
    }
  }, [open, appointment]);


  const handleFinishLog = async () => {
    if (!appointment || !appointment.patient || !dentalLog || !invoiceData) {
      const errorMsg = "Cannot finish log. Dental chart and billing information must be complete.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const submissionData = {
      appointmentId: appointment.id,
      patientId: appointment.patient.id,
      dentalLog,
      invoiceData,
    };

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/log-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorMsg = errData.message || "Failed to log appointment.";
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // On success
      toast.success("Appointment logged successfully!");
      onLogSuccess();

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to log appointment.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FIX: Add null checks for patient and service ---
  const patientName = appointment?.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : "N/A";
  const appointmentDate = appointment ? format(new Date(appointment.start_time), "MMMM d, yyyy") : "N/A";
  const serviceName = appointment?.service ? appointment.service.service_name : "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full 
          max-w-[90vw] lg:max-w-[75vw] xl:max-w-[60vw]
          max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 rounded-2xl
        "
      >
        <DialogHeader className="w-full mb-2">
          <div className="flex justify-center">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark text-center">
              Log Appointment
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="bg-blue-light rounded-2xl flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-8 py-2 px-4">
          <div><span className="text-small font-bold text-blue-dark">Patient:</span> {patientName}</div>
          <div><span className="text-small font-bold text-blue-dark">Date:</span> {appointmentDate}</div>
          <div><span className="text-small font-bold text-blue-dark">Service:</span> {serviceName}</div>
        </div>
        
        {error && <div className="text-red-500 text-center p-2 bg-red-100 rounded-md">{error}</div>}

        <div>
          {page === "odontogram" ? (
            <div className="overflow-x-auto">
              <Odontogram onSave={setDentalLog} initialData={dentalLog} />
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-primary rounded-xl p-4 sm:p-6 shadow-sm w-full overflow-x-auto">
              {/* --- FIX: Pass the appointment's service as a prop to SalesBilling --- */}
              {appointment?.patient && <SalesBilling patient={appointment.patient} onUpdate={setInvoiceData} initialService={appointment.service} />}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button variant="outline" className="text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-blue-light w-full sm:w-fit" onClick={onCancelLog}>
            {/* --- FIX: Change button text based on context --- */}
            {appointment?.status === 'completed' ? 'Close' : 'Cancel Log Appointment'}
          </Button>
          
          {/* --- FIX: Hide action buttons when just viewing a completed log --- */}
          {appointment?.status !== 'completed' && (
            page === "odontogram" ? (
              <Button className="w-full sm:w-fit" onClick={() => setPage("billing")}>
                Proceed to Billing
              </Button>
            ) : (
              <>
                <Button className="w-full sm:w-fit" onClick={() => setPage("odontogram")}>
                  Go Back to Dental Chart
                </Button>
                <Button className="w-full sm:w-fit" onClick={handleFinishLog} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Finish Log Appointment"}
                </Button>
              </>
            )
          )}
        </DialogFooter>
        <Toaster />
      </DialogContent>
    </Dialog>
  )
}
