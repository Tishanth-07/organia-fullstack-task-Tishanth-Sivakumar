'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { taskSchema, type TaskFormValues } from '@/schemas/task-schema';
import { useTasksStore } from '@/store/tasks-store';
import { TASK_STATUS_LABELS, type TaskStatus } from '@/types/task';

const STATUSES: TaskStatus[] = ['ToDo', 'InProgress', 'Completed'];

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  ToDo: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  InProgress: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3a9 9 0 1 0 9 9" />
      <polyline points="12 8 12 12 15 15" />
    </svg>
  ),
  Completed: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

export default function TaskModal() {
  const { isModalOpen, editingTask, closeModal, createTask, updateTask } = useTasksStore();
  const isEdit   = !!editingTask;
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', status: 'ToDo', dueDate: '' },
  });

  const selectedStatus = watch('status');

  // Populate form when editing
  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        reset({
          title:       editingTask.title,
          description: editingTask.description ?? '',
          status:      editingTask.status,
          dueDate:     editingTask.dueDate
            ? new Date(editingTask.dueDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        reset({ title: '', description: '', status: 'ToDo', dueDate: '' });
      }
    }
  }, [isModalOpen, editingTask, reset]);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const payload = {
        title:       values.title,
        description: values.description || undefined,
        status:      values.status,
        dueDate:     values.dueDate ? new Date(values.dueDate).toISOString() : null,
      };

      if (isEdit && editingTask) {
        await updateTask(editingTask.id, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created successfully');
      }
      closeModal();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Something went wrong');
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-panel animate-fade-up">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon">
              {isEdit ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <div>
              <h2 id="modal-title" className="modal-title">
                {isEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="modal-subtitle">
                {isEdit ? 'Update task details below' : 'Fill in the details for your new task'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={closeModal} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="modal-body" noValidate>
          {/* Title */}
          <div className="field-group">
            <label htmlFor="task-title" className="field-label">Task Title *</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Design the landing page hero section"
              className={`field-input ${errors.title ? 'error' : ''}`}
              autoFocus
              {...register('title')}
            />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="field-group">
            <label htmlFor="task-desc" className="field-label">Description</label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Add more context, links, or acceptance criteria…"
              className={`field-input field-textarea ${errors.description ? 'error' : ''}`}
              {...register('description')}
            />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          {/* Status */}
          <div className="field-group">
            <label className="field-label">Status</label>
            <div className="status-selector">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-option ${s === selectedStatus ? `status-option-active status-option-${s.toLowerCase()}` : ''}`}
                  onClick={() => setValue('status', s)}
                >
                  <span className={`status-option-icon ${s === selectedStatus ? 'text-current' : ''}`}>
                    {STATUS_ICON[s]}
                  </span>
                  {TASK_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="field-group">
            <label htmlFor="task-due" className="field-label">Due Date</label>
            <input
              id="task-due"
              type="date"
              className={`field-input ${errors.dueDate ? 'error' : ''}`}
              {...register('dueDate')}
            />
            {errors.dueDate && <p className="field-error">{errors.dueDate.message}</p>}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary modal-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}