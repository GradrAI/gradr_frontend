import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Exam } from "@/types/Exam";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: "id",
    accessorKey: "_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    id: "examName",
    accessorKey: "exam.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exam Name" />
    ),
  },
  {
    id: "status",
    accessorKey: "exam.result.score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <p
        className={`${row.original?.exam?.result?.score ? "text-blue-500" : "text-red-500"}`}
      >
        {row?.original?.exam?.result?.score ? "Graded" : "Ungraded"}
      </p>
    ),
  },
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
    id: "url",
    accessorKey: "answer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" />
    ),
  },
  {
    id: "fileName",
    accessorKey: "fileName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Name" />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const {
        _id,
        exam: { name },
      } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={!row.original.exam?.result?.score}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* disable if file is ungraded */}

            <DropdownMenuItem
              onClick={() => {
                window.location.href = `${encodeURI(`/app/grader/details?exam=${name}&studentId=${_id}`)}`;
              }}
            >
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
