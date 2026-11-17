<?php
/**
 * SEO. Works on its own, and hands over to Yoast SEO or Rank Math when one is installed.
 *
 * - WordPress writes the <title> (the design's own titles are the default).
 * - alert.html?a=…, news.html?n=…, profile.html?p=… and job.html?j=… are treated as that alert, story,
 *   person or job (not as one shared page), so each gets its own title, description, share image,
 *   canonical link and SEO box in wp-admin, while the design page still draws it.
 * - Design pages are linked as people.html (not /people/), so there is one address per page.
 * - Sitemaps leave out items without a page of their own and the empty detail pages.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
} );
add_filter( 'document_title_separator', function () {
	return '|';
} );

function skrine_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

/* ---------- one address per design page: people.html ---------- */
add_filter( 'page_link', function ( $link, $id ) {
	$p = get_post( $id );
	if ( ! $p || $p->post_status !== 'publish' || $p->post_parent ) {
		return $link;
	}
	if ( (int) get_option( 'page_on_front' ) === (int) $id ) {
		return home_url( '/' );
	}
	return isset( skrine_pages()[ $p->post_name ] ) ? home_url( $p->post_name . '.html' ) : $link;
}, 10, 2 );

/* ---------- detail pages: which design page shows which content type, and its ?parameter ---------- */
function skrine_item_pages() {
	return array(
		'alert'           => array( 'a', 'skrine_alert' ),
		'news'            => array( 'n', 'skrine_news' ),
		'profile'         => array( 'p', 'skrine_person' ),
		'profile-classic' => array( 'p', 'skrine_person' ),
		'job'             => array( 'j', 'skrine_job' ),
	);
}

/* slug in the address → post id, for items that have a page of their own (cached per content version) */
function skrine_item_map( $type ) {
	static $mem = array();
	if ( isset( $mem[ $type ] ) ) {
		return $mem[ $type ];
	}
	$key = 'skrine_items_' . $type . '_' . (int) get_option( 'skrine_data_ver', 1 );
	$map = get_transient( $key );
	if ( ! is_array( $map ) ) {
		$map = array();
		foreach ( skrine_query( $type ) as $p ) {
			if ( $type === 'skrine_job' ) {
				$map[ $p->post_name ] = $p->ID;
			} elseif ( $type === 'skrine_person' ) {
				if ( in_array( skrine_meta( $p->ID, 'group' ), array( 'partners', 'consultants' ), true ) ) {
					$map[ skrine_person_slug( $p->post_title ) ] = $p->ID;
				}
			} elseif ( trim( $p->post_content ) !== '' ) {
				$slug = skrine_slugify( $p->post_title );
				if ( ! isset( $map[ $slug ] ) ) {
					$map[ $slug ] = $p->ID;
				}
			}
		}
		set_transient( $key, $map, DAY_IN_SECONDS );
	}
	return $mem[ $type ] = $map;
}

add_filter( 'request', function ( $qv ) {
	if ( is_admin() || empty( $qv['pagename'] ) ) {
		return $qv;
	}
	$pages = skrine_item_pages();
	if ( ! isset( $pages[ $qv['pagename'] ] ) ) {
		return $qv;
	}
	list( $param, $type ) = $pages[ $qv['pagename'] ];
	$slug = isset( $_GET[ $param ] ) ? sanitize_title( wp_unslash( $_GET[ $param ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	if ( $slug === '' || ! skrine_type_ready( $type ) ) {
		return $qv;
	}
	$map = skrine_item_map( $type );
	if ( empty( $map[ $slug ] ) ) {
		return $qv;
	}
	$GLOBALS['skrine_item_page'] = $qv['pagename'];
	return array( 'post_type' => $type, 'p' => (int) $map[ $slug ] );
} );

/* ---------- descriptions ---------- */
function skrine_item_summary( $post ) {
	if ( $post->post_type === 'skrine_job' ) {
		$intro = skrine_lines( skrine_meta( $post->ID, 'intro' ) );
		if ( $intro ) {
			return $intro[0];
		}
		$group = skrine_meta( $post->ID, 'group' );
		return 'Skrine is hiring: ' . $post->post_title . ( $group ? ' (' . $group . ')' : '' ) . '. ' . skrine_meta( $post->ID, 'location' );
	}
	return skrine_summary( $post, 30 );
}

function skrine_meta_description() {
	if ( ! empty( $GLOBALS['skrine_item_page'] ) && is_singular() ) {
		$d = skrine_item_summary( get_queried_object() );
	} else {
		$slug = skrine_template_slug();
		$meta = skrine_page_meta();
		$d    = isset( $meta[ $slug ] ) ? $meta[ $slug ][1] : get_bloginfo( 'description' );
	}
	$d = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( html_entity_decode( (string) $d, ENT_QUOTES, 'UTF-8' ) ) ) );
	return mb_strlen( $d ) > 300 ? rtrim( mb_substr( $d, 0, 297 ) ) . '…' : $d;
}

// without an SEO plugin: the design's home title, and a description on every page
add_filter( 'pre_get_document_title', function ( $title ) {
	if ( skrine_seo_plugin() || ! is_front_page() ) {
		return $title;
	}
	$meta = skrine_page_meta();
	return isset( $meta['home'] ) && $meta['home'][0] !== '' ? $meta['home'][0] : $title;
} );
add_action( 'wp_head', function () {
	if ( skrine_seo_plugin() ) {
		return;
	}
	$d = skrine_meta_description();
	if ( $d !== '' ) {
		echo '<meta name="description" content="' . esc_attr( $d ) . '">' . "\n";
	}
}, 1 );

// with an SEO plugin: use the design's wording / the item's summary when its description box is left empty
add_filter( 'wpseo_metadesc', function ( $d ) {
	return $d ? $d : skrine_meta_description();
} );
add_filter( 'wpseo_opengraph_desc', function ( $d ) {
	return $d ? $d : skrine_meta_description();
} );
add_filter( 'rank_math/frontend/description', function ( $d ) {
	return $d ? $d : skrine_meta_description();
} );

/* ---------- sitemaps ---------- */
function skrine_sitemap_skip_types() {
	// these have no page of their own (they are listed on Publications, News & Events and the home page)
	return array( 'skrine_publication', 'skrine_event', 'skrine_deal', 'skrine_application' );
}

/* items without a page of their own, and the detail pages that are empty without ?a=… */
function skrine_no_page_ids() {
	static $ids = null;
	if ( $ids !== null ) {
		return $ids;
	}
	$key = 'skrine_nopage_' . (int) get_option( 'skrine_data_ver', 1 );
	$ids = get_transient( $key );
	if ( is_array( $ids ) ) {
		return $ids;
	}
	$ids = array();
	foreach ( array( 'skrine_alert', 'skrine_news', 'skrine_person', 'skrine_job' ) as $type ) {
		$with = array_flip( array_map( 'intval', skrine_item_map( $type ) ) );
		foreach ( get_posts( array( 'post_type' => $type, 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids', 'suppress_filters' => true ) ) as $id ) {
			if ( ! isset( $with[ $id ] ) ) {
				$ids[] = (int) $id;
			}
		}
	}
	foreach ( array( 'alert', 'news', 'job', 'profile', 'profile-classic', 'life-story', 'practice-area', 'sector', 'search' ) as $slug ) {
		$p = get_page_by_path( $slug );
		if ( $p ) {
			$ids[] = (int) $p->ID;
		}
	}
	set_transient( $key, $ids, DAY_IN_SECONDS );
	return $ids;
}

function skrine_skip_taxonomies() {
	return array( 'skrine_topic', 'skrine_news_cat' );
}

// WordPress's own sitemap (wp-sitemap.xml). The design has no blog, categories or author pages.
add_filter( 'wp_sitemaps_add_provider', function ( $provider, $name ) {
	return $name === 'users' ? false : $provider;
}, 10, 2 );
add_filter( 'wp_sitemaps_post_types', function ( $types ) {
	return array_diff_key( $types, array_flip( array_merge( skrine_sitemap_skip_types(), array( 'post' ) ) ) );
} );
add_filter( 'wp_sitemaps_taxonomies', function ( $tax ) {
	return array_diff_key( $tax, array_flip( array_merge( skrine_skip_taxonomies(), array( 'category', 'post_tag' ) ) ) );
} );
add_filter( 'wp_sitemaps_posts_query_args', function ( $args ) {
	$args['post__not_in'] = array_merge( isset( $args['post__not_in'] ) ? (array) $args['post__not_in'] : array(), skrine_no_page_ids() );
	return $args;
} );
// Yoast SEO
add_filter( 'wpseo_sitemap_exclude_post_type', function ( $skip, $type ) {
	return $skip || in_array( $type, skrine_sitemap_skip_types(), true );
}, 10, 2 );
add_filter( 'wpseo_sitemap_exclude_taxonomy', function ( $skip, $tax ) {
	return $skip || in_array( $tax, skrine_skip_taxonomies(), true );
}, 10, 2 );
add_filter( 'wpseo_exclude_from_sitemap_by_post_ids', function ( $ids ) {
	return array_merge( (array) $ids, skrine_no_page_ids() );
} );
// Rank Math
add_filter( 'rank_math/sitemap/exclude_post_type', function ( $skip, $type ) {
	return $skip || in_array( $type, skrine_sitemap_skip_types(), true );
}, 10, 2 );
add_filter( 'rank_math/sitemap/exclude_taxonomy', function ( $skip, $tax ) {
	return $skip || in_array( $tax, skrine_skip_taxonomies(), true );
}, 10, 2 );
add_filter( 'rank_math/sitemap/entry', function ( $url, $type, $object ) {
	return ( $object instanceof WP_Post && in_array( (int) $object->ID, skrine_no_page_ids(), true ) ) ? false : $url;
}, 10, 3 );

// a detail page that didn't match an item ("role not found" etc.) should not be indexed
add_filter( 'wp_robots', function ( $robots ) {
	$slug  = empty( $GLOBALS['skrine_item_page'] ) && is_page() ? skrine_template_slug() : '';
	$pages = skrine_item_pages();
	if ( isset( $pages[ $slug ] ) && skrine_type_ready( $pages[ $slug ][1] ) ) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
	}
	return $robots;
} );

/* pages still drawn from the design's data files keep their ?parameter in the canonical link,
   so each practice area, sector and Life at Skrine story counts as its own page */
function skrine_param_canonical( $url ) {
	$params = array( 'practice-area' => 'area', 'sector' => 'sector', 'life-story' => 'n' );
	$slug   = skrine_template_slug();
	if ( $url && isset( $params[ $slug ] ) && ! empty( $_GET[ $params[ $slug ] ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		$url = add_query_arg( $params[ $slug ], sanitize_title( wp_unslash( $_GET[ $params[ $slug ] ] ) ), $url ); // phpcs:ignore WordPress.Security.NonceVerification
	}
	return $url;
}
add_filter( 'get_canonical_url', 'skrine_param_canonical' );
add_filter( 'wpseo_canonical', 'skrine_param_canonical' );
add_filter( 'wpseo_opengraph_url', 'skrine_param_canonical' );
add_filter( 'rank_math/frontend/canonical', 'skrine_param_canonical' );
