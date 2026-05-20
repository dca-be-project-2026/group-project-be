const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const boards = prisma.board.findMany();
  res.json(boards);
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  prisma.board
    .findUnique({
      where: { id: id },
    })
    .then(data => {
      if (!data) {
        res.status(404).json({ error: `Board with id ${id} is not found` });
        return;
      }
      console.log('test');
      res.json(data);
    })
    .catch(err => res.status(500).json({ error: err }));
});

router.post('/', (req, res) => {
  // Response board has been created
});

router.delete('/:id', (req, res) => {
  // Response board has been deleted
});

module.exports = router;
