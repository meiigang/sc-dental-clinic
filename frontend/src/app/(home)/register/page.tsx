"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
    
    const [agreed, setAgreed] = useState(false);
    const [form, setForm] = useState({
        lastName: "",
        firstName: "",
        middleName: "",
        suffix: "",
        email: "",
        contactNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        contactNumber: "",
        password: ""
    });

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});

        // Clear errors on input change
        setErrors({ contactNumber: "", password: "" });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreed ) return;

        // contactNumber number validation
        if (!/^\d{11}$/.test(form.contactNumber)) {
            alert("contactNumber number must be exactly 11 digits.");
            return;
        }

        // Validate password matching
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Final check before submit
        if (errors.contactNumber || errors.password) {
            alert("Please fix the errors before submitting.");
            return;
        }

        const res = await fetch("http://localhost:4000/api/users/register", {
           method: "POST",
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify(form) 
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
            // Registration successful, redirect to login
            router.push("/login");
        } else {
            alert(data.message || "Registration failed");
        }
    }

    return (
        <main>
            <div className="page-container py-20 space-y-6 min-h-screen">
                <div className="page-title flex items-center justify-center">
                    <h1 className='text-5xl font-bold text-blue-dark'>Register</h1>
                </div>
                <form onSubmit ={handleSubmit} action="register" className='register-form flex flex-col items-center justify-center'>
                    <div className="form-container flex flex-col space-y-5 mt-10">
                        <div className="label-input flex flex-col">
                            <label htmlFor="lastName"><b>Last Name</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="lastName" name="lastName"
                            value={form.lastName} onChange={handleChange} required
                            placeholder = "Last Name"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="firstName"><b>First Name</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="firstName" name="firstName" 
                            value={form.firstName} onChange={handleChange} required 
                            placeholder = "First Name"/>
                        </div>
                        <div className="middle-suffix flex flex-row justify-between space-x-4">
                            <div className="label-input flex flex-col">
                                <label htmlFor="middleName"><b>Middle Name</b></label>
                                <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-38' id="middleName" name="middleName"
                                value={form.middleName} onChange={handleChange} required
                                placeholder = "Middle Name"/>
                            </div>
                            <div className="label-input flex flex-col">
                                <label htmlFor="suffix"><b>Suffix</b></label>
                                <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-38' id="suffix" name="suffix"
                                value={form.suffix} onChange={handleChange}
                                placeholder = "Suffix"/>
                            </div>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="email"><b>Email Address</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="email" name="email"
                            value={form.email} onChange={handleChange} required
                            placeholder = "Email Address"/>
                        </div>
                        <div className="label-input flex flex-col">
                            {errors.contactNumber && (
                                <span style={{ color: "red", marginBottom: "4px" }}>{errors.contactNumber}</span>
                            )}
                            <label htmlFor="contactNumber"><b>Contact Number</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="contactNumber" name="contactNumber"
                            value={form.contactNumber} onChange={handleChange} required
                            placeholder = "Contact Number"/>
                        </div>
                        <div className="label-input flex flex-col">
                            {errors.password && (
                                <span style={{ color: "red", marginBottom: "4px" }}>{errors.password}</span>
                            )}
                            <label htmlFor="password"><b>Password</b></label>
                            <input type="password" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="password" name="password"
                            value={form.password} onChange={handleChange} required
                            placeholder = "Password"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="confirmPassword"><b>Confirm Password</b></label>
                            <input type="password" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="confirmPassword" name="confirmPassword" required 
                            value={form.confirmPassword} onChange={handleChange}
                            placeholder = "Confirm Password"/>
                        </div>
                    </div>
                    {/* Terms and conditions checkbox */}
                    <div className="terms-checkbox flex items-center mt-8 mb-12">
                        <input type="checkbox" id="terms" name="terms" checked={agreed} onChange={() => setAgreed(!agreed)} required />
                        <label htmlFor="terms" className="ml-2 text-sm font-light"><b>I agree with the the Terms and Conditions.</b></label>
                    </div>
                    {/* Submit Button */}
                    <button type="submit" className='submit-button bg-[#082565] text-white p-3 rounded-xl cursor-pointer' 
                    disabled={!agreed}
                    ><b>Create New Account</b></button>
                </form>
                <div className="flex justify-center text-sm text-[#151515] font-bold">
                        <span>
                            Already have an account?
                            <Link href="/login" className="underline ml-1">Log in here</Link>
                        </span>
                    </div>
                </div>
            </main>
    );
}