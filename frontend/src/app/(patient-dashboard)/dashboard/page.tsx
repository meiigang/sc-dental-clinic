"use client"
import Image from "next/image"
import Link from 'next/link'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RiPencilFill } from "react-icons/ri"
import { RiLightbulbLine } from 'react-icons/ri'
import { RiArrowRightUpLine } from "react-icons/ri"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { EditProfileForm } from "@/components/editProfileForm/EditProfileForm"
import PatientAppointmentsTable from "@/components/PatientAppointmentsTable";

export default function PatientDashboard() {
  // Extract token variables
  const [firstName, setFirstName] = useState("User");
  const [fullName, setFullName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [profilePicture, setProfilePicture] = useState("/images/img-profile-default.png");
  const [showPatientDialog, setShowPatientDialog] = useState(false);
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

  useEffect(() => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setFirstName(decoded.firstName || "User");
          setFullName(`${decoded.firstName || ""} ${decoded.lastName || ""}`.trim());
          setUserEmail(decoded.email || "");
          setUserContact(decoded.contactNumber || "");
          setProfilePicture(decoded.profile_picture ||  "/images/img-profile-default.png" );

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
            setProfilePicture("/images/img-profile-default.png");
        }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); //Remove JWT
    window.location.replace("/login"); // Force reload to clear cached state
  }

  return (
    <main>
      <div className="page-container px-50 py-20 space-y-6 min-h-screen">
        {/* User Profile */}
        <div className="mt-4 justify-center">
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">Welcome, {firstName}</h1>

          <div className="flex gap-90 mt-8">
            {/* Profile Details*/}
            <div className="flex flex-row gap-4">
              {/* Profile Detail Labels */}
              <div className="flex flex-col gap-4">
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Name</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Email Address</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Phone Number</span>
              </div>
              {/* Profile Key Values*/}
              <div className="flex flex-col gap-4">
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{fullName}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userEmail}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userContact}</span>
              </div>
            </div>
              
            {/* Profile Picture and Edit Button */}
            <div className="flex flex-col gap-4 items-center">
              {/* Profile Picture */}
              <div className="justify-center">
                <Image
                  src={profilePicture}
                  alt="Default Profile Picture"
                  className="rounded-3xl object-cover"
                  width={160}
                  height={160}
                />
              </div>

              {/* Edit Profile Modal */}
              <Dialog>
                {/* Edit Profile Button */}
                <DialogTrigger asChild>
                  <Button className="bg-blue-primary text-white hover:bg-blue-dark w-full">
                    <RiPencilFill />Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-blue-dark">Edit Profile</DialogTitle>
                  </DialogHeader>
                  {/* Edit Profile Form Component */}
                <EditProfileForm
                  initialValues={profile}
                  onSubmit={(data) => {
                    // TODO: handle backend update here
                    console.log("Profile form submitted:", data);
                  }}
                />
                </DialogContent>
              </Dialog>
            </div>  
          </div> 
        </div>

        {/* Show dialog box if patient does not have a patient record */}
        {showPatientDialog && (
        <div className="dialog-box bg-[#DAE3F6] text-[#082565] p-10 mt-40 rounded-2xl flex flex-row justify-center">
          <div className="mr-5">
            <RiLightbulbLine size={35} />
          </div>
          <div className="text-container w-170 px-5 text-lg">
            You need to fill out your <b>Patient Information Record</b> first before you can reserve an appointment.
            <Link href="/patient-information-record" className="text-[#466BBA] ml-1 inline-flex items-center underline">Take me there<RiArrowRightUpLine /></Link>
          </div>
        </div>
        )}        

        {/* Appointments */}
        <div className="mt-50">
          <h1 className="text-3xl font-bold text-blue-dark">Appointments</h1>

          {/* Appointments Table */}
          <div className="flex justify-center mt-10">
           <PatientAppointmentsTable/>
          </div>
          <div className="flex justify-center mt-5">
            <Link href="/reserve-appointment">
              <Button className="bg-blue-primary text-white hover:bg-blue-dark">Reserve Appointment</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}