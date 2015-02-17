/**
 * CORS test payload. This file will not load if the user has a CORS-supporting browser and a
 * proxy that strips CORS headers.
 */
( function ( mw ) {
	'use strict';
	mw.config.set( 'wgImageMetricsCorsTestSucceeded', true );
} ( mediaWiki ) );
