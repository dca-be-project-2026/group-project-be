const request = require('supertest');
const express = require('express');
const { defaultBoard } = require('../fixtures/board.fixture');

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      board: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        create: mockCreate,
        delete: mockDelete,
      },
    })),
  };
});

const boardsRouter = require('../../routes/boards');

describe('Boards API Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/boards', boardsRouter);

    jest.clearAllMocks();
  });

  test('GET /boards returns boards', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', ...defaultBoard },
      { id: '2', name: 'Board 2', ...defaultBoard },
    ]);

    const res = await request(app).get('/boards');

    expect(res.statusCode).toBe(200);

    expect(res.body.length).toEqual(2);
    expect(res.body[0]).toEqual({
      id: '1',
      ...defaultBoard,
    });
  });

  test('GET /boards returns 500 on db error', async () => {
    mockFindMany.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/boards');

    expect(res.statusCode).toBe(500);

    expect(res.body).toEqual({
      error: 'An error happened while processing your request',
    });
  });

  test('GET /boards/:id returns board with specified id', async () => {
    mockFindUnique.mockResolvedValue({
      id: '1',
      ...defaultBoard,
    });
    const res = await request(app).get('/boards/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: '1',
      ...defaultBoard,
    });
  });

  test('GET /boards/invalid id returns 404', async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await request(app).get('/boards/xxx');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Board with id xxx is not found');
  });

  test('POST /boards creates a new board', async () => {
    mockCreate.mockResolvedValue({
      id: '1',
      ...defaultBoard,
    });
    const res = await request(app).post('/boards').send({
      name: defaultBoard.name,
      description: defaultBoard.description,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: '1',
      ...defaultBoard,
    });
  });

  test('POST /boards with no name produces error', async () => {
    const res = await request(app).post('/boards').send({ description: 'board 1' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Name of the board must be provided!');
  });
});
