import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Form, FormInput } from "semantic-ui-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const SUIForm = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    marks: 0,
    dependencyLevel: 0,
    extraPrompt: "",
    file1: undefined,
    file2: undefined,
  });

  const { isFetching, isLoading, isError, isSuccess, error, mutate } =
    useMutation({
      mutationKey: ["gradeData"],
      mutationFn: async (form) => {
        const res = await axios.post(`/upload/file`, form);
        console.log("res: ", res);
        return res;
      },
    });

  const handleChange = (e, { name, value }) => {
    if (/file\d/i.test(name)) {
      const files = e.nativeEvent.target.files;
      setForm((prevForm) => ({ ...prevForm, [name]: files[0] }));
      return;
    }
    if (name === "marks" || name === "dependencyLevel") {
      value = Number(value);
    }
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleGrade = async () => {
    toast.info("Performing grading. Be patient.");
    const formData = new FormData();
    for (const [key, val] of Object.entries(form)) {
      formData.append(key, val);
    }
    mutate(formData);
  };

  const dropdownOptions = [
    {
      key: "ans",
      text: "Only internet answers",
      value: 0,
    },
    {
      key: "both",
      text: "Both marking guide and internet",
      value: 1,
    },
    {
      key: "onlyg",
      text: "Only marking guide",
      value: 2,
    },
  ];

  if (isError) {
    toast.error(error?.message);
  }

  if (isSuccess) {
    toast.success("Grading succesful");
    setTimeout(() => {
      nav("/app/results");
    }, 500);
  }

  if (isFetching || isLoading) {
    return (
      <div className="w-100 h-100 flex justify-center items-center">
        <p className="font-xl text-gray-600">Loading....</p>
      </div>
    );
  }

  return (
    <Form className="border w-[60%] p-8 shadow-zinc-800 flex flex-col gap-6">
      <div className="flex flex-col gap-4 justify-between items-stretch">
        <label>Total Marks Attainable</label>
        <FormInput
          required
          placeholder="30"
          name="marks"
          value={form.marks}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-4 justify-between items-stretch">
        <label>AI Dependency Level</label>
        <Dropdown
          placeholder="Select"
          fluid
          selection
          closeOnEscape
          name="dependencyLevel"
          options={dropdownOptions}
          value={form.dependencyLevel}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-4 justify-between items-stretch">
        <label>Additional Note/Prompt</label>
        <FormInput
          placeholder="Be extra efficient."
          type="text"
          name="extraPrompt"
          value={form.extraPrompt}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-4 justify-between items-center">
        <div className="w-[50%] flex flex-col gap-4 justify-between items-stretch">
          <label className="self-center my-auto">Upload question</label>
          <FormInput
            required
            fluid
            placeholder=""
            type="file"
            name="file1"
            onChange={handleChange}
          />
        </div>

        <div className="w-[50%] flex flex-col gap-4 justify-between items-stretch">
          <label className="self-center my-auto">Upload guide</label>
          <FormInput
            required
            fluid
            placeholder=""
            type="file"
            name="file2"
            onChange={handleChange}
          />
        </div>
      </div>

      <Button primary type="submit" onClick={handleGrade}>
        {isFetching || isLoading ? "Grading..." : "Grade"}
      </Button>
    </Form>
  );
};

export default SUIForm;
