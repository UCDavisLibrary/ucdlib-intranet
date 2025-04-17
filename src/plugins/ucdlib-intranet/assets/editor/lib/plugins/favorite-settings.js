import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { Fragment, createRef } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import {
  Button,
  ColorPalette,
  BaseControl
 } from '@wordpress/components';
import { html, SelectUtils } from "@ucd-lib/brand-theme-editor/lib/utils";
import { IconPicker } from "@ucd-lib/brand-theme-editor/lib/block-components";
import { categoryBrands } from "@ucd-lib/theme-sass/colors";

const name = 'ucdlib-intranet-favorite-settings';

const Edit = () => {

  // todo: add department post type
  if ( !['page'].includes(SelectUtils.editedPostAttribute('type')) ){
    return html`<${Fragment} />`;
  }

  // post metadata
  const meta = SelectUtils.editedPostAttribute('meta');
  const defaultIcon = meta.favoriteDefaultIcon || '';
  const defaultIconColor = meta.favoriteDefaultIconColor || '';
  const watchedVars = [
    defaultIconColor,
    defaultIcon
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

  return html`
    <${PluginDocumentSettingPanel}
      className=${name}
      icon=${html`<ucdlib-icon style=${{marginLeft: '8px', width: '15px', minWidth: '15px'}} icon="ucd-public:fa-star"></ucdlib-icon>`}
      title='Favorites List Settings'>
      <style>
        .${name} {
          --ucdlib-icon-height: 50px;
          --ucdlib-icon-width: 50px;
        }
      </style>
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
