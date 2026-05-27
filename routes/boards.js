const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

const { NotFoundError, ValidationError, ServerError } = require('../utils/error');

const SERVER_ERROR = 'An error happened while processing your request';

router.get('/', (req, res, next) => {
  prisma.board
    .findMany()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      next(new ServerError(SERVER_ERROR));
    });
});

router.get('/:id', (req, res, next) => {
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
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      next(new ServerError(SERVER_ERROR));
    });
});

router.post('/', (req, res, next) => {
  const body = req.body;
  if (!body.name || body.name.trim() === '') {
    res.status(400).json({ error: 'Name of the board must be provided!' });
    return;
  }
  prisma.board
    .create({ data: { name: body.name, description: body.description, status: body.status } })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      next(new ServerError(SERVER_ERROR));
    });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  prisma.board
    .delete({ where: { id: id } })
    .then(data => {
      res.status(204).json(data);
    })
    .catch(err => {
      console.error(err);
      next(new ServerError(SERVER_ERROR));
    });
});

module.exports = router;
