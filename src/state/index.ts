import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { queryClient } from "@/lib/queryClient";
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
  selectedRail: "paystack_ngn" | "creem_usd" | null;
  setSelectedRail: (rail: "paystack_ngn" | "creem_usd" | null) => void;
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
        saveUser: (user) => {
          const currentUser = get().user;
          // Clear React Query cache when switching users
          if (currentUser && currentUser._id !== user._id) {
            queryClient.clear();
          }
          set({ user });
        },
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
        selectedRail: null,
        setSelectedRail: (selectedRail) => set({ selectedRail }),
        organizationData: {} as OrganizationData,
        appendOrganizationData: (data) =>
          set((state) => ({
            organizationData: { ...state.organizationData, ...data },
          })),
        expandedRowId: null,
        setExpandedRowId: (id) => set({ expandedRowId: id }),
        reset: () => {
          // Clear React Query cache to prevent cross-user data leaks
          queryClient.clear();
          set({
            accountType: "",
            user: null,
            token: "",
            code: "",
            studentData: null,
            selectedPaymentPlan: null,
            selectedRail: null,
            organizationData: {} as OrganizationData,
            expandedRowId: null,
          });
          localStorage.removeItem("storage");
        },
      }),
      {
        name: "storage",
      }
    )
  )
);

export default useStore;
