export default class Cache {

  constructor(opts={}){
    this.ttl = opts.ttl || 60 * 60 * 1000; // 1 hour
    this.cache = new Map();
  }

  get(key){
    const item = this.cache.get(key);
    if ( !item ) {
      return null;
    }
    if ( item.expires < Date.now() ) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  set(key, value){
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    });
  }
  delete(key){
    this.cache.delete(key);
  }
  clear(){
    this.cache.clear();
  }
  has(key){
    return this.cache.has(key);
  }
}
