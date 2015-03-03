/**
 * JavaScript module for CORS metrics.
 * @see https://mediawiki.org/wiki/Extension:ImageMetrics
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $, oo ) {
	'use strict';

	/**
	 * @class mw.imageMetrics.CorsLogger
	 * @extends mw.imageMetrics.Logger
	 * @constructor
	 * @param {number} samplingFactor sampling factor
	 * @param {Object} location window.location
	 * @param {Object} mwConfig mw.config
	 * @param {Object} geo window.Geo
	 * @param {Object} eventLog mw.eventLog
	 */
	function CorsLogger(
		/* inherited arguments */
		samplingFactor, location, mwConfig, geo, eventLog
	) {
		CorsLogger.parent.call( this, samplingFactor, location, mwConfig, geo, eventLog );
	}
	oo.inheritClass( CorsLogger, mw.imageMetrics.Logger );

	CorsLogger.prototype.schema = 'ImageMetricsCorsSupport';

	/**
	 * Factory function to take care of dependency injection.
	 * @static
	 * @param {number} samplingFactor sampling factor
	 * @return {mw.imageMetrics.CorsLogger}
	 */
	CorsLogger.create = function( samplingFactor ) {
		return new CorsLogger( samplingFactor, window.location, mw.config, window.Geo, mw.eventLog );
	};


	/**
	 * Sets up logging.
	 * @static
	 * @param {number} samplingFactor sampling factor
	 */
	CorsLogger.install = function ( samplingFactor ) {
		var logger = CorsLogger.create( samplingFactor );

		logger.loadScriptViaCors().always( $.proxy( logger, 'collect' ) );
	};

	/**
	 * Logs all CORS-related information
	 */
	CorsLogger.prototype.collect = function () {
		this.log( {
			xhrSupported: 'withCredentials' in new XMLHttpRequest(),
			xdomainSupported: typeof XDomainRequest !== 'undefined',
			imgAttributeSupported: 'crossOrigin' in document.createElement( 'img' ),
			scriptAttributeSupported: 'crossOrigin' in document.createElement( 'script' ),
			scriptLoaded: this.mwConfig.get( 'wgImageMetricsCorsTestSucceeded', false )
		} );
	};

	/**
	 * Loads cors-test.js with a crossorigin="anonymous" <script> attribute.
	 * @return {jQuery.Deferred}
	 */
	CorsLogger.prototype.loadScriptViaCors = function () {
		var script,
			deferred = $.Deferred();

		script = $( '<script>' )
			.attr( {
				type: 'text/javascript',
				crossorigin: 'anonymous',
				// this will not work if wgExtensionAssetsPath is a relative URL (which is the
				// default) but there is no need for CORS loading of assets in that case anyway
				src: this.mwConfig.get( 'wgExtensionAssetsPath' ) + '/ImageMetrics/resources/cors-test.js'
			} )
			.get( 0 );

		// jQuery subverts script insertion into an AJAX + eval call which would break the whole point
		script.onload = $.proxy( deferred, 'resolve' );
		script.onerror = $.proxy( deferred, 'reject' );
		$( 'head' ).get( 0 ).appendChild( script );

		return deferred.promise();
	};

	mw.imageMetrics.CorsLogger = CorsLogger;
} ( mediaWiki, jQuery, OO ) );
