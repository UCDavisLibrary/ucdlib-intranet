import { html, css } from 'lit';
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <ucd-theme-pagination
    current-page="${this.currentPage}"
    max-pages="${this.maxPages}"
    @page-change="${this._onPaginationClick}"
    xs-screen
    ellipses
  ></ucd-theme-pagination>
`;}
