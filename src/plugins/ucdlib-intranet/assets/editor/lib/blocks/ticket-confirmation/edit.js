import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps } from '@wordpress/block-editor';

export default ( ) => {
  const blockProps = useBlockProps();

  return html`
  <div ...${ blockProps }>
    <div className='alert'>
      For the current user, will show link to the last RT ticket submitted, along with a confirmation message and instructions for next steps.
    </div>
  </div>
  `
}
