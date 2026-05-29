const { z } = require('zod');
const { VALID_TASK_STATUSES } = require('../constants/taskStatus');

const taskStatusEnum = z.enum(VALID_TASK_STATUSES, {
  errorMap: () => ({ message: `Status must be one of: ${VALID_TASK_STATUSES.join(', ')}` }),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
});

const batchUpdateTaskSchema = z.object({
  ids: z.array(z.string()).min(1, 'ids must be a non-empty array'),
  status: taskStatusEnum,
});

module.exports = { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, batchUpdateTaskSchema };
