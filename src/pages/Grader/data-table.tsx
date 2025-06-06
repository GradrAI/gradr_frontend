import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdatedResource } from "@/types/UpdatedResource";
import { MoreHorizontal } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setSelectedRows?: any;
  getSubRows?: any;
  setSelectedSubRows?: (subRows: any[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setSelectedRows,
  getSubRows,
  setSelectedSubRows,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });
  const [expanded, setExpanded] = useState({});
  const [subRowSelection, setSubRowSelection] = useState<
    Record<string, Set<string>>
  >({});

  useEffect(() => {
    const selections = table.getFilteredSelectedRowModel().rows;
    if (Boolean(selections?.length)) {
      setSelectedRows(selections.map(({ original }) => original));
    }
  }, [rowSelection]);

  interface HandleCheckHeaderParams<TData> {
    id: string;
    subRows: Array<{ id: string } & TData>;
    checked: boolean;
  }

  const handleCheckHeader = <TData,>({
    id,
    subRows,
    checked,
  }: HandleCheckHeaderParams<TData>) => {
    const newSelection: Record<string, Set<string>> = { ...subRowSelection };
    if (checked) {
      newSelection[id] = new Set(subRows.map((row) => row.id));
    } else {
      delete newSelection[id];
    }
    setSubRowSelection(newSelection);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getSubRows,
    // getRowCanExpand: (row) => true,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      expanded,
    },
  });

  useEffect(() => {
    if (setSelectedSubRows) {
      // Flatten all selected subrows into a single array
      const selected = Object.entries(subRowSelection).flatMap(
        ([parentId, set]) =>
          table
            .getRowModel()
            .rows.find((row) => row.id === parentId)
            ?.subRows.filter((subRow) => set.has(subRow.id)) ?? []
      );
      setSelectedSubRows(selected?.map(({ original }) => original));
    }
  }, [subRowSelection, setSelectedSubRows, table]);

  return (
    <div className="">
      <div className="flex gap-4 items-center py-4">
        <Input
          placeholder="Filter by category type..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("type")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border bg-white p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {row.getIsExpanded() && row.subRows.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="p-2 rounded-md border bg-muted">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-4">
                                  <Input
                                    type="checkbox"
                                    checked={
                                      subRowSelection[row.id]?.size ===
                                        row.subRows.length &&
                                      row.subRows.length > 0
                                    }
                                    ref={(input) => {
                                      if (input) {
                                        input.indeterminate =
                                          !!subRowSelection[row.id] &&
                                          subRowSelection[row.id].size > 0 &&
                                          subRowSelection[row.id].size <
                                            row.subRows.length;
                                      }
                                    }}
                                    onChange={(e) =>
                                      handleCheckHeader({
                                        id: row.id,
                                        subRows: row.subRows,
                                        checked: e.target.checked,
                                      })
                                    }
                                  />
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  Student ID
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  Email
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  File URL
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  Status
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  Score
                                </TableHead>
                                <TableHead className="text-xs uppercase text-muted-foreground">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {row.subRows.map((subRow) => {
                                const resource =
                                  subRow.original as UpdatedResource;
                                return (
                                  <TableRow key={resource._id}>
                                    <TableCell>
                                      <Input
                                        type="checkbox"
                                        checked={
                                          subRowSelection[row.id]?.has(
                                            subRow.id
                                          ) || false
                                        }
                                        onChange={(e) => {
                                          setSubRowSelection((prev) => {
                                            const set = new Set(
                                              prev[row.id] || []
                                            );
                                            if (e.target.checked) {
                                              set.add(subRow.id);
                                            } else {
                                              set.delete(subRow.id);
                                            }
                                            return { ...prev, [row.id]: set };
                                          });
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {resource?.student?.studentId}
                                    </TableCell>
                                    <TableCell>
                                      {resource?.student?.email}
                                    </TableCell>
                                    <TableCell className="font-semibold truncate max-w-sm">
                                      {resource?.fileUrl}
                                    </TableCell>
                                    <TableCell
                                      className={`font-semibold truncate max-w-sm ${resource?.result ? "text-green-500" : "text-red-500"}`}
                                    >
                                      {resource?.result ? "Graded" : "Ungraded"}
                                    </TableCell>
                                    <TableCell>
                                      {resource?.result?.score
                                        ? resource?.result?.score?.split("/")[0]
                                        : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                          >
                                            <span className="sr-only">
                                              Open menu
                                            </span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => {
                                              console.log("fetching details");
                                            }}
                                          >
                                            View details
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
