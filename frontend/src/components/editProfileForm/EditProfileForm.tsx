import Image from "next/image";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, Profile } from "./schema";
import { jwtDecode } from "jwt-decode"
import { useEffect, useState, useRef } from "react"; 
import { z } from "zod";

export function EditProfileForm() {
  //Define use states
  const [userId, setUserId] = useState<string>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("/images/img-profile-default.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "none",
      email: "",
      contactNumber: "",
      password: ""
    },
  });

  //Get user id from JWT token and fetch data
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    //If token found
    if (token){
      //Decode JWT
      const decoded: any = jwtDecode(token);
      const currentUserId = decoded.id;
      setUserId(currentUserId);

      //ASYNC: Retrieve user from backend
      const fetchUserData = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/edit-profile/${currentUserId}`);
          if (!response.ok){
            throw new Error("Failed to fetch user data.");
          }

          const data = await response.json();

          form.reset({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName, 
            suffix: data.nameSuffix || "none",
            email: data.email,
            contactNumber: data.contactNumber
          });

          if (data.profile_picture) {
            setProfilePictureUrl(data.profile_picture);
          }

        }  catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData()
    }
  }, [form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfilePictureUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePicture = () => {
    setSelectedFile(null);
    setProfilePictureUrl("/images/img-profile-default.png");
    // We will send a flag to the backend to nullify the URL
  };

  //Backend call to update user data
  async function handleProfileUpdate(values: z.infer<typeof profileSchema>) {
    const formData = new FormData();

    // Append all form text fields
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'password' && !value) return; // Don't append empty password
      if (value) {
        formData.append(key, value as string);
      }
    });

    // Append the file if a new one was selected
    if (selectedFile) {
      formData.append('profilePicture', selectedFile);
    } else if (profilePictureUrl === "/images/img-profile-default.png") {
      // If the image is the default one, it means user wants to remove it
      formData.append('removeProfilePicture', 'true');
    }

    try {
      const response = await fetch(`http://localhost:4000/api/edit-profile/${userId}`, {
        method: 'PATCH',
        body: formData,
      });

      const responseData = await response.json(); 

      if (!response.ok){
        throw new Error(responseData.message || "Failed to update profile.");
      }

      // Check if a new token was sent and update it
      if (responseData.token) {
        // Update whichever storage you use (localStorage or sessionStorage)
        if (localStorage.getItem("token")) {
            localStorage.setItem("token", responseData.token);
        }
        if (sessionStorage.getItem("token")) {
            sessionStorage.setItem("token", responseData.token);
        }
      }
      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error: ${error.message}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
        <div className="flex flex-row gap-20">
          <div className="space-y-4">
            <p className="text-blue-dark font-medium text-lg">Basic Information</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* First Name */}
              <FormField name="firstName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} id="firstName" placeholder="First Name" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Middle Name */}
              <FormField name="middleName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input {...field} id="middleName" placeholder="Middle Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Last Name */}
              <FormField name="lastName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input {...field} id="lastName" placeholder="Last Name" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Suffix */}
              <FormField name="suffix" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Suffix</FormLabel>
                  <FormControl>
                    <Select name="suffix">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" {...field} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jr.">Jr.</SelectItem>
                        <SelectItem value="Sr.">Sr.</SelectItem>
                        <SelectItem value="II">II</SelectItem>
                        <SelectItem value="III">III</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Email Address */}
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input {...field} id="email" type="email" placeholder="Email Address" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Contact Number */}
            <FormField name="contactNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number *</FormLabel>
                <FormControl>
                  <Input {...field} id="contactNumber" placeholder="09XXXXXXXXX" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Password */}
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} id="password" type="password" placeholder="New Password" />
                </FormControl>
                <FormDescription>Leave blank to keep current password.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Profile Picture */}
          <div>
            <p className="text-blue-dark font-medium text-lg">Profile Picture</p>
            <div className="flex flex-col gap-4 items-center">
              <div>
              <Image
                src={profilePictureUrl}
                alt="Profile Picture"
                className="rounded-2xl object-cover mt-4"
                width={208}
                height={208}
              />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                style={{ display: 'none' }}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-blue-accent text-blue-dark hover:bg-blue-primary hover:text-white w-full">
                Upload New Picture
              </Button>
              <Button type="button" onClick={handleRemovePicture} className="bg-blue-accent text-blue-dark hover:bg-blue-primary hover:text-white w-full">
                Remove Picture
              </Button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-blue-primary text-white hover:bg-blue-dark">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}

