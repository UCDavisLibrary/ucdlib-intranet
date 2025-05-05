import express from 'express';
import logger from './lib/logger.js';
import config from './lib/config.js';
import es from './lib/elastic-search.js';
import indexer from './lib/indexer.js';
import Query from './lib/query.js';

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
});

app.get('/reindex/status', async (req, res) => {
  res.json({status: reindexRunning ? 'running' : 'not running'});
});

app.get('/reindex/:postId', async (req, res) => {
  let postId = req.params.postId;
  let postType = req.query.postType || 'post';
  let rebuildSchema = (req.query.rebuildSchema === 'true');

  if ( !config.postTypes.includes(postType) ) {
    logger.info({message: `Invalid post type ${postType}`, postId});
    return res.status(200).json({error: `Invalid post type ${postType}`});
  }

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

app.delete('/reindex/:postId', async (req, res) => {
  let postId = req.params.postId;

  res.json({status: 'started', postId});
  logger.info(`Deleting post id ${postId}`);
  try {
    await indexer.deletePost(postId);
  } catch (error) {
    logger.error({message: `Error deleting post id ${postId}`, error});
  }
});

app.get('/search', search);
app.post('/search', search);
async function search(req, res) {
  try {
    let input = Object.assign({}, req.query, req.body);
    const query = new Query(input);

    const out = {
      query: query.query
    }

    if ( input.constructedQuery ) {
      out.constructedQuery = query.constructQuery();
    }
    out.res = await query.execute();

    if ( !input.rawRes ) {
      delete out.res.res;
    }

    res.json(out);
  }
  catch (error) {
    logger.error({message: `Error searching`, error});
    res.status(500).json({error: 'Internal Server Error'});
  }
}

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
