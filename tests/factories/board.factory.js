const { PrismaClient } = require('@prisma/client');
const { defaultBoard } = require('../fixtures/board.fixture');
const prisma = new PrismaClient();

async function createBoard(overrides = {}) {
  return await prisma.board.create({
    data: { ...defaultBoard, ...overrides },
  });
}

module.exports = { createBoard };
