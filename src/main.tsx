import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { handleClosePopup } from './handleClosePopup';
import parse from './parse';
import {
	BlockCommandCallback,
} from '@logseq/libs/dist/LSPlugin.user';
import PreviewScreen from './PreviewScreen';

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
		key: 'logseq-wordpress-export',
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
