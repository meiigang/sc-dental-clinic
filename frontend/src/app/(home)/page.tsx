"use client";

import React from "react";
import { services } from "@/data/servicesData";

export default function Home() {
  return (
    <main className="bg-blue-light">
      {/* Section 1 */}
      <section className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto">
        {/* Text Side */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-dark leading-snug">
            Exceptional dental care in Davao
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-black">
            We deliver high-quality dental services to both children and adults.
            With a commitment to creating healthy, beautiful smiles, Sabado-Cuaton
            Dental Clinic continues to be a reliable partner in oral health for the
            Davao City community.
          </p>

          <a
            href="/register"
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

      {/* Section 2 - Services */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
          Our Services
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {services
            .filter((service) => [1, 2, 3].includes(service.id))
            .map((service) => (
              <div
                key={service.id}
                className="w-64 h-80 [perspective:1000px]"
              >
                <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
                  {/* Front Side */}
                  <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-between [backface-visibility:hidden]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <h3 className="mt-4 text-lg font-semibold text-blue-dark line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-blue-primary font-bold">
                      ₱{service.price.toLocaleString()} / {service.unit}
                    </p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute w-full h-full bg-blue-light rounded-xl shadow-lg p-4 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <h3 className="text-lg font-bold text-blue-dark">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-700 flex-grow">
                      {service.description}
                    </p>
                    <a
                      href="/register"
                      className="mt-4 px-4 py-2 bg-blue-primary text-white font-medium rounded-lg shadow-md hover:bg-blue-dark transition text-sm"
                    >
                      Sign up to avail service
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <p className="mt-8 text-sm sm:text-base md:text-lg text-black max-w-2xl mx-auto">
          At Sabado-Cuaton Dental Clinic, we don’t just treat teeth—we transform
          smiles. Every service we provide is designed to boost confidence, improve
          oral health, and ensure you walk out with a brighter, healthier, and
          happier smile.
        </p>

        <a
          href="/services"
          className="inline-block mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-primary text-white font-medium rounded-lg shadow-md hover:bg-blue-dark transition text-sm sm:text-base"
        >
          See More
        </a>
      </section>
    </main>
  );
}
