ImageMetrics
------------

ImageMetrics is a MediaWiki extension for logging various image-related
frontend metrics such as loading speed. It requires MediaWiki 1.25+.

Sample configuration:

```
wfLoadExtension( 'EventLogging' ); // dependency
wfLoadExtension( 'ImageMetrics' );
$wgImageMetricsSamplingFactor = 1000; // log 1:1000 requests
```

If your images are served from a different domain, you might want to add a `Timing-Allow-Origin: *` header
to them to get more accurate performance data.

For more information, see the extension's documentation on MediaWiki.org:

https://www.mediawiki.org/wiki/Extension:ImageMetrics
