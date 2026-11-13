<?php
/**
 * Skrine theme
 *
 * inc/setup.php          pages on activation, ".html" links, design files, page templates
 * inc/content-types.php  Alerts, Publications, News, Upcoming Events and Deals in wp-admin
 * inc/data.php           hands that content to the design's JavaScript
 * inc/home.php           home page sections built from that content (shortcodes)
 * inc/page-content.php   editable page wording
 * inc/importer.php       Skrine → Import: design content and media into WordPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SKRINE_VERSION', '2.0.0' );

require get_template_directory() . '/inc/pages.php';
require get_template_directory() . '/inc/topic-map.php';
require get_template_directory() . '/inc/people-list.php';
require get_template_directory() . '/inc/setup.php';
require get_template_directory() . '/inc/content-types.php';
require get_template_directory() . '/inc/data.php';
require get_template_directory() . '/inc/home.php';
require get_template_directory() . '/inc/page-content.php';
require get_template_directory() . '/inc/importer.php';
