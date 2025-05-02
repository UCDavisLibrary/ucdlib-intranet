import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client } from '@elastic/elasticsearch';
import config from './config.js';
import logger from './logger.js';
import waitUntil from './wait-until.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ElasticSearch {
  constructor() {
    this.DEFAULT_OFFSET = 0;
    this.DEFAULT_LIMIT = 10;
    this.init();
  }

  async init(){
    await this.connect();
    await this.ensureIndex();
  }

  /**
   * @method isConnected
   * @description make sure we are connected to elasticsearch
   */
  async isConnected() {
    if( this.connected ) return;

    logger.info('waiting for es connection');
    await waitUntil(config.elasticSearch.host, config.elasticSearch.port);

    // sometimes we still aren't ready....
    try {
      await this.client.ping({}, { requestTimeout: 5000 });
      this.connected = true;
    } catch(e) {
      logger.warn({message: 'es ping failed', error: e});
      await this.isConnected();
    }
  }

  /**
   * @method connect
   * @description connect to elasticsearch and ensure collection indexes
   */
  async connect() {
    if( !this.client ) {
      const node = `http://${config.elasticSearch.username}:${config.elasticSearch.password}@${config.elasticSearch.host}:${config.elasticSearch.port}`;
      this.client = new Client({
        node,
        requestTimeout : config.elasticSearch.requestTimeout
      });
    }

    await this.isConnected();
    logger.info('Connected to Elastic Search');
  }

  /**
   * @method ensureIndex
   * @description make sure given index exists in elastic search
   *
   * @param {String} alias
   *
   * @returns {Promise}
   */
  async ensureIndex() {
    let alias = config.elasticSearch.indexAlias;
    const aliasExists = await this.client.indices.existsAlias({ name: alias });

    if ( aliasExists ) {
      logger.info(`Alias exists: ${alias}`);
      return;
    }

    logger.info(`No alias exists: ${alias}, creating...`);

    let indexName = await this.createIndex(alias);
    await this.setAlias(indexName);
  }

  async setAlias(indexName) {
    let alias = config.elasticSearch.indexAlias;
    try {
      await this.client.indices.deleteAlias({index: indexName, name: alias});
    } catch(e) {}
    await this.client.indices.putAlias({index: indexName, name: alias});
    logger.info(`Alias ${alias} pointed at index ${indexName}`);
  }

  async deleteIndex() {
    let alias = config.elasticSearch.indexAlias;
    const aliasExists = await this.client.indices.existsAlias({ name: alias });
    if( !aliasExists ) return;

    let info = await this.client.indices.getAlias({name: alias});
    let indexes = Object.keys(info);
    if( indexes.length === 0 ) return;

    logger.info(`deleting index: ${indexes[0]}`);

    await this.client.indices.delete({index: indexes[0]});
  }

  /**
   * @method insert
   * @description insert record into index
   *
   * @param {Object} record
   * @param {String} index index to insert into, defaults to main alias
   */
  async insert(record, index) {
    return this.client.index({
      index : index || config.elasticSearch.indexAlias,
      id : record.id,
      body: record
    });
  }

  /**
   * @method createIndex
   * @description create new new index with a unique name based on alias name
   *
   * @param {String} alias alias name to base index name off of
   *
   * @returns {Promise} resolves to string, new index name
   */
   async createIndex(alias, newIndexName) {
    newIndexName = newIndexName && alias !== newIndexName ? newIndexName : `${alias}-${Date.now()}`;
    let schemaTxt = fs.readFileSync(path.join(__dirname, 'schema.json'), 'utf-8');
    let mappings = JSON.parse(schemaTxt);

    let synonymTxt = fs.readFileSync(path.join(__dirname, 'synonym.txt'), 'utf-8');
    let synonyms = synonymTxt.split('\n')
      .map(line => line.trim())
      .filter(line => !line.match(/^#/))
      .filter(line => line !== '');

    try {
      await this.client.indices.create({
        index: newIndexName,
        body : {
          settings : {
            analysis : {
              analyzer: {
                defaultAnalyzer: {
                  tokenizer: 'standard',
                  filter: ["lowercase", "stop", "synonym", "asciifolding"]
                },

                trigram: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase","stop","synonym", "asciifolding","shingle"]
                },
                reverse: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase","stop","synonym", "asciifolding","reverse"]
                }
              },
              filter: {
                shingle: {
                  type: "shingle",
                  min_shingle_size: 2,
                  max_shingle_size: 3
                },
                synonym: {
                  type : "synonym",
                  synonyms,
                  "ignore_position_increments": true
                }
              }
            }
          },
          mappings
        }
      });
    } catch(e) {
      throw e;
    }

    logger.info(`Index ${newIndexName} created`);

    return newIndexName;
  }
}

const instance = new ElasticSearch();
export default instance;
