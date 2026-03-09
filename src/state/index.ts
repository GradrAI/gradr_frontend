import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { User } from "@/types/User";
import { PaymentPlan } from "@/types/PaymentPlan";
import { OrganizationData } from "@/types/OrganizationData";
import { StudentData } from "@/types/StudentData";

interface State {
  accountType: string;
  setAccountType: (accountType: string) => void;
  user: User | null;
  saveUser: (user: User) => void;
  token: string;
  saveUserToken: (token: string) => void;
  code: string;
  setCode: (code: string) => void;
  studentData: StudentData | null;
  setStudentData: (studentData: StudentData) => void;
  selectedPaymentPlan: PaymentPlan | null;
  setSelectedPaymentPlan: (plan: PaymentPlan | null) => void;
  organizationData: OrganizationData;
  appendOrganizationData: (data: OrganizationData) => void;
  expandedRowId: number | null;
  setExpandedRowId: (id: number) => void;
  reset: () => void;
}

const useStore = create<State>()(
  devtools(
    persist(
      (set, get, store) => ({
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
        studentData: null,
        setStudentData: (studentData) => set({ studentData }),
        selectedPaymentPlan: null,
        setSelectedPaymentPlan: (plan) => set({ selectedPaymentPlan: plan }),
        organizationData: {} as OrganizationData,
        appendOrganizationData: (data) =>
          set((state) => ({
            organizationData: { ...state.organizationData, ...data },
          })),
        expandedRowId: null,
        setExpandedRowId: (id) => set({ expandedRowId: id }),
        reset: () => {set(store.getInitialState())},
      }),
      {
        name: "storage",
      }
    )
  )
);

export default useStore;
