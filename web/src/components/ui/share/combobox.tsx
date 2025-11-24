"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CheckIcon, ChevronDown } from "lucide-react";
import { CRequriedSymbol } from "./required-symbol";
import { cn } from "@/lib/utils";
import { IComboboxProps } from "@/types/shared";

interface StatelessComboboxProps {
  data: IComboboxProps[];
  label: string;
  placeholder?: string;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (value: string) => void;
  value?: string;
  buttonWidth?: string; // Allows customizing button width
  required?: boolean;
  modal?: boolean;
}

export const CCombobox: React.FC<StatelessComboboxProps> = ({
  data,
  label,
  placeholder = "Select an option...",
  value,
  open,
  onOpenChange,
  onSelect,
  buttonWidth = "w-[200px]",
  required = false,
  modal = true,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
      <div className="flex flex-col gap-3">
        <Label>
          {`${label} ${" "}`}
          {required && <CRequriedSymbol />}
        </Label>
        <div className="flex gap-2">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(buttonWidth, "justify-between")}
            >
              {value
                ? data.find((item) => item.value === value)?.label
                : placeholder}

              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
      </div>

      <PopoverContent className={cn(buttonWidth, "p-0")}>
        <Command>
          <CommandInput
            placeholder={`Search ${label.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => onSelect(item.value)}
                  className="uppercase"
                >
                  {item.label}

                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
