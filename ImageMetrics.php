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

$wgMessagesDirs['ImageMetrics'] = __DIR__ . '/i18n';

$wgExtensionFunctions[] = function () {
	global $wgEventLoggingSchemas;
	$wgEventLoggingSchemas['ImageMetricsLoadingTime'] = 9673571;
};


$wgResourceModules += array(
	'ext.imageMetrics' => array(
		'scripts'       => 'ext.imageMetrics.js',
		'localBasePath' => __DIR__ . '/resources',
		'remoteExtPath' => 'ImageMetrics/resources',
		'dependencies'  => 'schema.ImageMetricsLoadingTime',
		'targets'       => array( 'desktop', 'mobile' ),
	),
	'ext.imageMetrics.head' => array(
		'scripts'       => 'ext.imageMetrics.head.js',
		'localBasePath' => __DIR__ . '/resources',
		'remoteExtPath' => 'ImageMetrics/resources',
		'targets'       => array( 'desktop', 'mobile' ),
	    'position'      => 'top',
	),
);

/**
 * @param OutputPage $out
 * @param Skin $skin
 * @return bool
 */
$wgHooks['BeforePageDisplay'][] = function ( &$out, &$skin ) {
	if ( $out->getTitle()->inNamespace( NS_FILE ) && Action::getActionName( $out->getContext() ) === 'view' ) {
		$out->addModules( array( 'ext.imageMetrics.head', 'ext.imageMetrics' ) );
	}
	return true;
};

/**
 * @param array $vars
 * @return bool
 */
$wgHooks[ 'ResourceLoaderGetConfigVars' ][] = function ( &$vars ) {
	global $wgImageMetricsSamplingFactor;
	$vars[ 'wgImageMetricsSamplingFactor' ] = $wgImageMetricsSamplingFactor;
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
			'tests/qunit/ext.imageMetrics.test.js',
		),
		'localBasePath' => __DIR__,
		'remoteExtPath' => 'ImageMetrics',
	);
	return true;
};
