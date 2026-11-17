<?php
/**
 * Skrine theme
 *
 * inc/setup.php          pages on activation, ".html" links, design files, page templates
 * inc/content-types.php  People, Alerts, Publications, News, Upcoming Events, Deals and Jobs in wp-admin
 * inc/data.php           hands that content to the design's JavaScript
 * inc/home.php           home page sections built from that content (shortcodes)
 * inc/page-content.php   editable page wording
 * inc/layout.php         header and footer (Appearance → Menus, Appearance → Customize)
 * inc/jobs.php           Careers "Open roles" list, job applications (Jobs → Applications)
 * inc/seo.php            titles, descriptions, canonical links, sitemaps (with or without an SEO plugin)
 * inc/redirects.php      redirects from the old site's addresses, Skrine → Settings
 * inc/search.php         site search: where the search page and the latest content are
 * inc/alert-tools.php    Alerts: Import from Word, live preview, HTML editor
 * inc/importer.php       Skrine → Import: design content and media into WordPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SKRINE_VERSION', '2.2.0' );

require get_template_directory() . '/inc/pages.php';
require get_template_directory() . '/inc/page-meta.php';
require get_template_directory() . '/inc/menu-default.php';
require get_template_directory() . '/inc/redirect-data.php';
require get_template_directory() . '/inc/topic-map.php';
require get_template_directory() . '/inc/people-list.php';
require get_template_directory() . '/inc/setup.php';
require get_template_directory() . '/inc/content-types.php';
require get_template_directory() . '/inc/data.php';
require get_template_directory() . '/inc/home.php';
require get_template_directory() . '/inc/page-content.php';
require get_template_directory() . '/inc/layout.php';
require get_template_directory() . '/inc/jobs.php';
require get_template_directory() . '/inc/seo.php';
require get_template_directory() . '/inc/redirects.php';
require get_template_directory() . '/inc/search.php';
require get_template_directory() . '/inc/alert-tools.php';
require get_template_directory() . '/inc/importer.php';
