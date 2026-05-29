const prisma = require('../prisma/prisma');

const express = require('express');
const router = express.Router();
const { VALID_TASK_STATUSES } = require('../constants/taskStatus');
const { NotFoundError, ValidationError } = require('../utils/error');

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
      throw new ValidationError(statusErrorMessage);
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
    if (!task) {
      throw new NotFoundError('Task not found');
    }

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

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    if (!title || title.trim() === '') {
      throw new ValidationError('Title must be provided');
    }
    if (isInvalidStatus(status)) {
      throw new ValidationError(statusErrorMessage);
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
      throw new ValidationError('ids must be a non-empty array');
    }

    if (isInvalidStatus(status)) {
      throw new ValidationError(statusErrorMessage);
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

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    if (isInvalidStatus(status)) {
      throw new ValidationError(statusErrorMessage);
    }

    const findTask = await prisma.task.findUnique({ where: { id } });
    if (!findTask) {
      throw new NotFoundError('Task not found');
    }
    const updateTask = await prisma.task.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({
      data: updateTask,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const id = req.params.id;

    if (isInvalidStatus(status)) {
      throw new ValidationError(statusErrorMessage);
    }

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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
