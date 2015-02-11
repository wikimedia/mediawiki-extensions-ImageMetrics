/**
 * JavaScript module for image-related metrics.
 * @see https://mediawiki.org/wiki/Extension:Logger
 *
 * @licence GNU GPL v2 or later
 * @author Tisza Gergő <gtisza@wikimedia.org>
 */
( function ( mw, $ ) {
	'use strict';

	/**
	 * Abstract parent class for metrics tasks.
	 * @class mw.imageMetrics.Logger
	 * @constructor
	 * @param {number} samplingFactor sampling factor
	 * @param {Object} location window.location
	 * @param {Object} mwConfig mw.config
	 * @param {Object} geo window.Geo
	 * @param {Object} eventLog mw.eventLog
	 */
	function Logger( samplingFactor, location, mwConfig, geo, eventLog ) {
		this.samplingFactor = samplingFactor;

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
	 * EventLogging schema name.
	 * @type {string}
	 */
	Logger.prototype.schema = null;

	/**
	 * Factory function to take care of dependency injection.
	 * @static
	 * @param {number} samplingFactor sampling factor
	 * @return {mw.imageMetrics.Logger}
	 */
	Logger.create = function( samplingFactor ) {
		return new Logger( samplingFactor, window.location, mw.config, window.Geo, mw.eventLog );
	};

	/**
	 * Collects image metrics data and logs it via EventLogging.
	 */
	Logger.prototype.log = function( data ) {
		data = $.extend( {}, data );
		data.samplingFactor = this.samplingFactor;
		data.isHttps = this.location.protocol === 'https:';
		data.isAnon = this.mwConfig.get( 'wgUserId' ) === null;
		if ( this.geo && typeof this.geo.country === 'string' ) {
			data.country = this.geo.country;
		}

		this.eventLog.logEvent( this.schema, data );
	};

	mw.imageMetrics = {};
	mw.imageMetrics.Logger = Logger;
} ( mediaWiki, jQuery ) );
