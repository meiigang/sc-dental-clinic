"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { z } from "zod"
import { jwtDecode } from "jwt-decode"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { personalSchema } from "@/components/patientForms/formSchemas/schemas"

type FormMode = "register" | "edit";

type PersonalInfoFormProps = {
  initialValues?: z.infer<typeof personalSchema>;
  readOnly?: boolean;
  onSubmit?: (data: z.infer<typeof personalSchema>) => void;
  onPrev?: () => void;
  mode?: FormMode;
};

export default function PersonalInfoForm({ initialValues, readOnly = false, onSubmit, onPrev, mode }: PersonalInfoFormProps) {
  const personalForm = useForm<z.infer<typeof personalSchema>>({
    resolver: zodResolver(personalSchema),
    mode: "onSubmit",
    defaultValues: initialValues || {
      birthDate: undefined,
      age: "",
      sex: "",
      religion: "",
      nationality: "",
      nickname: "",
      homeAddress: "",
      occupation: "",
      hasDentalInsurance: false,
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
      // --- FIX: Map from the new nested structure ---
      const mappedValues = {
        // Patient fields
        nickname: initialValues.nickname || "",
        birthDate: initialValues.birth_date ? new Date(initialValues.birth_date) : undefined,
        occupation: initialValues.occupation || "", // This is now unambiguously the patient's occupation
        age: initialValues.age || "",
        sex: initialValues.sex || "",
        religion: initialValues.religion || "",
        nationality: initialValues.nationality || "",
        homeAddress: initialValues.home_address || "",
        dentalInsurance: initialValues.dental_insurance || "",
        effectiveDate: initialValues.effective_date ? new Date(initialValues.effective_date) : undefined,
        patientSince: initialValues.patient_since ? new Date(initialValues.patient_since) : undefined,
        // ... other patient fields ...
        
        // Emergency Contact fields from the nested object
        emergencyContactName: initialValues.emergency_contact?.name || "",
        emergencyContactOccupation: initialValues.emergency_contact?.occupation || "",
        emergencyContactNumber: initialValues.emergency_contact?.contact_number || "",
      };
      personalForm.reset(mappedValues);
    }
  }, [initialValues, personalForm]);

  // Use states for buttons and fields
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ isEditing, setIsEditing ] = useState(mode==='register');
  const [ hasSubmitted, setHasSubmitted ] = useState(false);
  const [ userId, setUserId ] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const birthDate = personalForm.watch("birthDate");

  const today = new Date().toISOString().split("T")[0];

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

  console.log("Current userId state:", userId);

  //Get user ID from JWT
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if(token){
      try{
        const decoded: any = jwtDecode(token);
        setUserId(decoded.id);

      }
      catch (error){
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // When form is submitted
  function onPersonalSubmit(values: z.infer<typeof personalSchema>) {
    console.log("Personal Info:", values)
    setHasSubmitted(true);
     if (userId) {
        updatePersonalInfo(values, userId);
    } else {
        submitPersonalInfo(values);
    }
    personalForm.reset(values); // Reset form to clear dirty state and hide Save/Discard buttons
  }

  // Submit data to backend
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
      if (res.ok) {
        toast.success("Personal information saved successfully!");
      } else {
        toast.error(result.message || "Failed to save personal information.");
      }
      return result;
    } catch (error) {
      console.error("Error submitting personal info:", error);
      toast.error("Failed to save personal information.");
      return null;
    }
  }

  // Fetch existing personal info from backend
  useEffect(() => {
    // This condition correctly separates the two use cases (staff-side vs patient-side)
    if (initialValues || !userId) return;

    async function fetchPatientInfo() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`/api/patients/patientPersonalInfo/${userId}`, { // Use relative path
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json(); // data is { patient: { ..., emergency_contact: { ... } } }
        
        if (data.patient) {
          // --- FIX: Map from the new nested data structure ---
          const fetchedData = {
            // Patient fields
            nickname: data.patient.nickname || "",
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
            
            // Emergency Contact fields from the nested object
            emergencyContactName: data.patient.emergency_contact?.name || "",
            emergencyContactOccupation: data.patient.emergency_contact?.occupation || "",
            emergencyContactNumber: data.patient.emergency_contact?.contact_number || "",
          };
          personalForm.reset(fetchedData);
        }
      } catch (err) {
        console.error("Error fetching patient info:", err);
      }
    }

    fetchPatientInfo();
  }, [userId, personalForm, initialValues]);

  // PATCH or update personal info
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
        if (res.ok) {
          toast.success("Personal information updated successfully!");
        } else {
          toast.error(result.message || "Failed to update personal information.");
        }
        return result;
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Failed to update personal information.");
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
        <form ref={formRef} 
          onSubmit={personalForm.handleSubmit(mode === 'register' && onSubmit ? onSubmit : onPersonalSubmit)} 
          className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl">
            <FormField
              control={personalForm.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-dark">Nickname</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      className={`${hasSubmitted && personalForm.formState.errors.nickname ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                      disabled={readOnly}
                      max={today}
                      value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                      onChange={e => {
                        const val = e.target.value;
                        field.onChange(val ? new Date(val) : undefined);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className={`${hasSubmitted && personalForm.formState.errors.birthDate ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={readOnly}>
                      <SelectTrigger className={`${hasSubmitted && personalForm.formState.errors.sex ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}>
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
                      disabled={readOnly}
                      className={`${hasSubmitted && personalForm.formState.errors.religion ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                      disabled={readOnly}
                      className={`${hasSubmitted && personalForm.formState.errors.nationality ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                    disabled={readOnly}
                    className={`${hasSubmitted && personalForm.formState.errors.homeAddress ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"} w-full`}
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
                    disabled={readOnly}
                    className={`${hasSubmitted && personalForm.formState.errors.occupation ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
                  />
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
                      placeholder="MM/DD/YYYY"
                      disabled={readOnly}
                      max={today}
                      value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                      onChange={e => {
                        const val = e.target.value;
                        field.onChange(val ? new Date(val) : undefined);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className={`${hasSubmitted && personalForm.formState.errors.patientSince ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
                    />
                  </FormControl>
                </FormItem>
              )} 
            />
            <div className="emergency-contact col-span-5 mt-2">
              <h5 className="text-blue-dark font-semibold">Emergency Contact</h5>
            </div>
            <FormField
              control={personalForm.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-dark">Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Dela Cruz" {...field} 
                      disabled={readOnly}
                      className={`${hasSubmitted && personalForm.formState.errors.emergencyContactName ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={personalForm.control}
              name="emergencyContactOccupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-dark">Relationship *</FormLabel>
                  <Input 
                    {...field}
                    disabled={readOnly}
                    className={`${hasSubmitted && personalForm.formState.errors.emergencyContactOccupation ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                    disabled={readOnly}
                    className={`${hasSubmitted && personalForm.formState.errors.emergencyContactNumber ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`} />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Dental Insurance Section */}
            {mode === "register" && (
              <div className="col-span-5 my-4">
                <h5 className="text-blue-dark font-semibold">Dental Insurance</h5>
                <FormField
                  control={personalForm.control}
                  name="hasDentalInsurance"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                          id="hasDentalInsurance"
                        />
                      </FormControl>
                      <FormLabel htmlFor="hasDentalInsurance" className="text-blue-dark my-3">
                        I have dental insurance (required)
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* If hasDentalInsurance is true, show details fields */}
                {personalForm.watch("hasDentalInsurance") && (
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end mt-2">
        <div className="flex-1">
          <FormField
            control={personalForm.control}
            name="dentalInsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Dental Insurance Details *</FormLabel>
                <Input
                  {...field}
                  disabled={readOnly}
                  className={`${personalForm.formState.errors.dentalInsurance ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={personalForm.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Effective Date *</FormLabel>
                <Input
                  type="date"
                  disabled={readOnly}
                  value={field.value ? (typeof field.value === "string" ? field.value : field.value.toISOString().split("T")[0]) : ""}
                  onChange={e => {
                    const val = e.target.value;
                    field.onChange(val ? new Date(val) : undefined);
                  }}
                  className={`${personalForm.formState.errors.effectiveDate ? "border-red-500" : ""} ${!readOnly ? "bg-background" : "bg-blue-light"}`}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    )}
              </div>
            )}

            {/* If form is in the Register page, Previous and Next buttons appear */}
            {mode === "register" ? (
              <div className="md:col-span-5 flex justify-end gap-2">
                {onPrev && (
                  <Button type="button" onClick={onPrev} className="bg-blue-primary">
                    Previous
                  </Button>
                )}
                <Button type="submit" className="bg-blue-dark">
                  Next
                </Button>
              </div>
            ) : (
              // If form is in the Profile page, Save Changes and Discard Changes buttons appear
              !readOnly && personalForm.formState.isDirty && (
              <div className="col-span-1 md:col-span-5 flex justify-end gap-2 mt-4">
                <Button type="button" className="bg-blue-primary hover:bg-blue-dark" onClick={() => formRef.current?.requestSubmit()}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-primary text-blue-primary hover:bg-blue-100 hover:text-blue-dark"
                  onClick={() => setShowCancelModal(true)}
                >
                  Discard Changes
                </Button>
              </div>
            )
          )}
          {/* Cancel Confirmation Modal */}
          <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent className="w-2xl">
              <DialogHeader>
                <DialogTitle>Discard changes?</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to discard all unsaved changes?</div>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button variant="outline" className="hover:bg-gray-200" onClick={() => setShowCancelModal(false)}>
                  {"No, keep editing"}
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-700 text-white"
                  onClick={() => {
                    personalForm.reset();
                    setShowCancelModal(false);
                  }}
                >
                  {"Yes, discard changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </Form>
      <Toaster />
    </div>
  )
}
