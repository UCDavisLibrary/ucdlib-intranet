import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps } from '@wordpress/block-editor';

export default ( ) => {
  const blockProps = useBlockProps();

  return html`
  <div ...${ blockProps }>
    <div className='alert'>
      A focal link will automatically display here if the "Team Directory URL" is set in the group settings.
    </div>
  </div>
  `
}
