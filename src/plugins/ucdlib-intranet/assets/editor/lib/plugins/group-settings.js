import { PluginPostStatusInfo } from '@wordpress/editor';
import { Fragment, useEffect, useState } from "@wordpress/element";
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from "@wordpress/data";
import {
  Button,
  ComboboxControl,
  DateTimePicker,
  Dropdown,
  RadioControl,
  SelectControl,
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
    postMeta.ucdlibGroupDirectoryUrl,
    postMeta.ucdlibGroupParent,
    postMeta.ucdlibGroupEndedYear,
    postMeta.ucdlibHideOnLandingPage,
    postMeta.ucdlibSubnavPattern,
    postMeta.ucdlibCommitteePermanence,
    postMeta.ucdlibCommitteeLeaderName,
    postMeta.ucdlibCommitteeLeaderEmail,
    postMeta.ucdlibCommitteeSponsorName,
    postMeta.ucdlibCommitteeStartDate,
    postMeta.ucdlibCommitteeReviewDate
  ]
  const { editPost } = useDispatch( 'core/editor', watchedVars );
  const [ groupType, setGroupType ] = useState( postMeta.ucdlibGroupType );
  const [ groupDirectoryUrl, setGroupDirectoryUrl ] = useState( postMeta.ucdlibGroupDirectoryUrl || '' );
  const [ groupTitle, setGroupTitle ] = useState( postTitle );
  const [ groupParent, setGroupParent ] = useState( postMeta.ucdlibGroupParent );
  const [ groupEndedYear, setGroupEndedYear ] = useState( postMeta.ucdlibGroupEndedYear );
  const [ groupHideOnLandingPage, setGroupHideOnLandingPage ] = useState( postMeta.ucdlibHideOnLandingPage );
  const [ groupSubnavPattern, setGroupSubnavPattern ] = useState( postMeta.subnavPattern );
  const [ groupCommitteePermanence, setGroupCommitteePermanence ] = useState( postMeta.ucdlibCommitteePermanence );
  const [ groupCommitteeLeaderName, setGroupCommitteeLeaderName ] = useState( postMeta.ucdlibCommitteeLeaderName );
  const [ groupCommitteeLeaderEmail, setGroupCommitteeLeaderEmail ] = useState( postMeta.ucdlibCommitteeLeaderEmail );
  const [ groupCommitteeSponsorName, setGroupCommitteeSponsorName ] = useState( postMeta.ucdlibCommitteeSponsorName );
  const [ groupCommitteeStartDate, setGroupCommitteeStartDate ] = useState( postMeta.ucdlibCommitteeStartDate );
  const [ groupCommitteeReviewDate, setGroupCommitteeReviewDate ] = useState( postMeta.ucdlibCommitteeReviewDate );

  const {editEntityRecord} = useDispatch( 'core' );


  // set component state from current page meta
  const setStateFromCurrentPage = () => {
    setLandingPageId( 0 );
    setGroupType( postMeta.ucdlibGroupType || 'committee' );
    setGroupDirectoryUrl( postMeta.ucdlibGroupDirectoryUrl || '' );
    setGroupTitle( postTitle );
    setGroupParent( postMeta.ucdlibGroupParent );
    setGroupEndedYear( postMeta.ucdlibGroupEndedYear || '');
    setGroupHideOnLandingPage( postMeta.ucdlibHideOnLandingPage || false );
    setGroupSubnavPattern( postMeta.ucdlibSubnavPattern );
    setGroupCommitteePermanence( postMeta.ucdlibCommitteePermanence );
    setGroupCommitteeLeaderName( postMeta.ucdlibCommitteeLeaderName );
    setGroupCommitteeLeaderEmail( postMeta.ucdlibCommitteeLeaderEmail );
    setGroupCommitteeSponsorName( postMeta.ucdlibCommitteeSponsorName );
    setGroupCommitteeStartDate( postMeta.ucdlibCommitteeStartDate );
    setGroupCommitteeReviewDate( postMeta.ucdlibCommitteeReviewDate );
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
        setGroupDirectoryUrl( r.groupDirectoryUrl || '' );
        setGroupParent( r.groupParent );
        setGroupEndedYear( r.groupEndedYear || '' );
        setGroupHideOnLandingPage( r.groupHideOnLandingPage || false );
        setGroupSubnavPattern( r.groupSubnavPattern );
        setGroupCommitteePermanence( r?.groupCommitteeMeta?.permanence || '' );
        setGroupCommitteeLeaderName( r?.groupCommitteeMeta?.leaderName || '' );
        setGroupCommitteeLeaderEmail( r?.groupCommitteeMeta?.leaderEmail || '' );
        setGroupCommitteeSponsorName( r?.groupCommitteeMeta?.sponsorName || '' );
        setGroupCommitteeStartDate( r?.groupCommitteeMeta?.startDate || '' );
        setGroupCommitteeReviewDate( r?.groupCommitteeMeta?.reviewDate || '' );
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

  // permanence options
  const permanenceOptions = [
    { label: 'Please Select', value: '' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Temporary', value: 'temporary' }
  ];

  // save component state variables to either the current page or hackathon landing page
  const saveMetadata = () => {
    const data = {
      meta: {
        ucdlibGroupType: groupType,
        ucdlibGroupDirectoryUrl: groupDirectoryUrl,
        ucdlibGroupParent: groupParent,
        ucdlibGroupEndedYear: groupEndedYear || null,
        ucdlibHideOnLandingPage: groupHideOnLandingPage,
        ucdlibSubnavPattern: groupSubnavPattern,
        ucdlibCommitteePermanence: groupCommitteePermanence,
        ucdlibCommitteeLeaderName: groupCommitteeLeaderName,
        ucdlibCommitteeLeaderEmail: groupCommitteeLeaderEmail,
        ucdlibCommitteeSponsorName: groupCommitteeSponsorName,
        ucdlibCommitteeStartDate: groupCommitteeStartDate,
        ucdlibCommitteeReviewDate: groupCommitteeReviewDate
      }
    }

    if ( landingPageId ) {
      editEntityRecord( 'postType', 'ucdlib-group', landingPageId, data )
    } else {
      editPost( data );
    }
    closeModal();
  }

  // start and review date pickers
  const datePickerDropdown = (onDropdownClose, field) => {
    let value = field == 'groupCommitteeStartDate' ? groupCommitteeStartDate : groupCommitteeReviewDate;
    if ( value ) {
      value = `${value}T12:00:00`;
    }

    const onChange = (v) => {
      const d = v.split('T')[0];
      if ( field === 'groupCommitteeStartDate' ) {
        setGroupCommitteeStartDate(d);
      } else {
        setGroupCommitteeReviewDate(d);
      }
    }
    const onReset = () => {
      if ( field === 'groupCommitteeStartDate' ) {
        setGroupCommitteeStartDate(null);
      } else {
        setGroupCommitteeReviewDate(null);
      }
      onDropdownClose();
    }
    return html`
      <div>
        <${DateTimePicker}
          is12Hour={ true }
          onChange=${onChange}
          currentDate=${value}
        />
        <div style=${{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
          ${value && html`
            <${Button} variant='link' isDestructive=${true} onClick=${onReset}>Reset</${Button}>
          `}
          <${Button} variant='link' onClick=${onDropdownClose}>Close</${Button}>
        </div>
      </div>
    `;
  }
  const dateLabel = (d) => {
    if ( !d ) return 'Not Set';
    return d;
  }

  const renderCommitteeMetadata = () => {
    return html`
      <style>
        .components-datetime__time > fieldset:first-of-type {
          display: none !important;
        }
      </style>
      <div>
        <h3>Committee Information</h3>
        <${SelectControl}
          className=${`${name}-field`}
          label="Committee Permanence"
          value=${groupCommitteePermanence}
          options=${permanenceOptions}
          onChange=${(value) => {
            setGroupCommitteePermanence(value);
          }}>
        </${SelectControl}>
        <h4>Committee Leader/Facilitator</h4>
        <div style=${{padding: '0 20px'}}>
          <${TextControl}
            className=${`${name}-field`}
            label="Name"
            value=${groupCommitteeLeaderName}
            onChange=${(value) => {
              setGroupCommitteeLeaderName(value);
            }}>
          </${TextControl}>
          <${TextControl}
            className=${`${name}-field`}
            label="Email"
            type="email"
            value=${groupCommitteeLeaderEmail}
            onChange=${(value) => {
              setGroupCommitteeLeaderEmail(value);
            }}>
          </${TextControl}>
        </div>
        <${TextControl}
          className=${`${name}-field`}
          label="Committee Sponsor"
          value=${groupCommitteeSponsorName}
          onChange=${(value) => {
            setGroupCommitteeSponsorName(value);
          }}>
        </${TextControl}>
        <div className=${`${name}-field`}>
          <${Dropdown}
            renderToggle=${({onToggle }) => html`
              <div onClick=${onToggle} style=${{cursor:'pointer'}}>
                <span>Committee Start Date: </span>
                <span className='components-button is-link'>${dateLabel(groupCommitteeStartDate)}</span>
              </div>
            `}
            renderContent=${({ onClose }) => datePickerDropdown(onClose, 'groupCommitteeStartDate')}
          />
        </div>
        <div className=${`${name}-field`}>
          <${Dropdown}
            renderToggle=${({onToggle }) => html`
              <div onClick=${onToggle} style=${{cursor:'pointer'}}>
                <span>Committee Review Date: </span>
                <span className='components-button is-link'>${dateLabel(groupCommitteeReviewDate)}</span>
              </div>
            `}
            renderContent=${({ onClose }) => datePickerDropdown(onClose, 'groupCommitteeReviewDate')}
          />
        </div>

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
      </div>
    `;
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

            ${groupType === 'department' && html`
              <${ComboboxControl}
                className=${`${name}-field`}
                label="Parent Group (if applicable)"
                value=${groupParent ? String(groupParent) : ''}
                options=${filteredGroups}
                onChange=${(value) => {
                  setGroupParent(value);
                }}
                onFilterValueChange=${_onFilterGroups}>
              </${ComboboxControl}>
            `}

            ${groupType === 'department' && html`
              <${TextControl}
                className=${`${name}-field`}
                label="Team Directory URL"
                value=${groupDirectoryUrl}
                onChange=${(value) => {
                  setGroupDirectoryUrl(value);
                }}
                help="Add a sidebar link to your unit's library website directory listing or team page.">
              </${TextControl}>
            `}

            ${(groupType === 'committee' || !groupType) && renderCommitteeMetadata()}

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

            <${ToggleControl}
              className=${`${name}-field`}
              label="Hide on Group Landing Page"
              checked=${groupHideOnLandingPage}
              onChange=${(value) => {
                setGroupHideOnLandingPage(value);
              }}>
            </${ToggleControl}>

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
