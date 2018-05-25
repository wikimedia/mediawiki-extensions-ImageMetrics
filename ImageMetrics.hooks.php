<?php
/**
 * ImageMetrics extension
 *
 * @file
 * @ingroup Extensions
 *
 * @author Tisza Gergő <gtisza@wikimedia.org>
 *
 * @license GPL-2.0-or-later
 * @version 0.1.0
 */

class ImageMetricHooks {
	public static function onEventLoggingRegisterSchemas( array &$schemas ) {
		$schemas['ImageMetricsLoadingTime'] = 10078363;
	}

	/**
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 */
	public static function onBeforePageDisplay( &$out, &$skin ) {
		if ( $out->getTitle()->inNamespace( NS_FILE ) && Action::getActionName( $out->getContext() ) === 'view' ) {
			$out->addModules( [ 'ext.imageMetrics.head', 'ext.imageMetrics.loader' ] );
		}
		return true;
	}

	/**
	 * @param array $vars
	 * @return bool
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		global $wgImageMetricsSamplingFactor, $wgImageMetricsLoggedinSamplingFactor;
		$vars[ 'wgImageMetrics' ] = [
			'samplingFactor' => [
				'image' => $wgImageMetricsSamplingFactor,
				'imageLoggedin' => $wgImageMetricsLoggedinSamplingFactor,
			],
		];
		return true;
	}

	/**
	 * @param array $testModules
	 * @param ResourceLoader resourceLoader
	 * @return bool
	 */
	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.imageMetrics.tests'] = [
			'scripts' => [
				'tests/qunit/logger/LoadingTimeLogger.test.js',
			],
			'dependencies' => [
				'ext.imageMetrics',
			],
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'ImageMetrics',
			];
		return true;
	}
}
