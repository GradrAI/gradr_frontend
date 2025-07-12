import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/DataTableColumnHeader";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Category } from "@/types/Category";

export const columns: ColumnDef<Partial<Category>>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    accessorKey: "_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },

  {
    id: "categoryName",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
  },
  {
    id: "categoryType",
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Type" />
    ),
    cell: ({ row }) => {
      return <p className="uppercase">{row.original.type}</p>;
    },
  },
  {
    id: "maxScoreAttainable",
    accessorKey: "maxScoreAttainable",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Maximum Score Attainable" />
    ),
  },
  // {
  //   id: "status",
  //   accessorKey: "",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     console.log("row.original(status): ", row.original);
  //     return <p className=""></p>;
  //   },
  // },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      // console.log(' row.getValue("createdAt"): ', row.getValue("createdAt"));
      // const formattedDate = new Date(

      // ).toLocaleDateString("en-US");
      // return <div className="font-medium">{formattedDate}</div>;

      const raw = row.original.createdAt;
      const date = raw ? new Date(raw) : null;
      return date instanceof Date && !isNaN(date.getTime())
        ? date.toLocaleDateString()
        : null;
    },
  },
  {
    id: "students",
    accessorKey: "students",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. of Students" />
    ),
    cell: ({ row }) => <p className="">{row.original?.students?.length}</p>,
  },
  {
    id: "expander",
    header: () => "Expand",
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="text-sm text-blue-500 hover:underline"
        >
          {row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
        </button>
      ) : (
        ""
      ),
  },
];
