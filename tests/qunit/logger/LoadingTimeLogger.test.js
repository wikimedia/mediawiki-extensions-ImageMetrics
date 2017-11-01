( function ( mw, $ ) {
	'use strict';

	QUnit.module( 'mw.imageMetrics.LoadingTimeLogger', QUnit.newMwEnvironment() );

	function createLoadingTimeLogger( sandbox, options ) {
		var logger,
			logEvent = sandbox.stub(),
			config = new mw.Map( false );

		config.set( options.config || {} );
		logger = new mw.imageMetrics.LoadingTimeLogger( options.samplingFactor, options.location || {}, config,
			options.geo || {}, { logEvent: logEvent }, options.performance || {} );

		options.logEvent = logEvent;
		return logger;
	}

	QUnit.test( 'Constructor sanity test', function ( assert ) {
		var logger = createLoadingTimeLogger( this.sandbox, {} );
		assert.equal( typeof logger, 'object', 'Object created' );
	} );

	QUnit.test( 'Minimal logging scenario', function ( assert ) {
		var data,
			options = {
				samplingFactor: 1,
				config: {}
			},
			logger = createLoadingTimeLogger( this.sandbox, options );
		$( '#qunit-fixture' ).append( '<div id="file"><img alt="Foo.jpg" /></div>' );
		mw.imageMetricsLoadTime = null; // mock - no need to clean up, not used elsewhere

		logger.collect();
		data = options.logEvent.firstCall.args[1];

		assert.strictEqual( data.samplingFactor, 1, 'samplingFactor is logged correctly' );
		assert.strictEqual( data.isHttps, false, 'isHttps is logged correctly' );
		assert.strictEqual( data.imageType, 'filepage-main', 'imageType is logged correctly' );
		assert.strictEqual( data.fileType, 'jpg', 'fileType is logged correctly' );
		assert.strictEqual( data.country, undefined, 'country is not logged when Geo object is not available' );
		assert.strictEqual( data.isAnon, true, 'isAnon is logged correctly' );
		assert.strictEqual( data.navigationType, undefined, 'navigationType is not logged when Navigation Timing API is not available' );
		assert.strictEqual( data.ownLoadingTime, undefined, 'ownLoadingTime is not logged when Resource Timing API is not available' );
		assert.strictEqual( data.fullLoadingTime, undefined, 'fullLoadingTime is not logged when Resource Timing API is not available' );
		assert.strictEqual( data.fallbackFullLoadingTime, undefined, 'fallbackFullLoadingTime is not logged when onload handler does not pass the value' );
		assert.strictEqual( data.fetchDelay, undefined, 'fetchDelay is not logged when Resource Timing API is not available' );

		options.config.wgUserId = 1;
		logger = createLoadingTimeLogger( this.sandbox, options );
		logger.collect();
		data = options.logEvent.firstCall.args[1];
		assert.strictEqual( data.isAnon, false, 'isAnon is logged correctly' );
	} );

	QUnit.test( 'Geo logging', function ( assert ) {
		var data,
			options = {
				samplingFactor: 1,
				geo: { country: 'London' }
			},
			logger = createLoadingTimeLogger( this.sandbox, options );
		$( '#qunit-fixture' ).append( '<div id="file"><img alt="Foo.jpg" /></div>' );

		logger.collect();
		data = options.logEvent.firstCall.args[1];

		assert.strictEqual( data.country, 'London', 'country is logged correctly' );
	} );

	// no test for onload time logging - it is set up in a head script, difficult to simulate

	QUnit.test( 'Navigation Timing logging', function ( assert ) {
		var data,
			options = {
				performance: { navigation: { type: 0 } },
				samplingFactor: 1
			},
			logger = createLoadingTimeLogger( this.sandbox, options );
		$( '#qunit-fixture' ).append( '<div id="file"><img alt="Foo.jpg" /></div>' );

		logger.collect();
		data = options.logEvent.firstCall.args[1];

		assert.strictEqual( data.navigationType, 'navigate', 'navigationType is logged correctly' );
	} );

	QUnit.test( 'Resource Timing logging', function ( assert ) {
		var data,
			options = {
				performance: { getEntriesByName: this.sandbox.stub().returns( [{
					duration: 111,
					startTime: 10111,
					responseStart: 10200,
					responseEnd: 10222
				}] ) },
				config: { wgImageMetricsSamplingFactor: 1 }
			},
			logger = createLoadingTimeLogger( this.sandbox, options );
		$( '#qunit-fixture' ).append( '<div id="file"><img alt="Foo.jpg" /></div>' );

		logger.collect();
		data = options.logEvent.firstCall.args[1];

		assert.strictEqual( data.ownLoadingTime, 111, 'ownLoadingTime is logged correctly' );
		assert.strictEqual( data.fullLoadingTime, 10222, 'fullLoadingTime is logged correctly' );
		assert.strictEqual( data.fetchDelay, 89, 'fetchDelay is logged correctly' );
	} );

	QUnit.test( 'No image, no logging', function ( assert ) {
		var options = {
				performance: { navigation: { type: 0 } },
				samplingFactor: 1
			},
			logger = createLoadingTimeLogger( this.sandbox, options );
		$( '#qunit-fixture' ).append( '<div id="file"></div>' );

		logger.collect();

		assert.strictEqual( options.logEvent.called, false, 'logEvent was not called' );
	} );
} ( mediaWiki, jQuery ) );
