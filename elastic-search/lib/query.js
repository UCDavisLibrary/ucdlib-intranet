import config from './config.js';
import elasticSearch from './elastic-search.js';
import logger from './logger.js';

/**
 * @description Query class for handling ES search queries
 */
class Query {

  constructor(query={}){
    this.query = this.parse(query);
  }

  /**
   * @description Parse the query object from the request
   * @param {Object} query - Simplified query object
   * @returns {Object} - Parsed query object
   */
  parse(query){
    const q = {
      size: query.size || config.query.perPage,
      from: 0,
      sort: 'relevance'
    }

    if ( query.type ){
      q.type = query.type.split(',');
    }

    if ( query.q ){
      q.q = query.q;
      q.sort = query.sort === 'date' ? 'date' : 'relevance';
    } else {
      q.sort = 'date'
    }

    if ( query.page ) {
      const page = parseInt(query.page, 10);
      if ( !isNaN(page) && page > 0 ) {
        q.from = (page - 1) * q.size;
      }
    }

    if ( query.libraryGroupIds ){
      const libraryGroupIds = query.libraryGroupIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (libraryGroupIds.length > 0) {
        q.libraryGroupIds = libraryGroupIds;
      }
    }
    return q;
  }

  async execute(){
    const query = {
      query: this.query,
      body: this.constructQuery()
    }
    logger.info({message: 'Executing search', query});
    const out = {};
    out.res = await elasticSearch.search(query.body);
    out.total = out.res.hits.total.value;
    out.totalPages = Math.ceil(out.total / this.query.size);
    out.page = Math.floor(this.query.from / this.query.size) + 1;
    out.items = out.res.hits.hits.map(hit => {
      return {
        id: hit._id,
        score: hit._score,
        ...hit._source
      }
    });
    return out;
  }


  constructQuery(){

    const must = [];
    const filter = [];
    const sort = this.query.sort === 'date' ? [{sortByDate: {order: 'desc'}}] : [{_score: {order: 'desc'}}];

    if ( this.query.q ){
      must.push({
        multi_match: {
          query: this.query.q,
          fields: [
            'title^3', 'title.trigram',
            'excerpt', 'excerpt.trigram',
            'content', 'content.trigram',
            'authorNames', 'libraryGroupNames', 'categories'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
        }
      });
    }
    if ( this.query.type ){
      filter.push({
        terms: {
          type: this.query.type
        }
      });
    }

    if ( this.query.libraryGroupIds ){
      filter.push({
        terms: {
          libraryGroupIds: this.query.libraryGroupIds
        }
      });
    }

    return {
      size: this.query.size,
      from: this.query.from,
      sort,
      query: {
        bool: {
          must,
          filter
        }
      }
    };
  }
}

export default Query;
