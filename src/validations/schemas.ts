import { z } from 'zod';

export const authSchemas = {
  login: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  register: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
};

export const assetSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required'),
    asset_id: z.string().optional(),
    asset_type: z.enum(["Fan_Blower", "Pumps", "Gearbox", "Compressor", "Chillers", "CNC", "Motor", "Other"], {
      message: "Please select an asset type",
    }),
    timezone: z.string().min(1, 'Time zone is required'),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    description: z.string().optional(),
    // We will validate locationObject and assigned_users directly or through zod
    // For react-hook-form we can just use any for objects if needed, but let's be strict:
    locationObject: z.any().refine((val) => val !== null && val !== undefined, { message: 'Location is required' }),
    assigned_users: z.array(z.any()).min(1, 'Please assign at least one user'),
    asset_build_type: z.string().optional(), // validated manually if mode=child
  }),
};

export const workOrderSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    assetId: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
    dueDate: z.string().optional(),
  }),
};
