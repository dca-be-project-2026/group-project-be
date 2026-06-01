const prisma = require('../prisma/prisma');

const express = require('express');
const router = express.Router();
const { NotFoundError } = require('../utils/error');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, batchUpdateTaskSchema } = require('../schemas/taskSchemas');

router.get('/', asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.status(200).json({ data: tasks });
}));

router.get('/:boardId/tasks', asyncHandler(async (req, res) => {
  const { status } = req.query;

  const where = { boardId: req.params.boardId };
  if (status) {
    where.status = status;
  }

  const tasks = await prisma.task.findMany({ where });
  res.status(200).json({ data: tasks });
}));

router.get('/:boardId/tasks/:id', asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
  });
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  res.status(200).json({ data: task });
}));

router.post('/:boardId/tasks', validate(createTaskSchema), asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const board = await prisma.board.findUnique({
    where: { id: req.params.boardId },
  });

  if (!board) {
    throw new NotFoundError('Board not found');
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      boardId: req.params.boardId,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
    },
  });
  res.status(201).json({ data: task });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.task.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
}));

router.patch('/batch', validate(batchUpdateTaskSchema), asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  const { count } = await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  res.status(200).json({ updated: count });
}));

router.patch('/:id/status', validate(updateTaskStatusSchema), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  const findTask = await prisma.task.findUnique({ where: { id } });
  if (!findTask) {
    throw new NotFoundError('Task not found');
  }

  const updateTask = await prisma.task.update({
    where: { id },
    data: { status },
  });
  res.status(200).json({ data: updateTask });
}));

router.patch('/:id', validate(updateTaskSchema), asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const id = req.params.id;

  const findTask = await prisma.task.findUnique({ where: { id } });
  if (!findTask) {
    throw new NotFoundError('Task not found');
  }

  const updateTask = await prisma.task.update({
    where: { id: id },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
    },
  });

  res.status(200).json({ data: updateTask });
}));

module.exports = router;
