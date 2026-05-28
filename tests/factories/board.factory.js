const prisma = require('../../prisma/prisma');
const { defaultBoard } = require('../fixtures/board.fixture');

async function createBoard(overrides = {}) {
  return await prisma.board.create({
    data: { ...defaultBoard, ...overrides },
  });
}

module.exports = { createBoard };
