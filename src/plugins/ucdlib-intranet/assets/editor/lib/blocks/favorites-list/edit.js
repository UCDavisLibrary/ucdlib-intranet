import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import { useBlockProps } from '@wordpress/block-editor';

export default ( ) => {
  const blockProps = useBlockProps();

  return html`
  <div ...${ blockProps }>
    <div className='alert'>
      A list of the current user's favorite pages will display here.
      <br />
      To manage your favorites, go to the <a href='/wp-admin/admin.php?page=ucdlib-intranet-favorites'>favorites admin menu</a>.
    </div>
  </div>
  `
}
