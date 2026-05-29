const request = require('supertest');
const express = require('express');
const boardsRouter = require('../../routes/boards');
const { createBoard } = require('../factories/board.factory');
const { defaultBoard } = require('../fixtures/board.fixture');
const prisma = require('../../prisma/prisma');

describe('Boards API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/boards', boardsRouter);
  });

  beforeEach(async () => {
    // clean database before every test
    await prisma.board.deleteMany();
  });

  afterEach(async () => {
    await prisma.board.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /boards creates a board in the real database', async () => {
    const res = await request(app).post('/boards').send({
      name: defaultBoard.name,
      description: defaultBoard.description,
      status: defaultBoard.status,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Board');
    expect(res.body.status).toBe('active');

    // verify database state
    const boardInDb = await prisma.board.findUnique({
      where: {
        id: res.body.id,
      },
    });

    expect(boardInDb).not.toBeNull();
    expect(boardInDb.name).toBe(defaultBoard.name);
  });

  test('GET /boards returns created boards', async () => {
    await createBoard({ name: 'Board 1', description: 'Test Board 1', status: 'active' });

    const res = await request(app).get('/boards');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Board 1');
    expect(res.body[0].status).toBe('active');
  });

  test('GET /boards/:id returns 404 for missing board', async () => {
    const res = await request(app).get('/boards/123');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'Board with id 123 is not found',
    });
  });

  test('DELETE /boards/:id deletes board from database', async () => {
    const board = await createBoard({ name: 'Delete Me' });

    const res = await request(app).delete(`/boards/${board.id}`);

    expect(res.statusCode).toBe(204);
    const deletedBoard = await prisma.board.findUnique({
      where: {
        id: board.id,
      },
    });
    expect(deletedBoard).toBeNull();
  });
});
