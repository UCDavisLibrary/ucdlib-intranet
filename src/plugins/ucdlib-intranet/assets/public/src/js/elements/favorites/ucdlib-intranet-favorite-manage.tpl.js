import { html, css } from 'lit';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js'
import '../components/ucdlib-brand-color-picker.js';
import '../components/ucdlib-icon-picker.js';

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
      .favorite-list__item {
        flex-direction: column;
        align-items: flex-start !important;
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
    .icon-button.small {
      --ucdlib-icon-width: 20px;
      --ucdlib-icon-height: 20px;
    }
    .loader-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #ffbf00;
    }
    .loader-overlay[hidden] {
      display: none;
    }
    .ele-container {
      position: relative;
    }
    .loader {
      --ucdlib-icon-width: 50px;
      --ucdlib-icon-height: 50px;
      animation: spin 2s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #form {
      padding: 0 1rem;
      max-width: 400px;
    }
    #form h2 {
      margin-bottom: 1rem;
    }
    .buttons {
      margin-top: 2rem;
    }
    .post-info {
      margin-bottom: 1rem;
    }
    .search-results {
      border: 1px solid #B0D0ED;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow-y: scroll;
      max-height: 200px;
    }

    .search-result {
      display: block;
      padding: 1rem;
      background-color: transparent;
      border: none;
      cursor: pointer;
      border-bottom: 1px solid #B0D0ED;
      width: 100%;
      text-align: left;
    }
    .search-result:hover {
      background-color: #FFF9E6;
    }
    .search-result .post-title {
      font-weight: 700;
      color: #022851;
    }
    .search-result .post-link {
      font-size: .875rem;
      color: #4C4C4C;
      font-weight: 400;
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

  <div class='ele-container'>
    <div class='loader-overlay' ?hidden=${!this.loading}>
      <ucdlib-icon icon='ucd-public:fa-spinner' class='loader'></ucdlib-icon>
    </div>
    <div class='heading-container'>
      ${this.logoUrl ? html`<img src=${this.logoUrl} width='100px' />` : html``}
      <h1 class='heading--weighted-underline'><span class='heading--weighted--weighted'>Favorite Pages</span></h1>
    </div>
    <ul class="tabs tabs--secondary">
      ${this.sections.map(section => html`
        <li>
          <button
            class="tabs__item ${this.activeTab === section.id ? 'tabs__item--active' : ''}"
            type="button"
            @click=${() => this._onTabClick(section.id)}
            >${section.label}</button>
        </li>
      `)}
    </ul>
    <ucdlib-pages selected=${this.page}>
      ${_renderYourFavorites.call(this)}
      ${_renderDefaultFavorites.call(this)}
      ${_renderPopularFavorites.call(this)}
      ${_renderDeleteConfirmation.call(this)}
      ${_renderForm.call(this)}
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
      <div class='buttons'>
        <button class='btn btn--primary' type='button' @click=${() => this._onEdit()}>Add Favorite</button>
      </div>
    </div>
  `;
}

function _renderDefaultFavorites() {
  return html`
    <div id="default-favorites">
      <div ?hidden=${this.defaultFavorites?.length}>
        <p>There are currently no default favorites. Please contact a site administrator</p>
      </div>
      <div ?hidden=${!this.defaultFavorites?.length}>
        <p>This list will display on your homepage if you don't have of your own favorites.
          <br>
          You can click the star icon to add a page to your own favorites list.</p>
        ${_renderFavoriteList.call(this, this.defaultFavorites, true, this.isAdmin)}
      </div>
      <div class='buttons' ?hidden=${!this.isAdmin}>
        <button class='btn btn--primary' type='button' @click=${() => this._onEdit({defaultFavorites: true})}>Add Favorite</button>
      </div>
    </div>
  `;
}
function _renderPopularFavorites() {
  return html`
    <div id="popular-favorites">
      <div ?hidden=${this.popularFavorites?.length}>
        <p>There are currently no popular favorites.</p>
      </div>
    <div ?hidden=${!this.popularFavorites?.length}>
      <p>The following are pages that are frequently favorited by your coworkers.
      <br>
      You can click the star icon to add a page to your own favorites list.</p>
      ${_renderFavoriteList.call(this, this.popularFavorites, true, false)}
    </div>
    </div>
  `;
}

function _renderDeleteConfirmation() {
  let title = this.payload?.label || this.payload?.post?.title || 'This favorite'
  let list = this.payload?.userId ? 'your' : 'the default';
  return html`
    <div id="delete-confirmation">
      <p>Are you sure you want to remove <strong>${title}</strong> from ${list} favorites list?</p>
      <div class='buttons'>
        <button class='btn btn--invert' type='button' @click=${() => this.page = this.lastPage}>Cancel</button>
        <button class='btn btn--primary' type='button' @click=${this.delete}>Delete</button>
      </div>
    </div>
    `;
}

function _renderForm() {
  let submitText = 'Add Favorite';
  let headerText = 'Add Favorite';
  if( this.payload?.favoriteId ){
    submitText = 'Save';
    headerText = 'Edit Favorite';
  }
  const disabled = this.loading || !(this.payload?.externalUrl || this.payload?.postId);

  return html`
  <div id="form">
    <form @submit=${this._onFormSubmit}>
      <h2 class='heading--highlight'>${headerText}</h2>
      <div>
        <div class='field-container'>
          <label for='f-label'>Custom Label</label>
          <input
            type='text'
            id='f-label'
            ?required=${this.payload.externalUrl}
            @input=${e => this._onInput('label', e.target.value)}
            .value=${this.payload?.label || ''} />
        </div>
        <div class='field-container'>
          <label for='f-sort'>Sort Order</label>
          <input
            type='number'
            id='f-sort'
            @input=${e => this._onInput('sortOrder', e.target.value)}
            .value=${this.payload?.sortOrder || ''} />
        </div>
        <div class='field-container checkbox'>
          <ul class="list--reset">
            <li>
              <input id='f-use-external' type='checkbox' @change=${() => this._onInput('useExternalUrl', !this.payload.useExternalUrl)} .checked=${this.payload?.useExternalUrl} />
              <label for='f-use-external'>Use External URL</label>
            </li>
          </ul>
        </div>
        <div class='field-container' ?hidden=${!this.payload.useExternalUrl}>
          <label for='f-url'>External URL</label>
          <input
            type='text'
            id='f-url'
            ?required=${this.payload.useExternalUrl}
            @input=${e => this._onInput('externalUrl', e.target.value)}
            .value=${this.payload?.externalUrl || ''} />
        </div>
      </div>
      <div class='field-container' ?hidden=${this.payload.useExternalUrl}>
        <label>Intranet Post</label>
        <div ?hidden=${!this.payload.postId} class='post-info'>
          <div><strong>Post ID: </strong>${this.payload.postId}</div>
          <div><strong>Post Title: </strong>${this.payload.post?.title}</div>
          <div><strong>Post Link: </strong>${this.payload.post?.link}</div>
        </div>
        <input
          type='text'
          placeholder='Search for a post'
          @input=${this._onSearchInput}
          @focus=${() => this.showSearchResults = true}
          @blur=${this._onSearchBlur}
          .value=${this.searchValue} />
        <div class='search-results' ?hidden=${!this.showSearchResults}>
          ${this.searchResults.map(result => html`
            <button
              class='search-result'
              @click=${() => this._onSearchResultClick(result)}
              type='button'>
              <div class='post-title'>${this.decodeHTMLEntities(result.title)}</div>
              <div class='post-link'>${result.url}</div>
            </button>
            `)}
        </div>
      </div>
      <div class='field-container'>
        <label>Custom Icon</label>
        <ucdlib-icon-picker
          .value=${this.payload.icon?.split?.(':')?.[1] || ''}
          @icon-selected=${e => this._onInput('icon', e.detail)}>
        </ucdlib-icon-picker>
      </div>
      <div class='field-container'>
        <label>Custom Icon Color</label>
        <ucdlib-brand-color-picker
          .value=${this.payload.brandColor || ''}
          @select=${e => this._onInput('brandColor', e.detail.color.id)}>
        </ucdlib-brand-color-picker>
      </div>
      <div class='buttons'>
        <button class='btn btn--invert' type='button' @click=${() => this.page = this.lastPage}>Cancel</button>
        <button ?disabled=${disabled} class='btn btn--primary' type='submit'>${submitText}</button>
      </div>
    </form>
  </div>
  `;
}

function _renderFavoriteList(favorites, addButton, canEdit) {
  return html`
    <div class='favorite-list'>
      ${favorites.map((favorite, i) => {
        let inOwnFavorites = addButton ? this.favoriteIsInList(favorite) : false;
        inOwnFavorites = inOwnFavorites ? true : false;
        return html`
        <div class='favorite-list__item'>
          <div class='favorite-list__item__content'>
            <div class='label'>${favorite.label || favorite.post?.title}</div>
            <div class='url'>${favorite.externalUrl || favorite.post?.link}</div>
          </div>
          <div class='favorite-list__item__actions'>
            <button
              class='icon-button'
              ?hidden=${!canEdit}
              @click=${() => this.moveItem(favorite, 'up')}
              ?disabled=${i === 0}
              title='Move up'
              aria-label='Move up'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-circle-up'></ucdlib-icon>
            </button>
            <button
              class='icon-button'
              ?hidden=${!canEdit}
              @click=${() => this.moveItem(favorite, 'down')}
              ?disabled=${i === favorites.length - 1}
              title='Move down'
              aria-label='Move down'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-circle-down'></ucdlib-icon>
            </button>
            <button
              class='icon-button small'
              ?hidden=${!canEdit}
              @click=${() => this._onDeleteRequest(favorite)}
              title='Delete'
              aria-label='Delete'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-trash'></ucdlib-icon>
            </button>
            <button
              class='icon-button small'
              ?hidden=${!canEdit}
              @click=${() => this._onEdit(favorite)}
              title='Edit'
              aria-label='Edit'
              type='button'>
              <ucdlib-icon icon='ucd-public:fa-pen'></ucdlib-icon>
            </button>
            <button
              ?hidden=${!addButton}
              class='icon-button'
              @click=${() => this._onTransferToggle(favorite)}
              title=${inOwnFavorites ? 'Remove from your favorites' : 'Add to your favorites'}
              aria-pressed='${inOwnFavorites}'
              aria-label=${inOwnFavorites ? 'Remove from your favorites' : 'Add to your favorites'}
              type='button'>
              <ucdlib-icon icon='ucd-public:${inOwnFavorites ? 'fa-star' : 'star-outline' }'></ucdlib-icon>
            </button>
          </div>
        </div>
        `})}
    </div>
  `;
}
