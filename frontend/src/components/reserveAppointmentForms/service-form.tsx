import ServicesAccordion from "@/components/services-accordion";
import { useFormContext } from "@/context/useFormContext";

export default function ServiceForm() {
  const { formValues, updateFormValues } = useFormContext<any>();
  return (
    <div className="bg-blue-light rounded-xl p-12">
      <p className="mb-4 text-xl font-bold text-blue-dark">Select Service</p>
      <ServicesAccordion
        selectedService={formValues.selectedService}
        setSelectedService={service => updateFormValues({ selectedService: service })}
      />
    </div>
  );
}