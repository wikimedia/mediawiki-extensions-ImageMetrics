/*!
 * JavaScript module for image-related metrics.
 * @see https://mediawiki.org/wiki/Extension:ImageMetrics
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $, oo ) {
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
	 * @class mw.imageMetrics.LoadingTimeLogger
	 * @extends mw.imageMetrics.Logger
	 * @constructor
	 * @param {number} samplingFactor sampling factor
	 * @param {Object} location window.location
	 * @param {Object} mwConfig mw.config
	 * @param {Object} geo window.Geo
	 * @param {Object} eventLog mw.eventLog
	 * @param {Object} performance window.performance
	 */
	function LoadingTimeLogger(
		/* inherited arguments */
		samplingFactor, location, mwConfig, geo, eventLog,
		/* custom arguments */
		performance
	) {
		LoadingTimeLogger.parent.call( this, samplingFactor, location, mwConfig, geo, eventLog );

		/** @property {Object} performance window.performance */
		this.performance = performance;
	}
	oo.inheritClass( LoadingTimeLogger, mw.imageMetrics.Logger );

	LoadingTimeLogger.prototype.schema = 'ImageMetricsLoadingTime';

	/**
	 * Factory function to take care of dependency injection.
	 *
	 * @static
	 * @param {number} samplingFactor sampling factor
	 * @return {mw.imageMetrics.LoadingTimeLogger}
	 */
	LoadingTimeLogger.create = function ( samplingFactor ) {
		// https://github.com/jscs-dev/jscs-jsdoc/issues/31
		// jscs:disable
		return new LoadingTimeLogger( samplingFactor, window.location, mw.config, window.Geo,
			mw.eventLog, window.performance );
		// jscs:enable
	};

	/**
	 * Installs the event handler which will perform the logging.
	 *
	 * @static
	 * @param {number} samplingFactor sampling factor
	 */
	LoadingTimeLogger.install = function ( samplingFactor ) {
		var logger = LoadingTimeLogger.create( samplingFactor );

		$( window ).load( function () {
			logger.collect();
		} );
	};

	/**
	 * Collects image metrics data and logs it via EventLogging.
	 */
	LoadingTimeLogger.prototype.collect = function () {
		var $file,
			data = {};

		data.imageType = 'filepage-main'; // the only supported measurement type ATM
		$file = $( '#file' ).find( 'img' ); // more efficient than '#file img'

		if ( !$file.length ) {
			return;
		}

		this.addNavigationTimingData( data );
		this.addResourceTimingData( data, $file );
		this.addOtherData( data, $file );

		this.log( data );
	};

	/**
	 * @property {Object<integer, string>} navigationTypes map of NavigationTiming.type constants to
	 *  human-readable strings
	 */
	LoadingTimeLogger.prototype.navigationTypes = {
		0: 'navigate',
		1: 'reload',
		2: 'back_forward'
	};

	/**
	 * Adds navigation type (reload, back etc) to the log data from the NavigationTiming API.
	 *
	 * @param {Object} data
	 */
	LoadingTimeLogger.prototype.addNavigationTimingData = function ( data ) {
		if ( this.performance.navigation && this.performance.navigation.type in this.navigationTypes ) {
			data.navigationType = this.navigationTypes[ this.performance.navigation.type ];
		}
	};

	/**
	 * Returns timing data about the given file.
	 * Requires ResourceTiming support - http://caniuse.com/resource-timing
	 *
	 * @param {jQuery} $file jQuery object containing the img element
	 * @return {PerformanceResourceTiming|boolean} timing object or false if not supported
	 */
	LoadingTimeLogger.prototype.getResourceTiming = function ( $file ) {
		var url, timing;

		if ( !this.performance || !this.performance.getEntriesByName ) {
			return false;
		}

		url = $file.prop( 'src' ); // attr() might be relative, prop() is always absolute
		timing = this.performance.getEntriesByName( url )[ 0 ];
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
	 *
	 * @param {Object} data
	 * @param {jQuery} $file jQuery object containing the img element
	 */
	LoadingTimeLogger.prototype.addResourceTimingData = function ( data, $file ) {
		var timing = this.getResourceTiming( $file );

		if ( timing ) {
			data.ownLoadingTime = timing.duration;
			data.fullLoadingTime = timing.responseEnd;
			data.fetchDelay = timing.responseStart ? ( timing.responseStart - timing.startTime ) : undefined;
		}
	};

	/**
	 * Adds non-ResourceTiming/NavigationTimning-based information.
	 *
	 * @param {Object} data
	 * @param {jQuery} $file jQuery object containing the img element
	 */
	LoadingTimeLogger.prototype.addOtherData = function ( data, $file ) {
		var navStart = this.performance && this.performance.timing && this.performance.timing.navigationStart;
		if ( $file.attr( 'alt' ) ) {
			data.fileType = $file.attr( 'alt' ).split( '.' ).pop();
		}
		if ( typeof mw.imageMetricsLoadTime === 'number' && navStart ) {
			data.fallbackFullLoadingTime = mw.imageMetricsLoadTime === 0 ? 0 : imageMetricsLoadTime - navStart;
		}
	};

	mw.imageMetrics.LoadingTimeLogger = LoadingTimeLogger;
}( mediaWiki, jQuery, OO ) );
