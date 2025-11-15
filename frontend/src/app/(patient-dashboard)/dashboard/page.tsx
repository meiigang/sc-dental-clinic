"use client"
import Image from "next/image"
import Link from 'next/link'
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RiPencilFill } from "react-icons/ri"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { EditProfileForm } from "@/components/editProfileForm/EditProfileForm"
import PatientAppointmentsTable from "@/components/PatientAppointmentsTable";

export default function PatientDashboard() {
  const [firstName, setFirstName] = useState("User");
  const [fullName, setFullName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [profilePicture, setProfilePicture] = useState("/images/img-profile-default.png");
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

  const appointmentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setFirstName(decoded.firstName || "User");
        setFullName(`${decoded.firstName || ""} ${decoded.middleName || ""} ${decoded.lastName || ""}`.trim());
        setUserEmail(decoded.email || "");
        setUserContact(decoded.contactNumber || "");
        setProfilePicture(decoded.profile_picture || "/images/img-profile-default.png");
        setProfile({
          firstName: decoded.firstName || "",
          middleName: decoded.middleName || "",
          lastName: decoded.lastName || "",
          suffix: (["none", "Jr.", "Sr.", "II", "III"].includes(decoded.suffix) ? decoded.suffix : "none") as "none" | "Jr." | "Sr." | "II" | "III",
          email: decoded.email || "",
          contactNumber: decoded.contactNumber || "",
          password: ""
        });
      } catch {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <div className="page-container px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-5 sm:py-14 md:py-14 lg:py-14 xl:py-14 space-y-10 min-h-screen">

        {/* User Profile */}
        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-dark">Welcome, {firstName}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
            {/* Left: Profile Picture & Edit */}
            <div className="lg:col-span-2 flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                <Image
                  src={profilePicture}
                  alt="Profile Picture"
                  className="rounded-3xl object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"
                  width={224}
                  height={224}
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-primary text-white hover:bg-blue-dark w-full">
                      <RiPencilFill /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-dark">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <EditProfileForm
                      initialValues={profile}
                      onSubmit={(data) => console.log("Profile updated:", data)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Center: Profile Details */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-row items-center gap-2 w-full">
                    <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">Name</span>
                    <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">{fullName || "—"}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2 w-full">
                    <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">Email Address</span>
                    <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">{userEmail || "—"}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2 w-full">
                    <span className="bg-blue-accent px-3 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap text-sm sm:text-base w-36">Phone Number</span>
                    <span className="px-3 py-2 font-medium text-dark text-sm sm:text-base truncate grow">{userContact || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="w-full lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 sm:p-6 border border-blue-200 h-full flex flex-col gap-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-dark mb-3">Quick Actions</h3>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => scrollToSection(appointmentsRef)}
                    className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-left flex flex-col"
                  >
                    <span className="font-semibold text-blue-dark text-sm sm:text-base">View Appointments</span>
                    <span className="text-xs sm:text-sm text-gray-600 mt-1">Check your appointment status.</span>
                  </button>

                  <Link href="/reserve-appointment" className="w-full">
                    <button className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-left flex flex-col">
                      <span className="font-semibold text-blue-dark text-sm sm:text-base">Reserve Appointment</span>
                      <span className="text-xs sm:text-sm text-gray-600 mt-1">Schedule a new appointment quickly.</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div ref={appointmentsRef} id="appointments"  className="py-8 sm:py-12 md:py-16">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-dark m-4">Appointments</h3>
          <PatientAppointmentsTable />
        </div>

      </div>
    </main>
  )
}
