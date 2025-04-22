import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/group-hierarchy';
const settings = {
  api_version: 2,
  title: "Library Group Hierarchy",
  description: "Displays parent and subunits of a library group",
  icon: UCDIcons.renderPublic('fa-network-wired'),
  category: 'ucdlib-intranet',
  keywords: [ 'unit', 'subunit', 'parent', 'child'],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
