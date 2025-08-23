import Image from "next/image";
import { RiPencilFill } from "react-icons/ri";

export default function StaffDashboard() {
  return (
    <main className="bg-blue-light">
        <div className="page-container px-50 py-20 space-y-6 min-h-screen">
            {/* User Profile */}
            <div className="mt-4 justify-center">
                {/* "Staff" to be replaced by user*/}
                <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">Welcome, Staff</h1>
                {/* Edit Profile button */}
                <div>
                    <span className="flex items-center text-blue-primary">
                        <RiPencilFill size={20}/>
                        <span className="ml-1">Edit Profile</span>
                    </span>
                </div>

                <div className="flex items-center gap-120 mt-4">
                    <div className="flex flex-col gap-4 mt-6">                    
                        {/* Profile Details (to be replaced by user data) */}
                        <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark">Name</span>
                        <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark">Email Address</span>
                        <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark">Phone Number</span>
                        <span className="bg-[#98AFDF] px-4 py-2 rounded-2xl font-medium text-blue-dark">Password</span>
                    </div>

                    {/* Profile Picture */}
                    <div className="flex justify-center mt-6">
                        <Image
                            src="/images/img-profile-default.png"
                            alt="Default Profile Picture"
                            className="w-60 h-60 rounded-3xl object-cover"
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