import React, { JSX } from "react";

export default function Footer(): JSX.Element {
  const year: number = new Date().getFullYear();

  return (
    <footer className="bg-blue-primary text-blue-light py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          {/* Left Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.png"
                alt="Clinic Logo"
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
              <div>
                <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
                  Sabado - Cuaton Dental Clinic
                </h2>
                <p className="mt-1 text-sm sm:text-base italic text-blue-light">
                  Exceptional dental care in Davao
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start mt-4 space-x-2 text-sm sm:text-base max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a6.75 6.75 0 0 0-6.75 6.75c0 4.97 6.75 12.75 6.75 12.75s6.75-7.78 6.75-12.75A6.75 6.75 0 0 0 12 2.25zm0 9.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                Door 2F Penta Point Bldg., Km. 5 San Pedro Village Extension,
                Buhangin, Davao City, Davao del Sur, 8000
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-4 text-sm sm:text-base">
            <div className="flex items-center space-x-3">
              {/* Email Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75zM3.75 6l8.25 5.25L20.25 6H3.75zm0 12V8.67l8.25 5.25 8.25-5.25V18H3.75z" />
              </svg>
              <a
                href="mailto:sabadocuatondentalclinic@gmail.com"
                className="text-white hover:underline"
              >
                sabadocuatondentalclinic@gmail.com
              </a>
            </div>

            <div className="flex items-center space-x-3">
              {/* Facebook Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white"
              >
                <path d="M22.5 12a10.5 10.5 0 1 0-12.15 10.4v-7.36h-2.7v-3.04h2.7V9.64c0-2.67 1.59-4.14 4.03-4.14 1.16 0 2.38.21 2.38.21v2.61h-1.34c-1.32 0-1.73.82-1.73 1.66v2h2.95l-.47 3.04h-2.48v7.36A10.5 10.5 0 0 0 22.5 12z" />
              </svg>
              <a
                href="https://www.facebook.com/SabadoCuatonDentalClinic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                Sabado-Cuaton Dental Clinic
              </a>
            </div>

            <div className="flex items-center space-x-3">
              {/* Phone Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white"
              >
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.48 2.54.73 3.9.73.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.36.25 2.69.73 3.9a1 1 0 0 1-.21 1.11l-2.4 2.4z" />
              </svg>
              <a
                href="tel:09421551053"
                className="text-white hover:underline"
              >
                0942 155 1053
              </a>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-blue-light mt-8 pt-4 text-center text-sm text-blue-light">
          © {year} Sabado-Cuaton Dental Clinic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
