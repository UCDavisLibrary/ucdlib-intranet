import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { Fragment, createRef } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import {
  Button,
  ColorPalette,
  BaseControl,
  ToggleControl
 } from '@wordpress/components';
import { html, SelectUtils } from "@ucd-lib/brand-theme-editor/lib/utils";
import { IconPicker } from "@ucd-lib/brand-theme-editor/lib/block-components";
import { categoryBrands } from "@ucd-lib/theme-sass/colors";

const name = 'ucdlib-intranet-page-settings';

const Edit = () => {

  // post metadata
  const meta = SelectUtils.editedPostAttribute('meta');
  const defaultIcon = meta.favoriteDefaultIcon || '';
  const defaultIconColor = meta.favoriteDefaultIconColor || '';
  const hideModifiedDate = meta.hideModifiedDate || false;
  const watchedVars = [
    defaultIconColor,
    defaultIcon,
    hideModifiedDate
  ]
  const { editPost } = useDispatch( 'core/editor', watchedVars );

  // set up icon picker
  const iconPickerRef = createRef();
  const onIconChangeRequest = () => {

    if ( iconPickerRef.current ){
      iconPickerRef.current.openModal();
    }
  }
  const setIcon = ( icon ) => {
    icon = `${icon.iconSet}:${icon.icon}`;
    editPost({meta: {favoriteDefaultIcon: icon}});
  }
  const onIconRemove = () => {
    editPost({meta: {favoriteDefaultIcon: ''}});
  }

  // set up color picker
  const colors =  Object.values(categoryBrands).map(c => Object({name: c.title, slug: c.id, color: c.hex}));
  const getColorObject = (val, key) => {
    for (const color of colors) {
      if ( color[key] === val ) return color;
    }
    return undefined;
  }
  const getSelectedColor = () => {
    const c = getColorObject(defaultIconColor, 'slug');
    if ( !c ) return undefined;
    return c.color;
  }
  const onColorChange = (v) => {
    let c;
    if ( !v ) {
      c = ""
    } else {
      c = getColorObject(v,'color').slug;
    }
    editPost({meta: {favoriteDefaultIconColor: c}});
  }

  if ( !['page', 'ucdlib-group'].includes(SelectUtils.editedPostAttribute('type')) ){
    return html`<${Fragment} />`;
  }

  return html`
    <${PluginDocumentSettingPanel}
      className=${name}
      icon=${html`<ucdlib-icon style=${{marginLeft: '8px', width: '15px', minWidth: '15px'}} icon="ucd-public:logo-uc-davis-library"></ucdlib-icon>`}
      title='Intranet Page Settings'>
      <style>
        .${name} {
          --ucdlib-icon-height: 50px;
          --ucdlib-icon-width: 50px;
        }
      </style>
      <${ToggleControl}
        label="Hide Modified Date"
        help="Hides the modified date from the bottom of the page."
        checked=${hideModifiedDate}
        onChange=${() => {
          editPost({meta: {hideModifiedDate: !hideModifiedDate}});
        }}
      />
      <div style=${{marginTop:'30px'}}><h4>Favorite Settings</h4></div>
      <div style=${{marginBottom:'20px'}}>
        <small>Controls how this page will be displayed in a user's favorites list. Can be overriden by user.</small>
      </div>
      <div style=${{marginBottom:'20px'}}>
        <${BaseControl} label="Default Icon"></${BaseControl}>
          ${defaultIcon ? html`
            <div>
              <ucdlib-icon icon=${defaultIcon}></ucdlib-icon>
              <${Button} style=${{marginTop:'10px'}} onClick=${onIconRemove} variant='link' isDestructive=${true}>Remove</${Button}>
            </div>
          ` : ''}
          <${Button} style=${{marginTop:'10px'}} onClick=${onIconChangeRequest} variant='link' >${defaultIcon ? 'Change' : 'Set'} Default Icon</${Button}>
          <${IconPicker}
            ref=${iconPickerRef}
            onChange=${v => setIcon(v)}
            selectedIcon=${defaultIcon}
          ></${IconPicker}>
      </div>
      <${BaseControl}
        id="icon-brand-color"
        label="Default Icon Brand Color"
        >
        <${ColorPalette}
          id="icon-brand-color"
          colors=${colors}
          value=${ getSelectedColor() }
          disableCustomColors
          clearable
          onChange=${onColorChange}
        />
      </${BaseControl}>
    </${PluginDocumentSettingPanel}>
  `;
}

const settings = {render: Edit};
export default { name, settings };
