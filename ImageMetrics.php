<?php
/**
 * ImageMetrics extension
 *
 * @file
 * @ingroup Extensions
 *
 * @author Tisza Gergő <gtisza@wikimedia.org>
 *
 * @license GPL v2 or later
 * @version 0.1.0
 */

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'ImageMetrics',
	'version' => '0.1.0',
	'url' => 'https://www.mediawiki.org/wiki/Extension:ImageMetrics',
	'author' => array(
		'Tisza Gergő',
	),
	'descriptionmsg' => 'imagemetrics-desc',
    'license-name' => 'GPL-2.0+',
);

/** @var int|bool: If set, logs once per this many requests. False if unset. **/
$wgImageMetricsSamplingFactor = false;

/** @var int|bool: If set, logs once per this many requests for logged-in users. False if unset. **/
$wgImageMetricsLoggedinSamplingFactor = false;

/** @var int|bool: If set, tests and logs CORS support once per this many requests. False if unset. **/
$wgImageMetricsCorsSamplingFactor = false;

$wgMessagesDirs['ImageMetrics'] = __DIR__ . '/i18n';

$wgHooks['EventLoggingRegisterSchemas'][] = function( array &$schemas ) {
	$schemas['ImageMetricsLoadingTime'] = 10078363;
	$schemas['ImageMetricsCorsSupport'] = 11686678;
};


$wgResourceModules += array(
	'ext.imageMetrics' => array(
		'scripts'       => array(
			'logger/Logger.js',
			'logger/LoadingTimeLogger.js',
			'logger/CorsLogger.js',
		),
		'localBasePath' => __DIR__ . '/resources',
		'remoteExtPath' => 'ImageMetrics/resources',
		'dependencies'  => array(
			'oojs',
			'schema.ImageMetricsLoadingTime',
			'schema.ImageMetricsCorsSupport',
		),
		'targets'       => array( 'desktop', 'mobile' ),
	),
	'ext.imageMetrics.head' => array(
		'scripts'       => 'head.js',
		'localBasePath' => __DIR__ . '/resources',
		'remoteExtPath' => 'ImageMetrics/resources',
		'targets'       => array( 'desktop', 'mobile' ),
	    'position'      => 'top',
	),
	'ext.imageMetrics.loader' => array(
		'scripts'       => 'loader.js',
		'localBasePath' => __DIR__ . '/resources',
		'remoteExtPath' => 'ImageMetrics/resources',
		'targets'       => array( 'desktop', 'mobile' ),
	),
);

/**
 * @param OutputPage $out
 * @param Skin $skin
 * @return bool
 */
$wgHooks['BeforePageDisplay'][] = function ( &$out, &$skin ) {
	if ( Action::getActionName( $out->getContext() ) === 'view' ) {
		$out->addModules( array( 'ext.imageMetrics.head', 'ext.imageMetrics.loader' ) );
	}
	return true;
};

/**
 * @param array $vars
 * @return bool
 */
$wgHooks[ 'ResourceLoaderGetConfigVars' ][] = function ( &$vars ) {
	global $wgImageMetricsSamplingFactor, $wgImageMetricsLoggedinSamplingFactor, $wgImageMetricsCorsSamplingFactor;
	$vars[ 'wgImageMetrics' ] = array(
		'samplingFactor' => array(
			'image' => $wgImageMetricsSamplingFactor,
			'imageLoggedin' => $wgImageMetricsLoggedinSamplingFactor,
			'cors' => $wgImageMetricsCorsSamplingFactor,
		),
	);
	return true;
};

/**
 * @param array $testModules
 * @param ResourceLoader resourceLoader
 * @return bool
 */
$wgHooks['ResourceLoaderTestModules'][] = function ( array &$testModules, ResourceLoader &$resourceLoader ) {
	$testModules['qunit']['ext.imageMetrics.tests'] = array(
		'scripts' => array(
			'tests/qunit/logger/LoadingTimeLogger.test.js',
			'tests/qunit/logger/CorsLogger.test.js',
		),
		'dependencies' => array(
			'ext.imageMetrics',
		),
		'localBasePath' => __DIR__,
		'remoteExtPath' => 'ImageMetrics',
	);
	return true;
};
