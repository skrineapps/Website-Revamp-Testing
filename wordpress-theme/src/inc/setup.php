<?php
/**
 * Pages on activation, ".html" links, design files served from the theme, page templates.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ---------- pages on activation ---------- */
function skrine_activate() {
	$home = get_page_by_path( 'home' );
	$home_id = $home ? $home->ID : wp_insert_post(
		array( 'post_title' => 'Home', 'post_name' => 'home', 'post_type' => 'page', 'post_status' => 'publish' )
	);
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $home_id );

	foreach ( skrine_pages() as $slug => $title ) {
		if ( ! get_page_by_path( $slug ) ) {
			wp_insert_post( array( 'post_title' => $title, 'post_name' => $slug, 'post_type' => 'page', 'post_status' => 'publish' ) );
		}
	}

	skrine_register_content_types();
	skrine_rewrites();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'skrine_activate' );

// a theme update (new version) also needs fresh rewrite rules
add_action( 'admin_init', function () {
	if ( get_option( 'skrine_theme_version' ) !== SKRINE_VERSION ) {
		skrine_activate();
		update_option( 'skrine_theme_version', SKRINE_VERSION );
	}
} );

/* ---------- "people.html" -> the People page ---------- */
function skrine_rewrites() {
	add_rewrite_rule( '^index\.html$', 'index.php', 'top' );
	add_rewrite_rule( '^([a-z0-9-]+)\.html$', 'index.php?pagename=$matches[1]', 'top' );
}
add_action( 'init', 'skrine_rewrites' );

// keep the .html address (and its ?query) instead of redirecting to /slug/
add_filter( 'redirect_canonical', function ( $redirect, $requested ) {
	return preg_match( '#\.html(\?|$)#', $requested ) ? false : $redirect;
}, 10, 2 );

/* ---------- design files requested from the site root ----------
 * JavaScript builds paths like "images/news/x.jpg" or "../current design/images/people/x.png";
 * with <base> at the site root these arrive here and are served from the theme folder. */
function skrine_serve_assets() {
	$path = rawurldecode( (string) wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) );
	$home = rtrim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && strpos( $path, $home ) === 0 ) {
		$path = substr( $path, strlen( $home ) );
	}
	$path = ltrim( $path, '/' );
	$map  = array(
		'current design/images/people/' => 'people/',
		'new design/'                   => '',
		'css/'                          => 'css/',
		'js/'                           => 'js/',
		'images/'                       => 'images/',
	);
	foreach ( $map as $from => $to ) {
		if ( strpos( $path, $from ) !== 0 ) {
			continue;
		}
		$rel  = $to . substr( $path, strlen( $from ) );
		$base = realpath( get_template_directory() );
		$file = realpath( $base . '/' . $rel );
		if ( ! $file || strpos( $file, $base ) !== 0 || ! is_file( $file ) || preg_match( '/\.php$/i', $file ) ) {
			return;
		}
		$types = array( 'css' => 'text/css', 'js' => 'application/javascript', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'gif' => 'image/gif', 'webp' => 'image/webp', 'svg' => 'image/svg+xml', 'pdf' => 'application/pdf' );
		$ext   = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );
		if ( ! isset( $types[ $ext ] ) ) {
			return;
		}
		status_header( 200 );
		header( 'Content-Type: ' . $types[ $ext ] );
		header( 'Content-Length: ' . filesize( $file ) );
		header( 'Cache-Control: public, max-age=604800' );
		readfile( $file );
		exit;
	}
}
add_action( 'init', 'skrine_serve_assets', 0 );

/* ---------- always use the design template for the design's own pages ----------
 * Other pages stay free to use Elementor or any page template. */
add_filter( 'template_include', function ( $template ) {
	if ( is_front_page() ) {
		return get_template_directory() . '/front-page.php';
	}
	if ( is_page() ) {
		$slug = get_post_field( 'post_name', get_queried_object_id() );
		$file = get_template_directory() . '/page-' . $slug . '.php';
		if ( $slug && file_exists( $file ) ) {
			return $file;
		}
	}
	return $template;
}, 99 );

/* ---------- tidy up ---------- */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'post-thumbnails' );
} );
// the design pages carry their own <title>
remove_action( 'wp_head', '_wp_render_title_tag', 1 );
