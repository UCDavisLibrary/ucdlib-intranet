import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-favorite-manage.tpl.js";
import WpRest from '../../controllers/wp-rest.js';

export default class UcdlibIntranetFavoriteManage extends LitElement {

  static get properties() {
    return {
      logoUrl: {type: String, attribute: 'logo-url'},
      page: {type: String},
      yourFavorites: {type: Array},
      defaultFavorites: {type: Array},
      popularFavorites: {type: Array},
      loading: {type: Boolean}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.logoUrl = '';
    this.yourFavorites = [];
    this.defaultFavorites = [];
    this.popularFavorites = [];

    this.restNamespace = 'ucdlib-intranet/favorites';
    this.api = new WpRest(this);

    this.page = '';
    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();

    const urlParams = new URLSearchParams(window.location.search);
    const pages = ['your-favorites', 'default-favorites', 'popular-favorites'];
    const page = urlParams.get('section');
    if (pages.includes(page)) {
      this.page = page;
    } else {
      this.page = 'your-favorites';
    }
  }

  willUpdate(props){
    if (props.has('page')) {
      this.loadPageData();
    }
  }

  _onTabClick(page){
    if ( this.loading ) return;
    if ( this.page === page ) return;
    this.page = page;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('section', page);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
  }

  async loadPageData(){
    if ( !this.page || this.page === 'error' ) return;
    this.loading = true;
    const yourFavorites = await this.api.get();
    if ( yourFavorites.status === 'error' ){
      this.page = 'error';
      console.error(yourFavorites.error);
      return;
    }
    this.yourFavorites = yourFavorites.data?.favorites || [];
    this.loading = false;
  }

  async _onItemMove(item, direction='up'){
    if ( this.loading ) return;
    this.loading = true;
    const r = await this.api.put('', item, {action: `move-${direction}`});
    if ( r.status === 'error' ){
      this.page = 'error';
      console.error(r.error);
      return;
    }
    this.api.clearCache();
    this.loading = false;
    this.loadPageData();
  }

}

customElements.define('ucdlib-intranet-favorite-manage', UcdlibIntranetFavoriteManage);
