"use client";
import Image from "next/image";
import { RiPencilFill } from "react-icons/ri";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { RiLightbulbLine } from 'react-icons/ri';
import { RiArrowRightUpLine } from "react-icons/ri";
import Link from 'next/link';

export default function PatientDashboard() {

    const [firstName, setFirstName] = useState("User");
    const [fullName, setFullName] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [userContact, setUserContact] = useState("");
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setFirstName(decoded.firstName || "User");
                setFullName(`${decoded.firstName || ""} ${decoded.lastName || ""}`.trim());
                setUserEmail(decoded.email || "");
                setUserContact(decoded.contactNumber || "");

                //Check patient record
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
                            className="w-100 rounded-3xl object-cover"
                            width={160}
                            height={160}
                        />
                    </div>
                </div> 
            </div>

            {/* Show dialog box if patient does not have a patient record */}
            {showPatientDialog && (
            <div className="dialog-box bg-[#DAE3F6] text-[#082565] p-10 mt-40 rounded-2xl flex flex-row justify-center">
                <div className="mr-5 ">
                    < RiLightbulbLine size={35}/>
                </div>
                <div className="text-container w-170 px-5 text-lg">
                    You need to fill out your <b>Patient Information Record</b> first before you can reserve an appointment.
                    <Link href="/patient-information-record" className="text-[#466BBA] ml-1 inline-flex items-center underline">Take me there<RiArrowRightUpLine /></Link>
                </div>
            </div>
        )}
            

            {/* Appointments Table */}
            <div className="mt-50">
                <h1 className="text-3xl font-bold text-blue-dark">Appointments</h1>
            </div>
        </div>
    </main>
  );
}