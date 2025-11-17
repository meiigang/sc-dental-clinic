'use client'
import {useState } from "react"
import { AppointmentsTable } from "@/components/appointments-table"
import { jwtDecode } from "jwt-decode";;

export default function AppointmentsPage() {
  const [filterOption, setFilterOption] = useState("This Week");
  const [sortOption, setSortOption] = useState("Date");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  let userRole = "";
  if (token) {
    const decoded = jwtDecode(token);
    userRole = decoded.role; // Make sure this matches your JWT payload
  }
    
  return (
    <main>
      <div id="appointments"className="text-center mt-14">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-dark text-center">Appointments</h1>
      <AppointmentsTable userRole={userRole}/>
    </div>
    </main>
  );
}