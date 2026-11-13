<?php
/**
 * Home page sections built from wp-admin content. Used as shortcodes in the Home page wording:
 *   [skrine_legal_updates]  the 8 latest Alerts (Legal Updates carousel)
 *   [skrine_spotlight]      Alerts and Publications ticked "Show in Spotlight" (latest fill any gaps)
 *   [skrine_deals]          Deals, in their "Order"
 * Until there is content in WordPress, each shows the design's original markup.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function skrine_part( $name ) {
	$file = get_template_directory() . '/content/parts/' . $name . '.html';
	return file_exists( $file ) ? file_get_contents( $file ) : '';
}

function skrine_short_date( $post ) {
	return get_the_date( 'd M Y', $post );
}

/* a photo for an alert: its featured image, else one picked from the title / topic (as js/topic-images.js) */
function skrine_alert_image( $post ) {
	$img = skrine_thumb( $post->ID );
	if ( $img ) {
		return $img;
	}
	$title = $post->post_title;
	foreach ( skrine_topic_keywords() as $rule ) {
		if ( preg_match( $rule[0], $title ) ) {
			return get_template_directory_uri() . '/' . $rule[1];
		}
	}
	$topics = skrine_topic_images();
	foreach ( array( skrine_term( $post->ID, 'skrine_topic' ), skrine_meta( $post->ID, 'practice' ) ) as $k ) {
		$k = strtolower( $k );
		if ( isset( $topics[ $k ] ) ) {
			return get_template_directory_uri() . '/' . $topics[ $k ];
		}
	}
	return get_template_directory_uri() . '/images/practice/corporate.jpg';
}

function skrine_alert_href( $post ) {
	return trim( $post->post_content ) !== '' ? 'alert.html?a=' . rawurlencode( skrine_slugify( $post->post_title ) ) : 'alerts.html';
}

/* ---------- Legal Updates carousel ---------- */
add_shortcode( 'skrine_legal_updates', function () {
	if ( ! skrine_type_ready( 'skrine_alert' ) ) {
		return skrine_part( 'legal-updates' );
	}
	$posts = get_posts( array( 'post_type' => 'skrine_alert', 'post_status' => 'publish', 'numberposts' => 8, 'orderby' => 'date', 'order' => 'DESC' ) );
	$out   = '';
	foreach ( $posts as $i => $p ) {
		$tag  = skrine_meta( $p->ID, 'practice' ) ?: skrine_term( $p->ID, 'skrine_topic' );
		$out .= '<li class="slide-card">'
			. '<div class="slide-art art-' . ( ( $i % 6 ) + 1 ) . '">'
			. ( $tag ? '<span class="slide-tag">' . esc_html( $tag ) . '</span>' : '' )
			. '<img src="' . esc_url( skrine_alert_image( $p ) ) . '" alt="" loading="lazy">'
			. '</div><div class="slide-body">'
			. '<h3>' . esc_html( $p->post_title ) . '</h3>'
			. '<a href="' . esc_attr( skrine_alert_href( $p ) ) . '" class="slide-link">Read update <i class="fa-solid fa-arrow-right"></i></a>'
			. '<time datetime="' . esc_attr( get_the_date( 'Y-m-d', $p ) ) . '">' . esc_html( skrine_short_date( $p ) ) . '</time>'
			. '</div></li>';
	}
	return $out;
} );

/* ---------- In the Spotlight ---------- */
function skrine_spotlight_pick( $type, $count ) {
	$ticked = get_posts( array(
		'post_type'   => $type,
		'post_status' => 'publish',
		'numberposts' => $count,
		'meta_key'    => '_sk_spotlight',
		'meta_value'  => '1',
		'orderby'     => 'date',
		'order'       => 'DESC',
	) );
	if ( count( $ticked ) < $count ) {
		$more   = get_posts( array(
			'post_type'    => $type,
			'post_status'  => 'publish',
			'numberposts'  => $count - count( $ticked ),
			'post__not_in' => wp_list_pluck( $ticked, 'ID' ),
			'orderby'      => 'date',
			'order'        => 'DESC',
		) );
		$ticked = array_merge( $ticked, $more );
	}
	return $ticked;
}

function skrine_spot_pub( $p, $feature = false ) {
	$cover = skrine_thumb( $p->ID );
	return '<a href="publications.html" class="spot-card' . ( $feature ? ' spot-card--feature' : '' ) . ' spot-card--pub reveal" data-tilt>'
		. '<div class="spot-cover spot-cover--photo">'
		. ( $cover ? '<img class="spot-cover-blur" src="' . esc_url( $cover ) . '" alt="" aria-hidden="true" loading="lazy">'
			. '<img class="spot-cover-img" src="' . esc_url( $cover ) . '" alt="' . esc_attr( $p->post_title ) . '" loading="lazy">' : '' )
		. '</div><div class="spot-body">'
		. '<p class="spot-tagline"><span class="spot-pill spot-pill--pub">Publication</span><time datetime="' . esc_attr( get_the_date( 'Y-m-d', $p ) ) . '">' . esc_html( skrine_short_date( $p ) ) . '</time></p>'
		. '<h3>' . esc_html( $p->post_title ) . '</h3>'
		. '<span class="read-more">Read more <i class="fa-solid fa-arrow-right"></i></span>'
		. '</div></a>';
}

function skrine_spot_alert( $p ) {
	$meta = array_filter( array( skrine_term( $p->ID, 'skrine_topic' ), skrine_names_text( skrine_lines( skrine_meta( $p->ID, 'authors' ) ) ) ) );
	return '<a href="' . esc_attr( skrine_alert_href( $p ) ) . '" class="spot-card spot-card--alert reveal" data-tilt>'
		. '<div class="spot-cover spot-cover--alert"><img class="spot-cover-photo" src="' . esc_url( skrine_alert_image( $p ) ) . '" alt="" loading="lazy"></div>'
		. '<div class="spot-body">'
		. '<p class="spot-tagline"><span class="spot-pill spot-pill--alert">Alert</span><time datetime="' . esc_attr( get_the_date( 'Y-m-d', $p ) ) . '">' . esc_html( skrine_short_date( $p ) ) . '</time></p>'
		. '<h3>' . esc_html( $p->post_title ) . '</h3>'
		. ( $meta ? '<p class="spot-meta">' . esc_html( implode( ' · ', $meta ) ) . '</p>' : '' )
		. '<span class="read-more">Read alert <i class="fa-solid fa-arrow-right"></i></span>'
		. '</div></a>';
}

add_shortcode( 'skrine_spotlight', function () {
	if ( ! skrine_type_ready( 'skrine_alert' ) && ! skrine_type_ready( 'skrine_publication' ) ) {
		return skrine_part( 'spotlight' );
	}
	$pubs   = skrine_spotlight_pick( 'skrine_publication', 5 );
	$alerts = skrine_spotlight_pick( 'skrine_alert', 3 );
	// layout: big publication, then alert / publication alternating, ending on publications
	$order = array( 'p', 'a', 'p', 'a', 'p', 'a', 'p', 'p' );
	$out   = '';
	$first = true;
	foreach ( $order as $kind ) {
		if ( $kind === 'p' && $pubs ) {
			$out  .= skrine_spot_pub( array_shift( $pubs ), $first );
			$first = false;
		} elseif ( $kind === 'a' && $alerts ) {
			$out .= skrine_spot_alert( array_shift( $alerts ) );
		}
	}
	return $out;
} );

/* ---------- Deals & Transactions ---------- */
add_shortcode( 'skrine_deals', function () {
	if ( ! skrine_type_ready( 'skrine_deal' ) ) {
		return skrine_part( 'deals' );
	}
	$deals = array_map( 'skrine_deal_item', skrine_query( 'skrine_deal' ) );
	if ( ! $deals ) {
		return '';
	}
	$d   = $deals[0];
	$out = '<article class="deal-feature" id="dealFeature" data-tilt aria-live="polite">'
		. '<div class="deal-feature-art" aria-hidden="true" style="background-image: url(&quot;' . esc_url( $d['img'] ) . '&quot;)"></div>'
		. '<div class="deal-feature-content">'
		. '<p class="deal-sector">' . esc_html( $d['sector'] ) . '</p>'
		. '<p class="deal-figure"><span class="deal-figure-num">' . esc_html( $d['num'] ) . '</span> <span class="deal-figure-unit">' . esc_html( $d['unit'] ) . '</span></p>'
		. '<p class="deal-figure-label">' . esc_html( $d['label'] ) . '</p>'
		. '<h3 class="deal-headline">' . esc_html( $d['headline'] ) . '</h3>'
		. '<p class="deal-summary">' . esc_html( $d['summary'] ) . '</p>'
		. '<p class="deal-meta"><span class="deal-team">' . esc_html( $d['team'] ) . '</span><time>' . esc_html( $d['date'] ) . '</time></p>'
		. '</div></article>'
		. '<ol class="deal-list" role="tablist" aria-label="Choose a transaction">';
	foreach ( $deals as $i => $x ) {
		$fig  = $x['num'] . ( strlen( $x['unit'] ) > 2 ? ' ' : '' ) . $x['unit'];
		$out .= '<li><button type="button" role="tab" aria-selected="' . ( $i ? 'false' : 'true' ) . '" data-deal="' . $i . '">'
			. '<span class="dl-figure">' . esc_html( $fig ) . '</span>'
			. '<span class="dl-client">' . esc_html( $x['client'] ?: $x['headline'] ) . '</span>'
			. '<span class="dl-sector">' . esc_html( $x['short'] ?: $x['sector'] ) . '</span>'
			. '</button></li>';
	}
	return $out . '</ol>';
} );
