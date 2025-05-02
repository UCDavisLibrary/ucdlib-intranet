import express from 'express';
import logger from './lib/logger.js';
import config from './lib/config.js';
import es from './lib/elastic-search.js';
import indexer from './lib/indexer.js';

const app = express();

let reindexRunning = false;
app.get('/reindex', async (req, res) => {
  let rebuildSchema = (req.query.rebuildSchema === 'true');

  if( reindexRunning ) {
    return res.json({status: 'already running'});
  }

  reindexRunning = true;
  res.json({status: 'started', rebuildSchema});

  if( rebuildSchema ) {
    await es.deleteIndex();
    await es.ensureIndex();
  }

  await indexer.reindexAll();
  reindexRunning = false;
  logger.info('Reindexing complete');
});

app.get('/reindex/:postId', async (req, res) => {
  let postId = req.params.postId;
  let postType = req.query.postType || 'post';
  let rebuildSchema = (req.query.rebuildSchema === 'true');

  res.json({status: 'started', rebuildSchema, postId});

  if( rebuildSchema ) {
    await es.deleteIndex();
    await es.ensureIndex();
  }

  const info = {
    postId,
    postType,
    rebuildSchema
  };
  logger.info({message: `Reindexing post id ${postId}`, info});
  await indexer.reindexPost(postId, postType);
  logger.info({message: `Reindexing complete for post id ${postId}`, info});
});

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
