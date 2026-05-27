const { PrismaClient } = require('@prisma/client');
const { defaultTask } = require('../fixtures/tasks.fixture');
const prisma = new PrismaClient();

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
