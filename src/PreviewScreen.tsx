import React, { useState } from 'react';
import './App.css';
const PreviewScreen: React.FC< { htmlText } > = ( { htmlText } ) => {
	return (
		<div>
			<div className="w-screen h-screen flex items-center justify-center text-black">
				<div className="w-5/6 h-5/6 bg-clip-padding">
					<div className="bg-slate-400 z-30 rounded-2xl p-4">
						<h1 className="font-bold text-4xl">WordPress Code</h1>
						<div className="">
							<button
								className="button"
								onClick={ () => navigator.clipboard.writeText( htmlText ).then( function() {
									alert( 'Text copied to clipboard' );
								  } ) }
							>
								Copy Text to clipboard
							</button>
						</div>
						<br></br>
						<div
							dangerouslySetInnerHTML={ { __html: htmlText } }
							id="cooldiv"
							className="post_content bg-white rounded-xl"
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
