<?php
/**
 * Alerts: Import from Word, a live preview in the site's design, and HTML editing.
 *
 * - The Add / Edit Alert screen (classic editor: Visual and HTML tabs) gets an "Import from Word" panel
 *   under the title (admin/alert-tools.js converts .docx / Word XML in the browser with mammoth.js)
 *   and a "Preview on the site" box, with an optional HTML code editor beside the preview.
 * - The preview is the real alert page (alert.html?a=skrine-preview) drawing the unsaved alert: the
 *   screen posts the current text and fields to it. WordPress's own Preview button opens the same page
 *   with the saved draft (or its latest autosave).
 * - Only logged-in people who can edit the alert see a preview; anyone else gets the normal page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SKRINE_PREVIEW_SLUG', 'skrine-preview' );

function skrine_preview_nonce_action( $id ) {
	return 'skrine_alert_preview_' . (int) $id;
}

/* ---------- the preview page ---------- */

/* the alert to preview, in the shape of js/alerts-full-data.js; false when this isn't a preview */
function skrine_alert_preview_data() {
	static $data = null;
	if ( $data !== null ) {
		return $data;
	}
	$data = false;
	// phpcs:disable WordPress.Security.NonceVerification -- checked below
	$id = isset( $_REQUEST['skrine_preview'] ) ? absint( $_REQUEST['skrine_preview'] ) : 0;
	if ( ! $id || ! is_user_logged_in() || ! current_user_can( 'edit_post', $id ) ) {
		return $data;
	}
	$nonce = isset( $_REQUEST['_skn'] ) ? sanitize_key( wp_unslash( $_REQUEST['_skn'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, skrine_preview_nonce_action( $id ) ) ) {
		return $data;
	}
	$post = get_post( $id );
	if ( ! $post || $post->post_type !== 'skrine_alert' ) {
		return $data;
	}

	if ( isset( $_SERVER['REQUEST_METHOD'] ) && $_SERVER['REQUEST_METHOD'] === 'POST' ) {
		// unsaved: what is on the edit screen right now (sk_ names: WordPress reads some plain names, such as title, as query settings)
		$in      = wp_unslash( $_POST );
		$title   = isset( $in['sk_title'] ) ? sanitize_text_field( $in['sk_title'] ) : '';
		$content = isset( $in['sk_content'] ) ? (string) $in['sk_content'] : '';
		$date    = isset( $in['sk_date'] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $in['sk_date'] ) ? $in['sk_date'] : current_time( 'Y-m-d' );
		$label   = isset( $in['sk_label'] ) ? sanitize_text_field( $in['sk_label'] ) : '';
		$prac    = isset( $in['sk_practice'] ) ? sanitize_text_field( $in['sk_practice'] ) : '';
		$topic   = isset( $in['sk_topic'] ) ? sanitize_text_field( $in['sk_topic'] ) : '';
		$authors = isset( $in['sk_authors'] ) ? skrine_lines( sanitize_textarea_field( $in['sk_authors'] ) ) : array();
		$notes   = isset( $in['sk_notes'] ) ? skrine_lines( wp_kses_post( $in['sk_notes'] ) ) : array();
	} else {
		// WordPress's Preview button: the saved alert, or the newer autosave of its text
		$title   = $post->post_title;
		$content = $post->post_content;
		$auto    = wp_get_post_autosave( $id, get_current_user_id() );
		if ( $auto && mysql2date( 'U', $auto->post_modified_gmt, false ) >= mysql2date( 'U', $post->post_modified_gmt, false ) ) {
			$title   = $auto->post_title;
			$content = $auto->post_content;
		}
		$date    = get_the_date( 'Y-m-d', $post );
		$label   = skrine_meta( $id, 'label' );
		$prac    = skrine_meta( $id, 'practice' );
		$topic   = skrine_term( $id, 'skrine_topic' );
		$authors = skrine_lines( skrine_meta( $id, 'authors' ) );
		$notes   = skrine_lines( skrine_meta( $id, 'notes' ) );
	}
	// phpcs:enable

	if ( ! current_user_can( 'unfiltered_html' ) ) {
		$content = wp_kses_post( $content );
	}
	$body = has_blocks( $content ) ? do_blocks( $content ) : wpautop( $content );

	$data = array(
		'slug'     => SKRINE_PREVIEW_SLUG,
		'title'    => $title !== '' ? $title : '(No title yet)',
		'label'    => $label !== '' ? $label : null,
		'date'     => $date,
		'topic'    => $topic,
		'practice' => $prac,
		'authors'  => array_map( function ( $n ) { return array( 'name' => $n, 'role' => '' ); }, $authors ),
		'body'     => array( do_shortcode( $body ) ),
		'notes'    => array_map( function ( $html, $i ) { return array( 'n' => $i + 1, 'html' => $html ); }, $notes, array_keys( $notes ) ),
		'preview'  => true,
	);
	return $data;
}

// add the alert after the alert data has loaded, before js/alert-page.js draws the page
add_action( 'skrine_data_printed', function ( $set ) {
	if ( $set !== 'alerts' ) {
		return;
	}
	$d = skrine_alert_preview_data();
	if ( ! $d ) {
		return;
	}
	echo '<script>window.SKRINE_ALERTS_FULL = window.SKRINE_ALERTS_FULL || {}; window.SKRINE_ALERTS_FULL[' . wp_json_encode( SKRINE_PREVIEW_SLUG ) . '] = '
		. wp_json_encode( $d, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ) . ";</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput -- JSON with < > & escaped
} );

add_action( 'template_redirect', function () {
	if ( ! skrine_alert_preview_data() ) {
		return;
	}
	nocache_headers();
	add_filter( 'wp_robots', 'wp_robots_no_robots' );
	add_filter( 'show_admin_bar', '__return_false' );
	// a small "Preview" tag, so a preview is never mistaken for the live page
	add_action( 'wp_footer', function () {
		echo '<div style="position:fixed;left:16px;bottom:16px;z-index:999;padding:6px 14px;border-radius:20px;background:#2a2a2a;color:#fff;font:700 12px/1.6 Karla,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,.2)">Preview · not published</div>';
	} );
}, 1 );

// WordPress's Preview button on an alert opens the alert page with that alert
add_filter( 'preview_post_link', function ( $link, $post ) {
	if ( ! $post || $post->post_type !== 'skrine_alert' ) {
		return $link;
	}
	return skrine_alert_preview_url( $post->ID );
}, 10, 2 );

function skrine_alert_preview_url( $id ) {
	return add_query_arg(
		array(
			'a'              => SKRINE_PREVIEW_SLUG,
			'skrine_preview' => (int) $id,
			'_skn'           => wp_create_nonce( skrine_preview_nonce_action( $id ) ),
		),
		home_url( 'alert.html' )
	);
}

/* ---------- the edit screen ---------- */

add_action( 'edit_form_after_title', function ( $post ) {
	if ( $post->post_type !== 'skrine_alert' ) {
		return;
	}
	?>
	<div id="skrine-word" class="skrine-word">
		<div class="skrine-word-drop" id="skrine-word-drop">
			<span class="dashicons dashicons-media-document" aria-hidden="true"></span>
			<div>
				<strong>Import from Word</strong>
				<p>Drop the alert's Word file here (.docx, or Word's "Save as XML" file), or
					<label class="button button-secondary skrine-word-choose">Choose file<input type="file" id="skrine-word-file" accept=".docx,.xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/xml,application/xml" hidden></label>
				</p>
				<p class="description">Headings, bold and italics, numbered and lettered lists, tables, links, images, alignment and footnotes come across. The site's design sets the fonts, colours and spacing. You can check everything before it goes into the alert.</p>
			</div>
		</div>
		<div class="skrine-word-status" id="skrine-word-status" role="status" aria-live="polite"></div>
		<div class="skrine-word-result" id="skrine-word-result" hidden>
			<div class="skrine-word-found">
				<h3>Found in <span id="skrine-word-name"></span></h3>
				<dl id="skrine-word-summary"></dl>
				<ul class="skrine-word-notes" id="skrine-word-warnings"></ul>
				<label class="skrine-word-opt"><input type="checkbox" id="skrine-word-fields" checked> Also fill in the title, date, authors, practice, topic and excerpt</label>
				<label class="skrine-word-opt"><input type="checkbox" id="skrine-word-bold" checked> Turn bold one-line paragraphs into subheadings</label>
				<div class="skrine-word-actions">
					<button type="button" class="button button-primary button-large" id="skrine-word-use">Use this content</button>
					<button type="button" class="button button-large" id="skrine-word-cancel">Cancel</button>
				</div>
			</div>
			<div class="skrine-word-preview">
				<p class="skrine-pv-label">How it will look on the site</p>
				<div class="skrine-pv-frame" data-device="desktop"><iframe name="skrine-word-frame" id="skrine-word-frame" title="Preview of the imported alert"></iframe></div>
			</div>
		</div>
	</div>
	<?php
} );

add_action( 'add_meta_boxes_skrine_alert', function () {
	add_meta_box( 'skrine_alert_preview', 'Preview on the site', 'skrine_alert_preview_box', 'skrine_alert', 'normal', 'high' );
} );

function skrine_alert_preview_box( $post ) {
	?>
	<div class="skrine-pv-bar">
		<div class="skrine-pv-seg" role="group" aria-label="Screen size">
			<button type="button" class="button" data-device="desktop" aria-pressed="true"><span class="dashicons dashicons-desktop" aria-hidden="true"></span> Desktop</button>
			<button type="button" class="button" data-device="phone" aria-pressed="false"><span class="dashicons dashicons-smartphone" aria-hidden="true"></span> Phone</button>
		</div>
		<button type="button" class="button" id="skrine-pv-html" aria-pressed="false"><span class="dashicons dashicons-editor-code" aria-hidden="true"></span> Edit HTML beside the preview</button>
		<button type="button" class="button" id="skrine-pv-refresh"><span class="dashicons dashicons-update" aria-hidden="true"></span> Refresh</button>
		<span class="skrine-pv-state" id="skrine-pv-state" aria-live="polite"></span>
		<a class="button" id="skrine-pv-open" href="#">Open full preview <span class="dashicons dashicons-external" aria-hidden="true"></span></a>
	</div>
	<div class="skrine-pv-split" id="skrine-pv-split">
		<div class="skrine-pv-code" id="skrine-pv-code" hidden>
			<label for="skrine-html" class="screen-reader-text">Alert HTML</label>
			<textarea id="skrine-html" rows="30"></textarea>
			<p class="description">Changes here go straight into the alert text and the preview. Footnotes are in the Footnotes field below; link to them with <code>&lt;sup&gt;&lt;a href="#note-1" id="ref-1"&gt;1&lt;/a&gt;&lt;/sup&gt;</code>.</p>
		</div>
		<div class="skrine-pv-frame" id="skrine-pv-frame" data-device="desktop"><iframe name="skrine-pv-iframe" id="skrine-pv-iframe" title="Preview of this alert"></iframe></div>
	</div>
	<p class="description">Updates as you type. The preview shows the unsaved alert; nothing is published until you press Publish or Update.</p>
	<?php
}

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$screen = get_current_screen();
	if ( ! $screen || $screen->post_type !== 'skrine_alert' || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	global $post;
	$code = wp_enqueue_code_editor( array( 'type' => 'text/html', 'codemirror' => array( 'lineWrapping' => true ) ) );
	$topics = get_terms( array( 'taxonomy' => 'skrine_topic', 'hide_empty' => false ) );
	wp_enqueue_script( 'wp-api-fetch' );
	wp_enqueue_script( 'skrine-alert-tools', get_template_directory_uri() . '/admin/alert-tools.js', array( 'jquery', 'wp-api-fetch', 'skrine-admin-fields' ), SKRINE_VERSION, true );
	wp_localize_script( 'skrine-alert-tools', 'SKRINE_ALERT_TOOLS', array(
		'postId'     => $post ? (int) $post->ID : 0,
		'previewUrl' => home_url( 'alert.html?a=' . SKRINE_PREVIEW_SLUG ),
		'openUrl'    => $post ? skrine_alert_preview_url( $post->ID ) : '',
		'nonce'      => $post ? wp_create_nonce( skrine_preview_nonce_action( $post->ID ) ) : '',
		'mammoth'    => get_template_directory_uri() . '/admin/vendor/mammoth.min.js?v=1.8.0',
		'code'       => $code ? $code : null,
		'topics'     => is_array( $topics ) ? array_map( function ( $t ) { return array( 'id' => $t->term_id, 'name' => html_entity_decode( $t->name, ENT_QUOTES, 'UTF-8' ) ); }, $topics ) : array(),
		'labels'     => array_values( array_filter( array_keys( skrine_fields( 'skrine_alert' )['label'][3] ) ) ),
		'home'       => home_url( '/' ),
	) );
} );
