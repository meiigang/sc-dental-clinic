"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { jwtDecode } from "jwt-decode"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { personalSchema } from "@/components/patientForms/formSchemas/schemas"


export default function PersonalInfoForm({ readOnly = false }) {
  const personalForm = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    mode: "onSubmit",
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

  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  useEffect(() => {
    if (isEditing) {
      setHasSubmitted(false);
      personalForm.clearErrors();
    }
  }, [isEditing]);

  useEffect(() => {
    // Decode JWT
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (token) {
    try {
      type UserJwtPayload = {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        suffix?: string;
        [key: string]: any;
      };
      const user = jwtDecode<UserJwtPayload>(token);
      personalForm.setValue("firstName", user.firstName || "");
      personalForm.setValue("middleName", user.middleName || "");
      personalForm.setValue("lastName", user.lastName || "");
      const allowedSuffixes = ["none", "Jr", "Sr", "II", "III"] as const;
      const suffix = allowedSuffixes.includes(user.suffix as any) ? user.suffix : "none";
      personalForm.setValue("suffix", suffix as typeof allowedSuffixes[number]);
    } catch (err) {
      console.error("Invalid token:", err);
    } 
    }
  }, [personalForm]);

  function onPersonalSubmit(values: z.infer<typeof personalSchema>) {
    console.log("Personal Info:", values)
    setHasSubmitted(true);
    setIsEditing(false);
  }

  return (
    <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Personal Information</h3>
      <Form {...personalForm}>
        <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6">
          <FormField
            control={personalForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">First Name *</FormLabel>
                <FormControl>
                  <Input {...field}
                  readOnly
                  className="bg-blue-light" />
                </FormControl>
                <FormMessage className="min-h-[20px]"/>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Middle Name</FormLabel>
                <FormControl>
                  <Input {...field} 
                  readOnly
                  className="bg-blue-light" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Dela Cruz" {...field}
                  readOnly
                  className="bg-blue-light" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Nickname</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={!isEditing}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.nickname ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
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
                <FormLabel className="text-blue-dark">Suffix</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    className="bg-blue-light"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Birthdate *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="MM/DD/YYYY"
                    value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val ? new Date(val) : undefined);
                    }}
                    disabled={!isEditing}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.birthDate ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
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
                <FormLabel className="text-blue-dark">Age *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    className="bg-blue-light w-20"
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
                <FormLabel className="text-blue-dark">Sex *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={`${isEditing && hasSubmitted && personalForm.formState.errors.sex ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"} w-30`}
                    disabled={!isEditing}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">M</SelectItem>
                      <SelectItem value="female">F</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          </div>
          <FormField
            control={personalForm.control}
            name="religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Religion *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={!isEditing}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.religion ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
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
                <FormLabel className="text-blue-dark">Nationality *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly={!isEditing}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.nationality ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
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
                <FormLabel className="text-blue-dark">Home Address *</FormLabel>
                <Input
                  {...field}
                  readOnly={!isEditing}
                  className={`${isEditing && hasSubmitted && personalForm.formState.errors.homeAddress ? "border-red-500" : ""}
                  ${isEditing ? "bg-background" : "bg-blue-light"} w-full`}
                />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Occupation</FormLabel>
                <Input 
                  {...field}
                    readOnly={!isEditing}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.occupation ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
                />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="dentalInsurance"
            render={({field}) => (
              <FormItem className="col-span-1 md:col-start-1">
                <FormLabel className="text-blue-dark">Dental Insurance</FormLabel>
                <Input
                  {...field}
                  readOnly={!isEditing}
                  className={`${isEditing && hasSubmitted && personalForm.formState.errors.dentalInsurance ? "border-red-500" : ""}
                  ${isEditing ? "bg-background" : "bg-blue-light"}`}
                  />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Effective Date *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={!isEditing}
                    placeholder="MM/DD/YYYY"
                    value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val ? new Date(val) : undefined);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.effectiveDate ? "border-red-500" : ""}
                      ${isEditing ? "bg-background" : "bg-blue-light"}`}
                  />
                </FormControl>
              </FormItem>
            )} 
          />
          <FormField
            control={personalForm.control}
            name="patientSince"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Patient Since</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={!isEditing}
                    placeholder="MM/DD/YYYY"
                    value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val ? new Date(val) : undefined);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.patientSince ? "border-red-500" : ""}
                      ${isEditing ? "bg-background" : "bg-blue-light"}`}
                  />
                </FormControl>
              </FormItem>
            )} 
          />
          <div className="emergency-contact col-span-5 mt-2">
            <h5 
            className="text-blue-dark font-semibold">Emergency Contact</h5>
          </div>
          <FormField
            control={personalForm.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Dela Cruz" {...field} 
                    readOnly={!isEditing}
                    className={`${isEditing && hasSubmitted && personalForm.formState.errors.emergencyContactName ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="emergencyContactOccupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Occupation *</FormLabel>
                <Input 
                  {...field}
                  readOnly={!isEditing}
                  className={`${isEditing && hasSubmitted && personalForm.formState.errors.emergencyContactOccupation ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`}
                />
              </FormItem>
            )}
          />
          <FormField
            control={personalForm.control}
            name="emergencyContactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Contact Number *</FormLabel>
                <FormControl>
                  <Input
                  {...field} 
                  readOnly={!isEditing}
                  className={`${isEditing && hasSubmitted && personalForm.formState.errors.emergencyContactNumber ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`} />
                </FormControl>
              </FormItem>
            )}
          />
          {!readOnly && (
          isEditing ? (
            <Button type="submit" className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4 hover:bg-blue-dark">
              Save Changes
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4 hover:bg-blue-dark"
              onClick={() => {
                setIsEditing(true);
                personalForm.reset(personalForm.getValues())
              }}
            >
              Edit Changes
            </Button>
          )
        )}
          
        </form>
      </Form>
    </div>
  )
}
