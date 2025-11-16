import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Teeth from "./Teeth"
import "./Odontogram.css"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"

type OdontogramProps = {
  onSave?: (data: any) => void; // Callback to pass data up
  initialData?: any; // For viewing existing records
};

type ToothData = {
  conditions: string[];
  notes: string;
};

const Odontogram: React.FC<OdontogramProps> = ({ onSave, initialData }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  
  // --- FIX: Initialize state from initialData if it exists ---
  const [allTeethData, setAllTeethData] = useState<Map<number, ToothData>>(() => {
    if (initialData) {
      // Convert the plain object from the parent back into a Map
      const entries = Object.entries(initialData).map(([key, value]) => [parseInt(key), value as ToothData] as [number, ToothData]);
      return new Map(entries);
    }
    return new Map();
  });

  const [currentNotes, setCurrentNotes] = useState("");
  const [currentConditions, setCurrentConditions] = useState<Record<string, boolean>>({});

  // Load data when a tooth is selected
  useEffect(() => {
    if (selectedTooth !== null) {
      const existingData = allTeethData.get(selectedTooth);
      setCurrentNotes(existingData?.notes || "");
      
      const conditions: Record<string, boolean> = {};
      if (existingData?.conditions) {
        existingData.conditions.forEach(c => { conditions[c] = true; });
      }
      setCurrentConditions(conditions);

    } else {
      setCurrentNotes("");
      setCurrentConditions({});
    }
  }, [selectedTooth, allTeethData]);

  const handleCheckboxChange = (key: string, isChecked: boolean) => {
    setCurrentConditions(prev => ({ ...prev, [key]: isChecked }));
  };
  
  const handleSaveToothData = () => {
    if (selectedTooth !== null) {
      const activeConditions = Object.keys(currentConditions).filter(key => currentConditions[key]);
      
      const updatedData = new Map(allTeethData);
      updatedData.set(selectedTooth, {
        conditions: activeConditions,
        notes: currentNotes,
      });
      setAllTeethData(updatedData);

      // Convert Map to a plain object for submission
      const dataForBackend = Object.fromEntries(updatedData);

      // Use the callback to pass the data to the parent modal
      if (onSave) {
        onSave(dataForBackend);
      }
      
      setSelectedTooth(null);
    }
  };

  const ConditionCheckbox = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={currentConditions[label] || false}
        onCheckedChange={(isChecked) => handleCheckboxChange(label, isChecked as boolean)}
      />
      <p>{label}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-primary p-8 h-auto space-y-8">
      <div className="flex flex-row gap-4 justify-between h-full">
        <Teeth
          selectedTooth={selectedTooth}
          setSelectedTooth={setSelectedTooth}
          modifiedTeeth={new Set(allTeethData.keys())}
        />
        {selectedTooth !== null && (
            <div className="bg-blue-light rounded-xl p-8 flex flex-col h-full w-120">
              <div className="grow overflow-y-auto pr-2">
                <div>
                  <p className="text-blue-dark text-lg font-bold">Tooth {selectedTooth}</p>
                  <Accordion type="single" collapsible defaultValue="item-1" className="bg-background rounded-xl px-4 mt-2 mb-4 w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-blue-dark font-medium">Conditions</AccordionTrigger>
                      <AccordionContent className="p-4 max-h-40 overflow-y-auto">
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
                      <AccordionContent className="flex flex-col gap-2 p-4 max-h-40 overflow-y-auto">
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
                      <AccordionContent className="flex flex-col gap-2 p-4 max-h-40 overflow-y-auto">
                        <ConditionCheckbox label="Extraction (Caries)" />
                        <ConditionCheckbox label="Extraction (other causes)" />
                        <ConditionCheckbox label="Congenitally Missing" />
                        <ConditionCheckbox label="Supernumerary" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="mb-2">
                  <p className=" font-medium text-blue-dark">Notes</p>
                  <Textarea
                    className="bg-background w-full"
                    placeholder="Add your notes here..."
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 py-6">
                  <Button onClick={() => setSelectedTooth(null)} variant="outline" className="bg-blue-light text-blue-dark border-blue-primary hover:text-blue-dark hover:bg-background">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveToothData}>Save</Button>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Odontogram;