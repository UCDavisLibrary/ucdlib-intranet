import Cache from './cache.js';
import wp from './wp.js';

class Taxonomy {

  constructor(){
    this.cache = new Cache({
      ttl: 60 * 60 * 1000 // 1 hour
    });
  }

  async get(taxonomy, id){
    const cacheKey = `taxonomy:${taxonomy}:${id}`;
    let taxonomyItem = this.cache.get(cacheKey);
    if ( taxonomyItem ) {
      return taxonomyItem;
    }
    taxonomyItem = await wp.getTaxonomyTerm(taxonomy, id);
    taxonomyItem = {
      id: taxonomyItem.id,
      slug: taxonomyItem.slug,
      taxonomy: taxonomyItem.taxonomy,
      name: taxonomyItem.name
    }
    this.cache.set(cacheKey, taxonomyItem);
    return taxonomyItem;
  }
}

export default new Taxonomy();
