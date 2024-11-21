"use client"

import * as React from "react"
import { X } from "lucide-react";
import { fetch_uploads_metadata } from "@/api/api"
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
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { use_current_uploads, set_selected_uploads, use_selected_uploads } from "@/handlers/file_handlers"
import { handle_remove_selected_uploads } from "@/handlers/button_handlers";






export function UploadTable() {
    const uploads = use_current_uploads()
    const selected_uploads = use_selected_uploads()
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
            const data: FileData[] = await fetch_uploads_metadata()
            setData(data)
        };
        if (uploads) {
            loadFiles();
        }
    }, [uploads]);

    const columns: ColumnDef<FileData>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        if (value) {
                            set_selected_uploads([...table.getRowModel().rows.map(row => row.original)]);
                        } else {
                            set_selected_uploads([]);
                        }
                    }}
                    aria-label="Select all"
                    className="border-gray-500"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selected_uploads.some(upload => upload.hash === row.original.hash)}
                    onCheckedChange={(checked) => {
                        row.toggleSelected(!!checked)
                        if (checked) {
                            set_selected_uploads([...selected_uploads, row.original]);
                        } else {
                            set_selected_uploads(selected_uploads.filter(upload => upload.hash !== row.original.hash));
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
                        Upload
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const upload = [row.original]
                return (
                    <Button
                        onClick={() => handle_remove_selected_uploads(upload)}
                        variant="destructive"
                        className="h-6 w-6 p-0 bg-black border border-white rounded-full">
                        <X className="h-2 w-2" />
                    </Button>

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
        <div id="upload_table_component" className="mt-2 flex flex-col flex-1 overflow-auto min-h-0">
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
