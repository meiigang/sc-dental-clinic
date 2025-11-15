"use client"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { EditProfileForm } from "@/components/editProfileForm/EditProfileForm"
import { RecentPatients } from "@/components/RecentPatients"
import AvailabilityInputs from "@/components/availability-inputs"
import UpcomingAppointments from "../appointments/UpcomingAppointments"
import StaffTable from "@/components/StaffTable"

export default function StaffDashboard() {
  // Extract token variables
  const [firstName, setFirstName] = useState("User");
  const [fullName, setFullName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("/images/img-profile-default.png");
  const [userContact, setUserContact] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "none" as "none" | "Jr." | "Sr." | "II" | "III",
    email: "",
    contactNumber: "",
    password: ""
  });
  const router = useRouter();

  // Refs for scroll navigation
  const availabilityRef = useRef<HTMLDivElement>(null);
  const upcomingAppointmentsRef = useRef<HTMLDivElement>(null);
  const patientRecordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setFirstName(decoded.firstName || "User");
        setFullName(`${decoded.firstName || ""} ${decoded.middleName || ""} ${decoded.lastName || ""}`.trim());
        setUserEmail(decoded.email || "");
        setUserContact(decoded.contactNumber || "");
        setProfilePicture(decoded.profile_picture ||  "/images/img-profile-default.png" );
        setProfile({
          firstName: decoded.firstName || "",
          middleName: decoded.middleName || "",
          lastName: decoded.lastName || "",
          suffix: (["none", "Jr.", "Sr.", "II", "III"].includes(decoded.suffix) ? decoded.suffix : "none") as "none" | "Jr." | "Sr." | "II" | "III",
          email: decoded.email || "",
          contactNumber: decoded.contactNumber || "",
          password: ""
        });
      } catch (err) {
        setFirstName("User");
        setFullName("User");
        setUserEmail("");
        setUserContact("");
        setProfilePicture("/images/img-profile-default.png");
        setProfile({
          firstName: "",
          middleName: "",
          lastName: "",
          suffix: "none",
          email: "",
          contactNumber: "",
          password: ""
        });
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT
    window.location.replace("/login"); // Force reload to clear cached state
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <div className="page-container px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-5 sm:py-14 md:py-14 lg:py-14 xl:py-14 space-y-2 min-h-screen">
        {/* User Profile */}
        <div className="mt-4">
          <h1 className="inline-block text-2xl sm:text-3xl md:text-4xl font-bold text-blue-dark">Welcome, {firstName}</h1>
          
          {/* Profile Details and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
            {/* Left Section: Profile Picture, Buttons, and Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                {/* Left: Profile Picture and Edit/Register Buttons */}
                <div className="flex flex-col gap-3 sm:gap-4 items-center w-full sm:w-auto">
                  <div className="shrink-0">
                    <Image
                      src={profilePicture}
                      alt="Profile Picture"
                      className="rounded-3xl object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"
                      width={224}
                      height={224}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-3 w-50 sm:w-auto">
                    {/* Edit Profile Modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-primary text-white hover:bg-blue-dark w-full">
                          <Pencil /> Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-dark">Edit Profile</DialogTitle>
                        </DialogHeader>
                        <EditProfileForm
                          initialValues={profile}
                          onSubmit={(data) => {
                            console.log("Profile form submitted:", data);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Center: Profile Detail Labels + Values */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 w-full">
                    {/* Column of pairs */}
                    <div className="flex flex-col gap-6 w-full">
                      {/* Name Pair */}
                      <div className="flex flex-row items-center gap-2 w-full">
                        <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">
                          Name
                        </span>
                        <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">
                          {fullName || "—"}
                        </span>
                      </div>

                      {/* Email Pair */}
                      <div className="flex flex-row items-center gap-2 w-full">
                        <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">
                          Email Address
                        </span>
                        <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">
                          {userEmail || "—"}
                        </span>
                      </div>

                      {/* Phone Pair */}
                      <div className="flex flex-row items-center gap-2 w-full">
                        <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">
                          Phone Number
                        </span>
                        <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">
                          {userContact || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions Widget */}
            <div className="w-full lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 sm:p-6 border border-blue-200 h-full">
                <h3 className="text-lg sm:text-xl font-bold text-blue-dark mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => scrollToSection(availabilityRef)}
                    className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left"
                  >
                    <p className="font-semibold text-blue-dark text-sm">View Schedule</p>
                    <p className="text-xs text-gray-600 mt-1">Check your availability</p>
                  </button>

                  <button
                    onClick={() => scrollToSection(upcomingAppointmentsRef)}
                    className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left"
                  >
                    <p className="font-semibold text-blue-dark text-sm">Today's Appointments</p>
                    <p className="text-xs text-gray-600 mt-1">View today's schedule</p>
                  </button>

                  {/* Patient Records with Search Dialog */}
                  <button
                    onClick={() => scrollToSection(patientRecordsRef)}
                    className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left"
                  >
                    <p className="font-semibold text-blue-dark text-sm">Recently Viewed</p>
                    <p className="text-xs text-gray-600 mt-1">View recently accessed records</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div ref={availabilityRef} className="py-2 sm:py-6 md:py-14">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark">Availability</h3>
          <AvailabilityInputs />
        </div>

        {/* Upcoming Appointments */}
        <div ref={upcomingAppointmentsRef} className="py-2 sm:py-6 md:py-14">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark">Upcoming Appointments</h3>
          <UpcomingAppointments />
        </div>
        
        {/* Staff Accounts Table */}
        <div className="py-2 sm:py-6 md:py-14">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark">Staff Accounts</h3>
          <StaffTable />
        </div>

        { /* Recently Viewed Patient Records */ }
        <div ref={patientRecordsRef} className="py-2 sm:py-6 md:py-14">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark">Recently Viewed Patient Records</h3>
          <RecentPatients />
        </div>

      </div>
    </main>
  );
}