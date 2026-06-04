const request = require('supertest');
const express = require('express');
const tasksRouter = require('../../routes/tasks');
const { createBoard } = require('../factories/board.factory');
const { defaultBoard } = require('../fixtures/board.fixture');
const { createTask } = require('../factories/task.factory');
const { defaultTask } = require('../fixtures/tasks.fixture');
const prisma = require('../../prisma/prisma');
const errorHandler = require('../../middleware/errorHandler');

describe('Boards API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/tasks', tasksRouter);
    app.use(errorHandler);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Task", "Board" RESTART IDENTITY CASCADE;
  `);
  });

  afterEach(async () => {
    await prisma.task.deleteMany();
    await prisma.board.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /tasks/boardId creates a task in the real database', async () => {
    // create board-1
    const boardOne = await createBoard({ name: 'Board 1' });
    // call endpoint with the id of boardOne
    console.log('created board: ', boardOne);
    const res = await request(app).post(`/tasks/${boardOne.id}/tasks`).send({
      title: defaultTask.title,
      description: defaultTask.description,
      boardId: boardOne.id,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Task');

    console.log('res: ', res.body.data);

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

  test('PATCH /tasks/:id/status updates the status of specified task', async () => {
    const boardOne = await createBoard({ name: 'Board 1' });
    const taskOne = await createTask(boardOne.id, { title: 'task one' });

    // Verify initial status to be TODO
    const taskInDb = await prisma.task.findUnique({
      where: {
        id: taskOne.id,
      },
    });
    expect(taskInDb.status).toBe('todo');

    const res = await request(app).patch(`/tasks/${taskOne.id}/status`).send({
      status: 'in_progress',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  test('PATCH /tasks/:id updates the specified task', async () => {
    const boardOne = await createBoard({ name: 'Board 1' });
    const taskOne = await createTask(boardOne.id, { title: 'task one' });

    // verify title to be task one
    const taskInDb = await prisma.task.findUnique({
      where: {
        id: taskOne.id,
      },
    });
    expect(taskInDb.title).toBe('task one');

    const res = await request(app).patch(`/tasks/${taskOne.id}`).send({
      title: 'task two',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('task two');
  });

  test('PATCH /batch updates the status of all tasks with the provided ids', async () => {
    const boardOne = await createBoard({ name: 'Board 1' });
    const taskOne = await createTask(boardOne.id, { title: 'task one', status: 'in_progress' });
    const taskTwo = await createTask(boardOne.id, { title: 'task two', status: 'in_progress' });
    const taskThree = await createTask(boardOne.id, { title: 'task three', status: 'in_progress' });

    const res = await request(app)
      .patch(`/tasks/batch`)
      .send({
        ids: [taskOne.id, taskTwo.id, taskThree.id],
        status: 'done',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.updated).toBe(3);
  });
});
