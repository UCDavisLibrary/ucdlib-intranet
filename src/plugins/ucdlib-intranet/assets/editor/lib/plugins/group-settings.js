import { PluginPostStatusInfo } from '@wordpress/editor';
import { Fragment, useEffect, useState } from "@wordpress/element";
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from "@wordpress/data";
import {
  Button,
  ComboboxControl,
  RadioControl,
  TextControl,
  ToggleControl,
  __experimentalText as Text,
  Modal
 } from '@wordpress/components';
import { html, SelectUtils } from "@ucd-lib/brand-theme-editor/lib/utils";

const name = 'ucdlib-intranet-group-settings';

const Edit = () => {
  const postType = SelectUtils.editedPostAttribute('type');

  // post metadata
  const postTitle = SelectUtils.editedPostAttribute('title');
  const postId = SelectUtils.editedPostAttribute('id');
  const postMeta = SelectUtils.editedPostAttribute('meta');
  const watchedVars = [
    postTitle,
    postId,
    postMeta.ucdlibGroupType,
    postMeta.ucdlibGroupParent,
    postMeta.ucdlibGroupEndedYear,
    postMeta.ucdlibHideOnLandingPage,
    postMeta.ucdlibSubnavPattern
  ]
  const { editPost } = useDispatch( 'core/editor', watchedVars );
  const [ groupType, setGroupType ] = useState( postMeta.ucdlibGroupType );
  const [ groupTitle, setGroupTitle ] = useState( postTitle );
  const [ groupParent, setGroupParent ] = useState( postMeta.ucdlibGroupParent );
  const [ groupEndedYear, setGroupEndedYear ] = useState( postMeta.ucdlibGroupEndedYear );
  const [ groupHideOnLandingPage, setGroupHideOnLandingPage ] = useState( postMeta.ucdlibHideOnLandingPage );
  const [ groupSubnavPattern, setGroupSubnavPattern ] = useState( postMeta.subnavPattern );

  const {editEntityRecord} = useDispatch( 'core' );


  // set component state from current page meta
  const setStateFromCurrentPage = () => {
    setLandingPageId( 0 );
    setGroupType( postMeta.ucdlibGroupType || 'committee' );
    setGroupTitle( postTitle );
    setGroupParent( postMeta.ucdlibGroupParent );
    setGroupEndedYear( postMeta.ucdlibGroupEndedYear || '');
    setGroupHideOnLandingPage( postMeta.ucdlibHideOnLandingPage || false );
    setGroupSubnavPattern( postMeta.ucdlibSubnavPattern );
  }

  // modal state
  const [ modalIsOpen, setModalOpen ] = useState( false );
  const openModal = () => {
    setModalOpen( true );
  };
  const closeModal = () => setModalOpen( false );

  // if this page has a parent, we need to find the landing page for this hackathon
  // and then set the component state from the metadata for that page
  const parent = SelectUtils.editedPostAttribute('parent') || 0;
  const [ parentError, setParentError ] = useState( false );
  const [ landingPageId, setLandingPageId ] = useState( 0 );
  useEffect(() => {
    if ( !parent || postType !== 'ucdlib-group' ) {
      setParentError(false);
      setStateFromCurrentPage();
      return;
    }
    const path = `ucdlib-intranet/groups/page/${parent}`;
    apiFetch( {path} ).then(
      ( r ) => {
        setParentError(false);
        setLandingPageId( r.groupId )
        setGroupTitle( r.groupTitle );
        setGroupType( r.groupType || 'committee' );
        setGroupParent( r.groupParent );
        setGroupEndedYear( r.groupEndedYear || '' );
        setGroupHideOnLandingPage( r.groupHideOnLandingPage || false );
        setGroupSubnavPattern( r.groupSubnavPattern );
      },
      (error) => {
        setParentError(true);
        setStateFromCurrentPage();
      });
  }, [parent]);

  const groupTypeOptions = [
    { label: 'Committee', value: 'committee' },
    { label: 'Department', value: 'department' }
  ];

  // Set up parent picker
  const [ allGroups, setAllGroups ] = useState([]);
  const [ filteredGroups, setFilteredGroups ] = useState([]);
  useEffect(() => {
    if ( postType !== 'ucdlib-group' ){
      return;
    }
    const path = `ucdlib-intranet/groups`;
    apiFetch( {path} ).then(
      ( r ) => {
        let allGroups = r.map( group => {
          return {
            label: group.groupTitle,
            value: String(group.groupId),
            disabled: group.groupId == postId || group.groupId == landingPageId
          }
        });
        setAllGroups( allGroups );
        setFilteredGroups( allGroups );
      },
      (error) => {
        console.error('Error fetching groups', error);
      });
  }, [landingPageId]);
  const _onFilterGroups = ( value ) => {
    if ( !value ) {
      setFilteredGroups( allGroups );
      return;
    }
    const filtered = allGroups
    .filter( group => {
      return group.label.toLowerCase().includes( value.toLowerCase() );
    })
    setFilteredGroups( filtered );
  }

  // set up pattern picker
  const [ allPatterns, setAllPatterns ] = useState([]);
  const [ filteredPatterns, setFilteredPatterns ] = useState([]);
  useEffect(() => {
    if ( postType !== 'ucdlib-group' ){
      return;
    }
    const path = `ucdlib-intranet/groups/patterns`;
    apiFetch( {path} ).then(
      ( r ) => {
        let allPatterns = r.map( pattern => {
          return {
            label: pattern.post_title,
            value: String(pattern.id)
          }
        });
        setAllPatterns( allPatterns );
        setFilteredPatterns( allPatterns );
      },
      (error) => {
        console.error('Error fetching patterns', error);
      });
  }, []);
  const _onFilterPatterns = ( value ) => {
    if ( !value ) {
      setFilteredPatterns( allPatterns );
      return;
    }
    const filtered = allPatterns
    .filter( pattern => {
      return pattern.label.toLowerCase().includes( value.toLowerCase() );
    })
    setFilteredPatterns( filtered );
  }

  // save component state variables to either the current page or hackathon landing page
  const saveMetadata = () => {
    const data = {
      meta: {
        ucdlibGroupType: groupType,
        ucdlibGroupParent: groupParent,
        ucdlibGroupEndedYear: groupEndedYear || null,
        ucdlibHideOnLandingPage: groupHideOnLandingPage,
        ucdlibSubnavPattern: groupSubnavPattern
      }
    }

    if ( landingPageId ) {
      editEntityRecord( 'postType', 'ucdlib-group', landingPageId, data )
    } else {
      editPost( data );
    }
    closeModal();
  }

  if ( postType !== 'ucdlib-group' ){
    return html`<${Fragment} />`;
  }

  return html`
    <${PluginPostStatusInfo} className=${name}>
      <style>
        .${name}-field {
          margin-bottom: 20px;
        }
      </style>
      <${Button} onClick=${openModal} variant="primary">Edit Library Group Metadata</${Button}>
      ${modalIsOpen && html`
        <${Modal} title='Library Group Metadata' onRequestClose=${closeModal} shouldCloseOnClickOutside=${false}>
        ${parentError ? html`
          <div><p>There was an error when retrieving library group metadata. Please try again later.</p></div>
        ` : html`
          <div>
            <h2>${groupTitle}</h2>

            <${RadioControl}
              className=${`${name}-field`}
              label="Library Group Type"
              selected=${groupType}
              options=${groupTypeOptions}
              onChange=${(value) => {
                setGroupType(value);
              }}>
            </${RadioControl}>

            <${ComboboxControl}
              className=${`${name}-field`}
              label="Parent Group"
              value=${groupParent}
              options=${filteredGroups}
              onChange=${(value) => {
                setGroupParent(value);
              }}
              onFilterValueChange=${_onFilterGroups}
              help="Select the parent group for this group, if applicable.">
            </${ComboboxControl}>

            <${TextControl}
              className=${`${name}-field`}
              label="Ended Year"
              type="number"
              value=${groupEndedYear}
              onChange=${(value) => {
                setGroupEndedYear(value);
              }}
              help="If not currently active, enter the last year this group was active.">
            </${TextControl}>

            <${ToggleControl}
              className=${`${name}-field`}
              label="Hide on Group Landing Page"
              checked=${groupHideOnLandingPage}
              onChange=${(value) => {
                setGroupHideOnLandingPage(value);
              }}
              help="If checked, this group will not be displayed on the library group landing page.">
            </${ToggleControl}>

            <${ComboboxControl}
              className=${`${name}-field`}
              label="Custom Subnav"
              value=${ groupSubnavPattern ? String(groupSubnavPattern) : '' }
              options=${filteredPatterns}
              onChange=${(value) => {
                setGroupSubnavPattern(value);
              }}
              onFilterValueChange=${_onFilterPatterns}
              help="By default, a subnav will be automatically generated based on this group's page hierarchy. To use a custom subnav, select an existing pattern.">
            </${ComboboxControl}>
          </div>
        `}
        <div style=${{marginTop: '20px', marginBottom: '10px'}}>
          <${Button} onClick=${saveMetadata} variant="primary">Save</${Button}>
          <${Button} onClick=${closeModal} variant="secondary">Close</${Button}>
        </div>
        ${landingPageId != 0 && html`
          <${Text} isBlock variant='muted'>After saving changes, you must still 'Update' this page for your changes to take effect.</${Text}>
        `}
        </${Modal}>
        `}

    </${PluginPostStatusInfo}>
  `;
}

const settings = {render: Edit};
export default { name, settings };
