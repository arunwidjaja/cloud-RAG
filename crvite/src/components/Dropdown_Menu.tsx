"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxItem = {
  value: string
  label: string
}

type useHook = () => string[]

type ComboboxProps = {
  useItemsHook: useHook
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  onChange?: (value: string) => void
}

export function DropdownMenu({
  useItemsHook: useHook,
  placeholder = "Select an item...",
  searchPlaceholder = "Search items...",
  emptyMessage = "No item found.",
  className = "w-[200px]",
  onChange
}: ComboboxProps) {

  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState("")

  const hook_items = useHook()

  const items: ComboboxItem[] = hook_items.map(item => ({
    value: item,
    label: item
  }))

  React.useEffect(() => {
    console.log('hook_items updated:', hook_items);
    console.log('mapped items:', items);
  }, [hook_items, items])

  const handleSelect = (currentValue: string) => {
    // const newValue = currentValue === selectedValue ? currentValue : currentValue
    setSelectedValue(currentValue)
    onChange?.(currentValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between bg-text text-text2", className)}
        >
          {selectedValue
            ? items.find((item) => item.value === selectedValue)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)}>
        <Command className="bg-secondary">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="bg-secondary">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(value) => handleSelect(value)}
                  className="text-text"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}