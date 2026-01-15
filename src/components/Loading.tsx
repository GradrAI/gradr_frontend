import FormField from "@/pages/Exams/components/FormField";
import LoadingImage from "../assets/loader.gif";

export default function Loading() {
  return (
    <FormField>
      <div className="flex flex-col items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src={LoadingImage}
          alt="Nodding head doge"
          width={50}
          height={50}
          className="block mb-3 rounded-full bg-sunny"
        />
        <h2 className="font-semibold tracking-tight text-center text-zinc-600">
          Generating Quiz...
        </h2>
      </div>
    </FormField>
  );
}
