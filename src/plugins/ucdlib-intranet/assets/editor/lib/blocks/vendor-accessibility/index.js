import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/vendor-accessibility';
const settings = {
  apiVersion: 3,
  title: "Vendor accessibility",
  description: "Displays accessibility information for vendors",
  icon: UCDIcons.renderPublic('fa-wheelchair'),
  category: 'ucdlib-intranet',
  keywords: [ ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
    contentProviderColumn: {
      type: 'string'
    },
    interfaceNameColumn: {
      type: 'string'
    },
    collectionPublicNameColumn: {
      type: 'string'
    },
    displayFields: {
      type: 'string'
    }
  },
  edit: Edit
};

export default { name, settings };
