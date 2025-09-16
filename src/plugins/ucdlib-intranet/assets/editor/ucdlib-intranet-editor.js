import "@ucd-lib/brand-theme-editor";
import { registerPlugin } from '@wordpress/plugins';
import { registerBlockType } from '@wordpress/blocks';
import customBlocks from "./lib/blocks";
import { select } from "@wordpress/data";

import groupSettings from "./lib/plugins/group-settings";
import intranetPageSettings from "./lib/plugins/intranet-page-settings";

customBlocks.forEach(block => {
  registerBlockType( block.name, block.settings );
});

if ( select('core/edit-post') ) {
  registerPlugin( groupSettings.name, groupSettings.settings );
  registerPlugin( intranetPageSettings.name, intranetPageSettings.settings );
};
