<?php
/**
 * Tools > Import Skrine Content
 *
 * One-off helper for the proof of concept. Fills the homepage lists with the
 * design's current content, images included:
 *   News          <- assets/js/news-data.js (latest 10) + news-full-data.js
 *   Legal Updates, Deals, Spotlight, Awards <- inc/homepage-content.json
 *                   (made from index.html by tools/extract-homepage-content.py)
 * Items already imported are skipped, so it is safe to run more than once.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const SKRINE_IMPORT_NEWS_COUNT = 10;

add_action( 'admin_menu', function () {
	add_management_page( 'Import Skrine Content', 'Import Skrine Content', 'manage_options', 'skrine-import', 'skrine_import_page' );
} );

function skrine_import_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	echo '<div class="wrap"><h1>Import Skrine Content</h1>';

	if ( isset( $_POST['skrine_import'] ) && check_admin_referer( 'skrine_import' ) ) {
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 );
		}
		$log = skrine_import_all();
		echo '<div class="notice notice-success"><p>' . implode( '<br>', array_map( 'esc_html', $log ) ) . '</p></div>';
		printf( '<p><a class="button button-primary" href="%s">View the homepage</a> <a class="button" href="%s">Edit the homepage in Customize</a></p>', esc_url( home_url( '/' ) ), esc_url( admin_url( 'customize.php?autofocus[panel]=skrine_home' ) ) );
	} else {
		echo '<p>Fills the site with the content from the design, so it looks the same as the HTML version:</p><ul style="list-style:disc;padding-left:20px">';
		printf( '<li><strong>News</strong>: the latest %d stories</li>', SKRINE_IMPORT_NEWS_COUNT );
		echo '<li><strong>Legal Updates</strong>, <strong>Deals</strong>, <strong>Spotlight</strong> and <strong>Awards</strong>: everything on the homepage</li>';
		echo '<li><strong>Alerts</strong>: all alerts from the Alerts page, with the full article where the design has one</li></ul>';
		echo '<p>Images are added to the Media Library. Items already imported are skipped, so it is safe to run again.</p>';
		echo '<form method="post">';
		wp_nonce_field( 'skrine_import' );
		submit_button( 'Import content', 'primary', 'skrine_import' );
		echo '</form>';
	}
	echo '</div>';
}

/* ---------------------------------------------------------------
   Helpers
   --------------------------------------------------------------- */
function skrine_read_js_json( $file, $var ) {
	$path = get_template_directory() . '/assets/js/' . $file;
	if ( ! is_readable( $path ) ) {
		return null;
	}
	$src = file_get_contents( $path );
	if ( ! preg_match( '/window\.' . preg_quote( $var, '/' ) . '\s*=\s*([\[{].*?\n[\]}]);/s', $src, $m ) ) {
		return null;
	}
	return json_decode( $m[1], true );
}

/** True if an item with this source title was already imported into $type. */
function skrine_already_imported( $type, $title ) {
	return (bool) get_posts( array(
		'post_type'   => $type,
		'post_status' => 'any',
		'meta_key'    => '_skrine_source_title',
		'meta_value'  => $title,
		'fields'      => 'ids',
	) );
}

/**
 * Adds a theme image (path relative to assets/, e.g. "images/practice/tax.jpg")
 * to the Media Library once, and returns its attachment ID.
 */
function skrine_import_image( $rel_path, $post_id, $alt = '' ) {
	$map = get_option( 'skrine_imported_images', array() );
	if ( isset( $map[ $rel_path ] ) && get_post( $map[ $rel_path ] ) ) {
		return $map[ $rel_path ];
	}
	$src = get_template_directory() . '/assets/' . $rel_path;
	if ( ! is_readable( $src ) ) {
		return new WP_Error( 'missing', 'image file not in theme: ' . $rel_path );
	}
	// media_handle_sideload moves the file, so give it a copy.
	$tmp = wp_tempnam( basename( $rel_path ) );
	copy( $src, $tmp );
	$att = media_handle_sideload( array( 'name' => basename( $rel_path ), 'tmp_name' => $tmp ), $post_id );
	if ( is_wp_error( $att ) ) {
		@unlink( $tmp );
		return $att;
	}
	if ( $alt ) {
		update_post_meta( $att, '_wp_attachment_image_alt', $alt );
	}
	$map[ $rel_path ] = $att;
	update_option( 'skrine_imported_images', $map, false );
	return $att;
}

/** Creates one post with its fields and image. Returns a log line. */
function skrine_import_item( $type, $title, $postarr, $meta, $image = '', $alt = '', $key = null ) {
	$key = null === $key ? $title : $key;   // what identifies this item on re-runs
	if ( skrine_already_imported( $type, $key ) ) {
		return 'Skipped (already there): ' . $title;
	}
	$post_id = wp_insert_post( $postarr + array(
		'post_type'   => $type,
		'post_status' => 'publish',
		'post_title'  => $title,
	), true );
	if ( is_wp_error( $post_id ) ) {
		return 'Failed: ' . $title . ' — ' . $post_id->get_error_message();
	}
	update_post_meta( $post_id, '_skrine_source_title', $key );
	foreach ( $meta as $k => $v ) {
		update_post_meta( $post_id, $k, $v );
	}
	$note = '';
	if ( $image ) {
		$att = skrine_import_image( $image, $post_id, $alt );
		if ( is_wp_error( $att ) ) {
			$note = ' (' . $att->get_error_message() . ')';
		} else {
			set_post_thumbnail( $post_id, $att );
		}
	}
	return 'Imported: ' . $title . $note;
}

/* ---------------------------------------------------------------
   The import
   --------------------------------------------------------------- */
function skrine_import_all() {
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$log = array();

	// ---- News ----
	$news = skrine_read_js_json( 'news-data.js', 'SKRINE_NEWS' );
	$full = skrine_read_js_json( 'news-full-data.js', 'SKRINE_NEWS_FULL' );
	$full_by_title = array();
	foreach ( (array) $full as $entry ) {
		if ( ! empty( $entry['title'] ) ) {
			$full_by_title[ $entry['title'] ] = $entry;
		}
	}
	$log[] = '— News —';
	if ( ! is_array( $news ) ) {
		$log[] = 'Could not read assets/js/news-data.js.';
	} else {
		foreach ( array_slice( $news, 0, SKRINE_IMPORT_NEWS_COUNT ) as $n ) {
			$content = isset( $full_by_title[ $n['title'] ]['body'] )
				? implode( "\n\n", (array) $full_by_title[ $n['title'] ]['body'] )
				: '<p>' . esc_html( $n['summary'] ) . '</p>';
			$line = skrine_import_item( 'skrine_news', $n['title'], array(
				'post_excerpt' => $n['summary'],
				'post_content' => wp_kses_post( $content ),
				'post_date'    => $n['date'] . ' 09:00:00',
			), array(), $n['image'] ? 'images/news/' . $n['image'] : '' );
			if ( 0 === strpos( $line, 'Imported' ) && ! empty( $n['category'] ) ) {
				$ids = get_posts( array( 'post_type' => 'skrine_news', 'meta_key' => '_skrine_source_title', 'meta_value' => $n['title'], 'fields' => 'ids' ) );
				if ( $ids ) {
					wp_set_object_terms( $ids[0], $n['category'], 'skrine_news_cat' );
				}
			}
			$log[] = $line;
		}
	}

	// ---- Homepage lists ----
	$data = json_decode( (string) file_get_contents( get_template_directory() . '/inc/homepage-content.json' ), true );
	if ( ! is_array( $data ) ) {
		$log[] = 'Could not read inc/homepage-content.json.';
		return $log;
	}

	$log[] = '— Legal Updates —';
	foreach ( $data['updates'] as $u ) {
		$log[] = skrine_import_item( 'skrine_update', $u['title'],
			array( 'post_date' => $u['date'] . ' 09:00:00' ),
			array( 'tag' => $u['tag'], 'link' => $u['link'] ),
			$u['image'] );
	}

	$log[] = '— Deals —';
	foreach ( $data['deals'] as $i => $d ) {
		$log[] = skrine_import_item( 'skrine_deal', $d['title'],
			array( 'post_excerpt' => $d['summary'], 'menu_order' => $i + 1 ),
			array(
				'sector' => $d['sector'], 'num' => $d['num'], 'unit' => $d['unit'], 'label' => $d['label'],
				'team' => $d['team'], 'date_label' => $d['date_label'],
				'list_figure' => $d['list_figure'], 'list_client' => $d['list_client'], 'list_sector' => $d['list_sector'],
			),
			$d['image'] );
	}

	$log[] = '— Spotlight —';
	foreach ( $data['spotlight'] as $i => $s ) {
		$log[] = skrine_import_item( 'skrine_spotlight', $s['title'],
			array( 'post_date' => $s['date'] . ' 09:00:00', 'menu_order' => $i + 1 ),
			array( 'type' => $s['type'], 'meta' => $s['meta'], 'link' => $s['link'], 'featured' => $s['featured'] ? '1' : '' ),
			$s['image'], $s['image_alt'] );
	}

	$log[] = '— Awards —';
	foreach ( $data['awards'] as $i => $a ) {
		$log[] = skrine_import_item( 'skrine_award', $a['title'],
			array( 'menu_order' => $i + 1 ),
			array( 'source' => $a['source'] ),
			$a['image'], $a['image_alt'], $a['title'] . ' — ' . $a['source'] );
	}

	// ---- Alerts ----
	$log[]  = '— Alerts —';
	$alerts = skrine_read_js_json( 'alerts-data.js', 'SKRINE_ALERTS' );
	$full   = (array) skrine_read_js_json( 'alerts-full-data.js', 'SKRINE_ALERTS_FULL' );
	if ( ! is_array( $alerts ) ) {
		$log[] = 'Could not read assets/js/alerts-data.js.';
		return $log;
	}
	foreach ( $alerts as $i => $a ) {
		$slug = skrine_slugify( $a['title'] );
		$f    = isset( $full[ $slug ] ) ? $full[ $slug ] : null;
		if ( $f ) {
			$content = implode( "\n\n", $f['body'] );
			$notes   = implode( "\n", array_map( function ( $n ) { return $n['html']; }, (array) $f['notes'] ) );
		} else {
			$content = '<p>' . esc_html( $a['excerpt'] ) . '</p>';
			$notes   = '';
		}
		$authors = $a['authors'] ? preg_split( '/\s*,\s*|\s+and\s+/', $a['authors'] ) : array();
		// Alerts on the same day keep the design's order (newest first) by time of day.
		$time = sprintf( '%02d:%02d:00', 23 - intdiv( $i, 60 ), 59 - $i % 60 );
		$line = skrine_import_item( 'skrine_alert', $a['title'],
			array(
				'post_name'    => $slug,
				'post_date'    => $a['date'] . ' ' . $time,
				'post_excerpt' => wp_slash( $a['excerpt'] ),
				'post_content' => wp_slash( $content ),
			),
			array(
				'label'    => (string) $a['label'],
				'practice' => (string) $a['practice'],
				'authors'  => implode( "\n", $authors ),
				'notes'    => wp_slash( $notes ),
			) );
		if ( $a['topic'] && 0 === strpos( $line, 'Imported' ) ) {
			$id = skrine_find_imported( 'skrine_alert', $a['title'] );
			if ( $id ) {
				wp_set_object_terms( $id, $a['topic'], 'skrine_alert_topic' );
			}
		}
		$log[] = $line . ( $f ? ' (full article)' : '' );
	}
	return $log;
}

function skrine_find_imported( $type, $key ) {
	$ids = get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'meta_key' => '_skrine_source_title', 'meta_value' => $key, 'fields' => 'ids' ) );
	return $ids ? $ids[0] : 0;
}
