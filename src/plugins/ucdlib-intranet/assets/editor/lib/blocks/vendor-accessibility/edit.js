import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';

export default ( props ) => {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps();

  return html`
  <div ...${ blockProps }>
    <div className='alert'>
      Searchable accessibility information for vendors will display here.
    </div>
    <${InspectorControls}>
      <${PanelBody} title="Vendor Accessibility Settings">
        <${TextControl}
          label="Content Provider Column Name"
          value=${ attributes.contentProviderColumn }
          onChange=${ contentProviderColumn => setAttributes({contentProviderColumn}) }
        />
        <${TextControl}
          label="Interface Name Column Name"
          value=${ attributes.interfaceNameColumn }
          onChange=${ interfaceNameColumn => setAttributes({interfaceNameColumn}) }
        />
        <${TextControl}
          label="Collection Public Name Column Name"
          value=${ attributes.collectionPublicNameColumn }
          onChange=${ collectionPublicNameColumn => setAttributes({collectionPublicNameColumn}) }
        />
        <${TextareaControl}
          label="Display Fields"
          help="Column names to display in the results. One per line. Must match column names in the data source."
          value=${ attributes.displayFields }
          onChange=${ displayFields => setAttributes({displayFields}) }
        />
      </${PanelBody}>
    </${InspectorControls}>
  </div>
  `
}