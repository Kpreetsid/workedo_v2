import { create } from "zustand";

interface PhoneNumber {
    number?: string;
    internationalNumber?: string;
    nationalNumber?: string;
    e164Number?: string;
    countryCode?: string;
    dialCode?: string;
}

export interface AuthPayload {
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
    isFirstUser?: boolean;
    phone_no?: PhoneNumber;
    password?: string;
    account_name?: string;
    type?: string;
    description?: string;
}

type FlowType = "signUp" | "resetPassword" | null;

interface AuthFlowState {
    payload: AuthPayload | null;
    flowType: FlowType;
    setAuthFlow: (type: FlowType, payload: AuthPayload) => void;
    resetAuthFlow: () => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
    payload: null,
    flowType: null,

    setAuthFlow: (type, payload) => set({ flowType: type, payload }),
    resetAuthFlow: () => set({ payload: null, flowType: null }),
}));
