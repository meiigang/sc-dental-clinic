import { accountInfoSchema } from '@/components/patientForms/formSchemas/schemas';
import { useForm } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
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

export default function AccountInfoForm({ initialValues, onSubmit }: { initialValues?: z.infer<typeof accountInfoSchema>, onSubmit: (data: z.infer<typeof accountInfoSchema>) => void }) {
    const registerForm = useForm<z.infer<typeof  accountInfoSchema>>({
        resolver: zodResolver(accountInfoSchema),
        mode: "onSubmit",
        defaultValues: initialValues || {
            first_name: "",
            last_name: "",
            middle_name: "",
            suffix: "",
            email: "",
            contact_number: "",
            password: "",
            confirm_password: "",
        }
    });

    const router = useRouter();
    const onSubmitHandler = (data: z.infer<typeof accountInfoSchema>) => {
        router.push("/personalInfoForm")
    }

    return (
        <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onSubmit)} className="col-span-5 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <FormField
                        control={registerForm.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="middle_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Name *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="suffix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suffix *</FormLabel>
                                <Select>
                                    <SelectTrigger className="bg-blue-light">
                                        <SelectValue placeholder="Select..." {...field} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                        <SelectItem value="II">II</SelectItem>
                                        <SelectItem value="III">III</SelectItem>
                                        <SelectItem value="III">IV</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="contact_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Number *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password *</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password"
                                    className="bg-blue-light"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="button-container">
                        <Button type="submit" className="bg-blue-dark hover:bg-blue-darker text-white mt-6">Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
};