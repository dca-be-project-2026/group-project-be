const { z } = require('zod');

const createBoardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().optional(),
});

module.exports = { createBoardSchema };
