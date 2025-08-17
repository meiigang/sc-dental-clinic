import React, { JSX } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home(): JSX.Element {
  return (
    <main className="bg-blue-light">
      {/* Home Header */}
      <section className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto">
        {/* Text Side */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-dark leading-snug">
            Exceptional dental care in Davao
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-black">
            We deliver high-quality dental services to both children and adults.
            With a commitment to creating healthy, beautiful smiles, Sabado-Cuaton Dental Clinic
            continues to be a reliable partner in oral health for the Davao City community.
          </p>

          <a
            href="/signup"
            className="inline-block mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-primary text-white font-medium rounded-lg shadow-md hover:bg-blue-dark transition text-sm sm:text-base"
          >
            Sign up to book appointment
          </a>
        </div>

        {/* Image Side */}
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img
            src="/images/home-section1-portrait.jpg"
            alt="Dentist Portrait"
            className="w-40 sm:w-56 md:w-72 lg:w-80 h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
          Our Services
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <img
              key={i}
              src="/images/home-section1-portrait.jpg"
              alt="Dentist Portrait"
              className="w-40 sm:w-56 md:w-64 lg:w-72 h-auto rounded-lg shadow-lg"
            />
          ))}
        </div>

        <p className="mt-8 text-sm sm:text-base md:text-lg text-black max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
          Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur,
          ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue.
        </p>

        <a
          href="/services"
          className="inline-block mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-primary text-white font-medium rounded-lg shadow-md hover:bg-blue-dark transition text-sm sm:text-base"
        >
          See More
        </a>
      </section>

      {/* Section 3 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 space-y-6 text-left sm:text-center">
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
              Q: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
              Q: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
