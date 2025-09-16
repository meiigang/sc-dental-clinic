"use client"
import Image from "next/image"
import Link from 'next/link'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { AppointmentHistoryTable } from "@/components/AppointmentHistoryTable"

export default function PatientRecord() {
  // Extract token variables
  const [firstName, setFirstName] = useState("User");
  const [fullName, setFullName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
      const decoded: any = jwtDecode(token);
      setFirstName(decoded.firstName || "User");
      setFullName(`${decoded.firstName || ""} ${decoded.lastName || ""}`.trim());
      setUserEmail(decoded.email || "");
      setUserContact(decoded.contactNumber || "");

      // Check patient record
      fetch(`http://localhost:4000/api/patients/check-record/${decoded.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.hasPatientRecord) {
            setShowPatientDialog(true);
          }
        })
      } catch (err) {
        setFirstName("User");
        setFullName("User");
        setUserEmail("");
        setUserContact("");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT
    window.location.replace("/login"); // Force reload to clear cached state
  }

  return (
    <main className="bg-blue-light">
      <div className="page-container px-50 py-20 space-y-6 min-h-screen">
        {/* Patient Profile */}
        <div className="justify-center">
          <p className="text-lg font-medium text-blue-primary">Patient Record</p>
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">{fullName}</h1>

          {/* Profile Details*/}
          <div className="flex gap-90 mt-8">
            <div className="flex flex-row gap-4">
              {/* Profile Detail Labels */}
              <div className="flex flex-col gap-4">
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Email Address</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Phone Number</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Patient Since</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Status</span>
              </div>
              {/* Profile Key Values*/}
              <div className="flex flex-col gap-4">
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{fullName}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userContact}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">year</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-green-600">Active</span>
              </div>
            </div>

            {/* Profile Picture (to be replaced by user's set profile picture) */}
            <div className="justify-end">
                <Image
                  src="/images/img-profile-default.png"
                  alt="Default Profile Picture"
                  className="rounded-3xl object-cover"
                  width={210}
                  height={210}
                />
            </div>  
          </div> 
        </div>

        {/* Patient Information Record */}
        <div className="py-20">
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark mb-4">Patient Information Record</h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Personal Information</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>Personal Information</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Dental History</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>Dental History</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Medical History</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>Medical History</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Appointments Table */}
        <div className="py-20">
          <h1 className="text-3xl font-bold text-blue-dark">Appointment History</h1>
          <AppointmentHistoryTable/>
        </div>

        {/* Dental Chart */}
        <div className="py-20">
          <h1 className="text-3xl font-bold text-blue-dark">Dental Chart</h1>
          {/* Dental Chart here */}
        </div>
      </div>
    </main>
  );
}