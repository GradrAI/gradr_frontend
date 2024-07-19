import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, Form } from "semantic-ui-react";

import { BASE_URL } from "../requests/constants";
import toast from "react-hot-toast";

const Login = () => {
  const [authUri, setAuthUri] = useState("");

  const { isLoading, isError, isSuccess, error, data, mutate } = useMutation({
    mutationKey: ["Data"],
    mutationFn: async () => {
      try {
        const res = await axios.get(`${BASE_URL}/auth/google`);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    // retry: 3,
  });

  if (authUri) {
    window.location.href = authUri;
  }

  const handleSubmit = () => {
    mutate();
  };

  useEffect(() => {
    if (isLoading) {
      toast.success("Signing you in...");
    }
    if (isError) {
      toast.error(error);
    }
    if (isSuccess && data) {
      console.log("data: ", data);
      setAuthUri(data?.data?.authorizationUrl);
    }
  }, [isSuccess, isError, error, data]);

  return (
    <Form
      onSubmit={handleSubmit}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <Button primary type="submit">
        Sign in with Google
      </Button>
    </Form>
  );
};

export default Login;
