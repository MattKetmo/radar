import { ListFilter, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { LabelFilter } from "./types";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AlertFiltersProps = {
  filters: LabelFilter[];
  setFilters: (value: LabelFilter[]) => void;
};

export function AlertFilters(props: AlertFiltersProps) {
  const { filters, setFilters } = props;

  const addFilter = (filter: LabelFilter) => {
    setFilters([...filters, filter]);
  };

  // No filters, display the filters button
  if (filters.length === 0) {
    return (
      <div className="-ml-1">
        <AddFilterButton addFilter={addFilter} label="Filters" />
      </div>
    );
  }

  return (
    <div className="gap-2 flex items-center">
      {filters.map((filter, i) => (
        <EditableFilterButton
          key={i}
          filter={filter}
          editFilter={(filter) => {
            const newFilters = [...filters];
            newFilters[i] = filter;
            setFilters(newFilters);
          }}
          deleteFilter={() => {
            const newFilters = [...filters];
            newFilters.splice(i, 1);
            setFilters(newFilters);
          }}
        />
      ))}
      <AddFilterButton addFilter={addFilter} label="" />
    </div>
  );
}

function filterOperand(isEqual: boolean, isRegex: boolean) {
  return isRegex ? (isEqual ? "=~" : "!~") : isEqual ? "=" : "!=";
}

function AddFilterButton(props: {
  addFilter: (filter: LabelFilter) => void;
  label: string;
}) {
  const { addFilter, label } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [filterText, setFilterText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse filter text (simple implementation - can be enhanced)
    const match = filterText.match(/^([^=!~]+)([=!~]+)(.+)$/);
    if (match) {
      const [, label, operator, value] = match;
      const isExclude = operator.startsWith("!");
      const isRegex = operator.includes("~");

      addFilter({
        label: label.trim(),
        value: value.trim(),
        exclude: isExclude,
        regex: isRegex,
      });

      setFilterText("");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="label=value"
          className="px-2 py-1 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
          onBlur={() => setIsEditing(false)}
        />
      </form>
    );
  }

  return (
    <Button
      variant="secondary"
      size="xs"
      className={cn(
        "w-full text-muted-foreground justify-between bg-background font-normal hover:bg-secondary",
        {
          "px-3": label.length > 0,
        }
      )}
      onClick={() => setIsEditing(true)}
    >
      <ListFilter
        size={16}
        strokeWidth={2}
        className="shrink-0 text-muted-foreground/80"
        aria-hidden="true"
      />
      {label}
    </Button>
  );
}

function EditableFilterButton(props: {
  filter: LabelFilter;
  editFilter: (filter: LabelFilter) => void;
  deleteFilter: () => void;
}) {
  const { filter, editFilter, deleteFilter } = props;

  {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(
      `${filter.label}${filterOperand(!filter.exclude, filter.regex)}${
        filter.value
      }`
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const match = editValue.match(/^([^=!~]+)([=!~]+)(.+)$/);
      if (match) {
        const [, label, operator, value] = match;
        const isExclude = operator.startsWith("!");
        const isRegex = operator.includes("~");

        const updatedFilter = {
          label: label.trim(),
          value: value.trim(),
          exclude: isExclude,
          regex: isRegex,
        };

        editFilter(updatedFilter);
        setIsEditing(false);
      }
    };

    return (
      <div
        className="flex items-center px-2 py-0.5 bg-secondary rounded-sm shadow-sm border-border/20"
      >
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex">
            <input
              autoFocus
              className="bg-transparent outline-none w-full min-w-[150px]"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={(e) => handleSubmit(e)}
            />
          </form>
        ) : (
          <button onClick={() => setIsEditing(true)}>
            <span className="font-semibold font-mono">{filter.label}</span>
            <span className="text-muted-foreground">
              {filterOperand(!filter.exclude, filter.regex)}
            </span>
            <span className="truncate">{filter.value}</span>
          </button>
        )}
        <button
          className="ml-1"
          title="Remove filter"
          onClick={deleteFilter}
        >
          <XIcon size={14} className="text-muted-foreground" />
        </button>
      </div>
    );
  }
}
