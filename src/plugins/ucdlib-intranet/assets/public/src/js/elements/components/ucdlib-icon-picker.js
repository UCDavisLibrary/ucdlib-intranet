import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-icon-picker.tpl.js";

/**
 * @description Searcheable icon picker component.
 * Assumes that the ucdlib-iconset is already loaded in the page.
 * @property {string} value - The selected icon name
 * @property {string} searchText - The text to search for
 * @property {number} resultLimit - The maximum number of results to show
 * @property {array} results - The array of results
 * @property {boolean} showResults - Whether to show the results or not
 *
 */
export default class UcdlibIconPicker extends LitElement {

  static get properties() {
    return {
      value: {type: String},
      searchText: {type: String},
      resultLimit: {type: Number},
      results: {type: Array},
      showResults: {type: Boolean}
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
    this.resultLimit = 12;
    this.results = [];
    this.iconset = 'ucd-public';
    this.showResults = false;
  }

  /**
   * @description Callback for when the element is added to the DOM.
   * @returns
   */
  connectedCallback(){
    super.connectedCallback();
    this.iconsetEle = document.querySelector(`head ucdlib-iconset[name="${this.iconset}"]`);
    if (!this.iconsetEle) {
      console.warn(`Iconset ${this.iconset} not found`);
      return;
    }
  }

  /**
   * @description Callback for input events on the search box.
   * @param {*} e - The event object
   */
  _onSearch(e){
    this.searchText = e.target.value || '';
    if ( this.searchTimeout ) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.showResults = !!this.searchText;
      this.search();
    }, 300);
  }

  /**
   * @description Searches the iconset for icons that match the search text.
   */
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
  }

  /**
   * @description Callback for when the search input loses focus.
   */
  _onSearchBlur(){
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  /**
   * @description Callback for when the clear button is clicked.
   */
  _onClearClick(){
    this.value = '';
    this._dispatchIconSelectedEvent();
  }

  /**
   * @description Callback for when an icon is clicked in the search results.
   * @param {String} icon - The icon name
   */
  _onResultClick(icon){
    this.value = icon;
    this._dispatchIconSelectedEvent();
    this.showResults = false;
    this.searchText = '';
    this.results = [];
  }

  /**
   * @description Dispatches the icon-selected event.
   */
  _dispatchIconSelectedEvent(){
    this.dispatchEvent(new CustomEvent('icon-selected', {
      detail: {
        icon: this.value,
        iconset: this.iconset
      },
      bubbles: true,
      composed: true
    }));
  }

}

customElements.define('ucdlib-icon-picker', UcdlibIconPicker);
