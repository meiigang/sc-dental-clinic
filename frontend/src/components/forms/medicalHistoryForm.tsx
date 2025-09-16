"use client"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
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
import { medicalSchema } from "@/components/forms/formSchemas/schemas"

export default function medicalHistoryForm() {
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

    //Use state for buttons and fields
    const[isEditing, setIsEditing] = useState(false);

    //When submitting form
    function onMedicalSubmit (values: z.infer<typeof medicalSchema>) {
          console.log("Medical History Info:", values)
          setIsEditing(false);
        }

    return (
        <div className="form-container bg-[#DAE3F6] justify-center mt-10 p-10 rounded-xl">
            <h3 className="text-xl font-semibold text-blue-dark mb-5">Medical History</h3>
            <Form {...medicalForm}>
                <form action="medical-history" className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Physician Name */}
                    <FormField
                        control={medicalForm.control}
                        name="physicianName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#082565]">Physician Name</FormLabel>
                                <FormControl>
                                    <Input {...field} 
                                    readOnly={!isEditing}
                                    placeholder="Dr. John Doe"
                                    className= {`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"}`}/>
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
                                <FormLabel className="text-[#082565]">Office Address</FormLabel>
                                <FormControl>
                                    <Input {...field} 
                                    readOnly={!isEditing}
                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"}`}/>
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
                                <FormLabel className="text-[#082565]">Specialty</FormLabel>
                                <FormControl>
                                    <Input {...field} 
                                    readOnly= {!isEditing}
                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"}`}/>
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
                                <FormLabel className="text-[#082565]">Office Number</FormLabel>
                                <FormControl>
                                    <Input {...field} 
                                    readOnly={!isEditing}
                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"}`}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="questionnaire">
                        <h5 className="text-blue-dark font-semibold">Medical Questionnaire</h5>
                        <table className="w-full text-left">
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
                                    <td className="align-top text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">1.</span>
                                        Are you in good health?</td>
                                    <td className="text-center py-2 px-6">
                                        <FormField
                                        control={medicalForm.control}
                                        name="goodHealth"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <input
                                                disabled={!isEditing}
                                                type="radio"
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
                                                    />
                                                </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </td>
                                </tr>
                                {/* Are you under medical treatment now? */}
                                <tr>
                                    <td className="align-top text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">2.</span>
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
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                <FormLabel>What is the condition being treated?</FormLabel>
                                                <FormControl>
                                                <input {...field}  className="bg-[#F8FAFF] text-sm w-1/4 rounded-xl px-5 ml-2" />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        </td>
                                    </tr>
                                    )}
                                {/* Have you had any serious illness or surgical operation? */}
                                <tr>
                                    <td className="align-top text-left py- 2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">3.</span>
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
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                <FormLabel>What illness or operation?</FormLabel>
                                                <FormControl>
                                                <input {...field}  className="bg-[#F8FAFF] text-sm w-1/4 rounded-xl px-5 ml-2" />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        </td>
                                    </tr>
                                    )}
                                {/* Have you been hospitalized? */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">4.</span>
                                        Have you been hospitalized?</td>
                                    <td className="text-center px-6">
                                        <FormField
                                        control={medicalForm.control}
                                        name="wasHospitalized"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <input
                                                type="radio"
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                <FormLabel>When, and why?</FormLabel>
                                                <FormControl>
                                                <input {...field}  className="bg-[#F8FAFF] text-sm w-1/4 rounded-xl px-5 ml-2" />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        </td>
                                    </tr>
                                    )}
                                {/* Is on prescription medication? */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">5.</span>
                                        Are you taking any prescription/non-prescription medication?</td>
                                    <td className="text-center px-6">
                                        <FormField
                                        control={medicalForm.control}
                                        name="onMedication"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <input
                                                type="radio"
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                <FormLabel>Current medication:</FormLabel>
                                                <FormControl>
                                                <input {...field}  className="bg-[#F8FAFF] text-sm w-1/4 rounded-xl px-5 ml-2" />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        </td>
                                    </tr>
                                    )}
                                {/* Uses tobacco? */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">6.</span>
                                        Do you use tobacco products?</td>
                                    <td className="text-center px-6">
                                        <FormField
                                        control={medicalForm.control}
                                        name="usesTobacco"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <input
                                                type="radio"
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
                                                    />
                                                </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </td>
                                </tr>
                                {/* On drugs/alcohol? */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">7.</span>
                                        Do you use alcohol, cocaine, or other dangerous drugs?</td>
                                    <td className="text-center px-6">
                                        <FormField
                                        control={medicalForm.control}
                                        name="usesDrugs"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <input
                                                type="radio"
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
                                                    value="no"
                                                    checked={field.value === "no"}
                                                    onChange={() => field.onChange("no")}
                                                    className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                    disabled={!isEditing}
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
                                                   disabled={!isEditing}
                                                   className= {`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} "bg-[#F8FAFF] text-sm w-32 rounded-xl px-5 border border-gray-300 focus:outline-none"`}
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
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                disabled={!isEditing}
                                                value="no"
                                                checked={field.value === "no"}
                                                onChange={() => field.onChange("no")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                disabled={!isEditing}
                                                value="no"
                                                checked={field.value === "no"}
                                                onChange={() => field.onChange("no")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                disabled={!isEditing}
                                                value="yes"
                                                checked={field.value === "yes"}
                                                onChange={() => field.onChange("yes")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
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
                                                disabled={!isEditing}
                                                value="no"
                                                checked={field.value === "no"}
                                                onChange={() => field.onChange("no")}
                                                className={`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} accent-blue-600`}
                                                />
                                            </FormControl>
                                            </FormItem>
                                        )}
                                        />
                                    </td>
                                    </tr>
                                {/* Blood Type */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">11.</span>
                                        Blood type: 
                                        
                                        <FormField
                                        control={ medicalForm.control }
                                        name="bloodType"
                                        render={({field}) => (
                                            <FormItem className="inline-block ml-2">
                                                <FormControl>
                                                    <select
                                                    {...field}
                                                    disabled={!isEditing}
                                                    className= {`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} ="bg-[#F8FAFF] text-sm w-32 rounded-xl px-5 border border-gray-300 focus:outline-none" `}
                                                    >
                                                    <option value="">Select...</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                    </select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                        />
                                    </td>
                                </tr>
                                {/* Blood Pressure */}
                                <tr>
                                    <td className="text-left py-2 pr-6 whitespace-nowrap"><span className="inline-block w-6 text-right mr-2 align-top">12.</span>
                                        Blood Pressure: 
                                        
                                        <FormField
                                        control={ medicalForm.control }
                                        name="bloodPressure"
                                        render={({field}) => (
                                            <FormItem className="inline-block ml-2">
                                                <FormControl>
                                                   <input type="text" {...field} 
                                                   disabled={!isEditing}
                                                   className= {`${isEditing ? "bg-[#F8FAFF]" : "bg-[#DAE3F6]"} "bg-[#F8FAFF] text-sm w-32 rounded-xl px-5 border border-gray-300 focus:outline-none"`}/>
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
                                                                disabled={!isEditing}
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
                    {
                        !isEditing ? (
                            <Button
                            type="button"
                            className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4"
                            onClick={() => setIsEditing(true)}
                            >
                            Edit changes
                            </Button>
                        ) : (
                            <Button
                            type="button"
                            className="bg-blue-primary col-span-1 md:col-span-5 justify-self-end mt-4"
                            >
                            Save Changes
                            </Button>
                        )
                    }
                </form>
            </Form>
        </div>
    )
}