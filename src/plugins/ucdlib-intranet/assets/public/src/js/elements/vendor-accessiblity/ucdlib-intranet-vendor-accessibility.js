import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-vendor-accessibility.tpl.js";
import WpRest from '../../controllers/wp-rest.js';
import ElementStatus from '../../controllers/element-status.js';
import { MutationObserverController } from "@ucd-lib/theme-elements/utils/controllers/index.js";

/**
 * @description Displays accessibility information for vendors from wordpress REST endpoint. Allows filtering by content provider, interface name, and collection name.
 * @property {Array} data - The data to display from the REST endpoint
 * @property {String} contentProviderColumn - The column name in the data that corresponds to the content provider (interface vendor)
 * @property {String} interfaceNameColumn - The column name in the data that corresponds to the interface name
 * @property {String} collectionPublicNameColumn - The column name in the data that corresponds to the collection public name
 * @property {Array} contentProviderOptions - The unique options to display in the content provider select filter
 * @property {Array} interfaceNameOptions - The unique options to display in the interface name select filter
 * @property {Array} collectionPublicNameOptions - The unique options to display in the collection public name select filter, based on level one filters
 * @property {Array} allCollectionPublicNameOptions - The unique options to display in the collection public name select filter without filtering based on level one filters. Used to reset collection public name options when level one filters are cleared.
 * @property {Array} contentProviderSelectedOptions - The currently selected options in the content provider filter
 * @property {Array} interfaceNameSelectedOptions - The currently selected options in the interface name filter
 * @property {Array} collectionPublicNameSelectedOptions - The currently selected options in the collection public name filter
 * @property {Array} displayFields - The fields to display in the results aside from the collection public name and vendor. Set in the block editor. Must match column names in the data source.
 */
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
      item = Object.fromEntries(Object.entries(item).map(([key, value]) => [key.trim(), value]));
      const vendor = [item[this.contentProviderColumn], item[this.interfaceNameColumn]].filter( item => item ).join(' - ');
      return {
        data: item,
        vendor,
        selected: false,
        levelOneMatch: false
      }
    });
    const displayFieldsDontExist = this.displayFields.filter( field => this.data.length && !Object.keys(this.data[0].data).includes(field) );
    if ( displayFieldsDontExist.length ){
      console.warn('The following display fields do not exist in the data source and will not be displayed:', displayFieldsDontExist);
    }
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