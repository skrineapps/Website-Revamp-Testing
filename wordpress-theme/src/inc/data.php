<?php
/**
 * Hands Alerts, Publications, News, Events and Deals to the design's JavaScript, in the same
 * shape as the old js/*-data.js files (window.SKRINE_ALERTS, SKRINE_NEWS, …).
 * Until the import has run, the design's own data files are used instead.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* same rule as slugify() in js/article-common.js, so ?a=<slug> links line up */
function skrine_slugify( $s ) {
	$s = strtolower( remove_accents( html_entity_decode( (string) $s, ENT_QUOTES, 'UTF-8' ) ) );
	$s = str_replace( array( "\u{2019}", "'", '.' ), '', $s );
	$s = preg_replace( '/[^a-z0-9]+/', '-', $s );
	$s = trim( $s, '-' );
	return rtrim( substr( $s, 0, 80 ), '-' );
}

/* profile.html?p=<slug>: same rule as profileSlug() in js/article-common.js (no length limit) */
function skrine_person_slug( $name ) {
	$s = strtolower( remove_accents( html_entity_decode( (string) $name, ENT_QUOTES, 'UTF-8' ) ) );
	$s = str_replace( array( "\u{2019}", "'", '.' ), '', $s );
	return trim( preg_replace( '/[^a-z0-9]+/', '-', $s ), '-' );
}

/* "## Heading" then one item per line → [ heading, items[] ]. A blank line starts a new group. */
function skrine_sections( $v ) {
	$out   = array();
	$cur   = null;
	$blank = false;
	foreach ( preg_split( '/\r\n|\r|\n/', (string) $v ) as $line ) {
		$line = trim( $line );
		if ( $line === '' ) {
			$blank = true;
			continue;
		}
		if ( $blank && $cur && strpos( $line, '##' ) !== 0 ) {
			$out[] = $cur;
			$cur   = array( 'heading' => '', 'items' => array() );
		}
		$blank = false;
		if ( strpos( $line, '##' ) === 0 ) {
			if ( $cur ) {
				$out[] = $cur;
			}
			$cur = array( 'heading' => trim( ltrim( $line, '#' ) ), 'items' => array() );
			continue;
		}
		if ( ! $cur ) {
			$cur = array( 'heading' => '', 'items' => array() );
		}
		$cur['items'][] = preg_replace( '/^[-•*]\s+/u', '', $line );
	}
	if ( $cur ) {
		$out[] = $cur;
	}
	return $out;
}

/* quote text, then "— Source"; a blank line between quotes → [ quote, source ] */
function skrine_quotes( $v ) {
	$out = array();
	foreach ( preg_split( '/\n\s*\n/', str_replace( "\r", '', (string) $v ) ) as $block ) {
		$lines  = array_values( array_filter( array_map( 'trim', explode( "\n", $block ) ), 'strlen' ) );
		$source = '';
		if ( count( $lines ) > 1 && preg_match( '/^(—|–|--|-)\s*(.+)$/u', end( $lines ), $m ) ) {
			$source = $m[2];
			array_pop( $lines );
		}
		$quote = trim( implode( ' ', $lines ), " \t\"“”" );
		if ( $quote !== '' ) {
			$out[] = array( 'quote' => $quote, 'source' => $source );
		}
	}
	return $out;
}

/* editor text → plain paragraphs (the profile overview) */
function skrine_paragraphs( $content ) {
	$html = has_blocks( $content ) ? do_blocks( $content ) : wpautop( $content );
	$out  = array();
	foreach ( preg_split( '#</p>|<br\s*/?>\s*<br\s*/?>#i', $html ) as $part ) {
		$t = trim( html_entity_decode( wp_strip_all_tags( $part ), ENT_QUOTES, 'UTF-8' ) );
		if ( $t !== '' ) {
			$out[] = $t;
		}
	}
	return $out;
}

function skrine_lines( $v ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $v ) ), 'strlen' ) );
}

function skrine_names_text( $names ) {
	if ( count( $names ) < 2 ) {
		return implode( '', $names );
	}
	$last = array_pop( $names );
	return implode( ', ', $names ) . ' and ' . $last;
}

function skrine_term( $post_id, $tax ) {
	$t = get_the_terms( $post_id, $tax );
	return ( $t && ! is_wp_error( $t ) ) ? html_entity_decode( $t[0]->name, ENT_QUOTES, 'UTF-8' ) : '';
}

function skrine_thumb( $post_id, $size = 'large' ) {
	$id = get_post_thumbnail_id( $post_id );
	return $id ? (string) wp_get_attachment_image_url( $id, $size ) : '';
}

function skrine_body( $post ) {
	$c = $post->post_content;
	$c = has_blocks( $c ) ? do_blocks( $c ) : wpautop( $c );
	return do_shortcode( $c );
}

function skrine_summary( $post, $words = 40 ) {
	if ( trim( $post->post_excerpt ) !== '' ) {
		return $post->post_excerpt;
	}
	return wp_trim_words( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ), $words, '…' );
}

function skrine_query( $type ) {
	$args = array(
		'post_type'        => $type,
		'post_status'      => 'publish',
		'numberposts'      => -1,
		'suppress_filters' => true,
	);
	if ( $type === 'skrine_deal' ) {
		$args['orderby'] = array( 'menu_order' => 'ASC', 'date' => 'DESC' );
	} elseif ( $type === 'skrine_person' ) {
		$args['orderby'] = array( 'menu_order' => 'ASC', 'title' => 'ASC' );
	} else {
		$args['orderby'] = 'date';
		$args['order']   = 'DESC';
	}
	return get_posts( $args );
}

/* has this content type been set up in WordPress yet? (imported, or posts added by hand)
 * Until then the design's own data files are used, so the site never shows empty lists. */
function skrine_type_ready( $type ) {
	if ( in_array( $type, (array) get_option( 'skrine_imported_types', array() ), true ) ) {
		return true;
	}
	$c = wp_count_posts( $type );
	return $c && ( (int) $c->publish + (int) $c->draft + (int) $c->future + (int) $c->private ) > 0;
}

/* ---------- the data sets ---------- */
function skrine_build_set( $set ) {
	switch ( $set ) {
		case 'alerts':
			$list = array();
			$full = array();
			foreach ( skrine_query( 'skrine_alert' ) as $p ) {
				$authors = skrine_lines( skrine_meta( $p->ID, 'authors' ) );
				$item    = array(
					'title'    => $p->post_title,
					'label'    => skrine_meta( $p->ID, 'label' ) ?: null,
					'date'     => get_the_date( 'Y-m-d', $p ),
					'topic'    => skrine_term( $p->ID, 'skrine_topic' ),
					'practice' => skrine_meta( $p->ID, 'practice' ),
					'authors'  => skrine_names_text( $authors ),
					'excerpt'  => skrine_summary( $p ),
				);
				$img = skrine_thumb( $p->ID );
				if ( $img ) {
					$item['image'] = $img;
				}
				$list[] = $item;
				if ( trim( $p->post_content ) !== '' ) {
					$slug          = skrine_slugify( $p->post_title );
					$notes         = array();
					foreach ( skrine_lines( skrine_meta( $p->ID, 'notes' ) ) as $i => $n ) {
						$notes[] = array( 'n' => $i + 1, 'html' => $n );
					}
					$full[ $slug ] = array(
						'slug'     => $slug,
						'title'    => $item['title'],
						'label'    => $item['label'],
						'date'     => $item['date'],
						'topic'    => $item['topic'],
						'practice' => $item['practice'],
						'authors'  => array_map( function ( $n ) { return array( 'name' => $n, 'role' => '' ); }, $authors ),
						'body'     => array( skrine_body( $p ) ),
						'notes'    => $notes,
					);
				}
			}
			return array( 'SKRINE_ALERTS' => $list, 'SKRINE_ALERTS_FULL' => (object) $full );

		case 'publications':
			$list = array();
			foreach ( skrine_query( 'skrine_publication' ) as $p ) {
				$list[] = array(
					'title'     => $p->post_title,
					'date'      => get_the_date( 'Y-m-d', $p ),
					'cover'     => skrine_thumb( $p->ID ),
					'publisher' => skrine_meta( $p->ID, 'publisher' ),
					'topic'     => skrine_term( $p->ID, 'skrine_topic' ),
					'authors'   => skrine_lines( skrine_meta( $p->ID, 'authors' ) ),
					'summary'   => skrine_summary( $p, 80 ),
					'pdf'       => skrine_meta( $p->ID, 'pdf' ),
				);
			}
			return array( 'SKRINE_PUBLICATIONS' => $list );

		case 'news':
			$list = array();
			$full = array();
			foreach ( skrine_query( 'skrine_news' ) as $p ) {
				$item   = array(
					'title'    => $p->post_title,
					'date'     => get_the_date( 'Y-m-d', $p ),
					'category' => skrine_term( $p->ID, 'skrine_news_cat' ),
					'image'    => skrine_thumb( $p->ID ),
					'people'   => skrine_lines( skrine_meta( $p->ID, 'people' ) ),
					'summary'  => skrine_summary( $p ),
				);
				$list[] = $item;
				if ( trim( $p->post_content ) !== '' ) {
					$slug    = skrine_slugify( $p->post_title );
					$gallery = array();
					foreach ( array_filter( array_map( 'absint', explode( ',', (string) skrine_meta( $p->ID, 'gallery' ) ) ) ) as $aid ) {
						$u = wp_get_attachment_image_url( $aid, 'large' );
						if ( $u ) {
							$gallery[] = $u;
						}
					}
					$full[ $slug ] = array_merge( $item, array( 'slug' => $slug, 'gallery' => $gallery, 'body' => array( skrine_body( $p ) ) ) );
				}
			}
			$events = array();
			foreach ( skrine_query( 'skrine_event' ) as $p ) {
				$date = skrine_meta( $p->ID, 'date' );
				if ( ! $date ) {
					continue;
				}
				$events[] = array_filter( array(
					'title'    => $p->post_title,
					'date'     => $date,
					'endDate'  => skrine_meta( $p->ID, 'end_date' ),
					'type'     => skrine_meta( $p->ID, 'type' ),
					'time'     => skrine_meta( $p->ID, 'time' ),
					'location' => skrine_meta( $p->ID, 'location' ),
					'summary'  => $p->post_excerpt,
					'people'   => skrine_lines( skrine_meta( $p->ID, 'people' ) ),
					'register' => skrine_meta( $p->ID, 'register' ),
				) );
			}
			// past events drop off by themselves
			$today  = current_time( 'Y-m-d' );
			$events = array_values( array_filter( $events, function ( $e ) use ( $today ) {
				return ( isset( $e['endDate'] ) ? $e['endDate'] : $e['date'] ) >= $today;
			} ) );
			return array( 'SKRINE_NEWS' => $list, 'SKRINE_NEWS_FULL' => (object) $full, 'SKRINE_UPCOMING' => $events );

		case 'deals':
			$list = array();
			foreach ( skrine_query( 'skrine_deal' ) as $p ) {
				$list[] = skrine_deal_item( $p );
			}
			return array( 'SKRINE_DEALS' => $list );

		case 'people':
			// same shape as js/people-data.js
			$groups = array_fill_keys( array_keys( skrine_person_roles() ), array() );
			foreach ( skrine_query( 'skrine_person' ) as $p ) {
				$g = skrine_meta( $p->ID, 'group' );
				if ( ! isset( $groups[ $g ] ) ) {
					continue;
				}
				$item  = array( 'name' => $p->post_title );
				$photo = skrine_thumb( $p->ID, 'full' );
				if ( $photo ) {
					$item['photo'] = $photo;
				}
				$extra = array(
					'division'     => skrine_meta( $p->ID, 'division' ),
					'areas'        => skrine_lines( skrine_meta( $p->ID, 'areas' ) ),
					'keyAreas'     => $g === 'seniorAssociates' ? skrine_lines( skrine_meta( $p->ID, 'key_areas' ) ) : array(),
					'quals'        => skrine_lines( skrine_meta( $p->ID, 'quals' ) ),
					'affiliations' => skrine_lines( skrine_meta( $p->ID, 'affiliations' ) ),
				);
				$groups[ $g ][] = array_merge( $item, array_filter( $extra ) );
			}
			return array( 'SKRINE_PEOPLE' => $groups );

		case 'profiles':
			// same shape as js/profiles-data.js: partners and consultants
			$roles    = skrine_person_roles();
			$profiles = array();
			foreach ( skrine_query( 'skrine_person' ) as $p ) {
				$g = skrine_meta( $p->ID, 'group' );
				if ( $g !== 'partners' && $g !== 'consultants' ) {
					continue;
				}
				$slug              = skrine_person_slug( $p->post_title );
				$profiles[ $slug ] = array(
					'slug'        => $slug,
					'name'        => $p->post_title,
					'role'        => $roles[ $g ],
					'phone'       => skrine_meta( $p->ID, 'phone' ),
					'email'       => skrine_meta( $p->ID, 'email' ),
					'overview'    => skrine_paragraphs( $p->post_content ),
					'keyAreas'    => skrine_lines( skrine_meta( $p->ID, 'key_areas' ) ),
					'experience'  => array_map( function ( $s ) { return array( 'area' => $s['heading'], 'matters' => $s['items'] ); }, skrine_sections( skrine_meta( $p->ID, 'experience' ) ) ),
					'credentials' => skrine_sections( skrine_meta( $p->ID, 'credentials' ) ),
					'talks'       => skrine_sections( skrine_meta( $p->ID, 'talks' ) ),
					'rankings'    => skrine_lines( skrine_meta( $p->ID, 'rankings' ) ),
					'quotes'      => skrine_quotes( skrine_meta( $p->ID, 'quotes' ) ),
					'source'      => '',
				);
			}
			return array( 'SKRINE_PROFILES' => (object) $profiles );
	}
	return array();
}

function skrine_deal_item( $p ) {
	return array(
		'sector'   => skrine_meta( $p->ID, 'sector' ),
		'num'      => skrine_meta( $p->ID, 'figure' ),
		'unit'     => skrine_meta( $p->ID, 'unit' ),
		'label'    => skrine_meta( $p->ID, 'figure_label' ),
		'headline' => $p->post_title,
		'summary'  => $p->post_excerpt,
		'team'     => skrine_meta( $p->ID, 'team' ),
		'date'     => skrine_meta( $p->ID, 'date_text' ),
		'img'      => skrine_thumb( $p->ID, 'full' ),
		'client'   => skrine_meta( $p->ID, 'client' ),
		'short'    => skrine_meta( $p->ID, 'list_sector' ),
	);
}

/* built once per content version (cleared when anything is edited) */
function skrine_data_set( $set ) {
	$ver   = (int) get_option( 'skrine_data_ver', 1 );
	$key   = 'skrine_data_' . $set . '_' . $ver;
	$cache = get_transient( $key );
	if ( is_array( $cache ) ) {
		return $cache;
	}
	$data = skrine_build_set( $set );
	set_transient( $key, $data, DAY_IN_SECONDS );
	return $data;
}

function skrine_bump_data() {
	update_option( 'skrine_data_ver', (int) get_option( 'skrine_data_ver', 1 ) + 1, false );
}
add_action( 'save_post', function ( $id, $post ) {
	if ( isset( skrine_content_types()[ $post->post_type ] ) || $post->post_type === 'attachment' ) {
		skrine_bump_data();
	}
}, 20, 2 );
add_action( 'deleted_post', 'skrine_bump_data' );
add_action( 'trashed_post', 'skrine_bump_data' );
add_action( 'untrashed_post', 'skrine_bump_data' );
add_action( 'edited_term', 'skrine_bump_data' );
add_action( 'set_object_terms', 'skrine_bump_data' );
add_action( 'transition_post_status', function ( $new, $old, $post ) {
	if ( $new !== $old && isset( skrine_content_types()[ $post->post_type ] ) ) {
		skrine_bump_data();
	}
}, 10, 3 );

function skrine_set_types() {
	return array(
		'alerts'       => 'skrine_alert',
		'publications' => 'skrine_publication',
		'news'         => 'skrine_news',
		'deals'        => 'skrine_deal',
		'people'       => 'skrine_person',
		'profiles'     => 'skrine_person',
	);
}

/* the script address for a data set: /skrine-data/<set>.js?v=<version> (browsers cache it until something changes) */
function skrine_data_url( $set, $fallback_file = '' ) {
	$types = skrine_set_types();
	if ( ! skrine_type_ready( $types[ $set ] ) ) {
		return $fallback_file ? get_template_directory_uri() . '/js/' . $fallback_file : '';
	}
	return add_query_arg( 'v', (int) get_option( 'skrine_data_ver', 1 ), home_url( 'skrine-data/' . $set . '.js' ) );
}

/**
 * Print a data set for the design's JavaScript.
 * $files: the design's own data file(s), used until the content is in WordPress.
 */
function skrine_data( $set, $files = array() ) {
	$types = skrine_set_types();
	if ( ! skrine_type_ready( $types[ $set ] ) ) {
		foreach ( (array) $files as $f ) {
			echo '<script src="' . esc_url( get_template_directory_uri() . '/js/' . $f ) . '"></script>' . "\n";
		}
		return;
	}
	echo '<script src="' . esc_url( skrine_data_url( $set ) ) . '"></script>' . "\n";
}

/* serve /skrine-data/<set>.js */
add_action( 'init', function () {
	$path = (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$home = rtrim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( ! preg_match( '#^' . preg_quote( $home, '#' ) . '/skrine-data/([a-z]+)\.js$#', $path, $m ) || ! isset( skrine_set_types()[ $m[1] ] ) ) {
		return;
	}
	$out = '';
	foreach ( skrine_data_set( $m[1] ) as $var => $value ) {
		$out .= 'window.' . $var . ' = ' . wp_json_encode( $value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ) . ";\n";
	}
	status_header( 200 );
	header( 'Content-Type: application/javascript; charset=utf-8' );
	// the address carries the content version, so it can be cached for long
	header( isset( $_GET['v'] ) ? 'Cache-Control: public, max-age=31536000, immutable' : 'Cache-Control: no-cache' ); // phpcs:ignore WordPress.Security.NonceVerification
	echo $out; // phpcs:ignore WordPress.Security.EscapeOutput -- JSON with < > & escaped
	exit;
}, 20 ); // after the content types and topics are registered
