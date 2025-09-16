import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/group-committee-meta';
const settings = {
  api_version: 2,
  title: "Library Group Committee Metadata Box",
  description: "Displays metadata for a library group committee",
  icon: UCDIcons.renderPublic('fa-users'),
  category: 'ucdlib-intranet',
  keywords: [ 'committee', 'metadata', 'group', 'unit'],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
