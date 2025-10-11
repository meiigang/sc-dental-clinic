"use client"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { dentistSchema } from "@/components/patientForms/formSchemas/schemas"
import { jwtDecode } from "jwt-decode"

type FormMode = "register" | "edit";

type dentalHistoryFormProps = {
  initialValues?: z.infer<typeof dentistSchema>;
  readOnly?: boolean;
  onSubmit?: (data: z.infer<typeof dentistSchema>) => void;
  onPrev?: () => void; // Register stepper
  mode?: FormMode;
};

export default function DentalHistoryForm({ initialValues, readOnly = false, onSubmit, onPrev, mode }: dentalHistoryFormProps) {

  // Instantiate dental form
  const dentalForm = useForm<z.infer<typeof dentistSchema>>({
    defaultValues: initialValues || {
      previousDentist: "",
      lastDentalVisit: undefined
    }
  });

  // Reset form when initialValues change (for read-only display)
  useEffect(() => {
    if (initialValues) {
      dentalForm.reset(initialValues);
    }
  }, [initialValues]);

  const [ isEditing, setIsEditing ] = useState(mode==='register');
  const [ userId, setUserId ] = useState<string>("");
  const [patientId, setPatientId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [ dentalHistoryId, setDentalHistoryId ] = useState<number | null>(null);

  // If readOnly, force isEditing to false
  useEffect(() => {
    if (readOnly) setIsEditing(false);
  }, [readOnly]);

  useEffect(() => {
    console.log("DentalHistoryForm mounted");
    return () => console.log("DentalHistoryForm unmounted");
  }, []);

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

  useEffect(() => {
    if (!patientId) return;

    async function fetchDentalHistory() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res =  await fetch(`http://localhost:4000/api/patients/patientDentalHistory/${patientId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        console.log("Fetched patient dental history:", data);
        if (data.dentalHistory && data.dentalHistory.length > 0) {
          setDentalHistoryId(data.dentalHistory[0].id); // <-- Save the id for PATCH
          dentalForm.reset({
            previousDentist: data.dentalHistory[0].previous_dentist || "",
            lastDentalVisit: data.dentalHistory[0].last_dental_visit ? new Date(data.dentalHistory[0].last_dental_visit) : undefined
          });
        } else {
          setDentalHistoryId(null);
        }
      } catch (err) {
        console.error("Error fetching dental history:", err);
      }
    }

    fetchDentalHistory();
  }, [patientId, dentalForm]);

  const lastDentalVisit = dentalForm.watch("lastDentalVisit");

  //Log info on screen to catch any errors
  async function onDentalSubmit (values: z.infer<typeof dentistSchema>) {
    console.log("Dental History Info:", values);
    if (dentalHistoryId) {
    await patchDentalHistory(values, dentalHistoryId); // PATCH if record exists
  } else {
    await submitDentalHistory(values); // POST if new
  }
    setIsEditing(false);
  }
  //Use effect for when checkbox is clicked
    //Disable when patient is an existing patient
  
  //Post form to backend
  //Submit data to backend
    async function submitDentalHistory(data: z.infer<typeof dentistSchema>) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const payload = { ...data, patientId };
        const res = await fetch("http://localhost:4000/api/patients/patientDentalHistory", {
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
  
    //Fetch data from backend
    useEffect(() => {
      if (!patientId) return;
  
      async function fetchDentalHistory() {
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          
          //Prepare request to backend
          const res =  await fetch(`http://localhost:4000/api/patients/patientDentalHistory/${patientId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (!res.ok) return;
          const data = await res.json();
          console.log("Fetched patient dental history:", data);
          if (data.dentalHistory && data.dentalHistory.length > 0) {
            //Populate form with the latest record
            dentalForm.reset({
              previousDentist: data.dentalHistory[0].previous_dentist || "",
              lastDentalVisit: data.dentalHistory[0].last_dental_visit ? new Date(data.dentalHistory[0].last_dental_visit) : undefined
            });
          }
        } catch (err) {
          console.error("Error fetching dental history:", err);
        }
      }
  
      fetchDentalHistory();
    }, [patientId, dentalForm]);

  //Update patient dental records
  async function patchDentalHistory(data: z.infer<typeof dentistSchema>, dentalHistoryId: number) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        previousDentist: data.previousDentist,
        lastDentalVisit: data.lastDentalVisit
          ? (typeof data.lastDentalVisit === "string"
              ? data.lastDentalVisit
              : data.lastDentalVisit.toISOString().split("T")[0])
          : null,
      };
      const res = await fetch(`http://localhost:4000/api/patients/patientDentalHistory/${dentalHistoryId}`, {
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
      console.error("Error updating dental history:", error);
      return null;
    }
  }

  //Render HTML
  return (
    <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Dental History</h3>
      <Form {...dentalForm}>
        <form ref={formRef} 
          onSubmit={dentalForm.handleSubmit(mode === 'register' && onSubmit ? onSubmit : onDentalSubmit)} 
          className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl">
          <FormField
            control={dentalForm.control}
            name="previousDentist"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark col-span-3 md:col-span-3">Previous Dentist</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane" {...field} 
                    className={`${isEditing ? "bg-background" : "bg-blue-light"}`}
                    readOnly={readOnly || !isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={dentalForm.control}
            name="lastDentalVisit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-dark col-span-2 md:col-span-2">Last Dental Visit</FormLabel>
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
                    disabled={readOnly || !isEditing}
                    className={`${isEditing ? "bg-background" : "bg-blue-light"}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            !readOnly && (
              !isEditing ? (
                <Button
                  type="button"
                  className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4"
                  onClick={() => {setIsEditing(true)}}
                >
                  Edit changes
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4"
                  onClick={() => formRef.current?.requestSubmit()}>
                  Save Changes
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