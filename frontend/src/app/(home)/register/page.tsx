"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
    
    const [agreed, setAgreed] = useState(false);

    return (
        <main className="bg-blue-light">
            <div className="page-container py-20 space-y-6 min-h-screen">
                <div className="page-title flex items-center justify-center">
                    <h1 className='text-5xl font-bold text-blue-dark'>Register</h1>
                </div>
                <form action="register" className='register-form flex flex-col items-center justify-center'>
                    <div className="form-container flex flex-col space-y-5 mt-10">
                        <div className="label-input flex flex-col">
                            <label htmlFor="lastName"><b>Last Name</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="lastName" name="lastName" required 
                            placeholder = "Last Name"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="firstName"><b>First Name</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="firstName" name="firstName" required 
                            placeholder = "First Name"/>
                        </div>
                        <div className="middle-suffix flex flex-row justify-between space-x-4">
                            <div className="label-input flex flex-col">
                                <label htmlFor="middleName"><b>Middle Name</b></label>
                                <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-38' id="middleName" name="middleName" required 
                                placeholder = "Middle Name"/>
                            </div>
                            <div className="label-input flex flex-col">
                                <label htmlFor="suffix"><b>Suffix</b></label>
                                <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-38' id="suffix" name="suffix" placeholder = "Suffix"/>
                            </div>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="email"><b>Email Address</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="email" name="email" required 
                            placeholder = "Email Address"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="contact"><b>Contact Number</b></label>
                            <input type="text" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="contact" name="contact" required 
                            placeholder = "Contact Number"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="password"><b>Password</b></label>
                            <input type="password" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="password" name="password" required 
                            placeholder = "Password"/>
                        </div>
                        <div className="label-input flex flex-col">
                            <label htmlFor="confirmPassword"><b>Confirm Password</b></label>
                            <input type="password" className='form-input bg-[#DAE3F6] p-4 rounded-xl w-84' id="confirmPassword" name="confirmPassword" required 
                            placeholder = "Confirm Password"/>
                        </div>
                    </div>
                    {/* Terms and conditions checkbox */}
                    <div className="terms-checkbox flex items-center mt-8 mb-12">
                        <input type="checkbox" id="terms" name="terms" checked={agreed} onChange={() => setAgreed(!agreed)} required />
                        <label htmlFor="terms" className="ml-2 text-sm font-light"><b>I agree with the the Terms and Conditions.</b></label>
                    </div>
                    {/* Submit Button */}
                    <button type="submit" className='submit-button bg-[#082565] text-white p-3 rounded-xl' disabled={!agreed}><b>Create New Account</b></button>
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