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
import { ContextData } from "@/types/types"
import { createDefaultFileData } from "@/stores/filesStore"
import { handle_select_retrieved } from "@/handlers/retrieved_handlers"
import { createContextData } from "@/stores/retrievedStore"
import { get_file_data } from "@/handlers/retrieved_handlers"

export type ComboboxItem = {
  value: string
  label: string
  text: string
}

type useHook = () => ContextData[]

type ComboboxProps = {
  useItemsHook: useHook
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function DropdownMenuContext({
  useItemsHook: useHook,
  placeholder = "Select an item...",
  searchPlaceholder = "Search items...",
  emptyMessage = "",
  className = "w-[200px]",
  value = "",
  onChange
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)

  const hook_items = useHook()

  const items: ComboboxItem[] = hook_items.map(item => ({
    value: item.file.hash,
    label: item.file.name,
    text: item.text
  }))

  const defaultOnChange = React.useCallback((value: string) => {
    const selectedItem = items.find(item => item.value === value)
    if (selectedItem) {
      handle_select_retrieved(createContextData(get_file_data(selectedItem.value),selectedItem.text))
    } else {
      handle_select_retrieved(createContextData(createDefaultFileData(),""))
    }
  }, [items])

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? currentValue : currentValue
    setSelectedValue(newValue)
    if (onChange) {
      onChange(newValue)
    } else {
      defaultOnChange(newValue)
    }
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
                  onSelect={handleSelect}
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