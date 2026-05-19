const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send({ data: 'Here are your tasks.' });
});

router.get('/:id', (req, res) => {
  res.send({ data: 'Here is your requested task.' });
});

router.post('/', (req, res) => {
  // Response task has been created
});

router.delete('/:id', (req, res) => {
  // Response task has been deleted
});

module.exports = router;
