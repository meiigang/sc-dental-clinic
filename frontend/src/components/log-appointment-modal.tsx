'use client'

import { useState } from "react"
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import Odontogram from "@/odontogram/Components/Odontogram"
import SalesBilling from "./SalesBilling"

type LogAppointmentProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onCancelLog: () => void
}

export function LogAppointment({ open, onOpenChange, onCancelLog }: LogAppointmentProps) {
  const [page, setPage] = useState<"odontogram" | "billing">("odontogram")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full 
          max-w-[125vw] sm:max-w-[120vw] md:max-w-[105vw] lg:max-w-[90vw] xl:max-w-[60vw]
          max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 rounded-2xl
        "
      >
        {/* Centered Header */}
        <DialogHeader className="w-full mb-2">
          <div className="flex justify-center">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark text-center">
              Log Appointment
            </DialogTitle>
          </div>
        </DialogHeader>
        {/* Page Content */}
        {/* Appointment Details */}
        {/* (TO DO: data fetching for patient, date, service) */}
        <div className="bg-blue-light rounded-2xl flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-8 py-2 px-4">
          <div>
            <span className="text-small font-bold text-blue-dark">Patient:</span> name
          </div>
          <div>
            <span className="text-small font-bold text-blue-dark">Date:</span> date
          </div>
          <div>
            <span className="text-small font-bold text-blue-dark">Service:</span> service
          </div>
        </div>
        <div>
          {page === "odontogram" ? (
            <div className="overflow-x-auto">
              <Odontogram panelType="log" />
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-primary rounded-xl p-4 sm:p-6 shadow-sm w-full overflow-x-auto">
              <SalesBilling />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button
            variant="outline"
            className="text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-blue-light w-full sm:w-fit"
            onClick={onCancelLog}
          >
            Cancel Log Appointment
          </Button>
          {page === "odontogram" ? (
            <>
              {/* Navigation Button to Billing */}
              <Button className="w-full sm:w-fit" onClick={() => setPage("billing")}>
                Proceed to Billing
              </Button>
            </>
          ) : (
            <>
              {/* Navigation Button back to Dental Chart */}
              <Button className="w-full sm:w-fit" onClick={() => setPage("odontogram")}>
                Go Back to Dental Chart
              </Button>
              <Button className="w-full sm:w-fit" onClick={onCancelLog}>
                Finish Log Appointment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
