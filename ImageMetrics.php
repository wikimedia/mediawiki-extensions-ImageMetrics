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

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'ImageMetrics' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['ImageMetrics'] = __DIR__ . '/i18n';
	/*wfWarn(
		'Deprecated PHP entry point used for ImageMetrics extension. Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);*/
	return;
} else {
	die( 'This version of the ImageMetrics extension requires MediaWiki 1.25+' );
}
