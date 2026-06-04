const request = require('supertest');
const express = require('express');
const { defaultTask } = require('../fixtures/tasks.fixture');
const errorHandler = require('../../middleware/errorHandler');

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockBoardFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      task: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        create: mockCreate,
        delete: mockDelete,
      },
      board: {
        findUnique: mockBoardFindUnique,
      },
    })),
  };
});

const taskRouter = require('../../routes/tasks');

describe('Tasks API Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/tasks', taskRouter);
    app.use(errorHandler);

    app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Something went wrong!';
      res.status(statusCode).json({ error: message });
    });

    jest.clearAllMocks();
  });

  test('GET /:boardId/tasks returns all tasks in the board', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', ...defaultTask },
      { id: '2', name: 'Task 2', ...defaultTask },
    ]);

    const res = await request(app).get('/tasks/123/tasks');

    expect(res.statusCode).toBe(200);

    expect(res.body.data.length).toEqual(2);
    expect(res.body.data[0]).toEqual({
      id: '1',
      ...defaultTask,
    });
  });

  test('GET /:boardId/tasks/:id returns 500 on db error', async () => {
    mockFindUnique.mockResolvedValue(undefined);

    const res = await request(app).get('/tasks/123/tasks/321');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Task not found');
  });

  test('PATCH /tasks/:id/invalidStatus returns error', async () => {
    const res = await request(app).patch('/tasks/123/status').send({
      status: 'processing',
    });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Invalid option: expected one of "todo"|"in_progress"|"done"'
    );
  });
});
