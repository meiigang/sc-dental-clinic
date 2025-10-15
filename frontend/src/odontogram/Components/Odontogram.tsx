import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Teeth from "./Teeth"
import "./Odontogram.css"
import { Textarea } from "@/components/ui/textarea";

const Odontogram: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  return (
    <div className="odontogram">
      <Teeth selectedTooth={selectedTooth} setSelectedTooth={setSelectedTooth} />
      {selectedTooth !== null && (
        <div className="border-2 border-blue-primary rounded-xl p-8 space-y-8">
          <p className="text-blue-dark text-lg font-bold mb-4">Tooth {selectedTooth}</p>
          {/* Appointment History */}
          <div className="space-y-4">
            <p className="text-blue-dark">Appointment History</p>
            <ul className="grid">
              <li
                className="bg-background hover:bg-blue-50 border-blue-primary rounded-lg p-4 mb-2"
              >
                October 15, 2025 | Surgery
              </li>
              <li
                className="bg-background hover:bg-blue-50 border-blue-primary rounded-lg p-4 mb-2"
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
          {/* Close Button */}
          <Button
            className="justify-end"
            onClick={() => setSelectedTooth(null)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default Odontogram;