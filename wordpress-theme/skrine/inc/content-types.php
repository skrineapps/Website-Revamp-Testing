<?php
/**
 * The homepage's lists, each with its own admin menu and edit form:
 *   News, Legal Updates, Deals, Spotlight, Awards.
 *
 * Fields are plain WordPress meta boxes (no plugins). Each item's picture is
 * its "Featured image", relabelled per type.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Field definitions per post type: key => [label, type, help, options].
 * Types: text, textarea, url, select, checkbox.
 */
function skrine_fields() {
	return array(
		'skrine_update'    => array(
			'tag'  => array( 'Category label', 'text', 'Shown on the card, e.g. "Tax" or "Employment".' ),
			'link' => array( 'Link', 'url', 'Where "Read update" goes. Full address, or a path like /alerts/my-alert/.' ),
		),
		'skrine_deal'      => array(
			'sector'      => array( 'Sector line', 'text', 'Above the figure, e.g. "Tax · Dispute Resolution".' ),
			'num'         => array( 'Big figure', 'text', 'e.g. "RM1" or "US$2.325".' ),
			'unit'        => array( 'Figure unit', 'text', 'Smaller text after the figure, e.g. "bn". Can be blank.' ),
			'label'       => array( 'Figure caption', 'text', 'Under the figure, e.g. "sought in civil recovery suits in Malaysia".' ),
			'team'        => array( 'Skrine team', 'text', 'e.g. "Preetha Pillai · Nimalan Devaraja".' ),
			'date_label'  => array( 'Date or tag line', 'text', 'Bottom right of the card, e.g. "06 Nov 2026".' ),
			'list_figure' => array( 'List: figure', 'text', 'Short figure in the list on the right, e.g. "RM1bn".' ),
			'list_client' => array( 'List: client', 'text', 'e.g. "Kingdom of Denmark".' ),
			'list_sector' => array( 'List: sector', 'text', 'e.g. "Tax · Disputes".' ),
		),
		'skrine_spotlight' => array(
			'type'     => array( 'Type', 'select', 'Publications show the cover; alerts show a photo.', array( 'publication' => 'Publication', 'alert' => 'Alert' ) ),
			'meta'     => array( 'Practice and authors', 'text', 'Alerts only, e.g. "Fintech · Lee Ai Hsian".' ),
			'link'     => array( 'Link', 'url', 'Where the card goes. Full address, or a path like /publications/.' ),
			'featured' => array( 'Large card', 'checkbox', 'Show this one as the big card. Use on one item only.' ),
		),
		'skrine_award'     => array(
			'source' => array( 'Source and year', 'text', 'e.g. "IFLR1000 · 2023".' ),
		),
		'skrine_alert'     => array(
			'label'    => array( 'Series label', 'text', 'Optional tag before the topic, e.g. "Transaction News" or "Employment Law Update".' ),
			'practice' => array( 'Practice', 'text', 'Shown as "… Practice" under the title, e.g. "Employment Law".' ),
			'authors'  => array( 'Authors', 'textarea', 'One name per line, as on the People page. Lawyers with a profile get their photo and role.' ),
			'notes'    => array( 'Notes (footnotes)', 'html_lines', 'One note per line; they are numbered 1, 2, 3… In the article, link to a note with a superscript number.' ),
		),
	);
}

add_action( 'init', function () {
	$common = array(
		'public'             => true,
		'publicly_queryable' => false,   // these appear on the homepage, not on pages of their own
		'show_in_rest'       => false,   // simple form instead of the block editor
		'has_archive'        => false,
		'rewrite'            => false,
		'menu_position'      => 5,
	);

	register_post_type( 'skrine_news', array(
		'labels'             => array(
			'name'           => 'News',
			'singular_name'  => 'News Story',
			'add_new_item'   => 'Add News Story',
			'edit_item'      => 'Edit News Story',
			'all_items'      => 'All News',
			'featured_image' => 'Story image',
			'set_featured_image' => 'Set story image',
		),
		'public'             => true,
		'has_archive'        => 'news-events',
		'rewrite'            => array( 'slug' => 'news-events', 'with_front' => false ),
		'menu_icon'          => 'dashicons-megaphone',
		'menu_position'      => 5,
		'supports'           => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
		'show_in_rest'       => true,
	) );
	register_taxonomy( 'skrine_news_cat', 'skrine_news', array(
		'labels'            => array( 'name' => 'News Categories', 'singular_name' => 'News Category' ),
		'hierarchical'      => true,
		'show_admin_column' => true,
		'show_in_rest'      => true,
		'rewrite'           => array( 'slug' => 'news-category' ),
	) );

	register_post_type( 'skrine_update', $common + array(
		'labels'    => array(
			'name' => 'Legal Updates', 'singular_name' => 'Legal Update', 'add_new_item' => 'Add Legal Update',
			'edit_item' => 'Edit Legal Update', 'all_items' => 'All Legal Updates',
			'featured_image' => 'Card image', 'set_featured_image' => 'Set card image',
		),
		'menu_icon' => 'dashicons-media-document',
		'supports'  => array( 'title', 'thumbnail' ),
	) );

	register_post_type( 'skrine_deal', $common + array(
		'labels'    => array(
			'name' => 'Deals', 'singular_name' => 'Deal', 'add_new_item' => 'Add Deal',
			'edit_item' => 'Edit Deal', 'all_items' => 'All Deals',
			'featured_image' => 'Background image', 'set_featured_image' => 'Set background image',
		),
		'menu_icon' => 'dashicons-chart-line',
		'supports'  => array( 'title', 'excerpt', 'thumbnail', 'page-attributes' ),
	) );

	register_post_type( 'skrine_spotlight', $common + array(
		'labels'    => array(
			'name' => 'Spotlight', 'singular_name' => 'Spotlight Card', 'add_new_item' => 'Add Spotlight Card',
			'edit_item' => 'Edit Spotlight Card', 'all_items' => 'All Spotlight Cards',
			'featured_image' => 'Cover or photo', 'set_featured_image' => 'Set cover or photo',
		),
		'menu_icon' => 'dashicons-star-filled',
		'supports'  => array( 'title', 'thumbnail', 'page-attributes' ),
	) );

	register_post_type( 'skrine_award', $common + array(
		'labels'    => array(
			'name' => 'Awards', 'singular_name' => 'Award', 'add_new_item' => 'Add Award',
			'edit_item' => 'Edit Award', 'all_items' => 'All Awards',
			'featured_image' => 'Logo', 'set_featured_image' => 'Set logo',
		),
		'menu_icon' => 'dashicons-awards',
		'supports'  => array( 'title', 'thumbnail', 'page-attributes' ),
	) );

	// Alerts: their own list page (/alerts/) and article pages (/alerts/<name>/).
	register_post_type( 'skrine_alert', array(
		'labels'        => array(
			'name' => 'Alerts', 'singular_name' => 'Alert', 'add_new_item' => 'Add Alert',
			'edit_item' => 'Edit Alert', 'all_items' => 'All Alerts', 'view_item' => 'View Alert',
			'featured_image' => 'Photo (optional)', 'set_featured_image' => 'Set photo',
		),
		'public'        => true,
		'has_archive'   => 'alerts',
		'rewrite'       => array( 'slug' => 'alerts', 'with_front' => false ),
		'menu_icon'     => 'dashicons-warning',
		'menu_position' => 5,
		'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
		'show_in_rest'  => true,
	) );
	register_taxonomy( 'skrine_alert_topic', 'skrine_alert', array(
		'labels'            => array( 'name' => 'Alert Topics', 'singular_name' => 'Alert Topic', 'menu_name' => 'Topics' ),
		'hierarchical'      => true,
		'show_admin_column' => true,
		'show_in_rest'      => true,
		'rewrite'           => false,
		'description'       => 'The groups in the "Topic" filter on the Alerts page.',
	) );

	// Rewrite rules for new post types are refreshed once per theme version,
	// so nobody has to visit Settings > Permalinks after updating the theme.
	if ( get_option( 'skrine_rewrite_version' ) !== SKRINE_VERSION ) {
		flush_rewrite_rules();
		update_option( 'skrine_rewrite_version', SKRINE_VERSION );
	}
}, 20 );

// Clearer labels on the edit screens.
add_filter( 'enter_title_here', function ( $text, $post ) {
	$map = array(
		'skrine_update'    => 'Update headline',
		'skrine_deal'      => 'Deal headline',
		'skrine_spotlight' => 'Card title',
		'skrine_award'     => 'Award name, e.g. "Top-Tier Firm"',
	);
	return isset( $map[ $post->post_type ] ) ? $map[ $post->post_type ] : $text;
}, 10, 2 );

add_filter( 'gettext', function ( $translation, $text ) {
	if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
		return $translation;
	}
	$screen = get_current_screen();
	$type   = $screen ? $screen->post_type : '';
	if ( 'Excerpt' === $text && 'skrine_news' === $type ) {
		return 'Summary (shown on the homepage)';
	}
	if ( 'Excerpt' === $text && 'skrine_deal' === $type ) {
		return 'Summary paragraph';
	}
	if ( 'Excerpt' === $text && 'skrine_alert' === $type ) {
		return 'Summary (shown in the Alerts list)';
	}
	if ( 'Order' === $text && in_array( $type, array( 'skrine_deal', 'skrine_spotlight', 'skrine_award' ), true ) ) {
		return 'Position on the homepage (1 = first)';
	}
	if ( 'Page Attributes' === $text && in_array( $type, array( 'skrine_deal', 'skrine_spotlight', 'skrine_award' ), true ) ) {
		return 'Position';
	}
	return $translation;
}, 10, 2 );

// Hide the "Excerpts are optional..." help text on Deals, which would be misleading.
add_action( 'admin_head', function () {
	echo '<style>.post-type-skrine_deal #postexcerpt p,.post-type-skrine_news #postexcerpt p{display:none}.skrine-fields th{width:200px}.skrine-fields .description{margin-top:4px}</style>';
} );

/* ---------------------------------------------------------------
   Meta boxes
   --------------------------------------------------------------- */
add_action( 'add_meta_boxes', function () {
	foreach ( skrine_fields() as $type => $fields ) {
		add_meta_box( 'skrine_fields', 'Details', 'skrine_render_fields', $type, 'normal', 'high' );
	}
} );

function skrine_render_fields( $post ) {
	$fields = skrine_fields();
	wp_nonce_field( 'skrine_fields', 'skrine_fields_nonce' );
	echo '<table class="form-table skrine-fields" role="presentation">';
	foreach ( $fields[ $post->post_type ] as $key => $f ) {
		list( $label, $type, $help ) = $f;
		$name  = 'skrine_' . $key;
		$value = get_post_meta( $post->ID, $key, true );
		echo '<tr><th scope="row"><label for="' . esc_attr( $name ) . '">' . esc_html( $label ) . '</label></th><td>';
		switch ( $type ) {
			case 'textarea':
			case 'html_lines':
				printf( '<textarea id="%1$s" name="%1$s" rows="%3$d" class="large-text">%2$s</textarea>', esc_attr( $name ), esc_textarea( $value ), 'html_lines' === $type ? 5 : 3 );
				break;
			case 'select':
				printf( '<select id="%s" name="%s">', esc_attr( $name ), esc_attr( $name ) );
				foreach ( $f[3] as $opt => $opt_label ) {
					printf( '<option value="%s"%s>%s</option>', esc_attr( $opt ), selected( $value, $opt, false ), esc_html( $opt_label ) );
				}
				echo '</select>';
				break;
			case 'checkbox':
				printf( '<label><input type="checkbox" id="%s" name="%s" value="1"%s> Yes</label>', esc_attr( $name ), esc_attr( $name ), checked( $value, '1', false ) );
				break;
			default:
				printf( '<input type="text" id="%1$s" name="%1$s" value="%2$s" class="large-text">', esc_attr( $name ), esc_attr( $value ) );
		}
		if ( $help ) {
			echo '<p class="description">' . esc_html( $help ) . '</p>';
		}
		echo '</td></tr>';
	}
	echo '</table>';
}

add_action( 'save_post', function ( $post_id, $post ) {
	$fields = skrine_fields();
	if ( ! isset( $fields[ $post->post_type ] ) || defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! isset( $_POST['skrine_fields_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['skrine_fields_nonce'] ), 'skrine_fields' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	foreach ( $fields[ $post->post_type ] as $key => $f ) {
		$raw = isset( $_POST[ 'skrine_' . $key ] ) ? wp_unslash( $_POST[ 'skrine_' . $key ] ) : '';
		switch ( $f[1] ) {
			case 'textarea':
				$value = sanitize_textarea_field( $raw );
				break;
			case 'html_lines':
				$value = implode( "\n", array_filter( array_map( function ( $line ) {
					return trim( wp_kses_post( $line ) );
				}, preg_split( '/\r\n|\r|\n/', $raw ) ) ) );
				break;
			case 'url':
				$value = trim( $raw ) === '' ? '' : esc_url_raw( trim( $raw ), array( 'http', 'https', 'mailto' ) );
				// esc_url_raw drops bare paths like /alerts/x/ — keep those as typed.
				if ( '' === $value && 0 === strpos( trim( $raw ), '/' ) || '#' === trim( $raw ) ) {
					$value = sanitize_text_field( trim( $raw ) );
				}
				break;
			case 'select':
				$value = array_key_exists( $raw, $f[3] ) ? $raw : key( $f[3] );
				break;
			case 'checkbox':
				$value = $raw ? '1' : '';
				break;
			default:
				$value = sanitize_text_field( $raw );
		}
		update_post_meta( $post_id, $key, $value );
	}
}, 10, 2 );

// Show the picture and position in the admin lists so editors can scan them.
foreach ( array( 'skrine_update', 'skrine_deal', 'skrine_spotlight', 'skrine_award' ) as $skrine_type ) {
	add_filter( "manage_{$skrine_type}_posts_columns", function ( $cols ) {
		return array_slice( $cols, 0, 1, true ) + array( 'skrine_thumb' => 'Image' ) + array_slice( $cols, 1, null, true );
	} );
	add_action( "manage_{$skrine_type}_posts_custom_column", function ( $col, $post_id ) {
		if ( 'skrine_thumb' === $col ) {
			echo get_the_post_thumbnail( $post_id, array( 60, 60 ), array( 'style' => 'width:60px;height:auto' ) );
		}
	}, 10, 2 );
}
// Lists ordered the way they appear on the homepage.
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() && $q->is_main_query() && in_array( $q->get( 'post_type' ), array( 'skrine_deal', 'skrine_spotlight', 'skrine_award' ), true ) && ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', 'menu_order' );
		$q->set( 'order', 'ASC' );
	}
} );

/* ---------------------------------------------------------------
   Helpers used by the templates
   --------------------------------------------------------------- */
/** The title exactly as typed (WordPress would otherwise change ' to ’ and - to –). */
function skrine_title( $post ) {
	$post = get_post( $post );
	return $post ? $post->post_title : '';
}

function skrine_meta( $post, $key ) {
	return get_post_meta( is_object( $post ) ? $post->ID : $post, $key, true );
}

/** Paths like "/people/" become full site addresses; full URLs and "#" are kept. */
function skrine_link( $href ) {
	$href = trim( (string) $href );
	if ( '' === $href ) {
		return '#';
	}
	return 0 === strpos( $href, '/' ) && 0 !== strpos( $href, '//' ) ? home_url( $href ) : $href;
}

function skrine_items( $type, $count = -1 ) {
	$by_position = in_array( $type, array( 'skrine_deal', 'skrine_spotlight', 'skrine_award' ), true );
	return get_posts( array(
		'post_type'      => $type,
		'post_status'    => 'publish',
		'posts_per_page' => $count,
		'orderby'        => $by_position ? array( 'menu_order' => 'ASC', 'date' => 'DESC' ) : 'date',
		'order'          => $by_position ? 'ASC' : 'DESC',
	) );
}

function skrine_image_url( $post, $size = 'large' ) {
	return get_the_post_thumbnail_url( $post, $size ) ?: '';
}

function skrine_image_alt( $post ) {
	$id = get_post_thumbnail_id( $post );
	return $id ? (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) : '';
}
