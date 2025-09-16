"use client"
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
import { dentistSchema } from "@/components/forms/formSchemas/schemas"

export default function dentalHistoryForm() {
  // Instantiate dental form
  const dentalForm = useForm<z.infer<typeof dentistSchema>>({
    defaultValues: {
      previousDentist: "",
      lastDentalVisit: undefined
    }
  })

  const lastDentalVisit = dentalForm.watch("lastDentalVisit");

  //Log info on screen to catch any errors
  function onDentalSubmit (values: z.infer<typeof dentistSchema>) {
      console.log("Dental History Info:", values)
    }
  //Use effect for when checkbox is clicked
    //Disable when patient is an existing patient

  //Render HTML
  return (
    <div className="form-container bg-[#DAE3F6] justify-center mt-10 p-10 rounded-xl w-full-max max-w-7xl">
      <h3 className="text-xl font-semibold text-blue-dark mb-5">Dental History</h3>
      <Form {...dentalForm}>
        <form onSubmit={dentalForm.handleSubmit(onDentalSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6 w-full-max max-w-6xl">
          <FormField
            control={dentalForm.control}
            name="previousDentist"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#082565] col-span-3 md:col-span-3">Previous Dentist</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} className="bg-[#F8FAFF]" />
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
                <FormLabel className="text-[#082565] col-span-2 md:col-span-2">Last Dental Visit</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4">
            Edit changes
          </Button>
        </form>
      </Form>
    </div>
  )
}