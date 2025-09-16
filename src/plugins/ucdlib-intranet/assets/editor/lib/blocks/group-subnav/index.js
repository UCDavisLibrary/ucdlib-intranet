import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/group-subnav';
const settings = {
  api_version: 2,
  title: "Library Group Subnav",
  description: "Displays a subnav for a hierarchical library group",
  icon: UCDIcons.renderPublic('fa-folder-tree'),
  category: 'ucdlib-intranet',
  keywords: [ 'menu', 'child'],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
