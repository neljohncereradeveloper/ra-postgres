import { useState } from "react";
import { CCombobox } from "@/components/ui/share/combobox";
import { useComboboxDistrict } from "@/hooks/use-combobox-district";
import { ISharedComboboxProps } from "@/types/shared";

const CComboboxDistrict: React.FC<ISharedComboboxProps> = ({
  value,
  onSelect,
  required = true,
}) => {
  const [open, setOpen] = useState(false);
  const { data } = useComboboxDistrict();

  return (
    <CCombobox
      data={data || []} // Combobox options
      label="District"
      placeholder="Select" // Ensure placeholder is shown for new rows
      value={value} // Current value for the combobox
      open={open} // Open state from context
      onOpenChange={setOpen} // Handle opening and closing
      onSelect={onSelect} // Update the desc1 field
      buttonWidth="flex-1" // Full width for alignment
      required={required}
    />
  );
};

export default CComboboxDistrict;
