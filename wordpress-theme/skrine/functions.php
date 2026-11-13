<?php
/**
 * Skrine (New Design) — proof-of-concept theme.
 *
 * - Loads the design's CSS/JS from /assets unchanged (home.js gets a small path tweak at build time).
 * - Every homepage section is editable:
 *     lists   -> admin menus: News, Legal Updates, Deals, Spotlight, Awards   (inc/content-types.php)
 *     the rest -> Appearance > Customize > Skrine Pages                       (inc/customizer.php)
 * - Alerts: /alerts/ list and /alerts/<name>/ pages drawn by the design's own scripts (inc/alerts.php).
 * - Tools > Import Skrine Content fills everything with the design's current content (inc/import.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SKRINE_VERSION', '0.3.0' );

function skrine_asset( $path ) {
	return get_template_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

require get_template_directory() . '/inc/content-types.php';
require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/import.php';
require get_template_directory() . '/inc/alerts.php';

/* ---------------------------------------------------------------
   Theme setup
   --------------------------------------------------------------- */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'script', 'style' ) );
} );

// New post type URLs need a rewrite flush once, when the theme is switched on.
add_action( 'after_switch_theme', function () {
	flush_rewrite_rules();
} );

/* ---------------------------------------------------------------
   Styles and scripts — the same files the static site uses
   --------------------------------------------------------------- */
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'skrine-fonts', 'https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700;900&display=swap', array(), null );
	wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css', array(), '6.5.0' );
	wp_enqueue_style( 'skrine-style', skrine_asset( 'css/style.css' ), array(), SKRINE_VERSION );

	wp_enqueue_script( 'skrine-main', skrine_asset( 'js/main.js' ), array(), SKRINE_VERSION, true );
	// Where the design's scripts find images, and where a lawyer's name links to.
	wp_add_inline_script( 'skrine-main', 'window.SKRINE_BASE=' . wp_json_encode( skrine_asset( '' ) ) . ';window.SKRINE_PROFILE_URL=' . wp_json_encode( home_url( '/profile/?p=' ) ) . ';', 'before' );

	// News list and story pages reuse the design's insights/article/home styles.
	if ( is_post_type_archive( 'skrine_news' ) || is_tax( 'skrine_news_cat' ) || is_singular( 'skrine_news' ) ) {
		wp_enqueue_style( 'skrine-insights', skrine_asset( 'css/insights.css' ), array( 'skrine-style' ), SKRINE_VERSION );
		wp_enqueue_style( 'skrine-article', skrine_asset( 'css/article.css' ), array( 'skrine-insights' ), SKRINE_VERSION );
		wp_enqueue_style( 'skrine-home', skrine_asset( 'css/home.css' ), array( 'skrine-style' ), SKRINE_VERSION );
	}

	if ( is_front_page() ) {
		wp_enqueue_style( 'skrine-home', skrine_asset( 'css/home.css' ), array( 'skrine-style' ), SKRINE_VERSION );
		wp_enqueue_script( 'skrine-globe-land', skrine_asset( 'js/globe-land.js' ), array(), SKRINE_VERSION, true );
		wp_enqueue_script( 'skrine-home', skrine_asset( 'js/home.js' ), array( 'skrine-main', 'skrine-globe-land' ), SKRINE_VERSION, true );

		// Hand home.js its content from WordPress, in the same shape as the design's data files.
		$config = array(
			'SKRINE_BASE'     => skrine_asset( '' ),
			'SKRINE_NEWS_URL' => get_post_type_archive_link( 'skrine_news' ),
			'SKRINE_NEWS'     => skrine_news_for_js( 5 ),
			'SKRINE_UPCOMING' => array(),
			'SKRINE_DEALS'    => skrine_deals_for_js(),
		);
		$js = '';
		foreach ( $config as $name => $value ) {
			$js .= 'window.' . $name . '=' . wp_json_encode( $value ) . ';';
		}
		wp_add_inline_script( 'skrine-home', $js, 'before' );
	}
}, 20 );

// The theme doesn't use the block editor's front-end styles; they would only add CSS the design never had.
add_action( 'wp_enqueue_scripts', function () {
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'classic-theme-styles' );
	wp_dequeue_style( 'global-styles' );
}, 100 );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

add_action( 'wp_head', function () {
	// Keep the fixed header below the WordPress admin bar when logged in.
	if ( is_admin_bar_showing() ) {
		echo "<style>.admin-bar .site-header{top:32px}@media (max-width:782px){.admin-bar .site-header{top:46px}}</style>\n";
	}
	if ( ! has_site_icon() ) {
		printf( '<link rel="icon" type="image/png" sizes="32x32" href="%s">' . "\n", esc_url( skrine_asset( 'images/favicon-32.png' ) ) );
		printf( '<link rel="icon" type="image/png" sizes="192x192" href="%s">' . "\n", esc_url( skrine_asset( 'images/favicon-192.png' ) ) );
		printf( '<link rel="apple-touch-icon" sizes="180x180" href="%s">' . "\n", esc_url( skrine_asset( 'images/apple-touch-icon.png' ) ) );
	}
	// Leave the description to Rank Math when it is active.
	if ( is_front_page() && ! defined( 'RANK_MATH_VERSION' ) ) {
		echo '<meta name="description" content="' . esc_attr( get_bloginfo( 'description' ) ) . '">' . "\n";
	}
} );

/* ---------------------------------------------------------------
   Data for home.js
   --------------------------------------------------------------- */

/** Latest news, in the shape home.js expects from news-data.js. */
function skrine_news_for_js( $count ) {
	$out = array();
	foreach ( skrine_items( 'skrine_news', $count ) as $p ) {
		$terms = get_the_terms( $p, 'skrine_news_cat' );
		$out[] = array(
			'title'    => html_entity_decode( skrine_title( $p ), ENT_QUOTES, 'UTF-8' ),
			'date'     => get_the_date( 'Y-m-d', $p ),
			'category' => ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : '',
			'image'    => skrine_image_url( $p ),
			'summary'  => html_entity_decode( wp_strip_all_tags( get_the_excerpt( $p ) ), ENT_QUOTES, 'UTF-8' ),
			'url'      => get_permalink( $p ),
			'people'   => array(),
		);
	}
	return $out;
}

/** Deals, in the shape of the DEALS list in home.js. */
function skrine_deals_for_js() {
	$out = array();
	foreach ( skrine_items( 'skrine_deal' ) as $p ) {
		$out[] = array(
			'sector'   => skrine_meta( $p, 'sector' ),
			'num'      => skrine_meta( $p, 'num' ),
			'unit'     => skrine_meta( $p, 'unit' ),
			'label'    => skrine_meta( $p, 'label' ),
			'headline' => html_entity_decode( skrine_title( $p ), ENT_QUOTES, 'UTF-8' ),
			'summary'  => $p->post_excerpt,
			'team'     => skrine_meta( $p, 'team' ),
			'date'     => skrine_meta( $p, 'date_label' ),
			'img'      => skrine_image_url( $p ),
		);
	}
	return $out;
}
