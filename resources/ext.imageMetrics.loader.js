/**
 * JavaScript module for image-related metrics.
 * @see https://mediawiki.org/wiki/Extension:ImageMetrics
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $ ) {
	'use strict';

	/**
	 * Makes a random decision (based on the sampling factor configuration setting) whether the current
	 * request should be logged.
	 * @return {boolean}
	 */
	function isInSample() {
		var factor = mw.config.get( 'wgImageMetricsSamplingFactor', false );
		if ( !$.isNumeric( factor ) || factor < 1 ) {
			return false;
		}
		return Math.floor( Math.random() * factor ) === 0;
	}

	if ( isInSample() ) {
		mw.loader.using( 'ext.imageMetrics', function () {
			mw.ImageMetrics.install();
		} );
	}
} ( mediaWiki, jQuery ) );
