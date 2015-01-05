( function ( mw ) {
	'use strict';

	QUnit.module( 'mw.imageMetrics.CorsLogger', QUnit.newMwEnvironment() );

	function createCorsLogger( sandbox, options ) {
		var logger,
			logEvent = sandbox.stub(),
			config = new mw.Map( options.config || {} );

		logger = new mw.imageMetrics.CorsLogger( options.samplingFactor, options.location || {}, config,
			options.geo || {}, { logEvent: logEvent } );

		options.logEvent = logEvent;
		return logger;
	}

	QUnit.test( 'Constructor sanity test', 1, function ( assert ) {
		var logger = createCorsLogger( this.sandbox, {} );
		assert.ok( logger, 'Object created' );
	} );

	QUnit.test( 'Minimal logging scenario', 10, function ( assert ) {
		var data,
			options = {
				samplingFactor: 1,
				config: {}
			},
			logger = createCorsLogger( this.sandbox, options );

		logger.collect();
		data = options.logEvent.firstCall.args[1];

		assert.strictEqual( data.samplingFactor, 1, 'samplingFactor is logged correctly' );
		assert.strictEqual( data.isHttps, false, 'isHttps is logged correctly' );
		assert.strictEqual( data.country, undefined, 'country is not logged when Geo object is not available' );
		assert.strictEqual( data.isAnon, true, 'isAnon is logged correctly' );
		// the feature tests are trivial, no point in mocking them
		assert.ok( 'xhrSupported' in data );
		assert.ok( 'xdomainSupported' in data );
		assert.ok( 'imgAttributeSupported' in data );
		assert.ok( 'scriptAttributeSupported' in data );
		assert.ok( 'scriptLoaded' in data );

		options.config.wgUserId = 1;
		logger = createCorsLogger( this.sandbox, options );
		logger.collect();
		data = options.logEvent.firstCall.args[1];
		assert.strictEqual( data.isAnon, false, 'isAnon is logged correctly' );
	} );

	QUnit.test( 'loadScriptViaCors() sanity test', 1, function ( assert ) {
		var logger = createCorsLogger( this.sandbox, {} ),
			promise = logger.loadScriptViaCors();
		assert.ok( 'then' in promise, 'loadScriptViaCors() runs successfully and returns a promise' );
	} );
} ( mediaWiki, jQuery ) );
