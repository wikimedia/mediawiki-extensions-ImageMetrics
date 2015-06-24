/*jshint node:true */
module.exports = function ( grunt ) {
	'use strict';
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'resources/**/*.js'
			]
		}
	} );

	grunt.registerTask( 'test', [ 'jshint' ] );
	grunt.registerTask( 'default', 'test' );
};
