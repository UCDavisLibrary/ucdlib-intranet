import config from './config.js';
import elasticSearch from './elastic-search.js';
import logger from './logger.js';
import wp from './wp.js';
import transform from './transform.js';

class Indexer {

  async reindexAll() {
    await this.deleteAll();
    for (let postType of config.postTypes) {
      await this.reindexPostType(postType);
    }
  }

  async reindexPost(postId, postType) {
    try {
      const {posts} = await wp.getPostType(postType, {
        include: postId
      });
      if (!posts.length){
        logger.warn({message: `Post not found in WP`, postId, postType});
        return;
      }
      await this.deletePost(postId);
      const post = posts[0];
      const transformedPost = await transform(post);
      if ( !transformedPost ) {
        logger.warn({message: `Post not found in transform`, postId, postType});
        return;
      }
      const insertRes = await elasticSearch.insert(transformedPost);
      logger.info({message: `Indexed ${postType}`, postId, result: insertRes?.result});
      if( insertRes.result !== 'updated' && insertRes.result !== 'created' ) {
        throw new Error('Unknown result from elasicsearch insert: '+insertRes.result);
      }

    } catch(e) {
      logger.error({message: `Error indexing ${postType}`, error: e, postId});
      return;
    }
  }

  async reindexPostType(postType){
    let offset = 0;
    let total = 0;
    let perPage = 100;
    logger.info(`Reindexing post type: '${postType}'`);
    do {
      try {
        let {posts, total: totalPosts} = await wp.getPostType(postType, {
          offset,
          perPage
        });
        total = parseInt(totalPosts);

        for (let post of posts) {
          const transformedPost = await transform(post);
          if ( !transformedPost ) {
            logger.warn({message: `Post not found in transform`, postId: post.id, postType});
            continue;
          }
          const insertRes = await elasticSearch.insert(transformedPost);
          logger.info({message: `Indexed ${postType}`, postId: post.id, result: insertRes?.result});
          if( insertRes.result !== 'updated' && insertRes.result !== 'created' ) {
            throw new Error('Unknown result from elasicsearch insert: '+insertRes.result);
          }
        }

      } catch(e) {
        logger.error({message: `Error indexing ${postType}`, error: e, offset, total});
      }
      offset += perPage;
    } while ( offset < total );
  }

  /**
   * @description Delete all posts from elastic search index
   */
  async deleteAll(){
    let result = await elasticSearch.client.deleteByQuery({
      index : config.elasticSearch.indexAlias,
      body : {
        query: {
          bool : {
            should : config.postTypes.map(type => ({term: {type}}))
          }
        }
      }
    });
    logger.info(`Scrubbed ${result.deleted} posts from elastic search of types: ${config.postTypes.join(', ')}`);
  }

  async deletePost(postId){
    let result = await elasticSearch.client.deleteByQuery({
      index : config.elasticSearch.indexAlias,
      body : {
        query: {
          term : {postId}
        }
      }
    });
    logger.info(`Deleted ${result.deleted} posts from elastic search with id: ${postId}`);
  }
}

export default new Indexer();
