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
    name: z.string().min(1, 'Asset name is required'),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.enum(['Active', 'Inactive', 'Maintenance']),
    locationId: z.string().min(1, 'Location is required'),
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
