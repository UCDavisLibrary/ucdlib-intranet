import { html, css } from 'lit';
import forms from "@ucd-lib/theme-sass/1_base_html/_forms.css.js";

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    .icon-button {
      background-color: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #13639E;
      transition: color 0.3s ease, background-color 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .icon-button:hover {
      color: #FFBF00;
    }
    .icon-button[disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .icon-button[disabled]:hover {
      color: #13639E;
      background-color: transparent;
    }
    input {
      box-sizing: border-box;
    }
    .search-results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      column-gap: .5rem;
      row-gap: 1rem;
      margin-top: 1rem;
    }
    .selected-container {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }
    .selected-container ucdlib-icon {
      color: #022851;
    }
    .selected-container button {
      background-color: transparent;
      border: none;
      color: #c10230;
      text-decoration: underline;
      cursor: pointer;
      font-size: .875rem;
      padding: 0;
    }
    .maybe-selected-container {
      margin-bottom: 1rem;
    }
    .selected-icon-container-label {
      margin-bottom: 0.5rem;
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
      <div class='maybe-selected-container'>
        <div ?hidden=${this.value}>
          <div>No icon selected.</div>
        </div>
        <div ?hidden=${!this.value}>
          <div class='selected-icon-container-label'>Selected icon:</div>
          <div class='selected-container'>
            <ucdlib-icon icon='${this.iconset}:${this.value}'></ucdlib-icon>
            <div class='icon-label'>${this.value}</div>
            <button @click=${this._onClearClick}>Clear</button>
          </div>
        </div>
      </div>
      <div class='field-container'>
        <input
          type='text'
          placeholder='Search...'
          .value=${this.searchText}
          @blur=${this._onSearchBlur}
          @input=${this._onSearch} />
      </div>
      <div class='search-results' ?hidden=${!this.showResults}>
        ${this.results.map(icon => html`
          <button
            class='icon-button'
            @click=${() => this._onResultClick(icon)}>
            <ucdlib-icon icon='${this.iconset}:${icon}'></ucdlib-icon>
            <div class='icon-label'>${icon}</div>
          </button>
        `)}
      </div>
    </div>
`;}
