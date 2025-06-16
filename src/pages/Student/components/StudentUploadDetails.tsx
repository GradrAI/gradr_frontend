import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface StudentUploadDetailsProps {
  resourceInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
}

const StudentUploadDetails: React.FC<StudentUploadDetailsProps> = ({
  resourceInfo,
}) => {
  const { data } = resourceInfo;

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="font-semibold">Category Upload</p>
      <div className="flex flex-col md:flex-row gap-1 md:gap-2">
        <p>File URL:</p>
        <p
          className="cursor-pointer text-blue-500 hover:text-blue-600 truncate max-w-sm"
          onClick={() => {
            window.open(`${data.fileUrl}`, "_blank", "noopener,noreferrer");
          }}
        >
          {data?.fileUrl}
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" disabled>
          Re-upload
        </Button>
      </div>
    </div>
  );
};

export default StudentUploadDetails;
