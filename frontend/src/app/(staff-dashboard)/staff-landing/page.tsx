"use client"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RiPencilFill } from "react-icons/ri"


export default function StaffDashboard() {
  // Extract token variables
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
      localStorage.removeItem("token"); // Remove JWT
      window.location.replace("/login"); // Force reload to clear cached state
    }
  
  {/* Form Schema for Personal Information 
  const personalForm = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: {firstName},
      lastName: "",
      middleName: "",
      suffix: "none",
    braces
  braces) */}

  return (
    <main className="bg-blue-light">
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
            <div className="flex flex-col gap-4 align-center">
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
                  {/* <Form {...}> */}
                      <DialogTrigger asChild>
                          {/* Edit Profile Button */}
                          <Button className="bg-blue-primary text-white"><RiPencilFill />Edit profile</Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                              <div className="grid gap-3">
                                  <Label htmlFor="first-name">First Name *</Label>
                                  <Input id="first-name"/>
                              </div>
                              <div className="grid gap-3">
                                  <Label htmlFor="middle-name">Middle Name *</Label>
                                  <Input id="middle-name"/>
                              </div>
                          </div>
                      </DialogContent>
                  {/* </Form> */}
              </Dialog>
            </div>
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="mt-50">
          <h1 className="text-3xl font-bold text-blue-dark">Availability</h1>

          {/* Calendar */ }
          <div className="bg-white p-5 rounded-2xl mt-4 w-96 h-96 flex items-center justify-center">
            <p className="text-blue-dark">Calendar Component Placeholder</p>
          </div>
        </div>

        { /* Recently Viewed Patient Records */ }
        <div className="mt-50">
          <h1 className="text-3xl font-bold text-blue-dark">Recently Viewed Patient Records</h1>

          {/* Recently Viewed Patient Records */ }
          <div className="bg-white p-5 rounded-2xl mt-4 w-96 h-96 flex items-center justify-center">
            <p className="text-blue-dark">Recently Viewed Patient Records Component Placeholder</p>
          </div>
        </div>
      </div>
    </main>
  );
}