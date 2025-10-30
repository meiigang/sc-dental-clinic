"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<"Weekly" | "Monthly" | "Annually">("Weekly");
  const [page, setPage] = useState(1);

  const handleTabChange = (tab: "Weekly" | "Monthly" | "Annually") => {
    setActiveTab(tab);
    setPage(1); // Reset to the first page whenever a tab is changed
  };

  return (
    <main>
      <section className="sales-container flex flex-col items-center py-20 min-h-screen">
          <h1 className="text-3xl font-bold text-blue-dark">Sales</h1>
          
          {/* --- TAB BUTTONS --- */}
          <div className="flex gap-3 m-6">
            <Button
              variant={activeTab === "Weekly" ? "default" : "outline"}
              onClick={() => handleTabChange("Weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={activeTab === "Monthly" ? "default" : "outline"}
              onClick={() => handleTabChange("Monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={activeTab === "Annually" ? "default" : "outline"}
              onClick={() => handleTabChange("Annually")}
            >
              Annually
            </Button>
          </div>

          {/* --- CONTENT BASED ON ACTIVE TAB --- */}
          <div className="tab-content mt-8 w-full max-w-4xl">
            {activeTab === "Weekly" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Weekly Sales Data</h2>
                {/* Weekly sales data content goes here */}
              </div>
            )}
            {activeTab === "Monthly" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Monthly Sales Data</h2>
                {/* Monthly sales data content goes here */}
              </div>
            )}
            {activeTab === "Annually" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Annual Sales Data</h2>
                {/* Annual sales data content goes here */}
              </div>
            )}
          </div>
      </section>
    </main>
  );
}