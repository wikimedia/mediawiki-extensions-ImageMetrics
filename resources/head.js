/**
 * JavaScript module for image-related metrics.
 * Top-loaded on every request to measure timing of events which might happen before normal script load.
 * @see https://mediawiki.org/wiki/Extension:ImageMetrics
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $ ) {
	'use strict';

	/**
	 * Time to load the main image on the file page, in ms. Null means unknown (none of the methods used here
	 * work reliably cross-browser, especially if the image was cached); 0 means already loaded when we first
	 * checked (this most likely means that the image was cached).
	 * @property {number|null}
	 */
	mw.imageMetricsLoadTime = null;

	$( function () {
		var $file = $( '#file' ).find( 'img'),
			file = $file.get( 0 );

		if ( !file ) {
			mw.log( 'ImageMetrics: file missing' );
			return;
		}

		// per spec readyState is for audio/video only but IE implements it for img:
		// http://msdn.microsoft.com/en-us/library/ie/ms534359(v=vs.85).aspx
		if ( file.readyState === 4 ) {
			mw.imageMetricsLoadTime = 0;
			return;
		}

		$file.load( function () {
			if ( window.mediaWikiLoadStart ) {
				mw.imageMetricsLoadTime = mw.now() - window.mediaWikiLoadStart;
			}
		} );
	} );
} ( mediaWiki, jQuery ) );
