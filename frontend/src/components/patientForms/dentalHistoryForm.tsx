"use client"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { z } from "zod"
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

export default function DentalHistoryForm() {
  // Instantiate dental form
  const dentalForm = useForm<z.infer<typeof dentistSchema>>({
    defaultValues: {
      previousDentist: "",
      lastDentalVisit: undefined
    }
  })

  const [ isEditing, setIsEditing ] = useState(false);

  useEffect(() => {
    console.log("DentalHistoryForm mounted");
    return () => console.log("DentalHistoryForm unmounted");
  }, []);

  const lastDentalVisit = dentalForm.watch("lastDentalVisit");

  //Log info on screen to catch any errors
  function onDentalSubmit (values: z.infer<typeof dentistSchema>) {
    console.log("Dental History Info:", values)
    setIsEditing(false);
  }
  // Use effect for when checkbox is clicked
  // Disable when patient is an existing patient

  //Render HTML
  return (
    <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Dental History</h3>
      <Form {...dentalForm}>
        <form onSubmit={dentalForm.handleSubmit(onDentalSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6 w-full max-w-6xl">
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
                    readOnly={!isEditing}
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
                    disabled ={!isEditing}
                    className={`${isEditing ? "bg-background" : "bg-blue-light"}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            !isEditing ? (
              <Button
                className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4 hover:bg-blue-dark"
                onClick={() => setIsEditing(true)}
              >
                Edit changes
              </Button>
            ) : (
              <Button className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4 hover:bg-blue-dark">
                Save Changes
              </Button>
            )
}
        </form>
      </Form>
    </div>
  )
}