import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Teeth from "./Teeth"
import "./Odontogram.css"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"

type OdontogramProps = {
  panelType?: "default" | "log";
};

const Odontogram: React.FC<OdontogramProps> = ({panelType = "default"}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-primary p-8 h-128 space-y-8">
      <div className={panelType === "log" ? "flex flex-row gap-4 justify-between h-full" : "flex flex-row gap-4 justify-between"}>
        <Teeth selectedTooth={selectedTooth} setSelectedTooth={setSelectedTooth} />
        {selectedTooth !== null && (
          panelType === "log" ? (
            // Log Appointment Panel
            <div className="bg-blue-light rounded-xl p-8">
              <div>
                <div>
                  <p className="text-blue-dark text-lg font-bold">Tooth {selectedTooth}</p>

                </div>
                <Accordion type="single" collapsible className="bg-background rounded-xl px-4 mt-2 mb-4 w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-blue-dark font-medium">Conditions</AccordionTrigger>
                    <AccordionContent className="p-4 max-h-20 overflow-y-auto">
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Decayed</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Missing due to Caries</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Filled</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Caries indicated for Extension</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Root Fragment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Missing (other causes)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Impacted Tooth</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-blue-dark font-medium">Restorations</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2 p-4 max-h-20 overflow-y-auto">
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Jacket Crown</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Amalgam Filling</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Abutment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Pontic</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Inlay</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Fixed Cure Composite</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Sealant</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Removable Denture</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-blue-dark font-medium">Treatments</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2 p-4 max-h-20 overflow-y-auto">
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Extraction (Caries)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Extraction (other causes)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Congenitally Missing</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox /><p>Supernumerary</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              {/* Notes */}
              <div className="mb-2">
                <p className=" font-medium text-blue-dark">Notes</p>
                <Textarea
                  className="bg-background w-96"
                  placeholder="Add your notes here..."
                />
              </div>
              <div className="flex justify-end gap-2 py-6">
                <Button
                  onClick={() => setSelectedTooth(null)}
                  variant="outline"
                  className="bg-blue-light text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-background"
                >
                  Cancel
                </Button>
                <Button onClick={() => setSelectedTooth(null)}>Save</Button> {/* TO DO: implement backend for Save */}
              </div>
            </div>
          ) : (
          // Tooth Details Panel
          <div className="bg-blue-light rounded-xl w-72 p-8 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-blue-dark text-lg font-bold">Tooth {selectedTooth}</p>
              <Button
                variant="ghost"
                className="text-blue-dark hover:bg-transparent"
                onClick={() => setSelectedTooth(null)}
              >
                <X />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-blue-dark">Appointment History</p>
              <ul className="grid gap-2 max-h-40 overflow-y-auto">
                <li
                  className="bg-background text-sm hover:bg-blue-50 border-blue-primary rounded-lg px-4 py-2"
                >
                  October 15, 2025
                  <p>Surgery</p>
                </li>
                <li
                  className="bg-background text-sm hover:bg-blue-50 border-blue-primary rounded-lg px-4 py-2"
                >
                  October 8, 2025 | Filling
                </li>
              </ul>
            </div>
            {/* Notes */}
            <div className="space-y-4">
              <p className="text-blue-dark">Notes</p>
              <Textarea
                className="bg-background"
                placeholder="Add your notes here..."
              />
              <Button
                className=""
                onClick={() => {
                  // Handle save notes
                }}
              >
                Save Notes
              </Button>
            </div>
          </div>
          )
        )}
      </div>
    </div>
  );
};

export default Odontogram;