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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category } from "@/types/Category";
import { Course } from "@/types/Course";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import CategoryRow from "./CategoryRow";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setSelectedRows?: any;
  getSubRows?: any;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setSelectedRows,
  getSubRows,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    url: false,
    fileName: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });
  const [expanded, setExpanded] = useState({});
  const [dataForLinkGeneration, setDataForLinkGeneration] = useState({
    courseId: "",
    categoryId: "",
  });
  const [open, setOpen] = useState(false);
  const [changeClipboardIcon, setChangeClipboardIcon] = useState(false);

  useEffect(() => {
    const selections = table.getFilteredSelectedRowModel().rows;
    if (Boolean(selections?.length)) {
      setSelectedRows(selections.map(({ original }) => original));
    }
  }, [rowSelection]);

  useEffect(() => {
    if (changeClipboardIcon) {
      setInterval(() => {
        setChangeClipboardIcon(false);
      }, 1000);
    }
  }, [changeClipboardIcon]);

  const {
    data: linkData,
    isLoading: linkIsLoading,
    isSuccess: linkIsSuccess,
    isError: linkIsError,
    error: linkError,
  } = useQuery({
    queryKey: ["courseLink"],
    queryFn: async () =>
      await axios.post(`/courses/generateLink`, dataForLinkGeneration, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled:
      Boolean(dataForLinkGeneration?.courseId?.length) &&
      Boolean(dataForLinkGeneration?.categoryId?.length),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (linkIsLoading) toast.success(`Generating link for category`);
    if (linkIsSuccess && linkData) setOpen(true);
    if (linkIsError)
      toast.error(linkError?.message || "Unable to generate course link");
  }, [linkIsSuccess, linkIsLoading, linkIsError, linkData]);

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

  return (
    <div className="">
      <div className="flex gap-4 items-center py-4">
        <Input
          placeholder="Filter by course name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
              table.getRowModel().rows.map((row) => {
                const data = row.original as Course;
                return (
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
                          <div className="p-4 bg-muted rounded-md space-y-2">
                            {row.subRows.map((subRow) => {
                              const category = subRow.original as Category;

                              return (
                                <CategoryRow
                                  key={category._id}
                                  category={category}
                                  courseId={data._id}
                                />
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
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
