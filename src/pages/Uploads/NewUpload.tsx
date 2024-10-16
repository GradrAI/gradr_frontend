import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadForm from "@/components/UploadForm";
import { useEffect, useState } from "react";
import { UploadData } from "@/types/UploadData";

const NewUpload = () => {
  const [uploadData, setUploadData] = useState<Partial<UploadData>>({
    examName: "",
    fileType: "",
  });
  const [addNew, setAddNew] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUploadData({ ...uploadData, examName: value });
  };

  const handleSelectExam = (selection: string) => {
    if (selection === "addNew") {
      setAddNew(true);
      return;
    }
    setUploadData({ ...uploadData, examName: selection });
  };

  const handleSelectFile = (selection: string) => {
    setUploadData({ ...uploadData, fileType: selection });
  };

  useEffect(() => {
    //! TO-DO: reset file input to empty state when fileType changes
  }, [uploadData.fileType]);

  return (
    <div className="p-8 flex flex-col gap-8 justify-between items-start w-full md:w-2/4">
      <h1>Upload resources.</h1>
      {addNew ? (
        <Input
          name="examName"
          placeholder="Exam name (e.g. CSC 101)"
          className="w-full"
          value={uploadData.examName}
          onChange={handleChange}
        />
      ) : (
        <Select onValueChange={handleSelectExam} name="exam" required>
          <SelectTrigger className="">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="CSC-101">CSC-101</SelectItem>
              <SelectItem value="addNew">Add new</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      <Select onValueChange={handleSelectFile} name="fileType" required>
        <SelectTrigger className="">
          <SelectValue placeholder="Select file type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="guide">Marking Guide</SelectItem>
            <SelectItem value="question">Exam question</SelectItem>
            <SelectItem value="answers">Student Answers</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <UploadForm uploadData={uploadData} />
    </div>
  );
};

export default NewUpload;
