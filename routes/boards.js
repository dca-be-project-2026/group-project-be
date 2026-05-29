const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

const { NotFoundError } = require('../utils/error');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { createBoardSchema } = require('../schemas/boardSchemas');

router.get('/', asyncHandler(async (req, res) => {
  const data = await prisma.board.findMany();
  res.json(data);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = await prisma.board.findUnique({ where: { id } });
  if (!data) {
    throw new NotFoundError(`Board with id ${id} is not found`);
  }
  res.json(data);
}));

router.post('/', validate(createBoardSchema), asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const data = await prisma.board.create({ data: { name, description, status } });
  res.status(201).json(data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.board.delete({ where: { id } });
  res.status(204).send();
}));

module.exports = router;
