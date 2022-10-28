import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { handleClosePopup } from './handleClosePopup';
import parse from './parse';
import {
	BlockCommandCallback,
	SettingSchemaDesc,
} from '@logseq/libs/dist/LSPlugin.user';
import PreviewScreen from './PreviewScreen';


const propertyOptions = [
	'Hide Page Properties',
	'Hide Brackets',
	'Inherit logseq CSS',
];
const regularExportPropertyOptions = [
	'Hide Page Properties',
	'Hide Brackets',
	'Make Bullets Black',
	'Hide Linked References',
];
const mainOptions = [
	'Flatten document(No bullets)',
	'Bullets for non top level elements',
	'Bullets througout the document',
];
const blockExportOptions = [
	'Keep title as name of page',
	'Keep title as heading of block',
	'Keep no title',
];

let settings: SettingSchemaDesc[] = [
	{
		key: 'retainedOptions',
		type: 'enum',
		default: '',
		title: 'Retained Formatting Choices',
		enumChoices: regularExportPropertyOptions,
		enumPicker: 'checkbox',
		description: 'Pick Option for Retained Formatting',
	},
	{
		key: 'template1CSS',
		type: 'string',
		default: '',
		title: 'Template 1 Css',
		description: 'Enter the css for the template 1',
	},
	{
		key: 'template1Choice',
		type: 'enum',
		default: 'Bullets for non top level elements',
		title: 'Template 1 Choice',
		enumChoices: mainOptions,
		enumPicker: 'radio',
		description: 'Pick Option for Template 1',
	},
	{
		key: 'template1Options',
		type: 'enum',
		default: [ 'Inherit logseq CSS' ],
		title: 'Template 1 Options',
		enumChoices: propertyOptions,
		enumPicker: 'checkbox',
		description: 'Pick Options for Template 1',
	},
	{
		key: 'template2CSS',
		type: 'string',
		default: '',
		title: 'Template 2 Css',
		description: 'Enter the css for the template 2',
	},
	{
		key: 'template2Choice',
		type: 'enum',
		default: 'Bullets througout the document',
		title: 'Template 2 Choice',
		enumChoices: mainOptions,
		enumPicker: 'radio',
		description: 'Pick Option for Template 2',
	},
	{
		key: 'template2Options',
		type: 'enum',
		default: [ 'Inherit logseq CSS' ],
		title: 'Template 2 Options',
		enumChoices: propertyOptions,
		enumPicker: 'checkbox',
		description: 'Pick Options for Template 2',
	},
	{
		key: 'template3CSS',
		type: 'string',
		default: '',
		title: 'Template 3 Css',
		description: 'Enter the css for the template 3',
	},
	{
		key: 'template3Choice',
		type: 'enum',
		default: '',
		title: 'Template 3 Choice',
		enumChoices: mainOptions,
		enumPicker: 'radio',
		description: 'Pick Option for Template 3',
	},
	{
		key: 'template3Options',
		type: 'enum',
		default: [ 'Inherit logseq CSS' ],
		title: 'Template 3 Options',
		enumChoices: propertyOptions,
		enumPicker: 'checkbox',
		description: 'Pick Options for Template 3',
	},
	{
		key: 'blockExportHandling',
		type: 'enum',
		default: 'Keep title as heading of block',
		title: 'How should single block exports be handled?',
		enumChoices: blockExportOptions,
		enumPicker: 'radio',
		description: 'Pick Options for Template 3',
	},
];

logseq.useSettingsSchema( settings );


function renderApp( env: string ) {
	//If bullet points have been requested
	ReactDOM.render(
		<React.StrictMode>
			<PreviewScreen htmlText={ env } />
		</React.StrictMode>,
		document.getElementById( 'root' )
	);
	logseq.showMainUI();
}


const main = async () => {
	logseq.App.registerUIItem( 'toolbar', {
		key: 'logseq-pdf-export-plugin',
		template:
			'<a data-on-click="show" class="button"><i class="ti ti-file-export"></i></a>',
	} );
	logseq.provideModel( {
		show() {
			initializeApp();
		},
	} );
	const exportSinglePDF: BlockCommandCallback = async ( block ) => {
		parse( 'template1', block.uuid ).then( html => {
			renderApp( html );
			handleClosePopup();
		} );
	};

	logseq.Editor.registerBlockContextMenuItem(
		'Export Block for WordPress',
		exportSinglePDF
	);

	function initializeApp() {
    	parse( 'template1' ).then( html => {
			renderApp( html );
			handleClosePopup();
		} );
	}


	logseq.App.registerPageMenuItem(
		'Download Page for WordPress',
		initializeApp
	);
};

logseq.ready( main ).catch( console.error );
