import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


export default function Availability() {
  return (
    <div className="bg-blue-light p-8 rounded-2xl mt-4 w-full h-full">
      <div className="grid grid-cols-2 gap-x-16 gap-y-4">
        {/* Weekly Hours */}
        <p className="font-semibold text-lg text-blue-dark">Weekly hours</p>
        <p className="font-semibold text-lg text-blue-dark">Date-specific hours</p>
        <div className="grid grid-cols-2 gap-4 w-36 items-center">
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">SUN</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">MON</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">TUE</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">WED</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">THU</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">FRI</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
          <span className="bg-blue-accent p-2 h-8 rounded-lg font-medium text-blue-dark flex items-center justify-center">SAT</span>
          <Input type="time" id="time-from" defaultValue="09:00" className="bg-background" />
        </div>
        {/* Date-specific Hours */}
        <div className="grid grid-cols-2 gap-4">
          
        </div>
      </div>
      <Button className="bg-blue-primary text-white hover:bg-blue-dark mt-8">Update availability</Button>
    </div>
  );
}