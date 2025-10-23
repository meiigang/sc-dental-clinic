'use client'
import {useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppointmentsTable } from "@/components/appointments-table";

export default function AppointmentsPage() {
  const [filterOption, setFilterOption] = useState("This Week");
  const [sortOption, setSortOption] = useState("Date");
  
  return (
    <main>
      <div className="text-center mt-14">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-dark text-center">Appointments</h1>

      <AppointmentsTable />
    </div>
    </main>
  );
}