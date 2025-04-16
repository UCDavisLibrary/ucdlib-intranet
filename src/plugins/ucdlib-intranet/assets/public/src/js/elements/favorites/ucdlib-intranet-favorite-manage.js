import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-favorite-manage.tpl.js";
import WpRest from '../../controllers/wp-rest.js';

/**
 * @description Element to manage favorite pages, including:
 *  - A user's favorite pages
 *  - Default favorite pages for the site
 *  - Showing the most frequently favorited pages
 * @property {String} logoUrl - The URL of the logo to display in the header
 * @property {Boolean} isAdmin - Whether the user is a site admin
 * @property {String} page - The current page being displayed
 * @property {String} lastPage - The last page displayed before a new page is loaded
 * @property {String} activeTab - The currently active navigation tab
 * @property {Array} yourFavorites - The user's favorite pages
 * @property {Array} defaultFavorites - The default favorite pages for the site
 * @property {Array} popularFavorites - The most frequently favorited pages
 * @property {Object} payload - The data to be sent to the server when creating, updating, or deleting a favorite
 * @property {Array} searchResults - The results of a post search (for adding a new favorite)
 * @property {String} searchValue - The current value of the post search input
 * @property {Boolean} showSearchResults - Whether to show the search results dropdown
 * @property {Boolean} loading - Whether the element is currently loading data. Shows a spinner overlay
 *
 */
export default class UcdlibIntranetFavoriteManage extends LitElement {

  static get properties() {
    return {
      logoUrl: {type: String, attribute: 'logo-url'},
      isAdmin: {type: Boolean, attribute: 'is-admin'},
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
    this.isAdmin = false;
    this.yourFavorites = [];
    this.defaultFavorites = [];
    this.popularFavorites = [];
    this.payload = {};
    this.searchResults = [];
    this.searchValue = '';
    this.showSearchResults = false;
    this.deleteConfirmed = false;

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

  /**
   * @description Called when the element is first connected to the DOM.
   */
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

  /**
   * @description Called when the element is going to be updated.
   * @param {Map} props - The properties that are going to be updated
   */
  willUpdate(props){
    if (props.has('page')) {
      this.lastPage = props.get('page') || this.page;
      if ( this.sections.find(section => section.id === this.page) ){
        this.activeTab = this.page;
      } else {
        this.activeTab = this.lastPage;
      }
      if ( this.page === 'error' ){
        this.loading = false;
      }
      this.loadPageData();
    }
  }

  /**
   * @description Called when a navigation tab is clicked.
   * @param {String} page - The page to navigate to
   * @returns
   */
  _onTabClick(page){
    if ( this.loading ) return;
    if ( this.page === page ) return;
    this.page = page;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('section', page);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
  }

  /**
   * @description Decodes HTML entities in a string.
   * @param {String} str - The string to decode
   * @returns {String}
   */
  decodeHTMLEntities(str) {
    this._decoder.innerHTML = str;
    return this._decoder.value;
  }

  /**
   * @description Loads the data required for the current page.
   * @returns
   */
  async loadPageData(){
    if ( !this.page || this.page === 'error' || this.page === 'form' ) return;
    this.loading = true;

    // all pages need the user's favorites
    const yourFavorites = await this.api.get();
    if ( yourFavorites.status === 'error' ){
      this.page = 'error';
      console.error(yourFavorites.error);
      return;
    }
    this.yourFavorites = yourFavorites.data?.favorites || [];

    if ( this.page === 'default-favorites' ){
      const defaultFavorites = await this.api.get('', {'default_favorites': true});
      if ( defaultFavorites.status === 'error' ){
        this.page = 'error';
        console.error(defaultFavorites.error);
        return;
      }
      this.defaultFavorites = defaultFavorites.data?.favorites || [];
    }

    if ( this.page === 'popular-favorites' ){
      const popularFavorites = await this.api.get('popular');
      if ( popularFavorites.status === 'error' ){
        this.page = 'error';
        console.error(popularFavorites.error);
        return;
      }
      this.popularFavorites = popularFavorites.data?.favorites || [];
    }

    this.loading = false;
  }

  /**
   * @description Moves a favorite item up or down one spot in the list.
   * @param {Object} item - The item to move
   * @param {String} direction - The direction to move the item ('up' or 'down')
   * @returns
   */
  async moveItem(item, direction='up'){
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

  /**
   * @description Callback for when the delete button is clicked for a favorite item.
   * Brings up a confirmation dialog.
   * @param {Object} item - The favorite to delete
   */
  _onDeleteRequest(item){
    this.payload = JSON.parse(JSON.stringify(item));
    this.page = 'delete-confirmation';
  }

  /**
   * @description Deletes the current favorite item. Called when the user confirms the deletion.
   * @returns
   */
  async delete(){
    this.loading = true;
    const r = await this.api.delete('', this.payload);
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

  /**
   * @description Callback for when the 'favorite' button is clicked on a list that is not the user's favorites.
   * This will add/remove the item to the user's favorites.
   * @param {Object} item - A favorite item
   * @returns
   */
  async _onTransferToggle(item){
    if ( this.loading ) return;
    const ownFavorite = this.favoriteIsInList(item);
    if ( ownFavorite ){
      this._onDeleteRequest(ownFavorite);
    } else {
      this.payload = JSON.parse(JSON.stringify(item));
      delete this.payload.favoriteId;
      delete this.payload.userId;
      delete this.payload.sortOrder;
      await this.submit();
      this.loadPageData();
    }
  }

  /**
   * @description Checks if a favorite item is in the user's favorites list.
   * @param {Object} item - A favorite item
   * @param {Array} list - The list to check against (defaults to user's favorites)
   * @returns {Object|null} - The favorite item if it exists in the list, otherwise null
   */
  favoriteIsInList(item, list){
    if ( !list ) list = this.yourFavorites;
    if ( !list ) return null;
    if ( item.favoriteId && list.find(fav => fav.favoriteId === item.favoriteId) ){
      return list.find(fav => fav.favoriteId === item.favoriteId);
    }
    if ( item.postId && list.find(fav => fav.postId == item.postId) ){
      return list.find(fav => fav.postId == item.postId);
    }
    if ( item.externalUrl && list.find(fav => fav.externalUrl == item.externalUrl) ){
      return list.find(fav => fav.externalUrl == item.externalUrl);
    }
    return null;
  }

  /**
   * @description Callback for when the 'edit' button is clicked on a favorite item.
   * Brings up the create/edit form.
   * @param {Object} item - The favorite item to edit. If empty, the form will be for creating a new favorite.
   */
  async _onEdit(item={}){
    this.payload = JSON.parse(JSON.stringify(item));
    this.payload.useExternalUrl = !!this.payload.externalUrl;
    this.page = 'form';
  }

  /**
   * @description Callback for when the create/edit form is submitted.
   * @param {*} e - The submit event
   * @returns
   */
  async _onFormSubmit(e){
    if ( e ) {
      e.preventDefault();
    }
    await this.submit();
    this.page = this.lastPage;
  }

  /**
   * @description Submits payload to the server to create or update a favorite.
   * @returns
   */
  async submit(){
    if ( this.loading ) return;
    this.loading = true;
    const r = this.payload.favoriteId ?
      await this.api.put('', this.payload) :
      await this.api.post('', this.payload);
    if ( r.status === 'error' ){
      this.page = 'error';
      console.error(r.error);
      return;
    }
    this.api.clearCache();
    this.loading = false;
    this.payload = {};
  }

  /**
   * @description Callback for input changes in the create/edit form.
   * @param {String} prop - The property that changed
   * @param {*} value - The new value of the property
   */
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

  /**
   * @description Callback for when the post search input changes on the create/edit form.
   * Debounces the search
   * @param {*} e
   */
  async _onSearchInput(e){
    this.searchValue = e.target.value;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.showSearchResults = !!this.searchValue;
      this.search(this.searchValue);
    }, 300);
  }

  /**
   * @description Searches for posts to add as favorites.
   * @param {String} value - Search term
   * @returns
   */
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

  /**
   * @description Callback for when a search result is clicked.
   * @param {Object} post - Search result post object
   */
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

  /**
   * @description Callback for when the search input loses focus.
   */
  _onSearchBlur(){
    setTimeout(() => {
      this.showSearchResults = false;
    }, 300);
  }

}

customElements.define('ucdlib-intranet-favorite-manage', UcdlibIntranetFavoriteManage);
