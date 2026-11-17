<?php
/**
 * The site header and footer, drawn in the design's markup from:
 *   Appearance → Menus      "Skrine main menu" (header) and "Skrine footer links"
 *   Appearance → Customize  Header (logo, search text) and Footer (member logo, social links, copyright)
 * A menu item with sub-items becomes a dropdown. Give it the link "#" for a dropdown-only heading
 * (like Capabilities), or a real link to make the heading clickable too (like Career).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'after_setup_theme', function () {
	register_nav_menus( array(
		'primary' => 'Header menu',
		'footer'  => 'Footer links (next to the copyright)',
	) );
} );

/* ---------- menus on activation: built from the design, so they can be edited straight away ---------- */
function skrine_menu_url( $link ) {
	if ( $link === '#' || $link === '' ) {
		return '#';
	}
	return preg_match( '#^(https?:|mailto:|tel:)#', $link ) ? $link : home_url( $link );
}

function skrine_make_menu( $name, $items ) {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		return (int) $menu->term_id;
	}
	$id = wp_create_nav_menu( $name );
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	$pos = 0;
	foreach ( $items as $it ) {
		$parent = wp_update_nav_menu_item( $id, 0, array(
			'menu-item-title'    => $it[0],
			'menu-item-url'      => skrine_menu_url( $it[1] ),
			'menu-item-type'     => 'custom',
			'menu-item-status'   => 'publish',
			'menu-item-position' => ++$pos,
		) );
		foreach ( $it[2] as $child ) {
			wp_update_nav_menu_item( $id, 0, array(
				'menu-item-title'     => $child[0],
				'menu-item-url'       => skrine_menu_url( $child[1] ),
				'menu-item-type'      => 'custom',
				'menu-item-status'    => 'publish',
				'menu-item-parent-id' => is_wp_error( $parent ) ? 0 : $parent,
				'menu-item-position'  => ++$pos,
			) );
		}
	}
	return (int) $id;
}

function skrine_setup_menus() {
	$locs = (array) get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locs['primary'] ) || ! wp_get_nav_menu_object( $locs['primary'] ) ) {
		$locs['primary'] = skrine_make_menu( 'Skrine main menu', skrine_default_menu() );
	}
	if ( empty( $locs['footer'] ) || ! wp_get_nav_menu_object( $locs['footer'] ) ) {
		$locs['footer'] = skrine_make_menu( 'Skrine footer links', skrine_default_footer_links() );
	}
	set_theme_mod( 'nav_menu_locations', $locs );
}

/* [ [ title, url, target, children[] ] ] for a menu location; the design's menu if none is set */
function skrine_menu_tree( $location ) {
	$locs = get_nav_menu_locations();
	$menu = ! empty( $locs[ $location ] ) ? wp_get_nav_menu_object( $locs[ $location ] ) : null;
	if ( ! $menu ) {
		$fallback = $location === 'primary' ? skrine_default_menu() : skrine_default_footer_links();
		return array_map( function ( $it ) {
			return array(
				'title'    => $it[0],
				'url'      => skrine_menu_url( $it[1] ),
				'target'   => '',
				'children' => array_map( function ( $c ) {
					return array( 'title' => $c[0], 'url' => skrine_menu_url( $c[1] ), 'target' => '', 'children' => array() );
				}, $it[2] ),
			);
		}, $fallback );
	}
	$items = (array) wp_get_nav_menu_items( $menu->term_id, array( 'update_post_term_cache' => false ) );
	$node  = function ( $i ) {
		return array( 'title' => $i->title, 'url' => $i->url, 'target' => $i->target, 'children' => array() );
	};
	$tree  = array();
	$index = array();
	foreach ( $items as $i ) {
		if ( ! (int) $i->menu_item_parent ) {
			$index[ $i->ID ] = count( $tree );
			$tree[]          = $node( $i );
		}
	}
	// two levels, like the design (deeper items are left out)
	foreach ( $items as $i ) {
		$p = (int) $i->menu_item_parent;
		if ( $p && isset( $index[ $p ] ) ) {
			$tree[ $index[ $p ] ]['children'][] = $node( $i );
		}
	}
	return $tree;
}

/* which design page we are on, as the menu sees it (an alert counts as Alerts, a job as Career, …) */
function skrine_template_slug() {
	if ( is_front_page() ) {
		return 'home';
	}
	if ( ! empty( $GLOBALS['skrine_item_page'] ) ) {
		return $GLOBALS['skrine_item_page'];
	}
	$o = get_queried_object();
	return $o instanceof WP_Post && $o->post_type === 'page' ? $o->post_name : '';
}

function skrine_menu_slug() {
	$parent = array(
		'alert' => 'alerts', 'news' => 'news-events', 'job' => 'careers', 'life-story' => 'careers', 'profile' => 'people',
		'profile-classic' => 'people', 'practice-area' => 'capabilities', 'sector' => 'sectors',
	);
	$s = skrine_template_slug();
	return isset( $parent[ $s ] ) ? $parent[ $s ] : $s;
}

function skrine_url_slug( $url ) {
	if ( ! $url || $url[0] === '#' ) {
		return '';
	}
	$path = (string) wp_parse_url( $url, PHP_URL_PATH );
	$home = rtrim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && strpos( $path, $home ) === 0 ) {
		$path = substr( $path, strlen( $home ) );
	}
	$path = trim( $path, '/' );
	return $path === '' ? 'home' : preg_replace( '/\.html$/', '', basename( $path ) );
}

function skrine_link_attrs( $node ) {
	$a = ' href="' . esc_url( $node['url'] ) . '"';
	if ( $node['target'] === '_blank' ) {
		$a .= ' target="_blank" rel="noopener"';
	}
	return $a;
}

/* ---------- settings: Appearance → Customize ---------- */
function skrine_layout_defaults() {
	return array(
		'skrine_logo'               => 0,
		'skrine_logo_alt'           => 'Skrine',
		'skrine_search_placeholder' => 'Search people, practices, insights…',
		'skrine_member_label'       => "Proud to be a\nmember of",
		'skrine_member_logo'        => 0,
		'skrine_member_alt'         => 'Lex Mundi — Bringing the best together',
		'skrine_connect_label'      => 'Connect with us',
		'skrine_email'              => '#',
		'skrine_linkedin'           => '#',
		'skrine_wechat'             => '#',
		'skrine_copyright'          => '© 1963 – {year} Skrine. All rights reserved',
	);
}

function skrine_mod( $key ) {
	$d = skrine_layout_defaults();
	return get_theme_mod( $key, $d[ $key ] );
}

add_action( 'customize_register', function ( $wp ) {
	$d = skrine_layout_defaults();
	$wp->add_section( 'skrine_header', array(
		'title'       => 'Skrine header',
		'priority'    => 25,
		'description' => 'The menu links are edited in Appearance → Menus ("Skrine main menu").',
	) );
	$wp->add_section( 'skrine_footer', array(
		'title'       => 'Skrine footer',
		'priority'    => 26,
		'description' => 'The links next to the copyright (Disclaimer, PDPA Notice…) are edited in Appearance → Menus ("Skrine footer links").',
	) );

	$add = function ( $id, $section, $label, $type, $desc = '' ) use ( $wp, $d ) {
		$wp->add_setting( $id, array(
			'default'           => $d[ $id ],
			'sanitize_callback' => $type === 'media' ? 'absint' : ( $type === 'textarea' ? 'sanitize_textarea_field' : ( $type === 'link' ? 'skrine_sanitize_link' : 'sanitize_text_field' ) ),
		) );
		if ( $type === 'media' ) {
			$wp->add_control( new WP_Customize_Media_Control( $wp, $id, array( 'label' => $label, 'section' => $section, 'mime_type' => 'image', 'description' => $desc ) ) );
		} else {
			$wp->add_control( $id, array( 'label' => $label, 'section' => $section, 'type' => $type === 'link' ? 'text' : $type, 'description' => $desc ) );
		}
	};
	$add( 'skrine_logo', 'skrine_header', 'Logo', 'media', 'Leave empty to use the Skrine logo from the design.' );
	$add( 'skrine_logo_alt', 'skrine_header', 'Logo text for screen readers', 'text' );
	$add( 'skrine_search_placeholder', 'skrine_header', 'Search box hint', 'text' );

	$add( 'skrine_member_label', 'skrine_footer', 'Membership text', 'textarea', 'A new line in the text starts a new line on the site.' );
	$add( 'skrine_member_logo', 'skrine_footer', 'Membership logo', 'media', 'Leave empty to use the Lex Mundi logo from the design.' );
	$add( 'skrine_member_alt', 'skrine_footer', 'Membership logo text for screen readers', 'text' );
	$add( 'skrine_connect_label', 'skrine_footer', '"Connect with us" text', 'text' );
	$add( 'skrine_email', 'skrine_footer', 'Email (address or link)', 'link', 'e.g. enquiry@skrine.com. Leave empty to hide the icon.' );
	$add( 'skrine_linkedin', 'skrine_footer', 'LinkedIn link', 'link', 'Leave empty to hide the icon.' );
	$add( 'skrine_wechat', 'skrine_footer', 'WeChat link', 'link', 'Leave empty to hide the icon.' );
	$add( 'skrine_copyright', 'skrine_footer', 'Copyright line', 'text', '{year} is replaced by the current year.' );
} );

function skrine_sanitize_link( $v ) {
	$v = trim( (string) $v );
	if ( $v === '' || $v === '#' ) {
		return $v;
	}
	if ( is_email( $v ) ) {
		return 'mailto:' . $v;
	}
	return esc_url_raw( $v, array( 'http', 'https', 'mailto', 'tel', 'weixin' ) );
}

function skrine_image_mod( $key, $fallback ) {
	$id = (int) skrine_mod( $key );
	if ( $id ) {
		$src = wp_get_attachment_image_src( $id, 'full' );
		if ( $src ) {
			return array( $src[0], (int) $src[1], (int) $src[2] );
		}
	}
	return array( get_template_directory_uri() . '/' . $fallback[0], $fallback[1], $fallback[2] );
}

/* ---------- header ---------- */
function skrine_header( $class = '' ) {
	$current = skrine_menu_slug();
	$logo    = skrine_image_mod( 'skrine_logo', array( 'images/skrine-logo.png', 475, 94 ) );
	$used    = array();
	?>
<header class="site-header<?php echo $class ? ' ' . esc_attr( $class ) : ''; ?>" id="siteHeader">
    <div class="header-inner">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ?: 'Skrine' ); ?> home">
        <img src="<?php echo esc_url( $logo[0] ); ?>" alt="<?php echo esc_attr( skrine_mod( 'skrine_logo_alt' ) ); ?>" class="brand-logo"<?php echo $logo[1] ? ' width="' . (int) $logo[1] . '" height="' . (int) $logo[2] . '"' : ''; ?>>
      </a>

      <nav class="main-nav" id="primaryNav" aria-label="Primary">
        <ul class="nav-list">
<?php
	foreach ( skrine_menu_tree( 'primary' ) as $item ) {
		$is_current = skrine_url_slug( $item['url'] ) === $current;
		foreach ( $item['children'] as $c ) {
			$is_current = $is_current || skrine_url_slug( $c['url'] ) === $current;
		}
		$cur = $is_current ? ' aria-current="page"' : '';
		if ( ! $item['children'] ) {
			echo '          <li class="nav-item"><a' . skrine_link_attrs( $item ) . ' class="nav-link"' . $cur . '>' . esc_html( $item['title'] ) . "</a></li>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
			continue;
		}
		$mid = 'menu-' . ( sanitize_title( $item['title'] ) ?: 'item' );
		while ( isset( $used[ $mid ] ) ) {
			$mid .= '-x';
		}
		$used[ $mid ] = true;
		$caret        = '<i class="fa-solid fa-chevron-down nav-caret" aria-hidden="true"></i>';
		echo '          <li class="nav-item has-menu">' . "\n";
		if ( $item['url'] === '#' || $item['url'] === '' ) {
			echo '            <button type="button" class="nav-link nav-trigger" aria-expanded="false" aria-controls="' . esc_attr( $mid ) . '"' . $cur . '>' . esc_html( $item['title'] ) . ' ' . $caret . "</button>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		} else {
			echo '            <a' . skrine_link_attrs( $item ) . ' class="nav-link"' . $cur . '>' . esc_html( $item['title'] ) . "</a>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
			echo '            <button type="button" class="nav-caret-btn nav-trigger" aria-expanded="false" aria-controls="' . esc_attr( $mid ) . '" aria-label="' . esc_attr( $item['title'] . ' menu' ) . '">' . $caret . "</button>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '            <ul class="nav-menu" id="' . esc_attr( $mid ) . '">' . "\n";
		foreach ( $item['children'] as $c ) {
			echo '              <li><a' . skrine_link_attrs( $c ) . '>' . esc_html( $c['title'] ) . "</a></li>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo "            </ul>\n          </li>\n";
	}
	?>
        </ul>
      </nav>

      <button class="icon-btn search-toggle" id="searchToggle" aria-label="Search">
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>

      <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <form class="search-bar" id="searchBar" role="search" onsubmit="return false;">
      <input type="search" placeholder="<?php echo esc_attr( skrine_mod( 'skrine_search_placeholder' ) ); ?>" aria-label="Search the site">
      <button type="submit" aria-label="Submit search"><i class="fa-solid fa-arrow-right"></i></button>
    </form>
  </header>
	<?php
}

/* ---------- footer ---------- */
function skrine_footer( $class = '' ) {
	$member = skrine_image_mod( 'skrine_member_logo', array( 'images/lexmundi.svg', 0, 0 ) );
	$social = array(
		array( 'skrine_email', 'Email', 'fa-regular fa-envelope' ),
		array( 'skrine_linkedin', 'LinkedIn', 'fa-brands fa-linkedin' ),
		array( 'skrine_wechat', 'WeChat', 'fa-brands fa-weixin' ),
	);
	$copy = esc_html( skrine_mod( 'skrine_copyright' ) );
	$copy = str_replace( '{year}', '<span id="year">' . esc_html( current_time( 'Y' ) ) . '</span>', $copy );
	?>
<footer class="site-footer<?php echo $class ? ' ' . esc_attr( $class ) : ''; ?>">
    <div class="footer-inner">
      <div class="footer-member">
        <span class="member-label"><?php echo nl2br( esc_html( skrine_mod( 'skrine_member_label' ) ), false ); ?></span>
        <img src="<?php echo esc_url( $member[0] ); ?>" alt="<?php echo esc_attr( skrine_mod( 'skrine_member_alt' ) ); ?>" class="member-logo">
      </div>

      <div class="footer-connect">
        <span><?php echo esc_html( skrine_mod( 'skrine_connect_label' ) ); ?></span>
<?php
	foreach ( $social as $s ) {
		$url = skrine_mod( $s[0] );
		if ( $url === '' ) {
			continue;
		}
		$ext = preg_match( '#^https?://#', $url ) ? ' target="_blank" rel="noopener"' : '';
		echo '        <a href="' . esc_url( $url, array( 'http', 'https', 'mailto', 'tel', 'weixin' ) ) . '" aria-label="' . esc_attr( $s[1] ) . '"' . $ext . '><i class="' . esc_attr( $s[2] ) . '"></i></a>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	?>
      </div>
    </div>
    <p class="footer-legal">
      <?php echo $copy; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped above ?>
<?php
	foreach ( skrine_menu_tree( 'footer' ) as $l ) {
		echo '      <span class="sep">|</span> <a' . skrine_link_attrs( $l ) . '>' . esc_html( $l['title'] ) . "</a>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	?>
    </p>
  </footer>
	<?php
}
