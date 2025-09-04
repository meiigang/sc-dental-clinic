"use client";
import Image from "next/image";
import { RiPencilFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";


export default function StaffDashboard() {
    //Extract token variables
    const [firstName, setFirstName] = useState("User");
    const [fullName, setFullName] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [userContact, setUserContact] = useState("");
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
        localStorage.removeItem("token"); //Remove JWT
        window.location.replace("/login"); // Force reload to clear cached state
    }


  return (
    <main className="bg-blue-light">
        <div className="page-container px-50 py-20 space-y-6 min-h-screen">
            {/* User Profile */}
            <div className="mt-4 justify-center">
                {/* "Staff" to be replaced by user*/}
                <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">Welcome, {firstName}</h1>
                {/* Edit Profile button */}
                <div>
                    <span className="flex items-center text-blue-primary">
                        <RiPencilFill size={20}/>
                        <span className="ml-1">Edit Profile</span>
                    </span>
                </div>

                <div className="flex justify-start gap-90 mt-4">
                    {/* Profile Details*/}
                    <div className="flex flex-row gap-4 mt-5">
                        {/* Profile Detail Labels */}
                        <div className="flex flex-col gap-4 mt-6">
                            <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Name</span>
                            <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Email Address</span>
                            <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Phone Number</span>
                            <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Password</span>
                        </div>
                        {/* Profile Key Values*/}
                        <div className="flex flex-col gap-4 mt-6">
                            <span className="px-4 py-2 rounded-2xl font-medium text-dark">{fullName}</span>
                            <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userEmail}</span>
                            <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userContact}</span>
                            <span className="px-4 py-2 rounded-2xl font-medium text-dark">********</span>
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="flex justify-center mt-6">
                        <Image
                            src="/images/img-profile-default.png"
                            alt="Default Profile Picture"
                            className="w-160 rounded-3xl object-cover"
                            width={160}
                            height={160}
                        />
                    </div>
                </div>
            </div>

            {/* Availability Calendar */}
            <div className="mt-50">
                <h1 className="text-3xl font-bold text-blue-dark">Availability</h1>

                {/* Calendar */ }
                <div className="bg-white p-5 rounded-2xl mt-4 w-96 h-96 flex items-center justify-center">
                    <p className="text-blue-dark">[Calendar Component Placeholder]</p>
                </div>
            </div>

            { /* Recently Viewed Patient Records */ }
            <div className="mt-50">
                <h1 className="text-3xl font-bold text-blue-dark">Recently Viewed Patient Records</h1>

                {/* Recently Viewed Patient Records */ }
                <div className="bg-white p-5 rounded-2xl mt-4 w-96 h-96 flex items-center justify-center">
                    <p className="text-blue-dark">[Recently Viewed Patient Records Component Placeholder]</p>
                </div>
            </div>
        </div>
    </main>
  );
}