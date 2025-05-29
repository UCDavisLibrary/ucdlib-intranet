import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-search-filters.tpl.js";
import { MutationObserverController } from "@ucd-lib/theme-elements/utils/controllers/index.js";

export default class UcdlibIntranetSearchFilters extends LitElement {

  static get properties() {
    return {
      filters: {type: Array},
      selectedFilters: {type: Array},
      selectedSortOption: {type: String},
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.filters = [];
    this.selectedFilters = [];
    this.selectedSortOption = 'relevance';

    new MutationObserverController(this, {childList: true, subtree: false}, '_onScriptLoaded');

    this.render = render.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setSelectedFiltersFromUrl();
    this.setSelectedSortOptionFromUrl();
  }

  setSelectedFiltersFromUrl() {
    const url = new URL(window.location);
    const params = url.searchParams;
    if ( !params.has('type') ){
      this.selectedFilters = [];
      return;
    }
    this.selectedFilters = params.get('type').split(',').map( item => item.trim() );
  }

  setSelectedSortOptionFromUrl() {
    const url = new URL(window.location);
    const params = url.searchParams;
    const sortOptions = ['relevance', 'date'];
    if ( !params.has('sort') || !sortOptions.includes(params.get('sort')) ){
      this.selectedSortOption = 'relevance';
      return;
    }
    this.selectedSortOption = params.get('sort');
  }

  toggleFilter(filter) {
    const url = new URL(window.location);
    const params = url.searchParams;
    if ( this.selectedFilters.includes(filter) ) {
      this.selectedFilters = this.selectedFilters.filter( item => item !== filter );
    } else {
      this.selectedFilters.push(filter);
    }
    if ( this.selectedFilters.length === 0 ) {
      params.delete('type');
    } else {
      params.set('type', this.selectedFilters.join(','));
    }
    url.search = params.toString();
    window.location.href = url.toString();
  }

  setSortOption(option) {
    const url = new URL(window.location);
    const params = url.searchParams;
    if ( this.selectedSortOption === option ) {
      return;
    }
    this.selectedSortOption = option;
    params.set('sort', option);
    url.search = params.toString();
    window.location.href = url.toString();
  }

  _onFilterKeyUp(e, filter){
    if ( e.key === 'Enter' ) {
      this.toggleFilter(filter);
    }
  }


  /**
   * @method _onScriptLoaded
   * @description Callback for mutation observer controller. Loads properties from json script tag.
   */
  _onScriptLoaded() {
    if ( this.SsrPropertiesLoaded ) return;
    const scriptEle = this.querySelector('script[type="application/json"]');
    if ( scriptEle ) {
      try {
        const props = JSON.parse(scriptEle.innerHTML);
        for( let key in props ) {
          this[key] = props[key];
        }
        this.SsrPropertiesLoaded = true;
      } catch(e) {
        console.error('Failed to parse SSR properties', e);
      }
    }
  }

}

customElements.define('ucdlib-intranet-search-filters', UcdlibIntranetSearchFilters);
