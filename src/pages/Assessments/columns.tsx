import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "../../components/DataTableColumnHeader";
import { Course } from "@/types/Course";
import { MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Partial<Course>>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Name" />
    ),
  },
  {
    id: "categoryName",
    accessorKey: "categories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categories" />
    ),
    cell: ({ row }) => <p>{row.original?.categories?.length}</p>,
  },
  // {
  //   id: "status",
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     return <p className="text-red-500">Ungraded</p>; //! TO-DO: calculate overall grade status of an exam based on grade value of each individual student(?)
  //   },
  // },
  // {
  //   id: "students",
  //   accessorKey: "students",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Number of students" />
  //   ),
  //   cell: ({ row }) => {
  //     return <p className="">{row.original?.students?.length}</p>;
  //   },
  // },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const formattedDate = new Date(
        row.getValue("createdAt")
      ).toLocaleDateString("en-US");
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `/app/assessments/${encodeURI(data?._id ?? "")}`)
              }
            >
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
