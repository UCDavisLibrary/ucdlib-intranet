import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-icon-picker.tpl.js";

export default class UcdlibIconPicker extends LitElement {

  static get properties() {
    return {
      value: {type: String},
      searchText: {type: String},
      resultLimit: {type: Number},
      results: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.value = '';
    this.searchText = '';
    this.resultLimit = 15;
    this.results = [];
    this.iconset = 'ucd-public';
  }

  connectedCallback(){
    super.connectedCallback();
    this.iconsetEle = document.querySelector(`head ucdlib-iconset[name="${this.iconset}"]`);
    if (!this.iconsetEle) {
      console.warn(`Iconset ${this.iconset} not found`);
      return;
    }
  }

  _onSearch(e){
    this.searchText = e.target.value || '';
    if ( this.searchTimeout ) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.search();
    }, 300);
  }

  search(){
    const results = [];
    const searchText = this.searchText.toLowerCase();
    if (searchText) {
      Array.from(this.iconsetEle.querySelectorAll('g')).forEach(icon => {
        if (results.length >= this.resultLimit) {
          return;
        }
        const name = icon.id || '';
        if (name.indexOf(searchText) !== -1) {
          results.push(name);
        }
      });

    }
    this.results = results;
    console.log(this.results);
  }


}

customElements.define('ucdlib-icon-picker', UcdlibIconPicker);
