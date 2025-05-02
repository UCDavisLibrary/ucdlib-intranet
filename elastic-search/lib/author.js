import Cache from './cache.js';
import wp from './wp.js';

class Author {

  constructor(){
    this.cache = new Cache({
      ttl: 60 * 60 * 1000 // 1 hour
    });
  }

  async get(authorId){
    const cacheKey = `author:${authorId}`;
    let author = this.cache.get(cacheKey);
    if ( author ) {
      return author;
    }
    author = await wp.getAuthor(authorId);
    author = {
      id: author.id,
      name: author.name
    }
    this.cache.set(cacheKey, author);
    return author;
  }

}

export default new Author();
