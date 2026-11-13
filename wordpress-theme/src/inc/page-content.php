<?php
/**
 * Editable page wording.
 * Each design page keeps its header, footer and scripts in the theme; everything inside <main>
 * is the WordPress page's own content (Pages → Edit), one "Custom HTML" block per section.
 * An empty page shows the design's original wording from /content/<slug>.html.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function skrine_page_post( $slug ) {
	if ( $slug === 'home' ) {
		$id = (int) get_option( 'page_on_front' );
		return $id ? get_post( $id ) : null;
	}
	$q = get_queried_object();
	if ( $q instanceof WP_Post && $q->post_name === $slug ) {
		return $q;
	}
	return get_page_by_path( $slug );
}

function skrine_page_content( $slug ) {
	$post = skrine_page_post( $slug );

	// a page rebuilt with Elementor shows Elementor's layout instead
	if ( $post && class_exists( '\Elementor\Plugin' ) && get_post_meta( $post->ID, '_elementor_edit_mode', true ) === 'builder' ) {
		if ( isset( $_GET['elementor-preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			while ( have_posts() ) {
				the_post();
				the_content();
			}
			return;
		}
		echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $post->ID ); // phpcs:ignore WordPress.Security.EscapeOutput
		return;
	}

	$html = $post ? $post->post_content : '';
	if ( trim( $html ) === '' ) {
		$file = get_template_directory() . '/content/' . $slug . '.html';
		$html = file_exists( $file ) ? file_get_contents( $file ) : '';
	}
	if ( has_blocks( $html ) ) {
		$html = do_blocks( $html );
	}
	echo do_shortcode( $html ); // phpcs:ignore WordPress.Security.EscapeOutput -- editor content
}

/* the block editor: say what the page is, and that the design supplies header and footer */
add_action( 'admin_notices', function () {
	$screen = get_current_screen();
	if ( ! $screen || $screen->base !== 'post' || $screen->post_type !== 'page' ) {
		return;
	}
	global $post;
	if ( ! $post ) {
		return;
	}
	$slug = (int) get_option( 'page_on_front' ) === $post->ID ? 'home' : $post->post_name;
	if ( ! file_exists( get_template_directory() . '/content/' . $slug . '.html' ) ) {
		return;
	}
	echo '<div class="notice notice-info"><p><strong>Skrine design page.</strong> Each block is one section of the page: edit the wording inside it (the menu and footer come from the theme). '
		. 'Lists such as alerts, news and people are filled in automatically from their own sections in the admin menu.</p></div>';
} );
