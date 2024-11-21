"use client"

import * as React from "react"
import { fetch_db_files_metadata } from "@/api/api"
import { use_current_collection } from "@/handlers/collection_handlers"
import { use_selected_files, set_selected_files, use_files } from "@/handlers/file_handlers"
import { FileData } from "@/types/types"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { handle_delete_selected_files, handle_download_selected_files } from "@/handlers/button_handlers"

export function FileTable() {
  const collection = use_current_collection()
  const files = use_files()
  const selected_files = use_selected_files()

  const [data, setData] = React.useState<FileData[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    const loadFiles = async () => {
      const data: FileData[] = await fetch_db_files_metadata(collection)
      setData(data)
    };
    if (collection) {
      loadFiles();
    }
  }, [collection, files]);

  const columns: ColumnDef<FileData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(!!checked);
            if (checked) {
              set_selected_files(table.getRowModel().rows.map(row => row.original));
            } else {
              set_selected_files([]);
            }
          }}
          aria-label="Select all"
          className="border-gray-500"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selected_files.some(file => file.hash === row.original.hash)}
          onCheckedChange={(checked) => {
            row.toggleSelected(!!checked)
            if (checked) {
              set_selected_files([...selected_files, row.original]);
            } else {
              set_selected_files(selected_files.filter(file => file.hash !== row.original.hash));
            }
          }}
          aria-label="Select row"
          className="border-gray-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="hover:bg-[#18181B] hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            File
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "word_count",
      header: () => <div className="text-right">Words</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("word_count"))
        return <div className="text-right font-medium">{amount}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const file = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="h-8 w-8 p-0 bg-black">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-600">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(file.hash)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handle_download_selected_files}>Download File</DropdownMenuItem>
              <DropdownMenuItem onClick={handle_delete_selected_files}>Delete File</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]



  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div id="file_table_component" className="mt-2 flex flex-col flex-1 overflow-auto min-h-0">
      {/* Search and Filter */}
      <div id='searchandfilter' className="grid grid-cols-4 mb-3">
        <Input
          placeholder="Search files..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className=" bg-black border-gray-800 mr-1 col-span-3"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="ml-1 bg-black border-gray-800">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div id='table' className="rounded-md border flex flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-[#18181B] data-[state=selected]:bg-[#18181B]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="flex-1">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#18181B] data-[state=selected]:bg-[#18181B]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div id='pagination' className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-gray-600"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-gray-600"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
