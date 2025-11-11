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
        <DialogHeader className="w-full mb-6">
          <div className="w-full flex justify-center">
            <DialogTitle className="text-2xl font-bold text-blue-dark">
              Log Appointment
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Page Content */}
<div className="">
{page === "odontogram" ? (
  <>
    {/* Just render Odontogram directly */}
    <Odontogram panelType="log" />

    {/* Navigation Button to Billing */}
    <div className="flex justify-center mt-4">
      <Button onClick={() => setPage("billing")}>
        Billing →
      </Button>
    </div>
  </>
) : (
  <>
    <div className="w-full border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
      <SalesBilling/>
    </div>

    {/* Navigation Button back to Odontogram */}
    <div className="flex justify-center mt-4">
      <Button onClick={() => setPage("odontogram")}>
        ← Odontogram
      </Button>
    </div>
  </>
)}

</div>



        {/* Footer Buttons */}
        <DialogFooter className="flex justify-end gap-2 mt-8">
          <Button
            variant="outline"
            className="text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-blue-light w-fit"
            onClick={onCancelLog}
          >
            Cancel Log Appointment
          </Button>
          <Button className="w-fit" onClick={onCancelLog}>
            Finish Log Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
