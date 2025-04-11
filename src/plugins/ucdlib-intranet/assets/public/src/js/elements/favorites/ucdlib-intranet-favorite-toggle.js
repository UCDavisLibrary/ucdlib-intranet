import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-favorite-toggle.tpl.js";
import WpRest from '../../controllers/wp-rest.js';

export default class UcdlibIntranetFavoriteToggle extends LitElement {

  static get properties() {
    return {
      postId: { type: Number, attribute: 'post-id' },
      isFavorite: { state: true },
      loading: { state: true },
      error: { state: true },
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.restNamespace = 'ucdlib-intranet/favorites';

    this.api = new WpRest(this);
    this.postId = 0;
    this.loading = false;
    this.error = false;
    this.isFavorite = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.get();
  }

  async get(){
    this.loading = true;
    const r = await this.api.get('', {post_id: this.postId});
    if ( r.status === 'error' ){
      this.error = true;
      console.error(r.error);
      return;
    }
    this.isFavorite = r.data.favorites.length > 0;
    this.loading = false;
    this.error = false;
  }

  async toggle(){
    if ( this.loading || this.error ) return;
    this.loading = true;
    if ( this.isFavorite ) {

    } else {
      const r = await this.api.post('', {postId: this.postId});
      if ( r.status === 'error' ){
        this.error = true;
        console.error(r.error);
        return;
      }
    }
    this.api.clearCache();
    await this.get();
    this.loading = false;
  }

  _onClick(){
    this.toggle();
  }

}

customElements.define('ucdlib-intranet-favorite-toggle', UcdlibIntranetFavoriteToggle);
