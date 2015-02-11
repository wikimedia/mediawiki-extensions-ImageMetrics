/**
 * JavaScript module for image-related metrics.
 * This module will be loaded on every request to perform sampling and load the real module if needed.
 * @see https://mediawiki.org/wiki/Extension:ImageMetrics
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $ ) {
	'use strict';

	var logImage,
		config = mw.config.get( 'wgImageMetrics', { samplingFactor: {} } ),
		imageFactor = config.samplingFactor.image,
		loggedinImageFactor = config.samplingFactor.imageLoggedin;

	/**
	 * Makes a random decision (based on samplingRatio) whether an event should be logged.
	 * Returns true with 1/samplingRatio probability, or false if samplingRatio  is not a number or smaller than 1.
	 * @param {number|boolean} samplingRatio
	 * @return {boolean}
	 */
	function isInSample( samplingRatio ) {
		if ( !$.isNumeric( samplingRatio ) || samplingRatio < 1 ) {
			return false;
		}
		return Math.floor( Math.random() * samplingRatio ) === 0;
	}


	if ( !mw.user.isAnon() && loggedinImageFactor ) {
		imageFactor = loggedinImageFactor;
	}

	logImage = isInSample( imageFactor );

	if ( !logImage ) {
		return;
	}

	mw.loader.using( 'ext.imageMetrics', function () {
		if ( logImage ) {
			mw.imageMetrics.LoadingTimeLogger.install( imageFactor );
		}
	} );
} ( mediaWiki, jQuery ) );
