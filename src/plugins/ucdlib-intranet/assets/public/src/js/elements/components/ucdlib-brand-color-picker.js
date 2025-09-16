import { LitElement } from 'lit';
import { render, styles } from "./ucdlib-brand-color-picker.tpl.js";
import { categoryBrands } from "@ucd-lib/theme-sass/colors.js";

export default class UcdlibBrandColorPicker extends LitElement {

  static get properties() {
    return {
      excludeColors: {type: Array},
      value: {type: String},
      _colors: {state: true}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.excludeColors = [];
    this.value = '';
    this._colors = [];
  }

  willUpdate(props){
    if ( props.has('excludeColors') ) {
      this._colors = Object.values(categoryBrands).filter(color => {
        return !this.excludeColors.includes(color.id);
      });
    }
  }

  _onSelect(color){
    this.value = color.id;

    this.dispatchEvent(new CustomEvent('select', {
      detail: {color: color}
    }));

  }

}

customElements.define('ucdlib-brand-color-picker', UcdlibBrandColorPicker);
