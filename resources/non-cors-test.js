/**
 * Sanity test payload. This file should always load; its purpose is to detect unexpected
 * loading errors which would otherwise be logged as lack of CORS support.
 */
( function ( mw ) {
	'use strict';
	mw.config.set( 'wgImageMetricsNonCorsTestSucceeded', true );
} ( mediaWiki ) );
