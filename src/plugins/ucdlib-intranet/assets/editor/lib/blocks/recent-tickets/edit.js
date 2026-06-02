import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { ToolbarColorPicker } from "@ucd-lib/brand-theme-editor/lib/block-components";
import { useBlockProps, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';


export default ( props ) => {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps();

  // set up color picker
  const onColorChange = (value) => {
    setAttributes( {brandColor: value ? value.slug : "" } );
  }

  return html`
  <div ...${ blockProps }>
    <${BlockControls} group="block">
      <${ToolbarColorPicker}
        onChange=${onColorChange}
        value=${attributes.brandColor}
        ucdBlock="recent-tickets"
      />
    </${BlockControls}>
    <${InspectorControls}>
      <${PanelBody} title="Settings">
        <${RangeControl}
          label="Number of Tickets to Show"
          value=${ attributes.limit }
          onChange=${ limit => setAttributes({limit}) }
          min=${1}
          max=${20}
        />
      </${PanelBody}>
    </${InspectorControls}>
    <div className='alert'>
      Based on your settings, a list of recent tickets will display here.
    </div>
  </div>
  `
};

