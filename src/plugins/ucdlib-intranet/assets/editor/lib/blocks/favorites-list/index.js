import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/favorites-list';
const settings = {
  api_version: 2,
	title: "User favorites list",
	description: "Displays a list of your favorite pages",
	icon: UCDIcons.renderPublic('fa-star'),
	category: 'ucdlib-intranet',
	keywords: [ 'favorite', 'bookmark' ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
