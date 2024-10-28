import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Exam } from "@/types/Exam";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeader";

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
];
