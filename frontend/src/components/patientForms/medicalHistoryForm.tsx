"use client"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { jwtDecode } from "jwt-decode"
import { medicalSchema } from "@/components/patientForms/formSchemas/schemas"

type FormMode = "register" | "edit";

type MedicalHistoryFormProps = {
  initialValues?: z.infer<typeof medicalSchema>;
  readOnly?: boolean;
  onSubmit?: (data: z.infer<typeof medicalSchema>) => void;
    onPrev?: () => void; // Register stepper
    mode?: FormMode;
};

export default function MedicalHistoryForm({ initialValues, readOnly = false, onSubmit, onPrev, mode }: MedicalHistoryFormProps) {
  // Instantiate medical form
  const medicalForm = useForm<z.infer<typeof medicalSchema>>({
    defaultValues: {
      physicianName: "",
      officeAddress: "",
      specialty: "",
      officeNumber: "",
      goodHealth: "yes",
      underMedicalTreatment: "no",
      medicalTreatmentCondition: "",
      hadSurgery: "no",
      surgeryDetails: "",
      wasHospitalized: "no",
      hospitalizationDetails: "",
      onMedication: "no",
      medicationDetails: "",
      usesTobacco: "no",
      usesDrugs: "no",
      allergies: [],
      bleedingTime: "",
      isPregnant: "no",
      isNursing: "no",
      isTakingBirthControl: "no",
      bloodType: "",
      bloodPressure: "",
      diseases: []
    }
  })

  // Use states for buttons and fields
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === 'register');
  const [userId, setUserId] = useState<string>("");
  const [patientId, setPatientId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [medicalHistoryId, setMedicalHistoryId] = useState<number | null>(null);

  //When submitting form
  async function onMedicalSubmit (values: z.infer<typeof medicalSchema>) {
    console.log("Medical History Info:", values)
      if (medicalHistoryId) {
        await updateMedicalForm(values, medicalHistoryId); // PATCH if record exists
      } else {
        await submitMedicalForm(values); // POST if new
      }
    medicalForm.reset(values); // Reset form to clear dirty state and hide Save/Discard buttons
  }
    
  //Retrieve patient id from JWT
  useEffect(() => {
    // 1. Get user ID from JWT
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = decoded.id; // or decoded.userId or decoded.sub, depending on your JWT
      setUserId(userId);

      // 2. Fetch patient record using user ID
      fetch(`http://localhost:4000/api/patients/patientPersonalInfo/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.patient && data.patient.id) {
            setPatientId(data.patient.id); // 3. Save patient primary key
          }
        })
        .catch(err => console.error("Failed to fetch patient record:", err));
    }
  }, []);
    
  //Fetch and set medicalHistoryId
  useEffect(() => {
    if (!patientId) return;
    async function fetchMedicalHistory() {
        try { 
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const res = await fetch(`http://localhost:4000/api/patients/patientMedicalHistory/${patientId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (!res.ok) return;
          const data = await res.json();
          console.log("Fetched patient medical history:", data);
          if (data.medicalHistory) {
            const record = data.medicalHistory;
            setMedicalHistoryId(record.id);
            medicalForm.reset({
              physicianName: record.physician_name || "",
              officeAddress: record.office_address || "",
              specialty: record.specialty || "",
              officeNumber: record.office_number || "",
              goodHealth: record.good_health ? "yes" : "no",
              underMedicalTreatment: record.under_medical_treatment ? "yes" : "no",
              medicalTreatmentCondition: record.medical_treatment_condition || "",
              hadSurgery: record.had_surgery ? "yes" : "no",
              surgeryDetails: record.surgery_details || "",
              wasHospitalized: record.was_hospitalized ? "yes" : "no",
              hospitalizationDetails: record.hospitalization_details || "",
              onMedication: record.on_medication ? "yes" : "no",
              medicationDetails: record.medication_details || "",
              usesTobacco: record.uses_tobacco ? "yes" : "no",
              usesDrugs: record.uses_drugs ? "yes" : "no",
              allergies: record.allergies || [],
              bleedingTime: record.bleeding_time || "",
              isPregnant: record.is_pregnant ? "yes" : "no",
              isNursing: record.is_nursing ? "yes" : "no",
              isTakingBirthControl: record.is_taking_birth_control ? "yes" : "no",
              bloodType: record.blood_type || "",
              bloodPressure: record.blood_pressure || "",
              diseases: record.diseases || []
            });
          } else {
            setMedicalHistoryId(null);
          }
        } catch (err) {
          console.error("Error fetching medical history:", err);
        }
    }
    fetchMedicalHistory();
  }, [patientId, medicalForm]);

  //Submit data to backend
  async function submitMedicalForm(data: z.infer<typeof medicalSchema>) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        patientId,
        physicianName: data.physicianName,
        officeAddress: data.officeAddress,
        specialty: data.specialty,
        officeNumber: data.officeNumber,
        goodHealth: data.goodHealth === "yes",
        underMedicalTreatment: data.underMedicalTreatment === "yes",
        medicalTreatmentCondition: data.medicalTreatmentCondition,
        hadSurgery: data.hadSurgery === "yes",
        surgeryDetails: data.surgeryDetails,
        wasHospitalized: data.wasHospitalized === "yes",
        hospitalizationDetails: data.hospitalizationDetails,
        onMedication: data.onMedication === "yes",
        medicationDetails: data.medicationDetails,
        usesTobacco: data.usesTobacco === "yes",
        usesDrugs: data.usesDrugs === "yes",
        allergies: data.allergies,
        bleedingTime: data.bleedingTime,
        isPregnant: data.isPregnant === "yes",
        isNursing: data.isNursing === "yes",
        isTakingBirthControl: data.isTakingBirthControl === "yes",
        bloodType: data.bloodType,
        bloodPressure: data.bloodPressure,
        diseases: data.diseases
      };
      const res = await fetch("http://localhost:4000/api/patients/patientMedicalHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      return result;
    } catch (error) {
      console.error("Error submitting medical info:", error);
      return null;
    }
  }

  //Fetch data from backend
  useEffect(() => {
    if (!patientId) return;
      
    async function fetchMedicalHistory() {
      try { 
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        // Prepare request to backend
        const res = await fetch(`http://localhost:4000/api/patients/patientMedicalHistory/${patientId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        console.log("Fetched patient medical history:", data);
        if (data.medicalHistory && data.medicalHistory.length > 0) {
          const record = data.medicalHistory[0];
          medicalForm.reset({
            physicianName: record.physician_name || "",
            officeAddress: record.office_address || "",
            specialty: record.specialty || "",
            officeNumber: record.office_number || "",
            goodHealth: record.good_health ? "yes" : "no",
            underMedicalTreatment: record.under_medical_treatment ? "yes" : "no",
            medicalTreatmentCondition: record.medical_treatment_condition || "",
            hadSurgery: record.had_surgery ? "yes" : "no",
            surgeryDetails: record.surgery_details || "",
            wasHospitalized: record.was_hospitalized ? "yes" : "no",
            hospitalizationDetails: record.hospitalization_details || "",
            onMedication: record.on_medication ? "yes" : "no",
            medicationDetails: record.medication_details || "",
            usesTobacco: record.uses_tobacco ? "yes" : "no",
            usesDrugs: record.uses_drugs ? "yes" : "no",
            allergies: record.allergies || [],
            bleedingTime: record.bleeding_time || "",
            isPregnant: record.is_pregnant ? "yes" : "no",
            isNursing: record.is_nursing ? "yes" : "no",
            isTakingBirthControl: record.is_taking_birth_control ? "yes" : "no",
            bloodType: record.blood_type || "",
            bloodPressure: record.blood_pressure || "",
            diseases: record.diseases || []
          });
        }
      } catch (err) {
        console.error("Error fetching medical history:", err);
      }
    } fetchMedicalHistory();
  }, [patientId, medicalForm])


  //Update data and send to backend
  async function updateMedicalForm(data: z.infer<typeof medicalSchema>, medicalHistoryId: number) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        physicianName: data.physicianName,
        officeAddress: data.officeAddress,
        specialty: data.specialty,
        officeNumber: data.officeNumber,
        goodHealth: data.goodHealth === "yes",
        underMedicalTreatment: data.underMedicalTreatment === "yes",
        medicalTreatmentCondition: data.medicalTreatmentCondition,
        hadSurgery: data.hadSurgery === "yes",
        surgeryDetails: data.surgeryDetails,
        wasHospitalized: data.wasHospitalized === "yes",
        hospitalizationDetails: data.hospitalizationDetails,
        onMedication: data.onMedication === "yes",
        medicationDetails: data.medicationDetails,
        usesTobacco: data.usesTobacco === "yes",
        usesDrugs: data.usesDrugs === "yes",
        allergies: data.allergies,
        bleedingTime: data.bleedingTime,
        isPregnant: data.isPregnant === "yes",
        isNursing: data.isNursing === "yes",
        isTakingBirthControl: data.isTakingBirthControl === "yes",
        bloodType: data.bloodType,
        bloodPressure: data.bloodPressure,
        diseases: data.diseases
      };
      const res = await fetch(`http://localhost:4000/api/patients/patientMedicalHistory/${medicalHistoryId}`, { 
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
      console.error("Error updating medical info:", error);
      return null;
    }
  }

  return (
    <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Medical History</h3>
      <Form {...medicalForm}>
        <form action="medical-history" className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl"
        ref={formRef} onSubmit={medicalForm.handleSubmit(mode === 'register' && onSubmit ? onSubmit : onMedicalSubmit)}>
          {/* Physician Name */}
          <FormField
            control={medicalForm.control}
            name="physicianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Physician Name</FormLabel>
                <FormControl>
                  <Input {...field}
                    placeholder="Dr. Juan Dela Cruz"
                    className= "bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Office Address */}
          <FormField
            control={medicalForm.control}
            name="officeAddress"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-blue-dark">Office Address</FormLabel>
                <FormControl>
                  <Input {...field}
                    className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
          />
          {/* Specialty */}
          <FormField
            control={medicalForm.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Specialty</FormLabel>
                <FormControl>
                  <Input {...field}
                    className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Office Number */}
          <FormField
            control={medicalForm.control}
            name="officeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark">Office Number</FormLabel>
                <FormControl>
                  <Input {...field}
                    className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="questionnaire">
            <h5 className="text-blue-dark font-semibold">Medical Questionnaire</h5>
            <table className="text-sm text-left w-full">
              <thead>
                <tr>
                  <th className="w-3/5"></th>
                  <th className="w-1/5 text-center">Yes</th>
                  <th className="w-1/5 text-center">No</th> 
                </tr>
              </thead>
              <tbody>
                {/* Are you in good health? */}
                <tr>
                  <td className="align-top text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">1.</span>
                    Are you in good health?
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="goodHealth"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="yes"
                          checked={field.value === "yes"}
                          onChange={() => field.onChange("yes")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="goodHealth"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Are you under medical treatment now? */}
                <tr>
                  <td className="align-top text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">2.</span>
                    Are you under medical treatment now?
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="underMedicalTreatment"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="yes"
                          checked={field.value === "yes"}
                          onChange={() => field.onChange("yes")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="underMedicalTreatment"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Use case: If user selects YES */}
                {medicalForm.watch("underMedicalTreatment") === "yes" && (
                  <tr>
                    <td colSpan={3} className="pl-10 pb-2">
                      <FormField
                        control={medicalForm.control}
                        name="medicalTreatmentCondition"
                        render={({ field }) => (
                        <FormItem className="flex">
                          <FormLabel className="font-normal">What is the condition being treated?</FormLabel>
                          <FormControl>
                          <input {...field}  className="bg-background w-40 rounded-sm px-3 ml-2" />
                          </FormControl>
                        </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                )}
                {/* Have you had any serious illness or surgical operation? */}
                <tr>
                  <td className="align-top text-left py- 2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">3.</span>
                    Have you had serious illness or surgical operation?
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="hadSurgery"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="yes"
                          checked={field.value === "yes"}
                          onChange={() => field.onChange("yes")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="hadSurgery"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Use case: If user selects YES */}
                {medicalForm.watch("hadSurgery") === "yes" && (
                  <tr>
                    <td colSpan={3} className="pl-10 pb-2">
                      <FormField
                        control={medicalForm.control}
                        name="surgeryDetails"
                        render={({ field }) => (
                          <FormItem className="flex">
                            <FormLabel className="font-normal">What illness or operation?</FormLabel>
                            <FormControl>
                            <input {...field} className="bg-background text-sm w-1/4 rounded-sm px-3 ml-2" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                  </tr>
                )}
                {/* Have you been hospitalized? */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">4.</span>
                    Have you been hospitalized?
                  </td>
                  <td className="text-center px-6">
                    <FormField
                      control={medicalForm.control}
                      name="wasHospitalized"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="wasHospitalized"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="no"
                          checked={field.value === "no"}
                          onChange={() => field.onChange("no")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Use case: If user selects YES */}
                {medicalForm.watch("wasHospitalized") === "yes" && (
                  <tr>
                    <td colSpan={3} className="pl-10 pb-2">
                    <FormField
                      control={medicalForm.control}
                      name="hospitalizationDetails"
                      render={({ field }) => (
                      <FormItem className="flex">
                        <FormLabel className="font-normal">When, and why?</FormLabel>
                        <FormControl>
                        <input {...field} className="bg-background text-sm w-1/4 rounded-sm px-3 ml-2" />
                        </FormControl>
                      </FormItem>
                      )}
                    />
                    </td>
                  </tr>
                )}
                {/* Is on prescription medication? */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">5.</span>
                    Are you taking any prescription/non-prescription medication?
                  </td>
                  <td className="text-center px-6">
                    <FormField
                      control={medicalForm.control}
                      name="onMedication"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="onMedication"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="no"
                          checked={field.value === "no"}
                          onChange={() => field.onChange("no")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Use case: If user selects YES */}
                {medicalForm.watch("onMedication") === "yes" && (
                  <tr>
                    <td colSpan={3} className="pl-10 pb-2">
                    <FormField
                      control={medicalForm.control}
                      name="medicationDetails"
                      render={({ field }) => (
                      <FormItem className="flex">
                        <FormLabel className="font-normal">Current medication:</FormLabel>
                        <FormControl>
                        <input {...field} className="bg-background text-sm w-1/4 rounded-sm px-3 ml-2" />
                        </FormControl>
                      </FormItem>
                      )}
                    />
                    </td>
                  </tr>
                )}
                {/* Uses tobacco? */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">6.</span>
                    Do you use tobacco products?
                  </td>
                  <td className="text-center px-6">
                    <FormField
                      control={medicalForm.control}
                      name="usesTobacco"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                    <td className="text-center py-2 px-6">
                      <FormField
                        control={medicalForm.control}
                        name="usesTobacco"
                        render={({ field }) => (
                          <FormItem>
                          <FormControl>
                            <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                            />
                          </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                </tr>
                {/* On drugs/alcohol? */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">7.</span>
                    Do you use alcohol, cocaine, or other dangerous drugs?
                  </td>
                  <td className="text-center px-6">
                    <FormField
                      control={medicalForm.control}
                      name="usesDrugs"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                          type="radio"
                          value="yes"
                          checked={field.value === "yes"}
                          onChange={() => field.onChange("yes")}
                          className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-2 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="usesDrugs"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Does patient have allergies? */}
                <tr>
                  <td className="align-top text-left py-2 pr-6" colSpan={3}>
                    <div className="flex">
                    <span className="inline-block w-6 text-right mr-2 align-top">8.</span>
                    <span>Are you allergic to any of the following:</span>
                    </div>
                  </td>
                </tr>
                {/* Allergies checkbox */}
                <tr>
                  <td colSpan={12} className="pb-4">
                    <div className="flex">
                      {/* Empty span for number alignment */}
                      <span className="inline-block w-6 mr-2" />
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                        {[
                        "Local Anesthetic (ex. Lidocaine)",
                        "Penicillin, Antibiotics",
                        "Sulfa drugs",
                        "Aspirin",
                        "Latex",
                        "Others"
                        ].map(option => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={option}
                            checked={medicalForm.watch("allergies")?.includes(option)}
                            onChange={e => {
                              const checked = e.target.checked;
                              const prev = medicalForm.getValues("allergies") || [];
                              if (checked) {
                              medicalForm.setValue("allergies", [...prev, option]);
                              } else {
                              medicalForm.setValue(
                                "allergies",
                                prev.filter((v: string) => v !== option)
                              );
                              }
                            }}
                            className="accent-blue-600"
                          />
                          {option}
                        </label>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
                {/* Bleeding time */}
                <tr>
                  <td className="align-top text-left py-2 pr-6">
                    <span className="inline-block w-6 text-right mr-2 align-top">9.</span>
                    Bleeding time:
                    <FormField
                      control={ medicalForm.control }
                      name="bleedingTime"
                      render={({field}) => (
                        <FormItem className="inline-block ml-2">
                          <FormControl>
                            <input type="text" {...field} 
                            className={`bg-background text-sm w-32 rounded-sm px-3 border border-gray-300 focus:outline-none`}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Form specifier: WOMEN ONLY */}
                <tr>
                  <td className="align-top text-left py-2 pr-6">
                    <span className="inline-block w-6 text-right mr-2 align-top">10.</span>
                    For Women Only:
                  </td>
                </tr>
                {/* Is pregnant? */}
                <tr>
                  <td className="text-left py-1 pr-6">
                    <div className="ml-10">Are you pregnant?</div>
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isPregnant"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isPregnant"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Is nursing? */}
                <tr>
                  <td className="text-left py-1 pr-6">
                    <div className="ml-10">Are you nursing?</div>
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isNursing"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isNursing"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Taking birth control? */}
                <tr>
                  <td className="text-left py-1 pr-6">
                    <div className="ml-10">Are you taking birth control pills?</div>
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isTakingBirthControl"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="yes"
                            checked={field.value === "yes"}
                            onChange={() => field.onChange("yes")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center py-1 px-6">
                    <FormField
                      control={medicalForm.control}
                      name="isTakingBirthControl"
                      render={({ field }) => (
                        <FormItem>
                        <FormControl>
                          <input
                            type="radio"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="accent-blue-600"
                          />
                        </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Blood Type */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 mt-2 align-top">11.</span>
                    Blood type: 
                    <FormField
                      control={ medicalForm.control }
                      name="bloodType"
                      render={({field}) => (
                        <FormItem className="inline-block ml-2">
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select..."/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Blood Pressure */}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap">
                    <span className="inline-block w-6 text-right mr-2 align-top">12.</span>
                    Blood Pressure: 
                    
                    <FormField
                      control={ medicalForm.control }
                      name="bloodPressure"
                      render={({field}) => (
                        <FormItem className="inline-block ml-2">
                          <FormControl>
                            <input type="text" {...field} 
                            className="bg-background text-sm w-32 rounded-sm px-3 border border-gray-300 focus:outline-none" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
                {/* Diseases checkbox*/}
                <tr>
                  <td className="text-left py-2 pr-6 whitespace-nowrap" colSpan={3}>
                    <span className="inline-block w-6 text-right mr-2 align-top">13.</span>
                    Do you have or have you had any of the following? Check which apply:
                    <div className="flex mt-2">
                      {/* Empty span for number alignment */}
                      <span className="inline-block w-6 mr-2" />
                      <div className="grid grid-cols-3 gap-x-60 gap-y-2 flex-1 items-start">
                        {[
                          "High Blood Pressure", "Low Blood Pressure", "Epilepsy/Convulsions",
                          "HIV/AIDS", "Sexually Transmitted Diseases", "Stomach Troubles/Ulcers",
                          "Fainting/Seizure", "Rapid Weight Loss", "Radiation Therapy",
                          "Joint Replacement/Implant", "Heart Surgery", "Heart Attack",
                          "Thyroid Problem", "Heart Disease", "Heart Murmur",
                          "Hepatitis/Liver Disease", "Rheumatic Fever", "Hay Fever/Allergies",
                          "Respiratory Problems", "Tubercolosis", "Swollen Ankles",
                          "Kidney Disease", "Diabetes", "Chest Pain",
                          "Stroke", "Cancer/Tumors", "Anemia",
                          "Angina", "Asthma", "Emphysema",
                          "Bleeding Problems", "Blood Disease", "Head Injuries",
                          "Arthritis/Rheumatism", "Other"        
                        ].map(option => (
                          <label key={option} className="flex items-center gap-2 min-w-0 whitespace-nowrap">
                            <input
                              type="checkbox"
                              value={option}
                              checked={medicalForm.watch("diseases")?.includes(option)}
                              onChange={e => {
                                const checked = e.target.checked;
                                const prev = medicalForm.getValues("diseases") || [];
                                if (checked) {
                                  medicalForm.setValue("diseases", [...prev, option]);
                                } else {
                                  medicalForm.setValue(
                                    "diseases",
                                    prev.filter((v: string) => v !== option)
                                  );
                                }
                              }}
                              className="accent-blue-600"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* If form is in the Register page, Previous and Next buttons appear */}
          {mode === "register" ? (
            <div className="md:col-span-5 flex justify-end gap-2 mt-4">
              {onPrev && (
                <Button type="button" className="bg-blue-primary" onClick={onPrev}>
                  Previous
                </Button>
              )}
              <Button className="bg-blue-dark" type="submit">
                Next
              </Button>
            </div>
          ): (
            // If form is in the Profile page, Save Changes and Discard Changes buttons appear
            !readOnly && medicalForm.formState.isDirty && (
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
                    medicalForm.reset();
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
    </div>
  )
}