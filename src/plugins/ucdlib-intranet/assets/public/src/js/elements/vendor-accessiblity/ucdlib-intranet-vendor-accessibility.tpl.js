import { html, css } from 'lit';
import ElementStatus from '../../controllers/element-status.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js';

import formStyles from '@ucd-lib/theme-sass/1_base_html/_forms.css.js';
import alertStyles from '@ucd-lib/theme-sass/4_component/_messaging-alert.css.js';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      container-type: inline-size;
    }
    .level-one-filters {
      display: flex;
      gap: 1rem;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    .level-one-filters .field-container {
      flex: 1;
    }
    .filters {
      border-bottom: 4px dotted var(--ucd-gold);
      padding-bottom: 1.5rem;
    }
    .result {
      padding: 1rem;
    }
    .result:nth-child(even) {
      background-color: var(--ucd-blue-30);
    }
    .result .collection-name {
      font-weight: 700;
      color: var(--ucd-blue);
    }
    .vendor {
      font-size: .875rem;
      font-weight: 700;
      color: var(--ucd-blue);
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: .5rem;
      margin-top: .5rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      font-size: .875rem;
    }
    .field-name {
      font-weight: 700;
      color: var(--ucd-black-70);
    }
    .field-value {
      word-break: break-word;
    }
    .no-filters-selected {
      margin-top: 1.5rem;
    }
    @container (min-width: 500px) {
      .level-one-filters {
        flex-direction: row;
      }
     }
  `;

  return [
    formStyles,
    alertStyles,
    ElementStatus.styles,
    elementStyles
  ];
}

export function render() { 
  const hasFilters = this.contentProviderSelectedOptions.length || this.interfaceNameSelectedOptions.length || this.collectionPublicNameSelectedOptions.length;
  return html`
    ${ this.status.render() }
    <div ?hidden=${!this.status.loaded}>
      <div class="filters">
        <div class='level-one-filters'>
          <div class='field-container'>
            <label>Content Provider</label>
            <ucd-theme-slim-select @change=${ e => this._onFilterChange('contentProvider', e.detail) }>
              <select multiple>
                ${ this.contentProviderOptions.map( option => html`
                  <option value=${option} ?selected=${this.contentProviderSelectedOptions.includes(option)}>${option}</option>
                `) }
              </select>
            </ucd-theme-slim-select>
          </div>
          <div class='field-container'>
            <label>Interface Name</label>
            <ucd-theme-slim-select @change=${ e => this._onFilterChange('interfaceName', e.detail) }>
              <select multiple>
                ${ this.interfaceNameOptions.map( option => html`
                  <option value=${option} ?selected=${this.interfaceNameSelectedOptions.includes(option)}>${option}</option>
                `) }
              </select>
            </ucd-theme-slim-select>
          </div>
        </div>
        <div class='field-container'>
          <label>Collection Public Name</label>
          <ucd-theme-slim-select @change=${ e => this._onFilterChange('collectionPublicName', e.detail) }>
            <select multiple>
              ${ this.collectionPublicNameOptions.map( option => html`
                <option value=${option} ?selected=${this.collectionPublicNameSelectedOptions.includes(option)}>${option}</option>
              `) }
            </select>
          </ucd-theme-slim-select>
        </div>
      </div>
      ${ hasFilters ? html`
        <div class='results'>
          ${ this.data.filter( item => item.selected ).map( item => html`
            <div class='result'>
              <div>
                <div class='collection-name'>${item.data[this.collectionPublicNameColumn]}</div>
                <div class='vendor'>${item.vendor}</div>
                <div class='fields' ?hidden=${!this.displayFields.length}>
                  ${this.displayFields.map(field => html`
                    <div class='field'>
                      <div class='field-name'>${field}</div>
                      <div class='field-value'>${item.data[field] || '--'}</div>
                    </div>
                  `)}
                </div>
              </div>
            </div>
            `) }
        </div>
        ` : html`
          <div class='no-filters-selected alert'>
            <p>Use the filters above to find accessibility information for specific vendors or collections.</p>
          </div>
        `}

    </div>
  `;
}