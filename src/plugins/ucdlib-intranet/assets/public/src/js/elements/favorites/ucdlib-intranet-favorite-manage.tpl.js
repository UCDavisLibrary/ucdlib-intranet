import { html, css } from 'lit';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js'

import normalize from "@ucd-lib/theme-sass/normalize.css.js";
import baseHtml from "@ucd-lib/theme-sass/1_base_html/_index.css.js";
import baseClass from "@ucd-lib/theme-sass/2_base_class/_index.css.js";
import tabs from "@ucd-lib/theme-sass/4_component/_nav-tabs.css.js";

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      background-color: #fff;
      color: #000;
      margin-right: 1rem;
      margin-top: 1rem;
      padding-top: 2rem;
      padding-bottom: 2rem;
      padding-left: 1rem;
      padding-right: 1rem;
      line-height: 1.618;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: "proxima-nova", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    [hidden] {
      display: none !important;
    }

    .heading-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media screen and (max-width: 450px) {
      .heading-container img {
        display: none;
      }
    }
    .tabs .tabs__item:focus:not(:hover) {
      color: #fff;
      background-color: rgb(19, 99, 158);
    }
    .favorite-list__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #B0D0ED;
    }
    .favorite-list__item:hover {
      background-color: #FFF9E6;
    }
    .favorite-list__item .label {
      font-weight: 700;
      color: #022851;
    }
    .favorite-list__item .url {
      font-size: .875rem;
      color: #4C4C4C;
      font-weight: 400;
      word-break: break-word;
    }
    .favorite-list__item__actions {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .tabs {
      margin-bottom: 1rem;
    }
    .icon-button {
      background-color: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #13639E;
      transition: color 0.3s ease, background-color 0.3s ease;
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
  `;

  return [
    normalize,
    baseHtml,
    baseClass,
    tabs,
    elementStyles
  ];
}

export function render() {
return html`
  <div>
    <div class='heading-container'>
      ${this.logoUrl ? html`<img src=${this.logoUrl} width='100px' />` : html``}
      <h1 class='heading--weighted-underline'><span class='heading--weighted--weighted'>Favorite Pages</span></h1>
    </div>
    <ul class="tabs tabs--secondary">
      ${_renderTab.call(this, 'your-favorites', 'Your Favorites')}
      ${_renderTab.call(this, 'default-favorites', 'Default Favorites')}
      ${_renderTab.call(this, 'popular-favorites', 'Popular Favorites')}
    </ul>
    <ucdlib-pages selected=${this.page}>
      ${_renderYourFavorites.call(this)}
      ${_renderDefaultFavorites.call(this)}
      ${_renderPopularFavorites.call(this)}
      <div id="error">
        <h2>Something went wrong</h2>
        <p>An unexpected error has occurred. Please try again later.</p>
      </div>
    </ucdlib-pages>
  </div>
`;}

function _renderYourFavorites() {
  return html`
    <div id="your-favorites">
      <div ?hidden=${this.yourFavorites?.length}>
        <p>You currently have no favorites. The default list will display on your homepage.</p>
      </div>
      <div ?hidden=${!this.yourFavorites?.length}>
        ${_renderFavoriteList.call(this, this.yourFavorites, false, true)}
      </div>

    </div>
  `;
}

function _renderDefaultFavorites() {
  return html`
    <div id="default-favorites">Default favorites</div>
  `;
}
function _renderPopularFavorites() {
  return html`
    <div id="popular-favorites">Popular favorites</div>
  `;
}

function _renderFavoriteList(favorites, addButton, canEdit) {
  return html`
    <div class='favorite-list'>
      ${favorites.map((favorite, i) => html`
        <div class='favorite-list__item'>
          <div class='favorite-list__item__content'>
            <div class='label'>${favorite.label || favorite.post?.title}</div>
            <div class='url'>${favorite.externalUrl || favorite.post?.link}</div>
          </div>
          <div class='favorite-list__item__actions'>
            <button
              class='icon-button'
              ?hidden=${!canEdit}
              @click=${() => this._onItemMove(favorite, 'up')}
              ?disabled=${i === 0}
              title='Move up'
              aria-label='Move up'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-circle-up'></ucdlib-icon>
            </button>
            <button
              class='icon-button'
              ?hidden=${!canEdit}
              @click=${() => this._onItemMove(favorite, 'down')}
              ?disabled=${i === favorites.length - 1}
              title='Move down'
              aria-label='Move down'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-circle-down'></ucdlib-icon>
            </button>
          </div>
        </div>
        `)}
    </div>
  `;
}

function _renderTab(page, text){
  return html`
    <li>
      <button
        class="tabs__item ${this.page === page ? 'tabs__item--active' : ''}"
        type="button"
        @click=${() => this._onTabClick(page)}
        >${text}</button>
    </li>
  `;
}
