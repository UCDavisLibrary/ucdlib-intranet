import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-intranet-favorite-toggle.tpl.js";

export default class UcdlibIntranetFavoriteToggle extends LitElement {

  static get properties() {
    return {

    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

  _onClick(){
    console.log('clicked');
  }

}

customElements.define('ucdlib-intranet-favorite-toggle', UcdlibIntranetFavoriteToggle);
