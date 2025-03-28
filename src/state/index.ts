import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { User } from "@/types/User";

interface State {
  accountType: string;
  setAccountType: (accountType: string) => void;
  user: User | null;
  saveUser: (user: User) => void;
  token: string;
  saveUserToken: (token: string) => void;
  code: string;
  setCode: (code: string) => void;
  uniqueExamCode: string;
  setUniqueExamCode: (uniqueExamCode: string) => void;
}

const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        accountType: "",
        setAccountType: (accountType) => set({ accountType }),
        user: null,
        saveUser: (user) => set({ user }),
        token: "",
        saveUserToken: (token) =>
          set({
            token,
          }),
        code: "",
        setCode: (code) => set({ code }),
        uniqueExamCode: "",
        setUniqueExamCode: (uniqueExamCode) => set({ uniqueExamCode }),
      }),
      {
        name: "storage",
      }
    )
  )
);

export default useStore;
