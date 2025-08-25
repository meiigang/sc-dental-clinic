import Link from 'next/link';

export default function Login () {
    return (
        <main className="bg-blue-light">
            {/* Login container */}
            <div className="login-container flex flex-col items-center justify-center min-h-screen bg-[#f8faff] space-y-15">
                <h1 className='text-5xl font-extrabold text-blue-dark'>Log In</h1>
                {/* User input form */}
                <form action="login" className="flex flex-col space-y-6">

                    {/* Email input div */}
                    <div className="email-input flex flex-col space-y-1">
                        <label htmlFor="email-contact" className='text-sm text-dark'><b>Email Address or Contact Number</b></label>
                        <input type="text" id="email-contact" name="email-contact" className='p-3 rounded-lg w-84 bg-[#DAE3F6]' required 
                        placeholder = "Email Address or Number"/>
                    </div>

                    {/* Password input div */}
                    <div className="password-input flex flex-col space-y-1">
                        <label htmlFor="password" className='text-sm text-dark'><b>Password</b></label>
                        <input type="password" id="password" name="password" className='p-3 rounded-lg w-84 bg-[#DAE3F6]' required 
                        placeholder = "Password"/>
                        <div className="flex justify-end">
                            <Link href="/" className='text-sm text-dark font-medium'>Forgot password?</Link>
                        </div>
                    </div>
                    <div className="button-container flex justify-center">
                        <button type="submit" className='bg-blue-dark text-white p-3 rounded-xl w-30'><b>Log In</b></button>
                    </div>
                    <div className="flex justify-center text-sm text-dark font-bold">
                        <span>
                           Don't have an account?
                            <Link href="/register" className="underline ml-1">Register Here</Link>
                        </span>
                    </div>
                </form>
            </div>

            {/* Links to dashboards for testing purposes */}
            <div className="flex flex-col items-center justify-center space-y-4 bg-blue-dark text-white">
                <p>PLACEHOLDER - REMOVE ONCE NOT NEEDED</p>
                <Link href="/dashboard">Go to Patient Dashboard</Link>
                <Link href="/staff-landing">Go to Staff Dashboard</Link>
            </div>
        </main>
    );
}