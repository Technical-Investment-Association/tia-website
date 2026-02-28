/**
 * Grey pill-styled select: no outline on focus, light gray trigger and dropdown.
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type GreyPillSelectOption = { value: string; label: string };

type GreyPillSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly GreyPillSelectOption[] | GreyPillSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export function GreyPillSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
}: GreyPillSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={
          triggerClassName ??
          "w-full rounded-full border-0 bg-gray-200 pr-10 text-sm text-[hsl(var(--section-light-foreground))] outline-none focus:ring-0 focus:ring-offset-0"
        }
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={`rounded-xl border-0 bg-gray-200 text-[hsl(var(--section-light-foreground))] ${className ?? ""}`}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg focus:bg-gray-300 focus:text-[hsl(var(--section-light-foreground))]"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
