interface StudentResultProps {
  resultInfo: {
    data: any;
    isSuccess: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };
}

const StudentResult: React.FC<StudentResultProps> = ({ resultInfo }) => {
  const { data } = resultInfo;
  console.log("data: ", data);
  return (
    <div>
      <h1>Here is your result breakdown:</h1>

      {data && Object.keys(data)?.length && (
        <div className="flex flex-col gap-8 items-start justify-start text-justify">
          <div className="flex flex-col items-start justify-start gap-1">
            <p className="font-semibold text-lg text-violet-500">Score:</p>
            <p className="">{data?.score}</p>
          </div>
          <div className="flex flex-col items-start justify-start gap-1">
            <p className="font-semibold text-lg text-red-500">Explanation:</p>
            <p className="">{data?.explanation}</p>
          </div>
          <div className="flex flex-col items-start justify-start gap-1">
            <p className="font-semibold text-lg text-green-500">Feedback:</p>
            <p className="">{data?.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResult;
