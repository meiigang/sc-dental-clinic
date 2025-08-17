"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, LayoutGrid, List } from "lucide-react";
import { services } from "@/data/servicesData";

export default function Services() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [cardHeight, setCardHeight] = useState(200);

  const VISIBLE = 3;
  const GAP = 24; // px gap between cards

  const listRef = useRef<HTMLDivElement>(null);

  // Adjust card height based on screen size
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 640) {
        setCardHeight(140);
      } else if (window.innerWidth < 1024) {
        setCardHeight(160);
      } else {
        setCardHeight(200);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const STEP = cardHeight + GAP;

  const scrollByStep = (dir: "up" | "down") => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({
      top: dir === "up" ? -STEP : STEP,
      behavior: "smooth",
    });
  };

  return (
    <main className="bg-blue-light space-y-20">
      {/* Services Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-blue-dark mb-4">
          Discover Our Services
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-black mb-10">
          Lorem Ipsum Dolor Sit Amet
        </p>
      </section>

      {/* Services Section */}
      <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative flex justify-center">
        {/* View Mode Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded-lg border ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
            aria-label="List view"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded-lg border ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={20} />
          </button>
        </div>

        {/* Services Scroll */}
        <div className="relative w-full max-w-4xl">
          {viewMode === "list" ? (
            <div className="relative w-full">
              <div
                ref={listRef}
                className="
                  overflow-y-scroll
                  pr-3
                  [scrollbar-gutter:stable]
                  snap-y snap-mandatory
                  scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100
                "
                style={{
                  height: `${cardHeight * VISIBLE + GAP * (VISIBLE - 1)}px`,
                }}
              >
                <div className="flex flex-col gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex bg-blue-100 rounded-xl overflow-hidden shadow-md snap-start"
                      style={{ height: `${cardHeight}px` }}
                    >
                      <div className="flex-1 p-4 flex flex-col justify-center text-left">
                        <h3 className="text-lg font-bold text-blue-dark mb-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={150}
                          height={cardHeight}
                          className="object-cover w-[150px] h-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll buttons */}
              <div className="absolute right-0 translate-x-full top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <button
                  onClick={() => scrollByStep("up")}
                  className="p-0.5 rounded-full bg-blue-500 hover:bg-blue-dark text-white shadow-md"
                  aria-label="Scroll up"
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  onClick={() => scrollByStep("down")}
                  className="p-0.5 rounded-full bg-blue-500 hover:bg-blue-dark text-white shadow-md"
                  aria-label="Scroll down"
                >
                  <ChevronDown size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-blue-100 rounded-xl overflow-hidden shadow-md text-center"
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={200}
                    height={200}
                    className="object-cover w-full h-40"
                  />
                  <h3 className="text-md font-bold text-blue-dark p-2">
                    {service.title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="bg-blue-light py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-dark mb-6">
            Interested? Book an appointment
          </h2>
          <button className="bg-blue-500 hover:bg-blue-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md transition">
            Sign up to book an appointment
          </button>
        </div>
      </section>
    </main>
  );
}
