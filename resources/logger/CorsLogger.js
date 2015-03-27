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

		$.when(
			logger.loadScript( 'cors-test.js', true),
			logger.loadScript( 'non-cors-test.js' )
		).done( $.proxy( logger, 'collect' ) );
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
			scriptLoaded: this.mwConfig.get( 'wgImageMetricsCorsTestSucceeded', false ),
			sanityCheck: this.mwConfig.get( 'wgImageMetricsNonCorsTestSucceeded', false )
		} );
	};

	/**
	 * Loads a resource.
	 * @param {string} filename Name of the file
	 * @param {bool} [crossorigin] Use a crossorigin="anonymous" <script> attribute.
	 * @return {jQuery.Deferred}
	 */
	CorsLogger.prototype.loadScript = function ( filename, crossorigin ) {
		var script,
			deferred = $.Deferred();

		script = $( '<script>' )
			.attr( {
				type: 'text/javascript',
				crossorigin: crossorigin ? 'anonymous' : undefined,
				// this will not work if wgExtensionAssetsPath is a relative URL (which is the
				// default) but there is no need for CORS loading of assets in that case anyway
				src: this.mwConfig.get( 'wgExtensionAssetsPath' ) + '/ImageMetrics/resources/' + filename
			} )
			.get( 0 );

		// jQuery subverts script insertion into an AJAX + eval call which would break the whole point, so
		// we use native AJAX. Also, don't trust success/error handlers, some browsers treat them in weird
		// ways for CORS calls; we will check directly whether the script has executed.
		script.onload = $.proxy( deferred, 'resolve' );
		script.onerror = $.proxy( deferred, 'resolve' );
		$( 'head' ).get( 0 ).appendChild( script );

		return deferred.promise();
	};

	mw.imageMetrics.CorsLogger = CorsLogger;
} ( mediaWiki, jQuery, OO ) );
