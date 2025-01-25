"use client"

import * as React from "react"
import _ from 'lodash';
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
import { handle_select_context } from "@/handlers/handlers_retrieval"
// import { createContextData } from "@/stores/retrievalStore"
// import { get_file_data } from "@/handlers/handlers_retrieval"

export type ComboboxItem = {
  value: string
  label: string
  item: ContextData
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
  const hook_items_unique = _.uniqBy(hook_items,'file.hash')

  const items: ComboboxItem[] = hook_items_unique.map(item => ({
    value: item.file.hash,
    label: item.file.name,
    item: item
  }))

  const defaultOnChange = React.useCallback((value: string) => {
    const selectedItem = items.find(item => item.value === value)
    if (selectedItem) {
      handle_select_context(selectedItem.item)
    } else {
      console.log("Else block in ddmcontext on change")
      // handle_select_context(createContextData(createDefaultFileData(),""))
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
                  onSelect={(value) => handleSelect(value)}
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