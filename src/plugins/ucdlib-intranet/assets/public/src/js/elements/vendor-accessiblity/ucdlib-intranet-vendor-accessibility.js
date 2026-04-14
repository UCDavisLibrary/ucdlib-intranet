import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-vendor-accessibility.tpl.js";
import WpRest from '../../controllers/wp-rest.js';
import ElementStatus from '../../controllers/element-status.js';
import { MutationObserverController } from "@ucd-lib/theme-elements/utils/controllers/index.js";

export default class UcdlibIntranetVendorAccessibility extends LitElement {

  static get properties() {
    return {
      data: { type: Array},
      contentProviderColumn: { type: String},
      interfaceNameColumn: { type: String},
      collectionPublicNameColumn: { type: String},
      contentProviderOptions: { type: Array},
      interfaceNameOptions: { type: Array},
      collectionPublicNameOptions: { type: Array},
      allCollectionPublicNameOptions: { type: Array},
      contentProviderSelectedOptions: { type: Array},
      interfaceNameSelectedOptions: { type: Array},
      collectionPublicNameSelectedOptions: { type: Array},
      displayFields: { type: Array }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.restNamespace = 'ucdlib-intranet/vendor-accessibility';
    this.api = new WpRest(this);

    this.status = new ElementStatus(this);
    this.data = [];

    this.contentProviderColumn = 'Content Provider (Interface Vendor)';
    this.interfaceNameColumn = 'Electronic Collection Interface Name';
    this.collectionPublicNameColumn = 'Electronic Collection Public Name';

    this.contentProviderOptions = [];
    this.interfaceNameOptions = [];
    this.collectionPublicNameOptions = [];

    this.contentProviderSelectedOptions = [];
    this.interfaceNameSelectedOptions = [];
    this.collectionPublicNameSelectedOptions = [];

    this.displayFields = [];

    new MutationObserverController(this, {childList: true, subtree: false}, '_onScriptLoaded');
  }

  connectedCallback() {
    super.connectedCallback();
    this.get();
  }

  async get(){
    this.status.loading = true;
    const params = new URLSearchParams(location.search);
    const qs = {};
    if ( params.has('refresh') ){
      qs.refresh = true;
    }
    const r = await this.api.get('data', qs);
    if ( r.status === 'error' || !r.data?.success ){
      this.status.error = true;
      console.error(r.error);
      return;
    }
    this.status.loaded = true;
    this.data = r.data.data.map( item => {
      const vendor = [item[this.contentProviderColumn], item[this.interfaceNameColumn]].filter( item => item ).join(' - ');
      return {
        data: item,
        vendor,
        selected: false,
        levelOneMatch: false
      }
    });
    this.contentProviderOptions = [...new Set(this.data.map( item => item.data[this.contentProviderColumn] ).filter( item => item ))].sort();
    this.interfaceNameOptions = [...new Set(this.data.map( item => item.data[this.interfaceNameColumn] ).filter( item => item ))].sort();
    this.allCollectionPublicNameOptions = [...new Set(this.data.map( item => item.data[this.collectionPublicNameColumn] ).filter( item => item ))].sort();
    this.setCollectionNameOptions();
  }

  setCollectionNameOptions(){
    if ( !this.contentProviderSelectedOptions.length && !this.interfaceNameSelectedOptions.length ){
      this.collectionPublicNameOptions = this.allCollectionPublicNameOptions;
      return;
    }
    this.collectionPublicNameOptions = [...new Set(this.data.filter(item => item.levelOneMatch).map( item => item.data[this.collectionPublicNameColumn] ).filter( item => item ))].sort();
  }

  _onFilterChange(filterType, selectedOptions){
    const options = selectedOptions.map( option => option.value );

    if ( filterType === 'contentProvider' ){
      this.contentProviderSelectedOptions = options;
    } else if ( filterType === 'interfaceName' ){
      this.interfaceNameSelectedOptions = options;
    } else if ( filterType === 'collectionPublicName' ){
      this.collectionPublicNameSelectedOptions = options;
    }

    // mark items as selected
    this.data.forEach( item => {
      item.selected = false;
      item.levelOneMatch = false;
      if ( this.contentProviderSelectedOptions.length && !this.contentProviderSelectedOptions.includes(item.data[this.contentProviderColumn]) ){
        return;
      }
      if ( this.interfaceNameSelectedOptions.length && !this.interfaceNameSelectedOptions.includes(item.data[this.interfaceNameColumn]) ){
        return;
      }
      item.levelOneMatch = true;
      if ( this.collectionPublicNameSelectedOptions.length && !this.collectionPublicNameSelectedOptions.includes(item.data[this.collectionPublicNameColumn]) ){
        return;
      }
      item.selected = true;
    });

    this.setCollectionNameOptions();

    // remove any selected collection names that are no longer valid based on level one filters
    if ( this.contentProviderSelectedOptions.length || this.interfaceNameSelectedOptions.length ){
      const validCollectionOptions = this.data.filter(item => item.data.levelOneMatch).map( item => item.data[this.collectionPublicNameColumn] ).filter( item => item );
      this.collectionPublicNameSelectedOptions = this.collectionPublicNameSelectedOptions.filter( option => validCollectionOptions.includes(option) );
    }

    this.requestUpdate();
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

customElements.define('ucdlib-intranet-vendor-accessibility', UcdlibIntranetVendorAccessibility);