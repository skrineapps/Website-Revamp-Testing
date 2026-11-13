<?php
/**
 * Site header — copied from index.html. Links to pages not yet built in
 * WordPress point at the URL they will have (e.g. /people/).
 */
$u = function ( $slug ) {
	return esc_url( home_url( '/' . $slug . '/' ) );
};
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <?php wp_head(); ?>
</head>
<body <?php body_class( is_front_page() ? '' : 'page-inner' ); ?>>
<?php wp_body_open(); ?>

  <!-- ============ HEADER ============ -->
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand" aria-label="Skrine home">
        <img src="<?php echo esc_url( skrine_asset( 'images/skrine-logo.png' ) ); ?>" alt="Skrine" class="brand-logo" width="475" height="94">
      </a>

      <nav class="main-nav" id="primaryNav" aria-label="Primary">
        <ul class="nav-list">
          <li class="nav-item">
            <a href="<?php echo $u( 'people' ); ?>" class="nav-link">People</a>
          </li>

          <li class="nav-item has-menu">
            <button type="button" class="nav-link nav-trigger" aria-expanded="false" aria-controls="menu-capabilities">
              Capabilities <i class="fa-solid fa-chevron-down nav-caret" aria-hidden="true"></i>
            </button>
            <ul class="nav-menu" id="menu-capabilities">
              <li><a href="<?php echo $u( 'capabilities' ); ?>">Practice Areas</a></li>
              <li><a href="<?php echo $u( 'sectors' ); ?>">Sectors</a></li>
            </ul>
          </li>

          <li class="nav-item has-menu">
            <button type="button" class="nav-link nav-trigger" aria-expanded="false" aria-controls="menu-insights">
              Insights <i class="fa-solid fa-chevron-down nav-caret" aria-hidden="true"></i>
            </button>
            <ul class="nav-menu" id="menu-insights">
              <li><a href="<?php echo $u( 'alerts' ); ?>">Alerts</a></li>
              <li><a href="<?php echo $u( 'articles' ); ?>">Articles</a></li>
              <li><a href="<?php echo $u( 'publications' ); ?>">Publications</a></li>
              <li><a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_news' ) ); ?>">News &amp; Events</a></li>
            </ul>
          </li>

          <li class="nav-item has-menu">
            <a href="<?php echo $u( 'careers' ); ?>" class="nav-link">Career</a>
            <button type="button" class="nav-caret-btn nav-trigger" aria-expanded="false" aria-controls="menu-career" aria-label="Career menu">
              <i class="fa-solid fa-chevron-down nav-caret" aria-hidden="true"></i>
            </button>
            <ul class="nav-menu" id="menu-career">
              <li><a href="<?php echo $u( 'professional-development' ); ?>">Professional Development</a></li>
              <li><a href="<?php echo $u( 'social-responsibility' ); ?>">Social Responsibility</a></li>
              <li><a href="<?php echo $u( 'sports-social' ); ?>">Sports &amp; Social</a></li>
              <li><a href="<?php echo $u( 'skrine-dragons' ); ?>">Skrine Dragons</a></li>
            </ul>
          </li>

          <li class="nav-item">
            <a href="<?php echo $u( 'contact' ); ?>" class="nav-link">Contact</a>
          </li>
        </ul>
      </nav>

      <button class="icon-btn search-toggle" id="searchToggle" aria-label="Search">
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>

      <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <form class="search-bar" id="searchBar" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
      <input type="search" name="s" placeholder="Search people, practices, insights…" aria-label="Search the site" value="<?php echo esc_attr( get_search_query() ); ?>">
      <button type="submit" aria-label="Submit search"><i class="fa-solid fa-arrow-right"></i></button>
    </form>
  </header>
