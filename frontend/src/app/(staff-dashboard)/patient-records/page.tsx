"use client"

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { RxCaretDown } from "react-icons/rx";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

{/* Filter Dropdown Options */}
const frameworks = [
  {
    value: "ascending",
    label: "Ascending (A-Z)",
  },
  {
    value: "descending",
    label: "Descending (Z-A)",
  }
]

export default function PatientRecords() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  
  return (
    <main>
      <div className="record-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Patient Records</h1>
        
        <div className="bg-blue-light mt-10 w-full max-w-4xl h-full rounded-3xl p-6">
          {/* Filter Button */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {value
                  ? frameworks.find((framework) => framework.value === value)?.label
                  : "Filter"}
                <RxCaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>No filter found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === framework.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
        </Popover>

        {/* Search Button */}
        </div>
      </div>
    </main>
  );
}