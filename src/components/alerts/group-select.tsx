"use client";

import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  labels: string[];
  defaultValue: string;
}

export default function GroupSelect(props: Props) {
  const { labels, defaultValue } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useQueryState('group', { defaultValue });

  return (
    <div className="flex space-x-2 items-center">
      <Label htmlFor="group-select" className="text-nowrap text-muted-foreground">Group by</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="group-select"
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-[30px] w-full justify-between bg-background px-3 font-normal hover:bg-background"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? labels.find((label) => label === value)
                : "Label"}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search label..." />
            <CommandList>
              <CommandEmpty>No label found.</CommandEmpty>
              <CommandGroup>
                {labels.map((label) => (
                  <CommandItem
                    key={label}
                    value={label}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === label ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
