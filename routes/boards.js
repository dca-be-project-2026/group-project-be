const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  prisma.board
    .findMany()
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(500).json({ error: err }));
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
  const body = req.body;
  prisma.board
    .create({ data: { name: body.name, description: body.description, status: body.status } })
    .then(data => {
      console.log('data: ', data);
      res.json(data);
    })
    .catch(err => {
      console.error('err: ', err);
      res.status(500).json({ error: err });
    });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  console.log('id: ', id);
  prisma.board
    .delete({ where: { id: id } })
    .then(data => {
      res.status(204).json(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: `Cannot delete board with id ${id}` });
    });
});

module.exports = router;
