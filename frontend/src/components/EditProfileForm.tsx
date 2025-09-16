import Image from "next/image";
import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, Profile } from "../app/(staff-dashboard)/staff-landing/schema";

interface EditProfileFormProps {
  initialValues: Partial<Profile>;
  onSubmit: (data: Profile) => void;
  loading?: boolean;
}

export function EditProfileForm({ initialValues, onSubmit, loading }: EditProfileFormProps) {
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="I">I</SelectItem>
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
                src="/images/img-profile-default.png"
                alt="Default Profile Picture"
                className="rounded-2xl object-cover mt-4"
                width={208}
                height={208}
              />
              </div>
              <Button className="bg-blue-accent text-blue-dark hover:bg-blue-primary hover:text-white w-full">
                Upload New Picture
              </Button>
              <Button className="bg-blue-accent text-blue-dark hover:bg-blue-primary hover:text-white w-full">
                Remove Picture
              </Button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-blue-primary text-white hover:bg-blue-dark" disabled={loading}>Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
