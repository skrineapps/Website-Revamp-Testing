<?php
/**
 * Alerts, Publications, News, Upcoming Events and Deals: what editors add in wp-admin.
 * Fields are stored as post meta "_sk_<key>".
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function skrine_content_types() {
	return array(
		'skrine_alert'       => array(
			'plural'   => 'Alerts',
			'singular' => 'Alert',
			'icon'     => 'dashicons-megaphone',
			'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'notes'    => array(
				'editor'    => 'The full alert. Leave empty to list the alert without a full page.',
				'excerpt'   => 'Short summary shown on the Alerts page.',
				'thumbnail' => 'Optional. Without one, a photo is picked from the topic.',
			),
		),
		'skrine_publication' => array(
			'plural'   => 'Publications',
			'singular' => 'Publication',
			'icon'     => 'dashicons-book',
			'supports' => array( 'title', 'excerpt', 'thumbnail', 'revisions' ),
			'notes'    => array(
				'excerpt'   => 'Summary shown on the Publications page.',
				'thumbnail' => 'The cover.',
			),
		),
		'skrine_news'        => array(
			'plural'   => 'News',
			'singular' => 'News Story',
			'icon'     => 'dashicons-format-image',
			'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
			'notes'    => array(
				'editor'    => 'The full story. Leave empty to list the story without a full page.',
				'excerpt'   => 'Summary shown on News & Events.',
				'thumbnail' => 'The story photo.',
			),
		),
		'skrine_event'       => array(
			'plural'   => 'Upcoming Events',
			'singular' => 'Event',
			'icon'     => 'dashicons-calendar-alt',
			'supports' => array( 'title', 'excerpt' ),
			'notes'    => array( 'excerpt' => 'Optional short description.' ),
		),
		'skrine_person'      => array(
			'plural'   => 'People',
			'singular' => 'Person',
			'icon'     => 'dashicons-groups',
			'supports' => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'revisions' ),
			'notes'    => array(
				'title'     => 'Full name, as it should appear on the site.',
				'editor'    => 'Profile overview (partners and consultants). One paragraph per block.',
				'thumbnail' => 'Portrait photo. Partners and consultants show photos; other lawyers show initials.',
				'order'     => 'Position on the People page within their group (lower comes first).',
			),
		),
		'skrine_deal'        => array(
			'plural'   => 'Deals',
			'singular' => 'Deal',
			'icon'     => 'dashicons-portfolio',
			'supports' => array( 'title', 'excerpt', 'thumbnail', 'page-attributes' ),
			'notes'    => array(
				'title'     => 'The headline.',
				'excerpt'   => 'The summary paragraph.',
				'thumbnail' => 'Background photo.',
			),
		),
	);
}

/* field types: text, textarea, html (footnotes), lines (one per line), people (tag Skrine people; stored one name per line),
   sections ("## Heading" then one item per line), quotes (quote, then "— Source"; blank line between),
   date, url, file (media URL), gallery, select, checkbox.
   Optional 5th entry: the person roles a field applies to (People only). */
function skrine_person_roles() {
	return array( 'partners' => 'Partner', 'consultants' => 'Consultant', 'seniorAssociates' => 'Senior Associate', 'associates' => 'Associate' );
}

function skrine_fields( $type ) {
	$profile = array( 'partners', 'consultants' );
	$f       = array(
		'skrine_person'      => array(
			'group'        => array( 'Role', 'select', '', skrine_person_roles() ),
			'division'     => array( 'Division', 'text', 'Shown under the name on the People page, e.g. "Corporate" or "Dispute Resolution".', null, $profile ),
			'areas'        => array( 'Practice areas (search and filters)', 'lines', 'One per line. Used by the People page search and filters.', null, array( 'partners', 'consultants', 'seniorAssociates', 'associates' ) ),
			'email'        => array( 'Email', 'text', '', null, $profile ),
			'phone'        => array( 'Phone', 'text', 'e.g. +603 2081 3999 ext 906', null, $profile ),
			'key_areas'    => array( 'Key practice areas', 'lines', 'One per line. Shown on the profile (and on the senior associate details card).', null, array( 'partners', 'consultants', 'seniorAssociates' ) ),
			'quals'        => array( 'Qualifications', 'lines', 'One per line.', null, array( 'seniorAssociates' ) ),
			'affiliations' => array( 'Professional affiliations', 'lines', 'One per line.', null, array( 'seniorAssociates' ) ),
			'experience'   => array( 'Experience', 'sections', 'Start each practice area with "## " (e.g. "## Mergers & Acquisitions"), then one matter per line.', null, $profile ),
			'credentials'  => array( 'Credentials', 'sections', 'e.g. "## Qualifications" then one per line, "## Professional Affiliations" then one per line.', null, $profile ),
			'talks'        => array( 'Publications and talks', 'sections', 'Optional headings with "## ", then one item per line.', null, $profile ),
			'rankings'     => array( 'Rankings and recognition', 'lines', 'One per line.', null, $profile ),
			'quotes'       => array( 'Client quotes', 'quotes', 'The quote, then the source on its own line starting with "—" (e.g. "— Chambers Asia-Pacific 2026"). Leave a blank line between quotes.', null, $profile ),
		),
		'skrine_alert'       => array(
			'label'     => array( 'Label', 'select', '', array( '' => '(none)', 'Transaction News' => 'Transaction News', 'Employment Law Update' => 'Employment Law Update' ) ),
			'practice'  => array( 'Short practice label', 'text', 'Shown on the home page cards, e.g. "Tax" or "Corporate".' ),
			'authors'   => array( 'Authors', 'people', '' ),
			'notes'     => array( 'Footnotes', 'html', 'One footnote per line, in order (1, 2, 3…). Link to them in the text with <sup><a href="#note-1" id="ref-1">1</a></sup>.' ),
			'spotlight' => array( 'Home page', 'checkbox', 'Show in "In the Spotlight" on the home page' ),
		),
		'skrine_publication' => array(
			'publisher' => array( 'Publisher', 'text', 'e.g. Lexology, Chambers and Partners.' ),
			'authors'   => array( 'Authors', 'people', '' ),
			'pdf'       => array( 'PDF or link', 'file', 'Upload a PDF to the Media Library or paste a link.' ),
			'spotlight' => array( 'Home page', 'checkbox', 'Show in "In the Spotlight" on the home page' ),
		),
		'skrine_news'        => array(
			'people'  => array( 'Skrine people in the story', 'people', '' ),
			'gallery' => array( 'Photo gallery', 'gallery', 'Shown on the full story page.' ),
		),
		'skrine_event'       => array(
			'date'     => array( 'Date', 'date', '' ),
			'end_date' => array( 'End date', 'date', 'Only for events longer than a day.' ),
			'type'     => array( 'Type', 'text', 'e.g. Webinar, Seminar, Conference.' ),
			'time'     => array( 'Time', 'text', 'e.g. 9.00am – 12.30pm.' ),
			'location' => array( 'Location', 'text', '' ),
			'register' => array( 'Registration link', 'url', '' ),
			'people'   => array( 'Skrine speakers', 'people', '' ),
		),
		'skrine_deal'        => array(
			'sector'       => array( 'Sector', 'text', 'e.g. "Oil & Gas · Energy".' ),
			'figure'       => array( 'Figure', 'text', 'The big number, e.g. "6.5" or "US$2.325".' ),
			'unit'         => array( 'Figure unit', 'text', 'e.g. "bn", "tcf", "jurisdictions".' ),
			'figure_label' => array( 'Figure caption', 'text', 'The line under the figure.' ),
			'team'         => array( 'Skrine team', 'text', 'Names separated by " · ".' ),
			'date_text'    => array( 'Date line', 'text', 'e.g. "06 Nov 2026".' ),
			'client'       => array( 'Client (list)', 'text', 'Short name in the list on the right, e.g. "TotalEnergies".' ),
			'list_sector'  => array( 'Sector (list)', 'text', 'Short sector in the list, e.g. "Oil & Gas".' ),
		),
	);
	return isset( $f[ $type ] ) ? $f[ $type ] : array();
}

function skrine_meta( $post_id, $key ) {
	return get_post_meta( $post_id, '_sk_' . $key, true );
}

function skrine_register_content_types() {
	foreach ( skrine_content_types() as $type => $c ) {
		register_post_type( $type, array(
			'labels'       => array(
				'name'          => $c['plural'],
				'singular_name' => $c['singular'],
				'add_new_item'  => 'Add ' . $c['singular'],
				'edit_item'     => 'Edit ' . $c['singular'],
				'new_item'      => 'New ' . $c['singular'],
				'view_item'     => 'View ' . $c['singular'],
				'search_items'  => 'Search ' . $c['plural'],
				'all_items'     => 'All ' . $c['plural'],
			),
			'public'       => true,
			'rewrite'      => false,
			'has_archive'  => false,
			'show_in_rest' => true,
			'menu_icon'    => $c['icon'],
			'supports'     => $c['supports'],
			'hierarchical' => false,
		) );
	}

	register_taxonomy( 'skrine_topic', array( 'skrine_alert', 'skrine_publication' ), array(
		'labels'            => array( 'name' => 'Topics', 'singular_name' => 'Topic', 'add_new_item' => 'Add Topic' ),
		'hierarchical'      => true,
		'show_in_rest'      => true,
		'show_admin_column' => true,
		'rewrite'           => false,
	) );
	register_taxonomy( 'skrine_news_cat', array( 'skrine_news' ), array(
		'labels'            => array( 'name' => 'News Categories', 'singular_name' => 'News Category', 'add_new_item' => 'Add News Category' ),
		'hierarchical'      => true,
		'show_in_rest'      => true,
		'show_admin_column' => true,
		'rewrite'           => false,
	) );
}
add_action( 'init', 'skrine_register_content_types' );

/* ---------- "View" links go to the design pages ---------- */
add_filter( 'post_type_link', function ( $link, $post ) {
	switch ( $post->post_type ) {
		case 'skrine_alert':
			return trim( $post->post_content ) !== '' ? home_url( 'alert.html?a=' . rawurlencode( skrine_slugify( $post->post_title ) ) ) : home_url( 'alerts.html' );
		case 'skrine_news':
			return trim( $post->post_content ) !== '' ? home_url( 'news.html?n=' . rawurlencode( skrine_slugify( $post->post_title ) ) ) : home_url( 'news-events.html' );
		case 'skrine_publication':
			return home_url( 'publications.html' );
		case 'skrine_event':
			return home_url( 'news-events.html#upcoming' );
		case 'skrine_deal':
			return home_url( '/#deals' );
		case 'skrine_person':
			$role = skrine_meta( $post->ID, 'group' );
			return in_array( $role, array( 'partners', 'consultants' ), true )
				? home_url( 'profile.html?p=' . rawurlencode( skrine_person_slug( $post->post_title ) ) )
				: home_url( 'people.html?q=' . rawurlencode( $post->post_title ) );
	}
	return $link;
}, 10, 2 );

/* ---------- People use the classic edit screen ----------
 * Everything about a person (overview, role, contact details, experience, quotes) sits on
 * one page; the block editor would tuck the fields away in a panel under the text. */
add_filter( 'use_block_editor_for_post_type', function ( $use, $type ) {
	return $type === 'skrine_person' ? false : $use;
}, 10, 2 );

/* ---------- People: list columns, role filter, title placeholder ---------- */
add_filter( 'enter_title_here', function ( $text, $post ) {
	return $post->post_type === 'skrine_person' ? 'Full name' : $text;
}, 10, 2 );

add_filter( 'manage_skrine_person_posts_columns', function ( $cols ) {
	$out = array();
	foreach ( $cols as $k => $v ) {
		$out[ $k ] = $v;
		if ( $k === 'title' ) {
			$out['skrine_photo'] = 'Photo';
			$out['skrine_role']  = 'Role';
			$out['skrine_order'] = 'Order';
		}
	}
	unset( $out['date'] );
	return $out;
} );
add_action( 'manage_skrine_person_posts_custom_column', function ( $col, $id ) {
	if ( $col === 'skrine_photo' ) {
		echo get_the_post_thumbnail( $id, array( 44, 44 ), array( 'style' => 'width:44px;height:44px;object-fit:cover;border-radius:50%' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	} elseif ( $col === 'skrine_role' ) {
		$roles = skrine_person_roles();
		$r     = skrine_meta( $id, 'group' );
		echo esc_html( isset( $roles[ $r ] ) ? $roles[ $r ] : '—' );
	} elseif ( $col === 'skrine_order' ) {
		echo (int) get_post_field( 'menu_order', $id );
	}
}, 10, 2 );
add_action( 'restrict_manage_posts', function ( $type ) {
	if ( $type !== 'skrine_person' ) {
		return;
	}
	$cur = isset( $_GET['skrine_role'] ) ? sanitize_key( $_GET['skrine_role'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	echo '<select name="skrine_role"><option value="">All roles</option>';
	foreach ( skrine_person_roles() as $k => $v ) {
		echo '<option value="' . esc_attr( $k ) . '"' . selected( $cur, strtolower( $k ), false ) . '>' . esc_html( $v ) . '</option>';
	}
	echo '</select>';
} );
add_action( 'pre_get_posts', function ( $q ) {
	if ( ! is_admin() || ! $q->is_main_query() || $q->get( 'post_type' ) !== 'skrine_person' ) {
		return;
	}
	if ( ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', array( 'menu_order' => 'ASC', 'title' => 'ASC' ) );
	}
	$role = isset( $_GET['skrine_role'] ) ? sanitize_key( $_GET['skrine_role'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	foreach ( array_keys( skrine_person_roles() ) as $k ) {
		if ( strtolower( $k ) === $role ) {
			$q->set( 'meta_key', '_sk_group' );
			$q->set( 'meta_value', $k );
		}
	}
} );

/* ---------- field boxes ---------- */
add_action( 'add_meta_boxes', function () {
	foreach ( skrine_content_types() as $type => $c ) {
		if ( skrine_fields( $type ) ) {
			add_meta_box( 'skrine_fields', $c['singular'] . ' details', 'skrine_fields_box', $type, 'normal', 'high' );
		}
		if ( ! empty( $c['notes'] ) ) {
			add_meta_box( 'skrine_help', 'Where this appears', 'skrine_help_box', $type, 'side', 'low' );
		}
	}
} );

function skrine_help_box( $post ) {
	$c     = skrine_content_types()[ $post->post_type ];
	$names = array( 'title' => 'Title', 'editor' => 'Main text', 'excerpt' => 'Excerpt', 'thumbnail' => 'Featured image', 'order' => 'Order' );
	echo '<ul style="margin:0">';
	foreach ( $c['notes'] as $k => $text ) {
		echo '<li><strong>' . esc_html( $names[ $k ] ) . ':</strong> ' . esc_html( $text ) . '</li>';
	}
	echo '</ul>';
}

function skrine_fields_box( $post ) {
	wp_nonce_field( 'skrine_fields', 'skrine_fields_nonce' );
	echo '<table class="form-table skrine-fields" role="presentation">';
	foreach ( skrine_fields( $post->post_type ) as $key => $def ) {
		list( $label, $kind ) = $def;
		$help  = isset( $def[2] ) ? $def[2] : '';
		$value = skrine_meta( $post->ID, $key );
		$name  = 'skrine_f[' . $key . ']';
		$id    = 'skrine_f_' . $key;
		$roles = ! empty( $def[4] ) ? ' data-roles="' . esc_attr( implode( ' ', $def[4] ) ) . '"' : '';
		echo '<tr' . $roles . '><th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $label ) . '</label></th><td>'; // phpcs:ignore WordPress.Security.EscapeOutput
		switch ( $kind ) {
			case 'textarea':
			case 'lines':
			case 'html':
				echo '<textarea class="large-text" rows="4" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">' . esc_textarea( $value ) . '</textarea>';
				break;
			case 'sections':
			case 'quotes':
				echo '<textarea class="large-text skrine-long" rows="10" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">' . esc_textarea( $value ) . '</textarea>';
				break;
			case 'people':
				// chips + search; the names live in the hidden textarea (one per line)
				echo '<div class="skrine-people" data-target="' . esc_attr( $id ) . '">';
				echo '<ul class="skrine-people-chips" aria-label="Tagged people"></ul>';
				echo '<input type="text" class="regular-text skrine-people-search" list="skrine-people-list" placeholder="Type a name, then pick it from the list" autocomplete="off"> ';
				echo '<button type="button" class="button skrine-people-add">Add</button>';
				echo '<textarea hidden id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">' . esc_textarea( $value ) . '</textarea>';
				echo '</div>';
				$help = 'Pick Skrine people from the list: their names link to their profile (partners and consultants) or to the People page. '
					. 'Someone outside Skrine can be typed in and added too; their name shows without a link. Drag to change the order.';
				skrine_people_datalist();
				break;
			case 'date':
				echo '<input type="date" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '">';
				break;
			case 'url':
				echo '<input type="url" class="large-text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '">';
				break;
			case 'file':
				echo '<input type="text" class="large-text skrine-file-url" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '"> ';
				echo '<button type="button" class="button skrine-pick-file" data-target="' . esc_attr( $id ) . '">Choose from Media Library</button>';
				break;
			case 'gallery':
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $value ) ) );
				echo '<input type="hidden" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( implode( ',', $ids ) ) . '">';
				echo '<div class="skrine-gallery-preview" data-target="' . esc_attr( $id ) . '">';
				foreach ( $ids as $aid ) {
					echo wp_get_attachment_image( $aid, 'thumbnail' );
				}
				echo '</div><button type="button" class="button skrine-pick-gallery" data-target="' . esc_attr( $id ) . '">' . ( $ids ? 'Edit gallery' : 'Add photos' ) . '</button> ';
				echo '<button type="button" class="button-link skrine-clear-gallery" data-target="' . esc_attr( $id ) . '">Remove all</button>';
				break;
			case 'select':
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">';
				foreach ( $def[3] as $opt => $text ) {
					echo '<option value="' . esc_attr( $opt ) . '"' . selected( $value, $opt, false ) . '>' . esc_html( $text ) . '</option>';
				}
				echo '</select>';
				$help = '';
				break;
			case 'checkbox':
				echo '<label><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="1"' . checked( $value, '1', false ) . '> ' . esc_html( $help ) . '</label>';
				$help = '';
				break;
			default:
				echo '<input type="text" class="large-text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '">';
		}
		if ( $help ) {
			echo '<p class="description">' . esc_html( $help ) . '</p>';
		}
		echo '</td></tr>';
	}
	echo '</table>';
}

/* [ name, role ] for everyone: from People in wp-admin, or the design's list before the import */
function skrine_people_list() {
	if ( ! skrine_type_ready( 'skrine_person' ) ) {
		return skrine_people_directory();
	}
	$roles = skrine_person_roles();
	$out   = array();
	foreach ( skrine_query( 'skrine_person' ) as $p ) {
		$r     = skrine_meta( $p->ID, 'group' );
		$out[] = array( $p->post_title, isset( $roles[ $r ] ) ? $roles[ $r ] : '' );
	}
	return $out;
}

/* the Skrine directory, once per screen, for the people pickers */
function skrine_people_datalist() {
	static $done = false;
	if ( $done ) {
		return;
	}
	$done = true;
	echo '<datalist id="skrine-people-list">';
	foreach ( skrine_people_list() as $p ) {
		echo '<option value="' . esc_attr( $p[0] ) . '">' . esc_html( $p[1] ) . '</option>';
	}
	echo '</datalist>';
}

add_action( 'save_post', function ( $post_id, $post ) {
	if ( ! isset( $_POST['skrine_fields_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['skrine_fields_nonce'] ), 'skrine_fields' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$in = isset( $_POST['skrine_f'] ) ? wp_unslash( (array) $_POST['skrine_f'] ) : array();
	foreach ( skrine_fields( $post->post_type ) as $key => $def ) {
		$v = isset( $in[ $key ] ) ? $in[ $key ] : '';
		switch ( $def[1] ) {
			case 'lines':
			case 'people':
			case 'sections':
			case 'quotes':
			case 'textarea':
				$v = sanitize_textarea_field( $v );
				break;
			case 'html':
				$v = wp_kses_post( $v );
				break;
			case 'url':
			case 'file':
				$v = esc_url_raw( trim( $v ) );
				break;
			case 'date':
				$v = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $v ) ? $v : '';
				break;
			case 'gallery':
				$v = implode( ',', array_filter( array_map( 'absint', explode( ',', $v ) ) ) );
				break;
			case 'checkbox':
				$v = $v ? '1' : '';
				break;
			case 'select':
				$v = array_key_exists( $v, $def[3] ) ? $v : '';
				break;
			default:
				$v = sanitize_text_field( $v );
		}
		update_post_meta( $post_id, '_sk_' . $key, $v );
	}
}, 10, 2 );

/* ---------- admin scripts: media pickers ---------- */
add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$screen = get_current_screen();
	if ( $screen && isset( skrine_content_types()[ $screen->post_type ] ) && in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		wp_enqueue_media();
		// the site's own name matching, so the picker shows exactly what each name will link to
		wp_enqueue_script( 'skrine-people-data', skrine_data_url( 'people', 'people-data.js' ), array(), null, true );
		wp_enqueue_script( 'skrine-people-links', get_template_directory_uri() . '/js/people-links.js', array( 'skrine-people-data' ), SKRINE_VERSION, true );
		wp_enqueue_script( 'skrine-admin-fields', get_template_directory_uri() . '/admin/fields.js', array( 'jquery', 'skrine-people-links' ), SKRINE_VERSION, true );
		wp_enqueue_style( 'skrine-admin', get_template_directory_uri() . '/admin/admin.css', array(), SKRINE_VERSION );
	}
} );

/* ---------- order: newest first (Deals: by "Order", then newest) ---------- */
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() && $q->is_main_query() && $q->get( 'post_type' ) === 'skrine_deal' && ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', array( 'menu_order' => 'ASC', 'date' => 'DESC' ) );
	}
} );
