<?php
/**
 * Alerts: the /alerts/ list page and each alert's own page.
 *
 * The design's alerts.js and alert-page.js still draw both pages. WordPress
 * gives them their data in the same shape as alerts-data.js and
 * alerts-full-data.js, so the pages look and behave exactly as designed.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Same rule as slugify() in the design's JS, so links like alert.html?a=<slug> map to /alerts/<slug>/. */
function skrine_slugify( $s ) {
	$s = strtolower( remove_accents( (string) $s ) );
	$s = preg_replace( "/[’'.]/u", '', $s );
	$s = trim( preg_replace( '/[^a-z0-9]+/', '-', $s ), '-' );
	return rtrim( substr( $s, 0, 80 ), '-' );
}

/** Authors meta (one per line) as a list. */
function skrine_alert_authors( $post ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) skrine_meta( $post, 'authors' ) ) ) ) );
}

/** "A", "A and B", "A, B and C" — the way the design shows author credits. */
function skrine_join_names( $names ) {
	if ( count( $names ) < 2 ) {
		return $names ? $names[0] : null;
	}
	$last = array_pop( $names );
	return implode( ', ', $names ) . ' and ' . $last;
}

function skrine_alert_topic( $post ) {
	$terms = get_the_terms( $post, 'skrine_alert_topic' );
	return ( $terms && ! is_wp_error( $terms ) ) ? html_entity_decode( $terms[0]->name, ENT_QUOTES, 'UTF-8' ) : null;
}

function skrine_plain( $s ) {
	return html_entity_decode( wp_strip_all_tags( (string) $s ), ENT_QUOTES, 'UTF-8' );
}

/** One alert in the shape of an entry in alerts-data.js (plus its URL, photo and "has full text"). */
function skrine_alert_item( $p ) {
	$excerpt = skrine_plain( $p->post_excerpt );
	$text    = skrine_plain( $p->post_content );
	return array(
		'title'    => skrine_plain( skrine_title( $p ) ),
		'label'    => skrine_meta( $p, 'label' ) ?: null,
		'date'     => get_the_date( 'Y-m-d', $p ),
		'topic'    => skrine_alert_topic( $p ),
		'practice' => skrine_meta( $p, 'practice' ) ?: null,
		'authors'  => skrine_join_names( skrine_alert_authors( $p ) ),
		'excerpt'  => $excerpt,
		'url'      => get_permalink( $p ),
		'image'    => skrine_image_url( $p ) ?: null,
		// "Read full story" only when the article is more than its summary
		'full'     => mb_strlen( $text ) > mb_strlen( $excerpt ) + 80,
	);
}

/** Every published alert, newest first. */
function skrine_alerts_for_js() {
	return array_map( 'skrine_alert_item', get_posts( array(
		'post_type'      => 'skrine_alert',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'DESC',
	) ) );
}

/** One alert in the shape of an entry in alerts-full-data.js. */
function skrine_alert_full( $p ) {
	$notes = array();
	foreach ( array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) skrine_meta( $p, 'notes' ) ) ) ) ) as $i => $html ) {
		$notes[] = array( 'n' => $i + 1, 'html' => $html );
	}
	return array(
		'slug'     => $p->post_name,
		'title'    => skrine_plain( skrine_title( $p ) ),
		'label'    => skrine_meta( $p, 'label' ) ?: null,
		'date'     => get_the_date( 'Y-m-d', $p ),
		'topic'    => skrine_alert_topic( $p ),
		'practice' => skrine_meta( $p, 'practice' ) ?: null,
		'authors'  => array_map( function ( $n ) { return array( 'name' => $n ); }, skrine_alert_authors( $p ) ),
		'body'     => array( apply_filters( 'the_content', $p->post_content ) ),
		'notes'    => $notes,
		'url'      => get_permalink( $p ),
	);
}

/* ---------------------------------------------------------------
   Scripts for the two pages
   --------------------------------------------------------------- */
add_action( 'wp_enqueue_scripts', function () {
	$list   = is_post_type_archive( 'skrine_alert' );
	$single = is_singular( 'skrine_alert' );
	if ( ! $list && ! $single ) {
		return;
	}
	wp_enqueue_style( 'skrine-insights', skrine_asset( 'css/insights.css' ), array( 'skrine-style' ), SKRINE_VERSION );

	if ( $list ) {
		wp_enqueue_script( 'skrine-topic-images', skrine_asset( 'js/topic-images.js' ), array( 'skrine-main' ), SKRINE_VERSION, true );
		wp_enqueue_script( 'skrine-alerts', skrine_asset( 'js/alerts.js' ), array( 'skrine-topic-images' ), SKRINE_VERSION, true );
		wp_add_inline_script( 'skrine-alerts', 'window.SKRINE_ALERTS=' . wp_json_encode( skrine_alerts_for_js() ) . ';window.SKRINE_ALERTS_FULL={};', 'before' );
		return;
	}

	// Single alert: its full content, plus the alerts either side of it for "Previous / Next".
	$post = get_queried_object();
	$full = array( $post->post_name => skrine_alert_full( $post ) );
	foreach ( array( true, false ) as $previous ) {
		$adjacent = get_adjacent_post( false, '', $previous );
		if ( $adjacent ) {
			$full[ $adjacent->post_name ] = array(
				'title' => skrine_plain( skrine_title( $adjacent ) ),
				'date'  => get_the_date( 'Y-m-d', $adjacent ),
				'url'   => get_permalink( $adjacent ),
			);
		}
	}

	wp_enqueue_style( 'skrine-article', skrine_asset( 'css/article.css' ), array( 'skrine-insights' ), SKRINE_VERSION );
	wp_enqueue_script( 'skrine-people-data', skrine_asset( 'js/people-data.js' ), array(), SKRINE_VERSION, true );
	wp_enqueue_script( 'skrine-profiles-data', skrine_asset( 'js/profiles-data.js' ), array(), SKRINE_VERSION, true );
	wp_enqueue_script( 'skrine-article-common', skrine_asset( 'js/article-common.js' ), array( 'skrine-main', 'skrine-people-data', 'skrine-profiles-data' ), SKRINE_VERSION, true );
	wp_enqueue_script( 'skrine-alert-page', skrine_asset( 'js/alert-page.js' ), array( 'skrine-article-common' ), SKRINE_VERSION, true );
	wp_add_inline_script( 'skrine-alert-page',
		'window.SKRINE_ALERT_SLUG=' . wp_json_encode( $post->post_name ) . ';' .
		'window.SKRINE_ALERTS=' . wp_json_encode( skrine_alerts_for_js() ) . ';' .
		'window.SKRINE_ALERTS_FULL=' . wp_json_encode( $full ) . ';' .
		'window.SKRINE_ALERT_DISCLAIMER=' . wp_json_encode( skrine_sanitize_inline_html( skrine_mod( 'alerts_disclaimer' ) ) ) . ';',
		'before' );
}, 30 );
