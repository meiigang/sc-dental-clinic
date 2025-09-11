"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InspectionPanel } from "lucide-react"
import { personalSchema, dentistSchema, medicalSchema } from "./schemas";

export default function PatientRecords() {
  const personalForm = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "none",
      birthDate: undefined,
      age: "",
      sex: "",
      religion: "",
      nationality: "",
      nickname: "",
      homeAddress: "",
      occupation: "",
      dentalInsurance: "",
      effectiveDate: undefined,
      patientSince: undefined,
      emergencyContactName: "",
      emergencyContactOccupation: "",
      emergencyContactNumber: "",
    }
  })

  const birthDate = personalForm.watch("birthDate");

  useEffect(() => {
    if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    personalForm.setValue("age", age.toString(), { shouldValidate: true });
  } else {
    personalForm.setValue("age", "", { shouldValidate: true });
  } 
  }, [birthDate, personalForm]);

  function onPersonalSubmit(values: z.infer<typeof personalSchema>) {
    console.log("Personal Info:", values)
  }

  return (
    <main className="bg-background">
      <div className="record-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Patient Information Record</h1>
        <div className="form-container bg-[#DAE3F6] justify-center mt-10 p-10 rounded-xl">
          <h3 className="text-xl font-semibold text-blue-dark mb-5">Personal Information</h3>
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6">
              <FormField
                control={personalForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field}
                      className="bg-[#F8FAFF]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Antonia" {...field} 
                      className="bg-[#F8FAFF]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dela Cruz" {...field}
                      className="bg-[#F8FAFF]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Nickname</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#F8FAFF]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="suffix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Suffix</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-[#F8FAFF]" >
                          <SelectValue placeholder="Select" 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Jr">Jr</SelectItem>
                          <SelectItem value="Sr">Sr</SelectItem>
                          <SelectItem value="II">II</SelectItem>
                          <SelectItem value="III">III</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Birthdate *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder="MM/DD/YYYY"
                        value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                        onChange={e => {
                          const val = e.target.value;
                          field.onChange(val ? new Date(val) : undefined);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="bg-[#F8FAFF]"
                      />
                    </FormControl>
                  </FormItem>
                )} 
              />
              <div className="col-span-1 flex gap-2 items-end">
                <FormField
                control={personalForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Age *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-[#F8FAFF] w-20"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="sex"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Sex *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-[#F8FAFF] w-20">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">M</SelectItem>
                          <SelectItem value="female">F</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <FormField
                control={personalForm.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Religion *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#F8FAFF]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Nationality *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#F8FAFF]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="homeAddress"
                render={({ field }) => (
                  <FormItem className="col-span-3 md:col-start-1">
                    <FormLabel className="text-[#082565]">Home Address *</FormLabel>
                    <Input
                      {...field}
                      className="bg-[#F8FAFF] w-full"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#082565]">Occupation</FormLabel>
                    <Input 
                      {...field}
                      className="bg-[#F8FAFF]"
                    />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4">
                Edit changes
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}