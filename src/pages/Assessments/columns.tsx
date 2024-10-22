import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../../components/DataTableColumnHeader";
import { Exam } from "@/types/Exam";

export const columns: ColumnDef<Partial<Exam>>[] = [
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
    accessorKey: "examName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exam Name" />
    ),
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
  {
    id: "students",
    accessorKey: "students",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Number of students" />
    ),
    cell: ({ row }) => {
      return <p className="">{row.original?.students?.length}</p>;
    },
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
  //! TO-DO: think about actions to be added here
  //   {
  //     id: "actions",
  //     header: "Actions",
  //     cell: ({ row }) => {
  //       const data = row.original;
  //       console.log("row data: ", data);

  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             {/* <DropdownMenuItem>View customer</DropdownMenuItem> */}
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     },
  //   },
];
