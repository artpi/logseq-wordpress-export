import React, { useState } from 'react';
import './App.css';
import { closePopup } from './handleClosePopup';
const PreviewScreen: React.FC< { htmlText } > = ( { htmlText } ) => {
	return (
		<div>
			<div className="w-screen h-screen flex items-center justify-center text-black">
				<div className="w-5/6 h-5/6 bg-clip-padding">
					<div className="preview_window z-30 bg-white">
					<a aria-label="Close" type="button" className="ui__modal-close opacity-60 hover:opacity-100"
						onClick={ closePopup }
					>
						<svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-6 w-6"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path></svg>
					</a>

						<div className="preview_header">
							<button
								className="button"
								onClick={ () => navigator.clipboard.writeText( htmlText ).then( function() {
									alert( 'Markup copied to clipboard!' );
								  } ) }
							>
								Copy HTML to Clipboard
							</button>
						</div>
						<br></br>
						<div
							dangerouslySetInnerHTML={ { __html: htmlText } }
							id="cooldiv"
							className="post_content bg-white"
						></div>
					</div>
				</div>
			</div>
			<div
				className="w-screen h-screen top-0 left-0 z-50"
				onClick={ () => logseq.hideMainUI() }
			></div>
		</div>
	);
};

export default PreviewScreen;
