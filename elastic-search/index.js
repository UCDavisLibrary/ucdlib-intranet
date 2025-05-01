import express from 'express';
import logger from './lib/logger.js';
import config from './lib/config.js';

const app = express();

app.get('/reindex', async (req, res) => {
  res.json({hello: 'world!!'});
});

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
