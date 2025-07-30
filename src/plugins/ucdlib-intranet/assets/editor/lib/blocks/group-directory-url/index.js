import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/group-directory-url';
const settings = {
  api_version: 2,
  title: "Library Group Team Directory URL",
  description: "Displays link to a library group team directory page if available.",
  icon: UCDIcons.renderPublic('fa-users'),
  category: 'ucdlib-intranet',
  keywords: [ 'directory', 'team', 'people', 'employees', 'staff' ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
