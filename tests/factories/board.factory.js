const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultBoard = {
  name: 'Test Board',
  description: 'Test description',
  status: 'active',
};

async function createBoard(overrides = {}) {
  return await prisma.board.create({
    data: { ...defaultBoard, ...overrides },
  });
}

module.exports = { createBoard, defaultBoard };
