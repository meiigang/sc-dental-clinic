"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, LayoutGrid, List } from "lucide-react";
import { services } from "@/data/servicesData";

export default function Services() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [cardHeight, setCardHeight] = useState(200);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  // Get unique categories
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.map((s) => s.category)))],
    []
  );

  // Filtered services based on category
  const filteredServices = useMemo(() => {
    if (selectedCategory === "All") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <main className="bg-blue-light space-y-1">
      {/* Services Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-blue-dark mb-4">
          Discover Our Services
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-black">
          From routine check-ups to advanced restorative treatments, our services are designed 
          to keep your smile healthy, radiant, and confident. At Sabado-Cuaton Dental Clinic, 
          every visit means comfort, care, and cutting-edge dental solutions tailored just for you.
        </p>
      </section>

      {/* Services Section */}
      <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative flex flex-col items-center">
        {/* Filters + View Mode */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
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
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex bg-blue-100 rounded-xl overflow-hidden shadow-md snap-start"
                      style={{ height: `${cardHeight}px` }}
                    >
                      <div className="flex-1 p-4 flex flex-col justify-center text-left">
                        <h3 className="text-lg font-bold text-blue-dark mb-1">
                          {service.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {service.category}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          {service.description}
                        </p>
                        {/* Price + Unit */}
                        <p className="text-base font-semibold text-blue-600">
                          ₱{service.price.toLocaleString()} {service.unit}
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
              {filteredServices.map((service) => (
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
                  <h3 className="text-md font-bold text-blue-dark pt-2">
                    {service.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {service.category}
                  </p>
                  {/* Price + Unit */}
                  <p className="text-base font-semibold text-blue-600 pb-2">
                    ₱{service.price.toLocaleString()} {service.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="bg-blue-light py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="mt-4 text-gray-800 font-medium">
            Ready to experience healthier, brighter smiles?{" "}
            <a
              href="/register"
              className="text-blue-primary hover:underline font-semibold"
            >
              Sign up now to secure your appointment.
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
