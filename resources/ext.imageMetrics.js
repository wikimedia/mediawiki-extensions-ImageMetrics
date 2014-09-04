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
	 * @class PerformanceResourceTiming
	 * See http://www.w3.org/TR/resource-timing/#performanceresourcetiming
	 * @property {number} duration time it took to load the resource, in ms. (This is from when the browser
	 *  started to load that image specifically, not from when it started to load the page.)
	 * @property {number} responseEnd time at which the loading of the resource ends, relative to start of
	 *  the page load.
	 */

	/**
	 * @class ImageMetrics
	 * @constructor
	 * @param {Object} performance window.performance
	 * @param {Object} location window.location
	 * @param {Object} mwConfig mw.config
	 * @param {Object} geo window.Geo
	 * @param {Object} eventLog mw.eventLog
	 */
	function ImageMetrics( performance, location, mwConfig, geo, eventLog ) {
		/** @property {Object} performance window.performance */
		this.performance = performance;

		/** @property {Object} location window.location */
		this.location = location;

		/** @property {Object} mwConfig mw.config */
		this.mwConfig = mwConfig;

		/** @property {Object} geo window.Geo */
		this.geo = geo;

		/** @property {Object} eventLog mw.eventLog */
		this.eventLog = eventLog;
	}

	/**
	 * Factory function to take care of dependency injection.
	 * @static
	 * @return {ImageMetrics}
	 */
	ImageMetrics.create = function() {
		return new ImageMetrics( window.performance, window.location, mw.config, window.Geo, mw.eventLog );
	};

	/**
	 * Installs the event handler which will perform the logging.
	 * @static
	 */
	ImageMetrics.install = function() {
		var imageMetrics = ImageMetrics.create();

		$( window ).load( function () {
			imageMetrics.log();
		} );
	};

	/**
	 * @property {Object<integer, string>} navigationTypes map of NavigationTiming.type constants to
	 *  human-readable strings
	 */
	ImageMetrics.prototype.navigationTypes = {
		0: 'navigate',
		1: 'reload',
		2: 'back_forward'
	};

	/**
	 * Adds information provided by MediaWiki.
	 * @param {Object} data
	 * @param {jQuery} $file jQuery object containing the img element
	 */
	ImageMetrics.prototype.addMediaWikiData = function ( data, $file ) {
		data.fileType = $file.attr( 'alt' ).split( '.' ).pop();
		if ( this.geo && typeof this.geo.country === 'string' ) {
			data.country = this.geo.country;
		}
		data.isAnon = this.mwConfig.get( 'wgUserId' ) === null;
	};

	/**
	 * Adds timing data from the image onload event.
	 * @param {Object} data
	 */
	ImageMetrics.prototype.addOnloadData = function ( data ) {
		data.fallbackFullLoadingTime = mw.imageMetricsLoadTime;
	};

	/**
	 * Adds navigation type (reload, back etc) to the log data from the NavigationTiming API.
	 * @param {Object} data
	 */
	ImageMetrics.prototype.addNavigationTimingData = function ( data ) {
		if ( this.performance.navigation && this.performance.navigation.type in this.navigationTypes ) {
			data.navigationType = this.navigationTypes[this.performance.navigation.type];
		}
	};

	/**
	 * Returns timing data about the given file.
	 * Requires ResourceTiming support - http://caniuse.com/resource-timing
	 * @param {jQuery} $file jQuery object containing the img element
	 * @return {PerformanceResourceTiming|boolean} timing object or false if not supported
	 */
	ImageMetrics.prototype.getResourceTiming = function ( $file ) {
		var url, timing;

		if ( !this.performance || !this.performance.getEntriesByName ) {
			return false;
		}

		url = $file.prop( 'src' ); // attr() might be relative, prop() is always absolute
		timing = this.performance.getEntriesByName( url )[0];
		if ( !timing ) {
			return false;
		}

		return timing;
	};

	/**
	 * Adds loading times to the log data from the ResourceTiming API.
	 * Adds three fields:
	 * - ownLoadingTime: net time it took the browser to load the image (PerformanceResourceTiming.duration)
	 * - fullLoadingTime: total time from opening the page to finishing the image load  (PerformanceResourceTiming.responseEnd)
	 * - fetchDelay: time between requesting the image and receiving the first byte (might be missing)
	 * @param {Object} data
	 * @param {jQuery} $file jQuery object containing the img element
	 */
	ImageMetrics.prototype.addResourceTimingData = function ( data, $file ) {
		var timing = this.getResourceTiming( $file );

		if ( timing ) {
			data.ownLoadingTime = timing.duration;
			data.fullLoadingTime = timing.responseEnd;
			data.fetchDelay = timing.responseStart ? ( timing.responseStart - timing.startTime ) : null;
		}
	};

	/**
	 * Collects image metrics data and logs it via EventLogging.
	 */
	ImageMetrics.prototype.log = function() {
		var $file,
			data = {};

		data.samplingFactor = this.mwConfig.get( 'wgImageMetricsSamplingFactor' );

		data.isHttps = this.location.protocol === 'https:';

		data.imageType = 'filepage-main'; // the only supported measurement type ATM
		$file = $( '#file' ).find( 'img' ); // more efficient than '#file img'

		this.addMediaWikiData( data, $file );
		this.addOnloadData( data );
		this.addNavigationTimingData( data );
		this.addResourceTimingData( data, $file );

		this.eventLog.logEvent( 'ImageMetricsLoadingTime', data );
	};

	mw.ImageMetrics = ImageMetrics;
} ( mediaWiki, jQuery ) );
