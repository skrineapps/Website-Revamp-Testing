<?php
/**
 * Skrine → Import: puts the design's content into WordPress.
 *   1. images      → Media Library (seed/media.json)
 *   2. alerts, publications, news, deals → posts (seed/*.json), with their images
 *   3. page wording → each page's content (content/*.html), image links pointing at the Media Library
 * Runs in small batches from the browser, so it never times out. Safe to run again: anything
 * already imported is skipped, and page wording is only filled in where a page is still empty.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function skrine_seed( $name ) {
	$file = get_template_directory() . '/seed/' . $name . '.json';
	return file_exists( $file ) ? json_decode( file_get_contents( $file ), true ) : array();
}

function skrine_media_map() {
	return (array) get_option( 'skrine_media_map', array() );
}

/* attachment id for a design image path such as "images/news/x.jpg" (imports it if needed) */
function skrine_media_id( $rel ) {
	$map = skrine_media_map();
	if ( isset( $map[ $rel ] ) && get_post( $map[ $rel ] ) ) {
		return (int) $map[ $rel ];
	}
	$src = get_template_directory() . '/' . $rel;
	if ( ! $rel || ! file_exists( $src ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tmp = wp_tempnam( basename( $rel ) );
	copy( $src, $tmp );
	$name  = basename( $rel );
	$title = ucwords( trim( preg_replace( '/[-_]+/', ' ', pathinfo( $name, PATHINFO_FILENAME ) ) ) );
	$id    = media_handle_sideload( array( 'name' => $name, 'tmp_name' => $tmp ), 0, $title );
	if ( is_wp_error( $id ) ) {
		@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		return 0;
	}
	update_post_meta( $id, '_skrine_source', $rel );
	$map         = skrine_media_map();
	$map[ $rel ] = $id;
	update_option( 'skrine_media_map', $map, false );
	return (int) $id;
}

/* point design image links ("images/…") at the Media Library copies */
function skrine_media_links( $html ) {
	$map = skrine_media_map();
	return preg_replace_callback( '#(?<![\w./-])images/[^"\'\s)&<>?]+#', function ( $m ) use ( $map ) {
		$rel = rawurldecode( $m[0] );
		if ( isset( $map[ $rel ] ) ) {
			$url = wp_get_attachment_url( $map[ $rel ] );
			if ( $url ) {
				return $url;
			}
		}
		return $m[0];
	}, $html );
}

function skrine_seeded_post( $type, $key ) {
	$found = get_posts( array(
		'post_type'   => $type,
		'post_status' => 'any',
		'numberposts' => 1,
		'meta_key'    => '_skrine_seed',
		'meta_value'  => $key,
		'fields'      => 'ids',
	) );
	return $found ? (int) $found[0] : 0;
}

function skrine_set_term( $post_id, $name, $tax ) {
	if ( ! $name ) {
		return;
	}
	$t = term_exists( $name, $tax );
	if ( ! $t ) {
		$t = wp_insert_term( $name, $tax );
	}
	if ( ! is_wp_error( $t ) ) {
		wp_set_object_terms( $post_id, array( (int) $t['term_id'] ), $tax );
	}
}

function skrine_import_item( $type, $r ) {
	$key = $type . ':' . $r['key'];
	if ( skrine_seeded_post( $type, $key ) ) {
		return;
	}
	$id = wp_insert_post( array(
		'post_type'    => $type,
		'post_status'  => 'publish',
		'post_title'   => $r['title'],
		'post_content' => isset( $r['body'] ) ? wp_slash( skrine_media_links( $r['body'] ) ) : '',
		'post_excerpt' => isset( $r['excerpt'] ) ? $r['excerpt'] : '',
		'post_date'    => isset( $r['date'] ) ? $r['date'] . ' 09:00:00' : current_time( 'mysql' ),
		'menu_order'   => isset( $r['order'] ) ? (int) $r['order'] : 0,
	), true );
	if ( is_wp_error( $id ) ) {
		return;
	}
	update_post_meta( $id, '_skrine_seed', $key );
	foreach ( (array) ( isset( $r['meta'] ) ? $r['meta'] : array() ) as $k => $v ) {
		update_post_meta( $id, '_sk_' . $k, $v );
	}
	if ( ! empty( $r['topic'] ) ) {
		skrine_set_term( $id, $r['topic'], 'skrine_topic' );
	}
	if ( ! empty( $r['category'] ) ) {
		skrine_set_term( $id, $r['category'], 'skrine_news_cat' );
	}
	if ( ! empty( $r['image'] ) ) {
		$aid = skrine_media_id( $r['image'] );
		if ( $aid ) {
			set_post_thumbnail( $id, $aid );
		}
	}
	if ( ! empty( $r['gallery'] ) ) {
		$ids = array_filter( array_map( 'skrine_media_id', $r['gallery'] ) );
		update_post_meta( $id, '_sk_gallery', implode( ',', $ids ) );
	}
}

/* ---------- the steps ---------- */
function skrine_import_steps() {
	return array(
		'media'        => array( 'Images → Media Library', 4 ),
		'people'       => array( 'People', 20 ),
		'alerts'       => array( 'Alerts', 25 ),
		'publications' => array( 'Publications', 10 ),
		'news'         => array( 'News', 10 ),
		'deals'        => array( 'Deals', 10 ),
		'pages'        => array( 'Page wording', 6 ),
	);
}

function skrine_import_types() {
	return array( 'people' => 'skrine_person', 'alerts' => 'skrine_alert', 'publications' => 'skrine_publication', 'news' => 'skrine_news', 'deals' => 'skrine_deal' );
}

function skrine_import_total( $step ) {
	if ( $step === 'pages' ) {
		return count( skrine_pages() ) + 1;
	}
	return count( skrine_seed( $step ) );
}

function skrine_import_run( $step, $offset, $overwrite_pages = false ) {
	$batch = skrine_import_steps()[ $step ][1];
	$total = skrine_import_total( $step );
	$end   = min( $total, $offset + $batch );

	if ( $step === 'media' ) {
		$list = skrine_seed( 'media' );
		for ( $i = $offset; $i < $end; $i++ ) {
			skrine_media_id( $list[ $i ] );
		}
	} elseif ( $step === 'pages' ) {
		$slugs = array_merge( array( 'home' ), array_keys( skrine_pages() ) );
		for ( $i = $offset; $i < $end; $i++ ) {
			$slug = $slugs[ $i ];
			$post = skrine_page_post( $slug );
			$file = get_template_directory() . '/content/' . $slug . '.html';
			if ( ! $post || ! file_exists( $file ) ) {
				continue;
			}
			if ( trim( $post->post_content ) !== '' && ! $overwrite_pages ) {
				continue;
			}
			wp_update_post( array(
				'ID'           => $post->ID,
				'post_content' => wp_slash( skrine_media_links( file_get_contents( $file ) ) ),
			) );
		}
	} else {
		$rows = skrine_seed( $step );
		$type = skrine_import_types()[ $step ];
		for ( $i = $offset; $i < $end; $i++ ) {
			skrine_import_item( $type, $rows[ $i ] );
		}
	}

	if ( $end >= $total ) {
		// from now on the site reads this content type from WordPress (even if it is later emptied)
		$types = skrine_import_types();
		if ( isset( $types[ $step ] ) ) {
			$done   = (array) get_option( 'skrine_imported_types', array() );
			$done[] = $types[ $step ];
			update_option( 'skrine_imported_types', array_values( array_unique( $done ) ) );
		}
		if ( $step === 'pages' ) {
			update_option( 'skrine_import_done', 1 );
		}
		skrine_bump_data();
	}
	return array( 'done' => $end, 'total' => $total );
}

/* ---------- admin page ---------- */
add_action( 'admin_menu', function () {
	add_menu_page( 'Skrine', 'Skrine', 'manage_options', 'skrine', 'skrine_import_page', 'dashicons-admin-site-alt3', 3 );
	add_submenu_page( 'skrine', 'Import design content', 'Import', 'manage_options', 'skrine', 'skrine_import_page' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( $hook !== 'toplevel_page_skrine' ) {
		return;
	}
	wp_enqueue_script( 'skrine-import', get_template_directory_uri() . '/admin/import.js', array(), SKRINE_VERSION, true );
	$steps = array();
	foreach ( skrine_import_steps() as $k => $s ) {
		$steps[] = array( 'key' => $k, 'label' => $s[0], 'total' => skrine_import_total( $k ) );
	}
	wp_localize_script( 'skrine-import', 'SKRINE_IMPORT', array(
		'ajax'  => admin_url( 'admin-ajax.php' ),
		'nonce' => wp_create_nonce( 'skrine_import' ),
		'steps' => $steps,
	) );
	wp_enqueue_style( 'skrine-admin', get_template_directory_uri() . '/admin/admin.css', array(), SKRINE_VERSION );
} );

function skrine_import_page() {
	$done   = get_option( 'skrine_import_done' );
	$counts = array();
	foreach ( skrine_import_types() as $k => $type ) {
		$c            = wp_count_posts( $type );
		$counts[ $k ] = $c ? (int) $c->publish : 0;
	}
	?>
	<div class="wrap skrine-import">
		<h1>Skrine: import the design's content</h1>
		<p>This copies the website's content into WordPress so it can be edited here:</p>
		<ul class="ul-disc">
			<li><strong>Images</strong> go into the <a href="<?php echo esc_url( admin_url( 'upload.php' ) ); ?>">Media Library</a>.</li>
			<li><strong>People, Alerts, Publications, News and Deals</strong> become posts in their own menus on the left (Upcoming Events starts empty).</li>
			<li><strong>Page wording</strong> goes into each page under <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=page' ) ); ?>">Pages</a>.</li>
		</ul>
		<p>It runs in small steps and takes a few minutes. Keep this tab open until it says it's finished. Running it again is safe: anything already imported is skipped.</p>

		<?php if ( $done ) : ?>
			<div class="notice notice-success inline"><p>The import has been run. People: <?php echo (int) $counts['people']; ?>, Alerts: <?php echo (int) $counts['alerts']; ?>, Publications: <?php echo (int) $counts['publications']; ?>, News: <?php echo (int) $counts['news']; ?>, Deals: <?php echo (int) $counts['deals']; ?>.</p></div>
		<?php endif; ?>

		<p><label><input type="checkbox" id="skrineOverwrite"> Also replace page wording that has already been edited, with the design's original wording</label></p>
		<p><button type="button" class="button button-primary button-hero" id="skrineRun"><?php echo $done ? 'Run the import again' : 'Start the import'; ?></button></p>

		<div id="skrineProgress" class="skrine-progress" hidden>
			<ol id="skrineSteps"></ol>
			<p id="skrineStatus" aria-live="polite"></p>
		</div>
	</div>
	<?php
}

add_action( 'wp_ajax_skrine_import', function () {
	check_ajax_referer( 'skrine_import', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Not allowed', 403 );
	}
	$step = isset( $_POST['step'] ) ? sanitize_key( $_POST['step'] ) : '';
	if ( ! isset( skrine_import_steps()[ $step ] ) ) {
		wp_send_json_error( 'Unknown step', 400 );
	}
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	}
	$offset    = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
	$overwrite = ! empty( $_POST['overwrite'] );
	wp_send_json_success( skrine_import_run( $step, $offset, $overwrite ) );
} );

/* a nudge until the import has run */
add_action( 'admin_notices', function () {
	if ( get_option( 'skrine_import_done' ) || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( $screen && $screen->id === 'toplevel_page_skrine' ) {
		return;
	}
	echo '<div class="notice notice-warning"><p><strong>Skrine theme:</strong> the site content is not in WordPress yet. '
		. '<a href="' . esc_url( admin_url( 'admin.php?page=skrine' ) ) . '">Run the import</a> to make it editable.</p></div>';
} );

/* WP-CLI: wp skrine import [--overwrite-pages] */
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'skrine import', function ( $args, $assoc ) {
		foreach ( array_keys( skrine_import_steps() ) as $step ) {
			$offset = 0;
			$total  = skrine_import_total( $step );
			while ( $offset < $total ) {
				$r      = skrine_import_run( $step, $offset, ! empty( $assoc['overwrite-pages'] ) );
				$offset = $r['done'];
				WP_CLI::log( sprintf( '%s: %d / %d', $step, $offset, $total ) );
			}
		}
		WP_CLI::success( 'Imported.' );
	} );
}
