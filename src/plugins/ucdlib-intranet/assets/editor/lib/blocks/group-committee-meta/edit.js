import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps } from '@wordpress/block-editor';

export default ( ) => {
  const blockProps = useBlockProps();

  return html`
  <div ...${ blockProps }>
    <div className='alert'>
      A box with metadata will be displayed here if the current page is a library group committee page.
    </div>
  </div>
  `
}
