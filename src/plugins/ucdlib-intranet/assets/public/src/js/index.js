import "@ucd-lib/brand-theme";
import './elements/favorites/ucdlib-intranet-favorite-toggle.js';

class DynamicScriptLoader {

  constructor() {
    this.loaded = {};
    this.registration = [
      {
        name: 'favorites-admin',
        cssQuery: ['ucdlib-intranet-favorite-manage']
      },
      {
        name: 'search',
        cssQuery: ['ucdlib-intranet-search-bar']
      }
    ];
  }


  async load() {
    for( let bundle of this.registration ) {
      if( bundle.cssQuery ) {
        if ( !Array.isArray(bundle.cssQuery) ){
          bundle.cssQuery = [bundle.cssQuery];
        }
        for (const q of bundle.cssQuery) {
          if ( document.querySelector(q) ){
            this.loadWidgetBundle(bundle.name);
          }
        }
      }
    }
  }

  loadWidgetBundle(bundleName) {
    if( typeof bundleName !== 'string' ) return;
    if( this.loaded[bundleName] ) return this.loaded[bundleName];

    if ( bundleName == 'favorites-admin' ){
      this.loaded[bundleName] = import(/* webpackChunkName: "jobs-board-admin" */ './elements/favorites/ucdlib-intranet-favorite-manage.js');
    } else if ( bundleName == 'search' ){
      this.loaded[bundleName] = import(/* webpackChunkName: "ucdlib-intranet-search" */ './elements/search/index.js');
    }

    return this.loaded[bundleName]
  }

}

let loaderInstance = new DynamicScriptLoader();
if( document.readyState === 'complete' ) {
  loaderInstance.load();
} else {
  window.addEventListener('load', () => {
    loaderInstance.load();
  });
}
