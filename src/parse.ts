import '@logseq/libs';
import markdownMark from 'markdown-it-mark';
import markdownIt from 'markdown-it';
import markdownTable from 'markdown-it-multimd-table';

async function formatText( text2, template ) {
	var text: string = text2.replace( /:LOGBOOK:|collapsed:: true/gi, '' );

    // Strip out queries
    text = text.replace( /\#\+BEGIN_QUERY([^]*)\#\+END_QUERY/g, function( whole, query ) {
        return '';
    } );

    // Handle references
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

    // Strip out id tags:
	if ( text.indexOf( `\nid:: ` ) !== -1 ) {
		text = text.substring( 0, text.indexOf( `\nid:: ` ) );
	}

    // Strip out the clock stuff
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

    // This will format links like [Title]([[Other page]]) to url contained in the target page IF it has a URL property.
	const linkRef =  ( /\[([^\]]+)\]\(\[\[([^\]]+)\]\]\)/ ).exec( text );
	if ( linkRef != null ) {
        const urlToReplace = await getUrlFromAttributeInPageName( linkRef[2] );
		if ( urlToReplace ) {
			text = text.replace(
				`[[${linkRef[2]}]]`,
				urlToReplace
			);
		}
	}

    // This will link [[Other blog post]] to the url parameter in that page.
	let regRef = null;
	const regRefRegex = ( /\[\[([^\]]+)\]\]/g );
	while ( ( regRef = regRefRegex.exec( text ) ) !== null ) {
		debugger;
        const urlToReplace = await getUrlFromAttributeInPageName( regRef[1] );
		if ( urlToReplace ) {
			text = text.replace(
				regRef[0],
				`[${regRef[1]}](${urlToReplace})`
			);
		} else {
			text = text.replace(
				regRef[0],
				regRef[1]
			);
        }
	}

    return text;
}

async function getUrlFromAttributeInPageName( title ) {
    const page = await logseq.Editor.getPage( title );
    return page?.properties?.url;
}

export default async function parse(
	templateName,
	block = undefined
) {
	var md = new markdownIt().use( markdownMark ).use( markdownTable );
    var blocks2 = [];
	md.inline.ruler.enable( [ 'mark' ] );
	var finalString;

    // Print only one block
	if ( block != undefined ) {
		blocks2 = parseBlocksTree(
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
        // Print whole page
        let currentBlock = await logseq.Editor.getCurrentPageBlocksTree();
        // If first block contains properties, remove entire block.
        if ( currentBlock[ 0 ] && currentBlock[ 0 ].properties ) {
            currentBlock = currentBlock.slice( 1 );
        }
		for ( const x in currentBlock ) {
			blocks2 = blocks2.concat( parseBlocksTree( currentBlock[ x ] ) );
		}
		finalString = `# ${
			( await logseq.Editor.getCurrentPage() ).originalName
		}`;
	}

	if (
		logseq.settings[ `${ templateName }Choice` ] ==
		'Bullets for non top level elements'
	) {
        console.log( 'BLOCKS2' , blocks2 );
		for ( const x in blocks2 ) {
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

	return logseq.App.getCurrentGraph().then( async ( graph ) => {
		var final4String = final2String
			.replaceAll( '../assets', `${ graph.path }/assets` )
			.replaceAll( '<p>BahBahBlackSheepYouAreAMeanSheep</p>', '<br>' );
		return final4String;
	} );
}


function parseBlocksTree( obj ) {
    var blocks2 = [];
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
    return blocks2;
}