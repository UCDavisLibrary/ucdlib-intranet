import config from './config.js';
import fetch from 'node-fetch';
import logger from './logger.js';

class Wp {
  constructor(){
    this.apiUrl = `${config.wp.url}/wp-json/wp/v2`;
  }

  async getPostType(postType, opts={}){
    let param = postType;
    if ( postType == 'page' ) {
      param = 'pages';
    } else if ( postType == 'post' ) {
      param = 'posts';
    }

    const params = new URLSearchParams({
      per_page: opts.perPage || 100,
      offset: opts.offset || 0
    });
    if ( opts.include ){
      params.set('include', Array.isArray(opts.include) ? opts.include.join(',') : opts.include);
    }
    const url = `${this.apiUrl}/${param}?${params.toString()}`;
    logger.info({message: `Fetching ${param}`, url, params: Object.fromEntries(params.entries())});
    const headers = this.addAuthHeader(opts.headers);
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    if ( !response.ok ) {
      const text = await response.text() || '';
      throw new Error(`${response.status} Error fetching posts: ${text}`);
    }
    const data = await response.json();
    if ( !Array.isArray(data) ) {
      throw new Error(`Invalid response from WP API: ${JSON.stringify(data)}`);
    }
    return {
      posts: data,
      url,
      total: response.headers.get('X-WP-Total'),
      totalPages: response.headers.get('X-WP-TotalPages')
    };

  }

  async getAuthor(authorId){
    const url = `${this.apiUrl}/users/${authorId}`;
    logger.info({message: `Fetching author`, url});
    const headers = this.addAuthHeader();
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    if ( !response.ok ) {
      const text = await response.text() || '';
      throw new Error(`${response.status} Error fetching author: ${text}`);
    }
    const data = await response.json();
    if ( !data?.id ) {
      throw new Error(`Invalid response from WP API: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /**
   * @description Add Application Password credentials to the headers
   * @param {Object} headers - The headers to add the credentials to
   * @returns
   */
  addAuthHeader(headers={}){
    return {
      ...headers,
      'Authorization': 'Basic '+ btoa(config.wp.username+':'+config.wp.password)
    };
  }
}

export default new Wp();
