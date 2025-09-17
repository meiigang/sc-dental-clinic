"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RiPencilFill } from "react-icons/ri"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { EditProfileForm } from "@/components/editProfileForm/EditProfileForm"

export default function StaffDashboard() {
  // Extract token variables
  const [firstName, setFirstName] = useState("User");
  const [fullName, setFullName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
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

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setFirstName(decoded.firstName || "User");
        setFullName(`${decoded.firstName || ""} ${decoded.lastName || ""}`.trim());
        setUserEmail(decoded.email || "");
        setUserContact(decoded.contactNumber || "");
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


  return (
    <main>
      <div className="page-container px-50 py-20 space-y-6 min-h-screen">
        {/* User Profile */}
        <div className="mt-4 justify-center">
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">Welcome, {firstName}</h1>
          
          {/* Profile Details*/}
          <div className="flex gap-90 mt-8">
            <div className="flex flex-row gap-4">
              {/* Profile Detail Labels */}
              <div className="flex flex-col gap-4">
                <span className="bg-blue-accent px-4 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap">Name</span>
                <span className="bg-blue-accent px-4 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap">Email Address</span>
                <span className="bg-blue-accent px-4 py-2 rounded-xl font-medium text-blue-dark whitespace-nowrap">Phone Number</span>
              </div>
              {/* Profile Key Values*/}
              <div className="flex flex-col gap-4">
                <span className="px-4 py-2 font-medium text-dark">{fullName}</span>
                <span className="px-4 py-2 font-medium text-dark">{userEmail}</span>
                <span className="px-4 py-2 font-medium text-dark">{userContact}</span>
              </div>
            </div>

            {/* Profile Picture and Edit Button */}
            <div className="flex flex-col gap-4 items-center">
            {/* Profile Picture */}
              <div className="justify-center">
                <Image
                  src="/images/img-profile-default.png"
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

        {/* Availability Calendar */}
        <div className="mt-50">
          <h1 className="text-3xl font-bold text-blue-dark">Availability</h1>

          {/* Calendar */ }
          <div className="bg-blue-light p-5 rounded-2xl mt-4 w-96 h-96 flex items-center justify-center">
            <p className="text-blue-dark">Calendar Component Placeholder</p>
          </div>
        </div>

          { /* Recently Viewed Patient Records */ }
          <div className="mt-50">
            <h1 className="text-3xl font-bold text-blue-dark">Recently Viewed Patient Records</h1>
          </div>

          {/* Recently Viewed Patient Records */ }
          <div className="bg-[#DAE3F6] p-5 rounded-2xl mt-4 w-full h-128 flex items-center justify-center overflow-y-auto">
          </div>
      </div>
    </main>
  );
}