import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-search-pagination.tpl.js";

export default class UcdlibIntranetSearchPagination extends LitElement {

  static get properties() {
    return {
      maxPages: {type: Number, attribute: 'max-pages'},
      currentPage: {type: Number, attribute: 'current-page'}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.maxPages = 0;
    this.currentPage = 1;
  }

  _onPaginationClick(e) {
    const page = e.detail.page;
    if ( page === this.currentPage ) return;
    this.currentPage = page;

    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  }

}

customElements.define('ucdlib-intranet-search-pagination', UcdlibIntranetSearchPagination);
