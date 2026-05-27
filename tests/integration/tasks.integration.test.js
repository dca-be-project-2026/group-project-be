const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const tasksRouter = require('../../routes/tasks');
const { createBoard } = require('../factories/board.factory');
const { defaultBoard } = require('../fixtures/board.fixture');
const { createTask } = require('../factories/task.factory');
const { defaultTask } = require('../fixtures/tasks.fixture');
const prisma = new PrismaClient();

describe('Boards API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/tasks', tasksRouter);
  });

  beforeEach(async () => {
    // clean database before every test
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /tasks/boardId/tasks creates a task in the real database', async () => {
    // create board-1
    const boardOne = await createBoard({ name: 'Board 1' });
    // call endpoint with the id of board-1
    const res = await request(app).post(`/tasks/${boardOne.id}/tasks`).send({
      title: defaultTask.title,
      description: defaultTask.description,
      boardId: boardOne.id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Task');

    // verify database state
    const taskInDb = await prisma.task.findUnique({
      where: {
        id: res.body.data.id,
      },
    });

    expect(taskInDb).not.toBeNull();
    expect(taskInDb.title).toBe(defaultTask.title);
  });

  test('POST /tasks/invalidBoardID/tasks returns 404', async () => {
    const boardOne = await createBoard({ name: 'Board 1' });
    const res = await request(app).post(`/tasks/123/tasks`).send({
      title: defaultTask.title,
      description: defaultTask.description,
      boardId: boardOne.id,
    });

    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Board not found');
  });

  test('GET /tasks returns created tasks', async () => {
    // create board-1
    const boardOne = await createBoard({ name: 'Board 1' });
    await createTask(boardOne.id, { title: 'task one' });
    await createTask(boardOne.id, { title: 'task two' });
    await createTask(boardOne.id, { title: 'task three' });
    const res = await request(app).get(`/tasks/${boardOne.id}/tasks`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.data.filter(e => e.title === 'task three').length).toBe(1);
  });

  test('GET /tasks/:boardId/tasks/:id returns the task with the specified id', async () => {
    const boardOne = await createBoard({ name: 'Board 1' });
    const taskOne = await createTask(boardOne.id, { title: 'task one' });

    const res = await request(app).get(`/tasks/${boardOne.id}/tasks/${taskOne.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe(taskOne.title);
  });
});
