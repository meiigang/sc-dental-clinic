"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { jwtDecode } from "jwt-decode";

export default function Login () {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const router = useRouter();
    const [rememberMe, setRememberMe] = useState(false);

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

        //Redirect logic based on patient role
        const token = localStorage.getItem("token");

        if(res.ok && data.token) {
            if (rememberMe) {
                localStorage.setItem("token", data.token);
                setError("");
            }
            else {
                sessionStorage.setItem("token", data.token);
                setError(data.message || "Invalid email/contact number or password.");
            }

            type MyJwtPayload = {
                role: string;
                [key: string]: any;
            };

            const decoded = jwtDecode<MyJwtPayload>(data.token);
            console.log("Decoded JWT:", decoded)

            if(decoded.role === "staff" || decoded.role === "dentist") {
                router.push("/staff-landing");
            } else {
                router.push("/dashboard")
            }
        } else {
            setError(data.message || "Login failed.")
        }
    }

    return (
        <main className="bg-blue-light">
            {/* Login container */}
            <div className="login-container flex flex-col items-center justify-center min-h-screen bg-[#f8faff] space-y-15">
                <h1 className='text-5xl font-extrabold text-blue-dark'>Log In</h1>
                {/* User input form */}
                {
                    error && (
                        <div className="w-87 max-w-md bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-2 rounded-lg mb-10 text-center whitespace-nowrap">
                            {error}
                        </div>
                    )
                }
                <form onSubmit={handleSubmit} action="login" className="flex flex-col space-y-6">

                    {/* Email input div */}
                    <div className="email-input flex flex-col space-y-1">
                        <label htmlFor="email-contact" className='text-sm text-[#151515]'><b>Email Address or Contact Number</b></label>
                        <input 
                        type="text" 
                        id="email-contact" 
                        name="email" 
                        className='p-3 rounded-lg w-84 bg-[#DAE3F6]' 
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setError("")}
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
                        onFocus={() => setError("")}
                        required 
                        placeholder = "Password"/>
                        <div className="flex items-center justify-between mt-2">
                            <div className="left-div flex items-center">
                                <input type="checkbox"
                                id="remember-me"
                                checked = {rememberMe}
                                onChange = {() => setRememberMe(!rememberMe)} />
                                <label htmlFor="RememberMe" className="text-sm text-dark font-medium ml-2">Remember me</label>
                            </div>
                            <div className="right-div"><Link href="/" className='text-sm text-dark font-medium'>Forgot password?</Link></div>
                        </div>
                    </div>
                    <div className="button-container flex justify-center">
                        <button type="submit" className='bg-[#082565] text-white p-3 rounded-xl w-30 cursor-pointer mt-4'><b>Sign In</b></button>
                    </div>
                    <div className="flex justify-center text-sm text-dark font-bold">
                        <span>
                           Don't have an account?
                            <Link href="/register" className="underline ml-1">Register Here</Link>
                        </span>
                    </div>
                </form>
            </div>
        </main>
    );
}