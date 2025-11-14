import React, { useEffect, useState } from "react"
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

type ToothData = {
  [key: string]: boolean;
};

const Odontogram: React.FC<OdontogramProps> = ({panelType = "default"}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [modifiedTeeth, setModifiedTeeth] = useState<Set<number>>(new Set());
  const [allTeethData, setAllTeethData] = useState<Map<number, ToothData>>(new Map());
  const [currentToothData, setCurrentToothData] = useState<ToothData>({});

  // Load data when a tooth is selected
  useEffect(() => {
    if (selectedTooth !== null) {
      // If data for this tooth exists, load it. Otherwise, start with an empty object.
      setCurrentToothData(allTeethData.get(selectedTooth) || {});
    } else
      // Clear data when no tooth is selected
      setCurrentToothData({});
  }, [selectedTooth, allTeethData]);

  // Handler to update the current tooth's data when a checkbox is changed
  const handleCheckboxChange = (key: string, isChecked: boolean) => {
    setCurrentToothData(prev => ({
      ...prev,
      [key]: isChecked,
    }));
  };
  
  const handleSaveToothData = () => {
    if (selectedTooth !== null) {
      // Save the current data to the main state
      setAllTeethData(prev => new Map(prev).set(selectedTooth, currentToothData));
      // Add the current tooth to the modified teeth set
      setModifiedTeeth(prev => new Set(prev).add(selectedTooth));
      // Close the tooth panel
      setSelectedTooth(null);
      // BACKEND: save the actual tooth data
    }
  };

  // Helper to create a checkbox and manage its state
  const ConditionCheckbox = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={currentToothData[label] || false}
        onCheckedChange={(isChecked) => handleCheckboxChange(label, isChecked as boolean)}
      />
      <p>{label}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-primary p-8 h-128 space-y-8">
      <div className={panelType === "log" ? "flex flex-row gap-4 justify-between h-full" : "flex flex-row gap-4 justify-between"}>
        <Teeth
          selectedTooth={selectedTooth}
          setSelectedTooth={setSelectedTooth}
          modifiedTeeth={modifiedTeeth}
        />
        {selectedTooth !== null && (
          panelType === "log" ? (
            // Log Appointment Tooth Info Panel
            <div className="bg-blue-light rounded-xl p-8 flex flex-col h-full w-120">
              <div className="grow overflow-y-auto pr-2">
                <div>
                  <p className="text-blue-dark text-lg font-bold">Tooth {selectedTooth}</p>
                  <Accordion type="single" className="bg-background rounded-xl px-4 mt-2 mb-4 w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-blue-dark font-medium">Conditions</AccordionTrigger>
                      <AccordionContent className="p-4 max-h-20 overflow-y-auto">
                        <ConditionCheckbox label="Decayed" />
                        <ConditionCheckbox label="Missing due to Caries" />
                        <ConditionCheckbox label="Filled" />
                        <ConditionCheckbox label="Caries indicated for Extension" />
                        <ConditionCheckbox label="Root Fragment" />
                        <ConditionCheckbox label="Missing (other causes)" />
                        <ConditionCheckbox label="Impacted Tooth" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-blue-dark font-medium">Restorations</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 p-4 max-h-20 overflow-y-auto">
                        <ConditionCheckbox label="Jacket Crown" />
                        <ConditionCheckbox label="Amalgam Filling" />
                        <ConditionCheckbox label="Abutment" />
                        <ConditionCheckbox label="Pontic" />
                        <ConditionCheckbox label="Inlay" />
                        <ConditionCheckbox label="Fixed Cure Composite" />
                        <ConditionCheckbox label="Sealant" />
                        <ConditionCheckbox label="Removable Denture" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-blue-dark font-medium">Treatments</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 p-4 max-h-20 overflow-y-auto">
                        <ConditionCheckbox label="Extraction (Caries)" />
                        <ConditionCheckbox label="Extraction (other causes)" />
                        <ConditionCheckbox label="Congenitally Missing" />
                        <ConditionCheckbox label="Supernumerary" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                {/* Notes */}
                <div className="mb-2">
                  <p className=" font-medium text-blue-dark">Notes</p>
                  <Textarea
                    className="bg-background w-full"
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
                  {/* TO DO: implement backend for Save */}
                  <Button onClick={handleSaveToothData}>Save</Button>
                </div>
              </div>
            </div>
          ) : (
          // Dental Chart Tooth Info Panel
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