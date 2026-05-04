import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/recent-tickets';
const settings = {
  api_version: 2,
  title: "Recent Tickets",
  description: "Displays a list of recent tickets submitted by the user.",
  icon: html`<span>RT</span>`,
  category: 'ucdlib-intranet',
  keywords: [  ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
    limit: {
      type: 'number',
      default: 5
    },
    brandColor: {
      type: "string",
      default: ""
    },
  },
  edit: Edit
};

export default { name, settings };
