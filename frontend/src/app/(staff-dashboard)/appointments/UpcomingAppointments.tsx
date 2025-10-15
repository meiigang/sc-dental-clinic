"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUpDown } from "lucide-react";

export default function UpcomingAppointments() {
  const [filterOption, setFilterOption] = useState("This Week");
  const [sortOption, setSortOption] = useState("Date");

  return (
    <div className="max-w-6xl mx-auto bg-blue-light p-6 rounded-3xl shadow-md">
      {/* Header + Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-dark">
          Upcoming Appointments
        </h2>

        <div className="flex gap-4">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6">
                <Filter className="h-4 w-4" />
                {filterOption}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterOption("This Week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("Today")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("This Month")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("All")}>
                All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6">
                <ArrowUpDown className="h-4 w-4" />
                Sort by {sortOption}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("Date")}>
                Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Service")}>
                Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Payment Status")}>
                Payment Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table with Scroll Limit */}
      <div className="overflow-x-auto">
        <div className="max-h-[480px] overflow-y-auto rounded-2xl border border-blue-accent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-accent text-blue-dark font-semibold sticky top-0">
                <th className="p-3 border border-blue-accent">Date</th>
                <th className="p-3 border border-blue-accent">Time</th>
                <th className="p-3 border border-blue-accent">Patient</th>
                <th className="p-3 border border-blue-accent">Service</th>
              </tr>
            </thead>
            <tbody>
              {/* Future API data will be dynamically mapped here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
