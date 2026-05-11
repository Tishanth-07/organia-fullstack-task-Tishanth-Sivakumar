import { z } from 'zod';

/**
 * Task Management Schema
 * Defines the validation rules for creating and updating tasks.
 * Ensures data integrity between the client and the backend API.
 */
export const taskSchema = z.object({
  
  /**
   * Title: Mandatory field for task identification.
   */
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be 200 characters or fewer')
    .trim(),

  /**
   * Description: Optional detailed context for the task.
   */
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),

  /**
   * Status: Strictly enforced enum matching the backend TaskStatus.
   */
  status: z.enum(['ToDo', 'InProgress', 'Completed'], {
    required_error: 'Status is required',
  }),

  /**
   * Due Date: Validates the date string format.
   * Allows empty values for tasks without a deadline.
   */
  dueDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, 'Please enter a valid date'),
});

/** TypeScript Type for Task Form Handling */
export type TaskFormValues = z.infer<typeof taskSchema>;