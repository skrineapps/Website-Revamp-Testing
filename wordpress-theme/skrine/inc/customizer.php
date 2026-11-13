<?php
/**
 * Appearance > Customize > Homepage
 *
 * One section per homepage section. Every default is the text/image in the
 * current index.html, so an untouched site looks exactly like the design.
 * Image defaults are paths inside the theme's assets folder.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * section id => [title, description, fields]
 * field id   => [label, type, default]   type: text | textarea | html | url | image | number
 */
function skrine_customizer_schema() {
	return array(
		'hero' => array( 'Hero', 'The large opening panel.', array(
			'hero_bg'          => array( 'Background image', 'image', 'images/hero-palette.jpg' ),
			'hero_eyebrow'     => array( 'Small line above the tagline', 'text', 'Skrine · Since 1963' ),
			'hero_word_1'      => array( 'Tagline word 1', 'text', 'Wisdom.' ),
			'hero_word_2'      => array( 'Tagline word 2', 'text', 'Fortitude.' ),
			'hero_word_3'      => array( 'Tagline word 3 (with colour swatch)', 'text', 'Ingenuity.' ),
			'hero_sub'         => array( 'Line below the tagline', 'text', 'Our Heritage, Your Legacy' ),
			'hero_btn1_label'  => array( 'Button 1: text', 'text', 'Our Story' ),
			'hero_btn1_link'   => array( 'Button 1: link', 'url', '/our-story/' ),
			'hero_btn2_label'  => array( 'Button 2: text', 'text', 'Explore Services' ),
			'hero_btn2_link'   => array( 'Button 2: link', 'url', '/capabilities/' ),
			'hero_badge1'      => array( 'Award badge 1', 'image', 'images/chambers-2026.png' ),
			'hero_badge1_alt'  => array( 'Award badge 1: description', 'text', 'Chambers Asia-Pacific 2026 — Top Ranked' ),
			'hero_badge2'      => array( 'Award badge 2', 'image', 'images/legal500-2026.png' ),
			'hero_badge2_alt'  => array( 'Award badge 2: description', 'text', 'Legal 500 Asia Pacific 2026 — Top Tier Firm' ),
		) ),

		'updates' => array( 'Legal Updates', skrine_admin_link( 'skrine_update', 'The cards themselves are edited in', 'Legal Updates' ), array(
			'updates_eyebrow'   => array( 'Small heading', 'text', 'Alerts & Insights' ),
			'updates_title'     => array( 'Heading', 'text', 'Legal Updates' ),
			'updates_count'     => array( 'How many cards to show', 'number', 8 ),
			'updates_cta_label' => array( 'Button text', 'text', 'All Legal Updates' ),
			'updates_cta_link'  => array( 'Button link', 'url', '#' ),
		) ),

		'deals' => array( 'Deals & Transactions', skrine_admin_link( 'skrine_deal', 'The deals themselves are edited in', 'Deals' ), array(
			'deals_eyebrow'   => array( 'Small heading', 'text', 'Transaction News' ),
			'deals_title'     => array( 'Heading', 'text', 'Deals & Transactions' ),
			'deals_deck'      => array( 'Line under the heading', 'text', "Landmark mandates shaping Malaysia's industries." ),
			'deals_cta_label' => array( 'Button text', 'text', 'All Transaction News' ),
			'deals_cta_link'  => array( 'Button link', 'url', '#' ),
		) ),

		'spotlight' => array( 'In the Spotlight', skrine_admin_link( 'skrine_spotlight', 'The cards themselves are edited in', 'Spotlight' ), array(
			'spot_eyebrow'   => array( 'Small heading', 'text', 'Alerts & Publications' ),
			'spot_title'     => array( 'Heading', 'text', 'In the Spotlight' ),
			'spot_cta_label' => array( 'Button text', 'text', 'More Spotlights' ),
			'spot_cta_link'  => array( 'Button link', 'url', '#' ),
		) ),

		'news' => array( 'News & Events', skrine_admin_link( 'skrine_news', 'The stories themselves are edited in', 'News' ), array(
			'news_eyebrow'   => array( 'Small heading', 'text', "What's Happening" ),
			'news_title'     => array( 'Heading', 'text', 'News & Events' ),
			'news_cta_label' => array( 'Button text', 'text', 'All News & Events' ),
		) ),

		'network' => array( 'Global Network', 'Text, figures and regional desks beside the globe.', array(
			'net_eyebrow'      => array( 'Small heading', 'text', 'Global Network' ),
			'net_title'        => array( 'Heading', 'text', 'Local expertise, global reach' ),
			'net_lead'         => array( 'Opening sentence (use <strong>…</strong> for bold)', 'html', "Skrine is the exclusive member firm in Malaysia for <strong>Lex Mundi</strong> — the world's leading network of independent law firms." ),
			'net_stat1_num'    => array( 'Figure 1: number', 'text', '21000' ),
			'net_stat1_suffix' => array( 'Figure 1: after the number', 'text', '+' ),
			'net_stat1_label'  => array( 'Figure 1: label', 'text', 'lawyers' ),
			'net_stat2_num'    => array( 'Figure 2: number', 'text', '100' ),
			'net_stat2_suffix' => array( 'Figure 2: after the number', 'text', '+' ),
			'net_stat2_label'  => array( 'Figure 2: label', 'text', 'countries' ),
			'net_stat3_num'    => array( 'Figure 3: number', 'text', '1' ),
			'net_stat3_suffix' => array( 'Figure 3: after the number', 'text', '' ),
			'net_stat3_label'  => array( 'Figure 3: label', 'text', 'point of contact' ),
			'net_body'         => array( 'Paragraph', 'textarea', 'Our membership positions us to seamlessly handle cross-border transactions and disputes, giving clients preferred access to in-depth experience worldwide — tapping into the best law practices and resources available internationally.' ),
			'net_desks_label'  => array( 'Desks: heading', 'text', 'Regional Desks' ),
			'net_desks_sub'    => array( 'Desks: line beside the heading', 'text', 'Dedicated teams for inbound investment' ),
			'desk_china_region' => array( 'China desk: region', 'text', 'East Asia' ),
			'desk_china_name'   => array( 'China desk: name', 'text', 'China Desk' ),
			'desk_china_local'  => array( 'China desk: small line', 'text', '中国服务组' ),
			'desk_china_link'   => array( 'China desk: link', 'url', '#' ),
			'desk_india_region' => array( 'India desk: region', 'text', 'South Asia' ),
			'desk_india_name'   => array( 'India desk: name', 'text', 'India Desk' ),
			'desk_india_local'  => array( 'India desk: small line', 'text', 'Indian investors & businesses' ),
			'desk_india_link'   => array( 'India desk: link', 'url', '#' ),
			'desk_mena_region'  => array( 'MENA desk: region', 'text', 'Middle East' ),
			'desk_mena_name'    => array( 'MENA desk: name', 'text', 'MENA Desk' ),
			'desk_mena_local'   => array( 'MENA desk: small line', 'text', 'Gulf & North African clients' ),
			'desk_mena_link'    => array( 'MENA desk: link', 'url', '#' ),
			'net_logo'          => array( 'Network logo', 'image', 'images/lexmundi.svg' ),
		) ),

		'awards' => array( 'Awards', skrine_admin_link( 'skrine_award', 'The row of smaller awards is edited in', 'Awards' ), array(
			'aw_eyebrow'      => array( 'Small heading', 'text', 'Recognition' ),
			'aw_title'        => array( 'Heading', 'text', 'Awards' ),
			'aw_deck'         => array( 'Line under the heading', 'text', 'Ranked by the directories our clients trust — year after year.' ),
			'aw1_badge'       => array( 'Card 1: badge', 'image', 'images/chambers-2026.png' ),
			'aw1_badge_alt'   => array( 'Card 1: badge description', 'text', 'Chambers Asia-Pacific 2026 — Top Ranked' ),
			'aw1_src'         => array( 'Card 1: source', 'text', 'Chambers Asia-Pacific · 2026 Guide' ),
			'aw1_num'         => array( 'Card 1: big number', 'text', '11' ),
			'aw1_label'       => array( 'Card 1: label beside the number', 'text', 'practice areas ranked' ),
			'aw1_list'        => array( 'Card 1: list', 'textarea', 'Construction · Employment & Industrial Relations · Intellectual Property · Projects, Infrastructure & Energy · TMT · Competition & Antitrust · Corporate/M&A · Dispute Resolution · Shipping · Real Estate · Banking & Finance' ),
			'aw1_note_num'    => array( 'Card 1: note number', 'text', '18' ),
			'aw1_note'        => array( 'Card 1: note text', 'text', 'partners individually ranked' ),
			'aw2_badge'       => array( 'Card 2: badge', 'image', 'images/legal500-2026.png' ),
			'aw2_badge_alt'   => array( 'Card 2: badge description', 'text', 'Legal 500 Asia Pacific 2026 — Top Tier Firm' ),
			'aw2_src'         => array( 'Card 2: source', 'text', 'Legal 500 Asia-Pacific · 2026 Edition' ),
			'aw2_num'         => array( 'Card 2: big number', 'text', '11' ),
			'aw2_label'       => array( 'Card 2: label beside the number', 'text', 'practice areas in Tier 1 & Tier 2' ),
			'aw2_list'        => array( 'Card 2: list', 'textarea', "Hall of Fame: To' Puan Janet Looi (Corporate and M&A) · Charmayne Ong (Intellectual Property and TMT)" ),
			'aw2_note_num'    => array( 'Card 2: note number (blank to hide the note)', 'text', '' ),
			'aw2_note'        => array( 'Card 2: note text', 'text', '' ),
			'aw_banner_src'   => array( 'Banner: source', 'text', 'Chambers Asia-Pacific & Greater China Region Awards 2024' ),
			'aw_banner_title' => array( 'Banner: award', 'text', '“Malaysia Law Firm of the Year”' ),
			'aw_cta_label'    => array( 'Button text', 'text', 'All Recognitions' ),
			'aw_cta_link'     => array( 'Button link', 'url', '#' ),
		) ),

		'alerts' => array( 'Alerts pages', skrine_admin_link( 'skrine_alert', 'The alerts themselves are edited in', 'Alerts' ), array(
			'alerts_intro'      => array( 'Alerts page: introduction', 'textarea', 'Timely updates from our practice teams on legal and regulatory developments in Malaysia — what changed, and what it means for your business.' ),
			'alerts_sub_title'  => array( 'Subscribe box: heading', 'text', 'Get our alerts in your inbox' ),
			'alerts_sub_text'   => array( 'Subscribe box: text', 'text', 'Receive legal updates from our practice teams as soon as they are published.' ),
			'alerts_sub_label'  => array( 'Subscribe box: button text', 'text', 'Subscribe' ),
			'alerts_sub_link'   => array( 'Subscribe box: button link', 'url', '#' ),
			'alerts_disclaimer' => array( 'Disclaimer at the end of each alert (<a href="…">links</a> allowed)', 'html', 'This alert contains general information only. It does not constitute legal advice nor an expression of legal opinion and should not be relied upon as such. For further information, kindly contact <a href="mailto:skrine@skrine.com">skrine@skrine.com</a>.' ),
		) ),

		'footer' => array( 'Footer', 'Shown at the bottom of every page.', array(
			'ft_logo'       => array( 'Member logo', 'image', 'images/lexmundi.svg' ),
			'ft_email'      => array( 'Email link (e.g. mailto:info@example.com)', 'url', '#' ),
			'ft_linkedin'   => array( 'LinkedIn link', 'url', '#' ),
			'ft_wechat'     => array( 'WeChat link', 'url', '#' ),
			'ft_disclaimer' => array( 'Disclaimer link', 'url', '/disclaimer/' ),
			'ft_pdpa'       => array( 'PDPA Notice link', 'url', '/pdpa-notice/' ),
		) ),
	);
}

/** Flat map of field id => [label, type, default]. */
function skrine_customizer_fields() {
	static $flat = null;
	if ( null === $flat ) {
		$flat = array();
		foreach ( skrine_customizer_schema() as $section ) {
			$flat += $section[2];
		}
	}
	return $flat;
}

/** A Customize value, falling back to the design's original. Images come back as full URLs. */
function skrine_mod( $key ) {
	$fields = skrine_customizer_fields();
	$f      = $fields[ $key ];
	$value  = get_theme_mod( $key, null );
	if ( null === $value || ( 'image' === $f[1] && '' === $value ) ) {
		$value = $f[2];
	}
	if ( 'image' === $f[1] && 0 === strpos( $value, 'images/' ) ) {
		$value = skrine_asset( $value );
	}
	return $value;
}

add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_panel( 'skrine_home', array(
		'title'       => 'Skrine Pages',
		'description' => 'Edit the text, images and links on the homepage and the Alerts pages. Changes show in the preview on the right; nothing is live until you click Publish.',
		'priority'    => 25,
	) );

	$priority = 0;
	foreach ( skrine_customizer_schema() as $section_id => $section ) {
		list( $title, $description, $fields ) = $section;
		$wp_customize->add_section( 'skrine_' . $section_id, array(
			'title'       => $title,
			'description' => $description,
			'panel'       => 'skrine_home',
			'priority'    => $priority += 10,
		) );

		foreach ( $fields as $key => $f ) {
			list( $label, $type, $default ) = $f;
			$sanitize = array(
				'text'     => 'sanitize_text_field',
				'textarea' => 'sanitize_textarea_field',
				'html'     => 'skrine_sanitize_inline_html',
				'url'      => 'skrine_sanitize_link',
				'image'    => 'esc_url_raw',
				'number'   => 'absint',
			);
			$wp_customize->add_setting( $key, array(
				'default'           => 'image' === $type ? skrine_asset( $default ) : $default,
				'sanitize_callback' => $sanitize[ $type ],
			) );

			if ( 'image' === $type ) {
				$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, $key, array(
					'label'   => $label,
					'section' => 'skrine_' . $section_id,
				) ) );
			} else {
				$wp_customize->add_control( $key, array(
					'label'       => $label,
					'section'     => 'skrine_' . $section_id,
					'type'        => array( 'html' => 'textarea', 'url' => 'text', 'number' => 'number' )[ $type ] ?? $type,
					'description' => 'url' === $type ? 'A full address, or a path on this site such as /people/' : '',
				) );
			}
		}
	}
} );

function skrine_sanitize_inline_html( $value ) {
	return wp_kses( $value, array( 'strong' => array(), 'em' => array(), 'br' => array(), 'a' => array( 'href' => array() ) ) );
}

function skrine_sanitize_link( $value ) {
	$value = trim( (string) $value );
	if ( '' === $value || '#' === $value || ( 0 === strpos( $value, '/' ) && 0 !== strpos( $value, '//' ) ) ) {
		return sanitize_text_field( $value );
	}
	return esc_url_raw( $value, array( 'http', 'https', 'mailto' ) );
}

/** "… edited in <Legal Updates>" with a link that leaves Customize for that admin list. */
function skrine_admin_link( $type, $text, $menu ) {
	return sprintf(
		'%s <a href="%s" target="_top"><strong>%s</strong></a> (in the black menu on the left of the dashboard). This opens it and closes Customize, so click Publish first if you changed anything here.',
		esc_html( $text ),
		esc_url( admin_url( 'edit.php?post_type=' . $type ) ),
		esc_html( $menu )
	);
}

/* Small output helpers for the templates */
function skrine_e( $key ) {
	echo esc_html( skrine_mod( $key ) );
}
function skrine_e_url( $key ) {
	echo esc_url( skrine_link( skrine_mod( $key ) ) );
}
function skrine_e_img( $key ) {
	echo esc_url( skrine_mod( $key ) );
}
