const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log('hi');
  res.send('ci/cd test ok!');
});

module.exports = router;
