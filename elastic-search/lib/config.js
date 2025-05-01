import fs from 'fs';

class Config {
  constructor(){

    this.appName = this.getEnv('INDEXER_NAME', 'intranet-indexer');
    this.port = 3000;

    // google cloud credentials, for logging
    this.gc = {
      projectId: this.getEnv('INDEXER_GC_PROJECT_ID', 'digital-ucdavis-edu'),
      keyFilename: this.getEnv('INDEXER_GC_KEY_FILENAME', '/secrets/gc-reader-key.json')
    }
    this.gc.serviceAccountExists = fs.existsSync(this.gc.keyFilename);

    this.logger = {
      name: this.getEnv('INDEXER_LOGGER_NAME', this.appName),
      //streams: this.toArray( this.getEnv('INDEXER_LOGGER_STREAM', 'console,gc') ), TODO: change back after restart
      streams: this.toArray( this.getEnv('INDEXER_LOGGER_STREAM', 'console') ),
      level: this.getEnv('INDEXER_LOGGER_LEVEL', 'warn')
    }

  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @param {Boolean} errorIfMissing - If true, throw an error if the environment variable is not set.
   * @returns
   */
  getEnv(name, defaultValue=false, errorIfMissing=false){
    const env = process?.env?.[name]
    if ( env ) {
      if ( env.toLowerCase() == 'true' ) return true;
      if ( env.toLowerCase() == 'false' ) return false;
      return env;
    }
    if ( errorIfMissing && !this.ignoreEnvError ) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return defaultValue;
  }

  toArray(str){
    if ( !str ) return [];
    return str.split(',').map( s => s.trim() );
  }
}

export default new Config();
