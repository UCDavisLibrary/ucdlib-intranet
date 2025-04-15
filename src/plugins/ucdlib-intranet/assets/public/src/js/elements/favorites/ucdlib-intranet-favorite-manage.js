import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-favorite-manage.tpl.js";
import WpRest from '../../controllers/wp-rest.js';

export default class UcdlibIntranetFavoriteManage extends LitElement {

  static get properties() {
    return {
      logoUrl: {type: String, attribute: 'logo-url'},
      page: {type: String},
      lastPage: {type: String},
      activeTab: {type: String},
      yourFavorites: {type: Array},
      defaultFavorites: {type: Array},
      popularFavorites: {type: Array},
      payload: {type: Object},
      searchResults: {type: Array},
      searchValue: {type: String},
      showSearchResults: {type: Boolean},
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
    this.payload = {};
    this.searchResults = [];
    this.searchValue = '';
    this.showSearchResults = false;

    this.restNamespace = 'ucdlib-intranet/favorites';
    this.api = new WpRest(this);
    this.wpApi = new WpRest(this, 'wp/v2');

    this.page = '';
    this.lastPage = '';
    this.activeTab = '';
    this.loading = false;
    this.sections = [
      {id: 'your-favorites', label: 'Your Favorites', default: true},
      {id: 'default-favorites', label: 'Default Favorites'},
      {id: 'popular-favorites', label: 'Popular Favorites'}
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    const urlParams = new URLSearchParams(window.location.search);
    const sections = this.sections.map(section => section.id);
    const page = urlParams.get('section');
    if (sections.includes(page)) {
      this.page = page;
    } else {
      this.page = this.sections.find(section => section.default).id;
    }

    this._decoder = document.createElement('textarea');
  }

  willUpdate(props){
    if (props.has('page')) {
      this.lastPage = props.get('page');
      if ( this.sections.find(section => section.id === this.page) ){
        this.activeTab = this.page;
      } else {
        this.activeTab = this.lastPage;
      }
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

  decodeHTMLEntities(str) {
    this._decoder.innerHTML = str;
    return this._decoder.value;
  }

  async loadPageData(){
    if ( !this.page || this.page === 'error' || this.page === 'form' ) return;
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

  async _onDelete(item){
    console.log(item);
  }

  async _onEdit(item){
    this.payload = JSON.parse(JSON.stringify(item));
    this.payload.useExternalUrl = !!this.payload.externalUrl;
    this.page = 'form';
  }

  async _onFormSubmit(e){
    e.preventDefault();
    if ( this.loading ) return;
    this.loading = true;
    const r = await this.api.put('', this.payload);
    if ( r.status === 'error' ){
      this.page = 'error';
      console.error(r.error);
      return;
    }
    this.api.clearCache();
    this.loading = false;
    this.payload = {};
    this.page = this.lastPage;
  }

  _onInput(prop, value){
    this.payload[prop] = value;
    if ( prop === 'useExternalUrl' ){
      if ( value ){
        this.payload.postId = null;
        this.payload.post = {};
      } else {
        this.payload.externalUrl = null;
      }
    }
    this.requestUpdate();
  }

  async _onSearchInput(e){
    this.searchValue = e.target.value;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.showSearchResults = !!this.searchValue;
      this.search(this.searchValue);
    }, 300);
  }

  async search(value){
    if ( !value ) {
      this.searchResults = [];
      return;
    }
    // todo: add departments to search when post type is created
    const params = {
      search: value,
      subtype: 'page'
    };
    const r = await this.wpApi.get('search', params);
    if ( r.status === 'error' ){
      this.page = 'error';
      console.error(r.error);
      return;
    }
    this.searchResults = r.data;
  }

  _onSearchResultClick(post){
    this.payload.postId = post.id;
    this.payload.post = {
      id: post.id,
      title: this.decodeHTMLEntities(post.title),
      link: post.url
    };
    this.searchValue = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  _onSearchBlur(){
    setTimeout(() => {
      this.showSearchResults = false;
    }, 300);
  }

}

customElements.define('ucdlib-intranet-favorite-manage', UcdlibIntranetFavoriteManage);
