import { useEffect, useState, useId } from "react";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
  type: string;
  status: "Available" | "Unavailable";
};

const SERVICE_CATEGORIES = [
  "Basic Services",
  "Restoration/Prevention",
  "Surgery",
  "Endodontics",
  "Prosthodontics",
  "Orthodontics",
  "Miscellaneous/Adjunct Management",
];

type ServicesAccordionProps = {
  selectedService: Service | null;
  setSelectedService: (service: Service) => void;
};

export default function ServicesAccordion({ selectedService, setSelectedService }: ServicesAccordionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(""); // No default selection
  const id = useId();

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("http://localhost:4000/api/services");
        const data = await res.json();
        if (res.ok && Array.isArray(data.services)) {
          setServices(data.services);
        }
      } catch (err) {
        // handle error
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {SERVICE_CATEGORIES.map((category, idx) => {
          const categoryServices = services.filter(
            (s) => s.type === category && s.status === "Available"
          );
          return (
            <AccordionItem value={`item-${idx + 1}`} key={category}>
              <AccordionTrigger className="text-blue-dark font-medium bg-blue-accent rounded-md px-4">
                {category}
              </AccordionTrigger>
              <AccordionContent className="mt-4">
                {categoryServices.length > 0 ? (
                  <RadioGroup
                    className="w-full gap-2 overflow-y-auto max-h-45"
                    value={selectedServiceId}
                    onValueChange={(val) => {
                      setSelectedServiceId(val);
                      const found = categoryServices.find(s => s.id.toString() === val);
                      if (found) setSelectedService(found);
                    }}
                  >
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        className="border-input has-data-[state=checked]:border-blue-primary relative flex w-full items-center gap-2 bg-background rounded-md border p-4 shadow-xs outline-none"
                      >
                        {/* Individual Service Radio Button */}
                        <RadioGroupItem
                          value={service.id.toString()}
                          id={`${id}-${service.id}`}
                          aria-label={`service-radio-${service.name}`}
                          aria-describedby={`${id}-${service.id}-description`}
                          className="bg-white size-5 after:absolute after:inset-0 [&_svg]:size-3"
                        />
                        <div className="grid grow gap-2">
                          {/* Service Name and Price */}
                          <Label htmlFor={`${id}-${service.id}`} className="justify-between">
                            {service.name}{" "}
                            <span className="text-black text-xs leading-[inherit] font-medium">
                              ₱{service.price}{service.unit ? service.unit : ""}
                            </span>
                          </Label>
                          {/* Service Description */}
                          {service.description && (
                            <p id={`${id}-${service.id}-description`} className="text-muted-foreground text-xs">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-gray-500 text-sm px-2 py-4">No available services.</div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}