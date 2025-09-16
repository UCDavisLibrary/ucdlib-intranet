import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { ToolbarColorPicker } from "@ucd-lib/brand-theme-editor/lib/block-components";

export default ( props ) => {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps();

  const typeOptions = [
    { label: 'All', value: '' },
    { label: 'Committee', value: 'committee' },
    { label: 'Department', value: 'department' }
  ];
  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  return html`
  <div ...${ blockProps }>
    <${BlockControls} group="block">
      <${ToolbarColorPicker}
        onChange=${(value) => {setAttributes( {brandColor: value ? value.slug : "" } )}}
        value=${attributes.brandColor}
        ucdBlock="all"
      />
    </${BlockControls}>
    <${InspectorControls}>
      <${PanelBody} title="Query Filters">
      <${SelectControl}
        options=${ typeOptions }
        value=${ attributes.groupType }
        label='Group Type'
        onChange=${ groupType => setAttributes({groupType}) }
      />
      <${SelectControl}
        options=${ statusOptions }
        value=${ attributes.activeStatus }
        label='Active Status'
        onChange=${ activeStatus => setAttributes({activeStatus}) }
      />
      <div style=${{marginTop: '1rem'}}>
        <${ToggleControl}
          label='Override Hidden Flag'
          checked=${attributes.showHidden}
          onChange=${ () => setAttributes({showHidden: !attributes.showHidden}) }
          help="If checked, a group will be displayed even if it is marked as hidden."
        />
      </div>
      </${PanelBody}>
    </${InspectorControls}>
    <div className='alert'>
      Based on your query, an automatically generated list of library groups will display here.
    </div>
  </div>
  `
}
