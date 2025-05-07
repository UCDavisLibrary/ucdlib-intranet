import "@ucd-lib/brand-theme-editor";
import { registerPlugin } from '@wordpress/plugins';
import { registerBlockType } from '@wordpress/blocks';
import customBlocks from "./lib/blocks";
import { select } from "@wordpress/data";

import favoriteSettings from "./lib/plugins/favorite-settings";
import groupSettings from "./lib/plugins/group-settings";

customBlocks.forEach(block => {
  registerBlockType( block.name, block.settings );
});

if ( select('core/edit-post') ) {
  registerPlugin( favoriteSettings.name, favoriteSettings.settings );
  registerPlugin( groupSettings.name, groupSettings.settings );
};
