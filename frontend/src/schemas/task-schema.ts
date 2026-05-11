import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer')
    .trim(),

  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),

  status: z.enum(['ToDo', 'InProgress', 'Completed'], {
    required_error: 'Status is required',
  }),

  dueDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, 'Invalid date'),
});

export type TaskFormValues = z.infer<typeof taskSchema>;