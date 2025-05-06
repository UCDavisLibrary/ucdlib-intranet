import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-search-bar.tpl.js";

export default class UcdlibIntranetSearchBar extends LitElement {

  static get properties() {
    return {
      value: {type: String},
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.value = '';
  }

  _onSearch(e){
    this.value = e.detail.searchTerm || '';
    const url = new URL(window.location);
    url.searchParams.set('s', this.value);
    window.location.href = url.toString();
  }

}

customElements.define('ucdlib-intranet-search-bar', UcdlibIntranetSearchBar);
