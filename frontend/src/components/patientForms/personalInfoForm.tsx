"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
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


type FormMode = "register" | "edit";

type PersonalInfoFormProps = {
  initialValues?: z.infer<typeof personalSchema>;
  readOnly?: boolean;
  onSubmit?: (data: z.infer<typeof personalSchema>) => void;
  onPrev?: () => void; // Register stepper
  mode?: FormMode;
};

export default function PersonalInfoForm({ initialValues, readOnly = false, onPrev, mode }: PersonalInfoFormProps) {
  const personalForm = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    mode: "onSubmit",
    defaultValues: initialValues || {
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
  });

  // Reset form when initialValues change (for read-only display)
  useEffect(() => {
    if (initialValues) {
      personalForm.reset(initialValues);
    }
  }, [initialValues]);

  const [ isEditing, setIsEditing ] = useState(false);
  const [ hasSubmitted, setHasSubmitted ] = useState(false);
  const [ userId, setUserId ] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  // If readOnly, force isEditing to false
  useEffect(() => {
    if (readOnly) setIsEditing(false);
  }, [readOnly]);

  const birthDate = personalForm.watch("birthDate");

  // Calculate age from birth date
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

  //Reset form when toggling edit mode
  useEffect(() => {
    if (isEditing) {
      setHasSubmitted(false);
      personalForm.clearErrors();
    }
  }, [isEditing]);

  //Populate form with user data from JWT
  useEffect(() => {
    //Decode JWT
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (token) {
    try {
      type UserJwtPayload = {
        id?: string;
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
      setUserId(user.id || user.sub || "");
      console.log("Decoded JWT:", user); // For debugging
      console.log("userId to send:", user.id); // For debugging
    } catch (err) {
      console.error("Invalid token:", err);
    } 
    }
  }, [personalForm]);

  console.log("Current userId state:", userId);

  //When form is submitted
  function onPersonalSubmit(values: z.infer<typeof personalSchema>) {
    console.log("Personal Info:", values)
    setHasSubmitted(true);
     if (userId) {
        updatePersonalInfo(values, userId);
    } else {
        submitPersonalInfo(values);
    }
    setIsEditing(false);
  }

  //Submit data to backend
  async function submitPersonalInfo(data: z.infer<typeof personalSchema>) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = { ...data, userId };
      const res = await fetch("http://localhost:4000/api/patients/patientPersonalInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, body: JSON.stringify(payload),
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.error("Error submitting personal info:", error);
      return null;
    }
  }

  //Fetch existing personal info from backend
  useEffect(() => {
    if (!userId) return;

    async function fetchPatientInfo() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/api/patients/patientPersonalInfo/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        console.log("Fetched patient info from backend:", data);
        if (data.patient) {
          personalForm.reset({
            ...personalForm.getValues(),
            nickname: data.patient.nickname || "",
            suffix: data.patient.suffix || "none",
            birthDate: data.patient.birth_date ? new Date(data.patient.birth_date) : undefined,
            age: data.patient.age || "",
            sex: data.patient.sex || "",
            religion: data.patient.religion || "",
            nationality: data.patient.nationality || "",
            homeAddress: data.patient.home_address || "",
            occupation: data.patient.occupation || "",
            dentalInsurance: data.patient.dental_insurance || "",
            effectiveDate: data.patient.effective_date ? new Date(data.patient.effective_date) : undefined,
            patientSince: data.patient.patient_since ? new Date(data.patient.patient_since) : undefined,
            emergencyContactName: data.emergencyContact?.name || "",
            emergencyContactOccupation: data.emergencyContact?.occupation || "",
            emergencyContactNumber: data.emergencyContact?.contact_number || "",
          });
        }
      } catch (err) {
        console.error("Error fetching patient info:", err);
      }
    }

    fetchPatientInfo();
  }, [userId, personalForm]);

  //PATCH or update personal info
  async function updatePersonalInfo(data: z.infer<typeof personalSchema>, userId: string) {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const payload = { ...data };
        const res = await fetch(`http://localhost:4000/api/patients/patientPersonalInfo/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        return result;
    } catch (error) {
      console.error("Error updating personal info:", error);
      return null;
    }
  }

  //Button Handler -> Button modes for when rendering on the register page vs update profile info button
  type FormMode = "register" | "edit";

  type PersonalInfoFormProps = {
    initialValues?: z.infer<typeof personalSchema>;
    readOnly?: boolean;
    onSubmit?: (data: z.infer<typeof personalSchema>) => void;
    onPrev?: () => void; //Register stepper
    mode?: FormMode;
  }


  return (
    <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Personal Information</h3>
      <Form {...personalForm}>
        <form ref={formRef} onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                  disabled={readOnly || !isEditing}
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
                  disabled={readOnly || !isEditing}
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
                  disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                    disabled={readOnly || !isEditing}
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
                  disabled={readOnly || !isEditing}
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
                  disabled={readOnly || !isEditing}
                  className={`${isEditing && hasSubmitted && personalForm.formState.errors.emergencyContactNumber ? "border-red-500" : ""}
                    ${isEditing ? "bg-background" : "bg-blue-light"}`} />
                </FormControl>
              </FormItem>
            )}
          />
          {mode === "register" ? (
            <div className="flex gap-2 mt-4">
              {onPrev && (
                <Button type="button" onClick={onPrev}>
                  Previous
                </Button>
              )}
              <Button type="submit">
                Next
              </Button>
            </div>
          ) : 
          (
              !readOnly && (
              isEditing ? (
                <Button
                  type="button"
                  className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4 hover:bg-blue-dark"
                  onClick={() => formRef.current?.requestSubmit()}>
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
            )
          )
          }
        </form>
      </Form>
    </div>
  )
}
