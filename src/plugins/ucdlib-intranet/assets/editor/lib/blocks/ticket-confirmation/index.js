import { UCDIcons } from "@ucd-lib/brand-theme-editor/lib/utils";
import { html } from "@ucd-lib/brand-theme-editor/lib/utils";
import Edit from './edit';

const name = 'ucdlib-intranet/ticket-confirmation';
const settings = {
  apiVersion: 3,
  title: "Ticket Confirmation",
  description: "Displays confirmation information for a submitted RT ticket.",
  icon: html`<span>RT</span>`,
  category: 'ucdlib-intranet',
  keywords: [  ],
  supports: {
    "html": false,
    "customClassName": false
  },
  attributes: {
  },
  edit: Edit
};

export default { name, settings };
