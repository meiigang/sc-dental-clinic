"use client";
import { useState } from "react";
import Link from 'next/link';

export default function Login () {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value})
    }

    //Send post request to backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res =  await fetch("http://localhost:4000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        alert(data.message);
    }

    return (
        <main>
            {/* Login container */}
            <div className="login-container flex flex-col items-center justify-center min-h-screen bg-[#f8faff] space-y-15">
                <h1 className='text-5xl font-extrabold text-[#082565]'>Log In</h1>
                {/* User input form */}
                <form onSubmit={handleSubmit} action="login" className="flex flex-col space-y-6">

                    {/* Email input div */}
                    <div className="email-input flex flex-col space-y-1">
                        <label htmlFor="email-contact" className='text-sm text-[#151515]'><b>Email Address or Contact Number</b></label>
                        <input 
                        type="text" 
                        id="email-contact" 
                        name="email-contact" 
                        className='p-3 rounded-lg w-84 bg-[#DAE3F6]' 
                        value={form.email}
                        onChange={handleChange}
                        required 
                        placeholder = "Email Address or Number"/>
                    </div>

                    {/* Password input div */}
                    <div className="password-input flex flex-col space-y-1">
                        <label htmlFor="password" className='text-sm text-[#151515]'><b>Password</b></label>
                        <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        className='p-3 rounded-lg w-84 bg-[#DAE3F6]' 
                        value={form.password}
                        onChange={handleChange}
                        required 
                        placeholder = "Password"/>
                        <div className="flex justify-end">
                            <Link href="/" className='text-sm text-[#151515] font-medium'>Forgot password?</Link>
                        </div>
                    </div>
                    <div className="button-container flex justify-center">
                        <button type="submit" className='bg-[#082565] text-white p-3 rounded-xl w-30'><b>Log In</b></button>
                    </div>
                    <div className="flex justify-center text-sm text-[#151515] font-bold">
                        <span>
                           Don't have an account?
                            <Link href="/register" className="underline ml-1">Register Here</Link>
                        </span>
                    </div>
                </form>
            </div>

            {/* Links to dashboards for testing purposes */}
            <div className="flex flex-col items-center justify-center space-y-8 bg-[#082565] text-white">
                <Link href="/patient-dashboard">Go to Patient Dashboard</Link>
                <Link href="/staff-dashboard">Go to Staff Dashboard</Link>
            </div>
        </main>
    );
}