import { accountInfoSchema } from '@/components/patientForms/formSchemas/schemas';
import { useForm } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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

interface AccountInfoFormProps {
  initialValues?: z.infer<typeof accountInfoSchema>;
  onSubmit: (data: z.infer<typeof accountInfoSchema>) => void;
  readOnly?: boolean;
}

export default function AccountInfoForm({ initialValues, onSubmit, readOnly=false}: AccountInfoFormProps) {
    const [isEditing, setIsEditing] = useState(!readOnly);

    useEffect(() => {
        setIsEditing(!readOnly);
    }, [readOnly]);

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

    const handleFormSubmit = (data: z.infer<typeof accountInfoSchema>) => {
        const processedData = {
            ...data,
            suffix: data.suffix === "NONE_VALUE" ? "" : data.suffix,
        };
        if (onSubmit) {
            onSubmit(processedData);
        }
    };

    return (
        <div className="form-container bg-blue-light justify-center mt-10 p-10 rounded-xl">
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleFormSubmit)} className="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                        control={registerForm.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                    <Input {...field}
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                                <FormLabel>Suffix</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={readOnly}>
                                    <SelectTrigger className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE_VALUE">None</SelectItem>
                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                        <SelectItem value="II">II</SelectItem>
                                        <SelectItem value="III">III</SelectItem>
                                        <SelectItem value="IV">IV</SelectItem>
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
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
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
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password *</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password"
                                    disabled={readOnly}
                                    className={`${!readOnly ? "bg-background" : "bg-blue-light"}`}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    {!readOnly && (
                    <div className="button-container md:col-span-4 flex justify-end">
                        <Button type="submit" className="bg-blue-dark hover:bg-blue-darker text-white mt-6">Next</Button>
                    </div>
                    )}
                </form>
            </Form>
        </div>
    )
};