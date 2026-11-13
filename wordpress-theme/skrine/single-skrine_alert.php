<?php
/**
 * One alert (/alerts/<name>/) — the page from alert.html. alert-page.js fills it from
 * this alert's content, given to it by inc/alerts.php.
 */
get_header();
?>
  <div class="ar-progress" aria-hidden="true"><span id="arProgress"></span></div>

  <main class="page-main ar-main" id="article">
    <nav class="ar-crumbs" aria-label="Breadcrumb">
      <a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_alert' ) ); ?>">Insights</a>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      <a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_alert' ) ); ?>">Alerts</a>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      <a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_alert' ) ); ?>#archive" id="arCrumbMonth"></a>
    </nav>

    <header class="ar-head reveal">
      <p class="ar-tags" id="arTags"></p>
      <h1 class="ar-title" id="arTitle"></h1>
      <p class="ar-meta" id="arMeta"></p>
      <div class="ar-authors" id="arAuthors"></div>
    </header>

    <div class="ar-layout">
      <aside class="ar-rail" aria-label="Article tools">
        <nav class="ar-toc" id="arToc" aria-label="On this page" hidden>
          <p class="ar-rail-label">On this page</p>
          <ol id="arTocList"></ol>
        </nav>
        <div class="ar-share" id="arShare">
          <p class="ar-rail-label">Share</p>
          <div class="ar-share-row"></div>
        </div>
      </aside>

      <article class="ar-body" id="arBody" aria-labelledby="arTitle"></article>
    </div>

    <section class="ar-related" id="arRelated" aria-labelledby="arRelatedTitle" hidden>
      <div class="ar-related-head">
        <h2 id="arRelatedTitle">More alerts</h2>
        <a class="ar-all" href="<?php echo esc_url( get_post_type_archive_link( 'skrine_alert' ) ); ?>">All alerts <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      </div>
      <div class="ar-related-grid" id="arRelatedGrid"></div>
    </section>

    <section class="ar-missing" id="arMissing" hidden>
      <h1 class="page-title">Alert not found</h1>
      <p class="page-intro">We couldn't find that alert. Browse all of them on the Alerts page.</p>
      <a class="btn btn--outline" href="<?php echo esc_url( get_post_type_archive_link( 'skrine_alert' ) ); ?>">Go to Alerts <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    </section>
  </main>
<?php
get_footer();
