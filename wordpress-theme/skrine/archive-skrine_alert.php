<?php
/**
 * Alerts list (/alerts/) — the <main> of alerts.html. alerts.js draws the cards from
 * every published Alert (see inc/alerts.php). Intro and Subscribe box: Customize > Homepage > Alerts pages.
 */
get_header();
?>
  <main class="page-main">
    <header class="page-head reveal">
      <p class="eyebrow">Insights</p>
      <h1 class="page-title">Alerts</h1>
      <p class="page-intro"><?php skrine_e( 'alerts_intro' ); ?></p>
    </header>

    <!-- ===== Latest ===== -->
    <section class="alerts-latest" aria-labelledby="latestTitle">
      <div class="alerts-subhead">
        <h2 id="latestTitle">Latest</h2>
        <a href="#archive" class="alerts-subhead-link">Browse by month <i class="fa-solid fa-arrow-down" aria-hidden="true"></i></a>
      </div>
      <div class="latest-grid" id="alertLatest"></div>
    </section>

    <!-- ===== Filter bar ===== -->
    <div class="alerts-toolbar" id="archive">
      <label class="alerts-search">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input type="search" id="alertSearch" placeholder="Search alerts" aria-label="Search alerts by title, topic or author" autocomplete="off">
      </label>

      <div class="topic-filter" id="topicFilter">
        <button type="button" class="topic-toggle" id="topicToggle" aria-expanded="false" aria-controls="topicPanel">
          <i class="fa-solid fa-sliders" aria-hidden="true"></i>
          <span>Topic:</span> <strong id="topicCurrent">All topics</strong>
          <i class="fa-solid fa-chevron-down topic-caret" aria-hidden="true"></i>
        </button>
        <div class="topic-panel" id="topicPanel" hidden>
          <p class="topic-panel-title">Filter by topic</p>
          <div class="topic-chips" id="alertTopics"></div>
        </div>
      </div>

      <button type="button" class="topic-clear" id="topicClear" hidden><i class="fa-solid fa-xmark" aria-hidden="true"></i> Clear</button>
      <p class="alerts-results" id="alertResults" aria-live="polite"></p>
    </div>

    <!-- ===== Archive by month ===== -->
    <div class="alerts-archive">
      <nav class="month-rail" aria-label="Jump to month">
        <p class="month-rail-title">Archive</p>
        <ol id="monthRail"></ol>
      </nav>

      <div class="alerts-months">
        <div id="alertList"></div>
        <div class="alerts-empty" id="alertEmpty" hidden>
          <i class="fa-regular fa-face-meh" aria-hidden="true"></i>
          <p>No alerts match your search.</p>
          <button type="button" class="btn btn--outline" id="alertReset">Show all alerts</button>
        </div>
        <noscript><p class="page-intro">Please enable JavaScript to view the alerts.</p></noscript>
      </div>
    </div>

    <!-- ===== Subscribe ===== -->
    <aside class="alert-subscribe reveal">
      <div>
        <h2><?php skrine_e( 'alerts_sub_title' ); ?></h2>
        <p><?php skrine_e( 'alerts_sub_text' ); ?></p>
      </div>
      <a href="<?php skrine_e_url( 'alerts_sub_link' ); ?>" class="btn btn--light-solid"><?php skrine_e( 'alerts_sub_label' ); ?> <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    </aside>
  </main>
<?php
get_footer();
