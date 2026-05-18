const { PrismaClient } = require('@prisma/client');

let prisma;

// Initialize Prisma client for tests
beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  prisma = new PrismaClient();
});

// Clean up database before each test
beforeEach(async () => {
  // TODO: Uncomment when models are defined
  // await prisma.task.deleteMany();
  // await prisma.board.deleteMany();
});

// Close Prisma connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { prisma };
