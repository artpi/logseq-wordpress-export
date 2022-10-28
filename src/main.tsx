import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { handleClosePopup } from './handleClosePopup';
import markdownMark from 'markdown-it-mark';
import markdownIt from 'markdown-it';
import markdownTable from 'markdown-it-multimd-table';
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

async function formatText( text2, template ) {
	var text: string = text2.replace( /:LOGBOOK:|collapsed:: true/gi, '' );
	if ( text.includes( 'CLOCK: [' ) ) {
		text = text.substring( 0, text.indexOf( 'CLOCK: [' ) );
	}

	// Strip out Readwise Location tags
	text = text.replace(
		/\(\[Location\s[0-9]+\]\([^)]+readwise[^)]+\)\)/g,
		''
	); // Remove readwise links

	if (
		logseq.settings[ `${ template }Options` ].includes(
			'Hide Page Properties'
		)
	) {
		text = text.replaceAll( /((?<=::).*|.*::)/g, '' );
	}
	if (
		logseq.settings[ `${ template }Options` ].includes( 'Hide Brackets' )
	) {
		text = text.replaceAll( '[[', '' );
		text = text.replaceAll( ']]', '' );
	}

	const rxGetId = /\(\(([^)]*)\)\)/;
	const blockId = rxGetId.exec( text );
	if ( blockId != null ) {
		const block = await logseq.Editor.getBlock( blockId[ 1 ], {
			includeChildren: true,
		} );
		//optional based on setting enabled

		if ( block != null ) {
			text = text.replace(
				`((${ blockId[ 1 ] }))`,
				block.content.substring( 0, block.content.indexOf( 'id::' ) )
			);
		}
	}

	if ( text.indexOf( `\nid:: ` ) === -1 ) {
		return text;
	} else {
		return text.substring( 0, text.indexOf( `\nid:: ` ) );
	}
}



export async function createPDF(
	templateName,
	block = undefined
) {
	var md = new markdownIt().use( markdownMark ).use( markdownTable );
	md.inline.ruler.enable( [ 'mark' ] );
	var finalString;

	const currentBlock = await logseq.Editor.getCurrentPageBlocksTree();
	if ( block != undefined ) {
		parseBlocksTree(
			await logseq.Editor.getBlock( block, { includeChildren: true } )
		);
		if (
			logseq.settings.blockExportHandling == 'Keep title as name of page'
		) {
			finalString = `# ${
				( await logseq.Editor.getCurrentPage() ).originalName
			}`;
		} else if (
			logseq.settings.blockExportHandling ==
			'Keep title as heading of block'
		) {
			finalString = `# ${
				( await logseq.Editor.getBlock( block ) ).content
			}`;
		} else {
			finalString = ``;
		}
	} else {
		for ( const x in currentBlock ) {
			parseBlocksTree( currentBlock[ x ] );
		}
		finalString = `# ${
			( await logseq.Editor.getCurrentPage() ).originalName
		}`;
	}

	if (
		logseq.settings[ `${ templateName }Choice` ] ==
		'Bullets for non top level elements'
	) {
		for ( const x in blocks2 ) {
			console.log( 'Hi' );
			if (
				! (
					blocks2[ x ].uuid == block &&
					logseq.settings.blockExportHandling ==
						'Keep title as heading of block' &&
					block != undefined
				)
			) {
				var formattedText = await formatText(
					blocks2[ x ][ 0 ],
					templateName
				);
				//if templateName has bullets enabled
				if ( blocks2[ x ][ 1 ] > 1 ) {
					formattedText = '- ' + formattedText;
					for ( let step = 1; step < blocks2[ x ][ 1 ]; step++ ) {
						//For each value of step add a space in front of the dash
						formattedText = '  ' + formattedText;
					}
				}
				//Filter to remove bullets when they are hastags as well
				console.log( formattedText );
				finalString = `${ finalString }\n\n ${ formattedText }`;
			}
		}
	} else if (
		logseq.settings[ `${ templateName }Choice` ] ==
		'Bullets througout the document'
	) {
		for ( const x in blocks2 ) {
			if (
				! (
					Number( x ) == 0 &&
					logseq.settings.blockExportHandling ==
						'Keep title as heading of block'
				)
			) {
				var formattedText = await formatText(
					blocks2[ x ][ 0 ],
					templateName
				);
				console.log( blocks2[ x ][ 1 ] );
				if ( blocks2[ x ][ 1 ] > 0 ) {
					formattedText = '- ' + formattedText;
					for ( let step = 1; step < blocks2[ x ][ 1 ]; step++ ) {
						//For each value of step add a space in front of the dash
						formattedText = '  ' + formattedText;
					}
				}
				finalString = `${ finalString }\n\n ${ formattedText }`;
			}
		}
	} else if (
		logseq.settings[ `${ templateName }Choice` ] ==
		'Flatten document(No bullets)'
	) {
		for ( const x in blocks2 ) {
			if (
				! (
					blocks2[ x ].uuid == block &&
					logseq.settings.blockExportHandling ==
						'Keep title as heading of block'
				)
			) {
				var formattedText = await formatText(
					blocks2[ x ][ 0 ],
					templateName
				);

				finalString = `${ finalString }\n\n ${ formattedText }`;
			}
		}
	}
	finalString = finalString.replaceAll( '#+BEGIN_QUOTE', '' );
	finalString = finalString.replaceAll( '#+END_QUOTE', '' );
	// Make logseqs highlights into MD standard
	finalString = finalString.replaceAll( '^^', '==' );

	// console.log(result);
	var final2String = md.render( finalString );
	console.log( finalString );
	console.log( final2String );
	// final2String = result.replace();

	return logseq.App.getCurrentGraph().then( async ( graph ) => {
		var final4String = final2String
			.replaceAll( '../assets', `${ graph.path }/assets` )
			.replaceAll( '<p>BahBahBlackSheepYouAreAMeanSheep</p>', '<br>' );
		var final5String = final4String;
		//Add paragraph spacing if all bullets are selected
		console.log( logseq.settings[ templateName + 'Options' ] );
		if (
			logseq.settings[ templateName + 'Options' ].includes(
				'Inherit logseq CSS'
			)
		) {
			console.log( 'inheritcss' );
			let finalResult =
				'<html>' +
				top.document.head.innerHTML +
				final5String +
				'</html>';
			return finalResult;
		} else {
			return final5String;
		}
	} );
}

var blocks2 = [];
function parseBlocksTree( obj ) {
	conductParsing( obj );
	function conductParsing( obj ) {
		if ( obj.content != '' || obj.content != undefined ) {
			let content2 = obj.content;
			let level = obj.level;
			blocks2.push( [ content2, level ] );
		} else if ( obj.content == '' ) {
			let content2 = 'BahBahBlackSheepYouAreAMeanSheep';
			let level = 0;
			blocks2.push( [ content2, level ] );
		} else {
			console.log( obj );
		}

		obj.children.map( conductParsing );
	}
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
		createPDF( 'template1', block.uuid ).then( html => {
			renderApp( html );
			handleClosePopup();
		} );
	};

	logseq.Editor.registerBlockContextMenuItem(
		'Export Block for WordPress',
		exportSinglePDF
	);

	function initializeApp() {
    	createPDF( 'template1' ).then( html => {
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
