<?php
/**
 * Site search (search.html and the suggestions under the header search bar).
 * The search runs in the browser over the same data the pages use (js/search-index.js);
 * this tells js/main.js where the search page is and where to load the latest content from
 * (WordPress's /skrine-data/… once content is in wp-admin, else the design's own files).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_head', function () {
	$js  = get_template_directory_uri() . '/js/';
	$cfg = array(
		'root'  => home_url( '/' ),
		'page'  => home_url( 'search.html' ),
		'js'    => $js,
		'files' => array(
			'SKRINE_PEOPLE'       => skrine_data_url( 'people', 'people-data.js' ),
			'SKRINE_ALERTS'       => skrine_data_url( 'alerts', 'alerts-data.js' ),
			'SKRINE_ALERTS_FULL'  => skrine_data_url( 'alerts', 'alerts-full-data.js' ),
			'SKRINE_NEWS'         => skrine_data_url( 'news', 'news-data.js' ),
			'SKRINE_NEWS_FULL'    => skrine_data_url( 'news', 'news-full-data.js' ),
			'SKRINE_PUBLICATIONS' => skrine_data_url( 'publications', 'publications-data.js' ),
			'SKRINE_JOBS'         => skrine_data_url( 'jobs', 'jobs-data.js' ),
		),
	);
	echo '<script>window.SKRINE_SEARCH = ' . wp_json_encode( $cfg, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG ) . ";</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
}, 2 );

/* the results page is for visitors, not for search engines */
function skrine_is_search_page() {
	return is_page() && skrine_template_slug() === 'search';
}
add_filter( 'wp_robots', function ( $robots ) {
	if ( skrine_is_search_page() ) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
	}
	return $robots;
}, 20 );
add_filter( 'wpseo_robots', function ( $r ) {
	return skrine_is_search_page() ? 'noindex, follow' : $r;
} );
add_filter( 'rank_math/frontend/robots', function ( $r ) {
	if ( skrine_is_search_page() ) {
		$r['index']  = 'noindex';
		$r['follow'] = 'follow';
	}
	return $r;
} );
