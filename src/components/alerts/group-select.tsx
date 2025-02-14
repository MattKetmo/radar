"use client";

import { useState } from "react";
import { Boxes, Check, ChevronDown } from "lucide-react";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  labels: string[];
  defaultValue: string;
}

export default function GroupSelect(props: Props) {
  const { labels, defaultValue } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useQueryState('group', { defaultValue, history: 'push' });

  useHotkeys('g', (e) => {
    e.preventDefault(); // Prevent typing in input field
    setOpen(true)
  }, []);

  return (
    <div className="flex space-x-2 items-center">
      <Label htmlFor="group-select" className="text-nowrap text-muted-foreground">
        <span className="sr-only">Group by</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Boxes size={16} className="shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="left" className="flex items-center gap-2">
            <span>Group by</span>
            <span className="font-mono flex items-center justify-center h-5 w-5 text-muted-foreground border-muted-foreground border rounded-sm">G</span>
          </TooltipContent>
        </Tooltip>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="group-select"
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-[30px] min-w-[120px] w-full justify-between bg-background px-3 font-normal hover:bg-background"
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
                      setValue(currentValue);
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
