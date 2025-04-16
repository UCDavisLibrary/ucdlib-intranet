import { html, css } from 'lit';
import forms from "@ucd-lib/theme-sass/1_base_html/_forms.css.js";

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
  `;

  return [
    forms,
    elementStyles
  ];
}

export function render() {
  if ( !this.iconsetEle ){
    return html``;
  }
  return html`
    <div class='container'>
      <div class='field-container'>
        <input
          type='text'
          placeholder='Search...'
          .value=${this.searchText}
          @input=${this._onSearch} />
      </div>
    </div>

`;}
