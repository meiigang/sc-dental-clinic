'use client'
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Odontogram from "@/odontogram/Components/Odontogram"

type LogAppointmentProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onCancelLog: () => void;
};

export function LogAppointment({open, onOpenChange, onCancelLog} : LogAppointmentProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-2xl font-bold text-blue-dark">Log Appointment</DialogTitle>
          </DialogHeader>
          <div>
            {/* Backend: fetch information */}
            <p>Patient: </p>
            <p>Appointment Date: </p>
            <p>Service: </p>
          </div>
          <Odontogram panelType="log"/>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-blue-light w-fit" onClick={onCancelLog}>Cancel Log Appointment</Button>
            <Button className="w-fit" onClick={onCancelLog}>Finish Log Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
