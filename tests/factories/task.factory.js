const prisma = require('../../prisma/prisma');
const { defaultTask } = require('../fixtures/tasks.fixture');

async function createTask(boardId, overrides = {}) {
  return await prisma.task.create({
    data: {
      ...defaultTask,
      boardId,
      ...overrides,
    },
  });
}

module.exports = { createTask };
