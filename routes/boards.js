const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send({ data: 'Here are your boards.' });
});

router.get('/:id', (req, res) => {
  res.send({ data: 'Here is your requested board.' });
});

router.post('/', (req, res) => {
  // Response board has been created
});

router.delete('/:id', (req, res) => {
  // Response board has been deleted
});

module.exports = router;
