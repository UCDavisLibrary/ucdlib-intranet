import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/group-query';
const settings = {
  api_version: 2,
  title: "Library Group Query",
  description: "Displays a list of library groups",
  icon: UCDIcons.renderPublic('fa-people-group'),
  category: 'ucdlib-intranet',
  keywords: [ 'unit' ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
    groupType: {
      type: 'string',
      default: ''
    },
    activeStatus: {
      type: 'string',
      default: ''
    },
    brandColor: {
      type: 'string',
      default: ''
    },
    showHidden: {
      type: 'boolean',
      default: false
    }
  },
  edit: Edit
};

export default { name, settings };
