import { create } from "zustand";

export interface CreateLocationFormData {
    title: string;
    location_type: string;
    description: string;
    assigned_users: any[];
    attachments: any[];
}

interface CreateLocationStore extends CreateLocationFormData {
    setTitle: (data: string) => void;
    setLocationType: (data: string) => void;
    setDescription: (data: string) => void;
    setAssignedUsers: (data: any[]) => void;
    setAttachments: (data: any[]) => void;

    /** Generic setter if you ever need it */
    setCreateLocationValue: <K extends keyof CreateLocationFormData>(
        key: K,
        value: CreateLocationFormData[K]
    ) => void;

    resetForm: () => void;
}

const initialState: CreateLocationFormData = {
    title: "",
    location_type: "",
    description: "",
    assigned_users: [],
    attachments: [],
};

export const useCreateLocationStore = create<CreateLocationStore>((set) => ({
    ...initialState,

    // INDIVIDUAL SETTERS
    setTitle: (data) => set({ title: data }),
    setLocationType: (data) => set({ location_type: data }),
    setDescription: (data) => set({ description: data }),
    setAssignedUsers: (data: any[]) => set({ assigned_users: data }),
    setAttachments: (data: any[]) => set({ attachments: data }),

    // GENERIC SETTER
    setCreateLocationValue: (key, value) =>
        set(() => ({
            [key]: value,
        })),

    // RESET FORM
    resetForm: () => set(initialState),
}));
