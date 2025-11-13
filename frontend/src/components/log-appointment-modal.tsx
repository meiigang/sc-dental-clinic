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
      <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto p-8 rounded-xl">
        {/* Centered Header */}
        <DialogHeader className="w-full mb-2">
          <div className="w-full flex justify-center">
            <DialogTitle className="text-3xl font-bold text-blue-dark">
              Log Appointment
            </DialogTitle>
          </div>
        </DialogHeader>
        {/* Page Content */}
        {/* Appointment Details */}
        {/* (TO DO: data fetching for patient, date, service) */}
        <div className="bg-blue-light rounded-2xl flex flex-row items-center gap-8 py-2 px-4 h-12">
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
        <div className="">
          {page === "odontogram" ? (
            <><Odontogram panelType="log" /></>
          ) : (
            <>
              <div className="bg-white border-2 border-blue-primary rounded-xl p-6 shadow-sm w-full">
                <SalesBilling/>
              </div>
            </>
          )}
        </div>
        {/* Footer Buttons */}
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-blue-light w-fit"
            onClick={onCancelLog}
          >
            Cancel Log Appointment
          </Button>
          {page === "odontogram" ? (
            <>
              {/* Navigation Button to Billing */}
              <Button onClick={() => setPage("billing")}>
                Proceed to Billing
              </Button>
            </>
          ) : (
            <>
              {/* Navigation Button back to Dental Chart */}
              <Button onClick={() => setPage("odontogram")}>
                Go Back to Dental Chart
              </Button>
              <Button className="w-fit" onClick={onCancelLog}>
                Finish Log Appointment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
