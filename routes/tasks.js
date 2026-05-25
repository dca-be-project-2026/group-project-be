const { PrismaClient } = require('@prisma/client');

const express = require('express');
const router = express.Router();
const prisma = new PrismaClient();

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
    const tasks = await prisma.task.findMany({
      where: { boardId: req.params.boardId },
    });
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
    const VALID_STATUSES = ['todo', 'in_progress', 'done'];
    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be one of these: "todo", "in_progress", "done"' });
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

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  prisma.task
    .delete({ where: { id: id } })
    .then(() => {
      res.status(204).send();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong!' });
    });
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const id = req.params.id;

    const findTask = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task cannot be found' });
    }

    const VALID_STATUSES = ['todo', 'in_progress', 'done'];
    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be one of these: "todo", "in_progress", "done"' });
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

    res.status(200).json({ data: task });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
