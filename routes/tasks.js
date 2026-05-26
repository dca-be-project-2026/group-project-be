const { PrismaClient } = require('@prisma/client');

const express = require('express');
const router = express.Router();
const prisma = new PrismaClient();
const { VALID_TASK_STATUSES } = require('../constants/taskStatus');

const isInvalidStatus = status => status && !VALID_TASK_STATUSES.includes(status);
const statusErrorMessage = `Status must be one of these: ${VALID_TASK_STATUSES.map(s => `"${s}"`).join(', ')}`;

router.get('/', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany();
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/:boardId/tasks', async (req, res, next) => {
  try {
    const { status } = req.query;

    if (isInvalidStatus(status)) {
      return res.status(400).json({ error: statusErrorMessage });
    }

    const where = { boardId: req.params.boardId };
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({ where });
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/:boardId/tasks/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ data: task });
  } catch (error) {
    next(error);
  }
});

router.post('/:boardId/tasks', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const board = await prisma.board.findUnique({
      where: { id: req.params.boardId },
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be provided' });
    }
    if (isInvalidStatus(status)) {
      return res.status(400).json({ error: statusErrorMessage });
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
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.patch('/batch', async (req, res, next) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    if (isInvalidStatus(status)) {
      return res.status(400).json({ error: statusErrorMessage });
    }

    const { count } = await prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    res.status(200).json({ updated: count });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const id = req.params.id;

    const findTask = await prisma.task.findUnique({ where: { id } });
    if (!findTask) {
      return res.status(404).json({ error: 'Task cannot be found' });
    }

    if (isInvalidStatus(status)) {
      return res.status(400).json({ error: statusErrorMessage });
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
