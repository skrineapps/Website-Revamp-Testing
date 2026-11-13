<?php
/**
 * Homepage — the <main> of index.html, with every section editable:
 *   lists    -> admin menus (News, Legal Updates, Deals, Spotlight, Awards)
 *   the rest -> Appearance > Customize > Homepage
 * The markup and class names are unchanged from index.html so the design's CSS/JS apply as-is.
 */
get_header();

$hero_bg_default = skrine_asset( 'images/hero-palette.jpg' );
$hero_bg         = skrine_mod( 'hero_bg' );
?>
  <main>

    <!-- ============ HERO ============ -->
    <section class="hero" id="hero">
      <div class="hero-bg" aria-hidden="true"<?php if ( $hero_bg !== $hero_bg_default ) : ?> style="background-image: url(&quot;<?php echo esc_url( $hero_bg ); ?>&quot;)"<?php endif; ?>></div>
      <div class="hero-shade"></div>
      <div class="hero-diagonal"></div>

      <div class="hero-panel">

        <p class="hero-eyebrow"><span></span><?php skrine_e( 'hero_eyebrow' ); ?></p>
        <h1 class="hero-tagline">
          <span class="ht-word"><?php skrine_e( 'hero_word_1' ); ?></span>
          <span class="ht-word"><?php skrine_e( 'hero_word_2' ); ?></span>
          <span class="ht-word ht-word--swatch"><span class="ht-swatch" aria-hidden="true"></span><span class="ht-text"><?php skrine_e( 'hero_word_3' ); ?></span></span>
        </h1>
        <p class="hero-sub"><?php skrine_e( 'hero_sub' ); ?></p>

        <div class="hero-foot">
          <div class="hero-actions">
            <a href="<?php skrine_e_url( 'hero_btn1_link' ); ?>" class="btn btn--solid"><?php skrine_e( 'hero_btn1_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
            <a href="<?php skrine_e_url( 'hero_btn2_link' ); ?>" class="btn btn--outline"><?php skrine_e( 'hero_btn2_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <ul class="hero-rosettes" aria-label="Recognitions">
            <li><img src="<?php skrine_e_img( 'hero_badge1' ); ?>" alt="<?php echo esc_attr( skrine_mod( 'hero_badge1_alt' ) ); ?>" width="320" height="269"></li>
            <li><img src="<?php skrine_e_img( 'hero_badge2' ); ?>" alt="<?php echo esc_attr( skrine_mod( 'hero_badge2_alt' ) ); ?>" width="290" height="320"></li>
          </ul>
        </div>
      </div>

      <a href="#updates" class="scroll-cue" aria-label="Scroll to content">
        Scroll
        <span aria-hidden="true"></span>
      </a>
    </section>

    <!-- ============ LEGAL UPDATES ============ -->
    <?php $updates = skrine_items( 'skrine_update', max( 1, (int) skrine_mod( 'updates_count' ) ) ); ?>
    <section class="section section--updates section--art" id="updates" data-watermark="Updates">
      <header class="section-head reveal">
        <p class="eyebrow"><?php skrine_e( 'updates_eyebrow' ); ?></p>
        <h2 class="section-title"><?php skrine_e( 'updates_title' ); ?></h2>
      </header>

      <?php if ( $updates ) : ?>
      <div class="carousel reveal" id="updatesCarousel" aria-roledescription="carousel" aria-label="Legal updates">
        <button class="carousel-arrow prev" aria-label="Previous update"><i class="fa-solid fa-chevron-left"></i></button>

        <div class="carousel-stage">
          <ul class="carousel-track">
            <?php foreach ( $updates as $i => $u ) : ?>
            <li class="slide-card">
              <div class="slide-art art-<?php echo (int) ( $i % 6 ) + 1; ?>">
                <span class="slide-tag"><?php echo esc_html( skrine_meta( $u, 'tag' ) ); ?></span>
                <?php if ( skrine_image_url( $u ) ) : ?><img src="<?php echo esc_url( skrine_image_url( $u ) ); ?>" alt="" loading="lazy"><?php endif; ?>
              </div>
              <div class="slide-body">
                <h3><?php echo esc_html( skrine_title( $u ) ); ?></h3>
                <a href="<?php echo esc_url( skrine_link( skrine_meta( $u, 'link' ) ) ); ?>" class="slide-link">Read update <i class="fa-solid fa-arrow-right"></i></a>
                <time datetime="<?php echo esc_attr( get_the_date( 'Y-m-d', $u ) ); ?>"><?php echo esc_html( get_the_date( 'd M Y', $u ) ); ?></time>
              </div>
            </li>
            <?php endforeach; ?>
          </ul>
        </div>

        <button class="carousel-arrow next" aria-label="Next update"><i class="fa-solid fa-chevron-right"></i></button>
        <div class="carousel-dots" role="tablist" aria-label="Choose update"></div>
      </div>
      <?php endif; ?>

      <div class="section-cta reveal">
        <a href="<?php skrine_e_url( 'updates_cta_link' ); ?>" class="btn btn--outline"><?php skrine_e( 'updates_cta_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </section>

    <!-- ============ DEALS & TRANSACTIONS ============ -->
    <?php $deals = skrine_items( 'skrine_deal' ); ?>
    <section class="section section--deals section--art" id="deals" data-watermark="Deals">
      <header class="section-head reveal">
        <p class="eyebrow"><?php skrine_e( 'deals_eyebrow' ); ?></p>
        <h2 class="section-title"><?php skrine_e( 'deals_title' ); ?></h2>
        <p class="section-deck"><?php skrine_e( 'deals_deck' ); ?></p>
      </header>

      <?php if ( $deals ) : $d = $deals[0]; ?>
      <div class="deals-board reveal" id="dealsBoard">
        <!-- The first deal is shown without JavaScript; home.js switches between them -->
        <article class="deal-feature" id="dealFeature" data-tilt aria-live="polite">
          <div class="deal-feature-art" aria-hidden="true" style="background-image: url(&quot;<?php echo esc_url( skrine_image_url( $d ) ); ?>&quot;)"></div>
          <div class="deal-feature-content">
            <p class="deal-sector"><?php echo esc_html( skrine_meta( $d, 'sector' ) ); ?></p>
            <p class="deal-figure"><span class="deal-figure-num"><?php echo esc_html( skrine_meta( $d, 'num' ) ); ?></span> <span class="deal-figure-unit"><?php echo esc_html( skrine_meta( $d, 'unit' ) ); ?></span></p>
            <p class="deal-figure-label"><?php echo esc_html( skrine_meta( $d, 'label' ) ); ?></p>
            <h3 class="deal-headline"><?php echo esc_html( skrine_title( $d ) ); ?></h3>
            <p class="deal-summary"><?php echo esc_html( $d->post_excerpt ); ?></p>
            <p class="deal-meta"><span class="deal-team"><?php echo esc_html( skrine_meta( $d, 'team' ) ); ?></span><time><?php echo esc_html( skrine_meta( $d, 'date_label' ) ); ?></time></p>
          </div>
        </article>

        <ol class="deal-list" role="tablist" aria-label="Choose a transaction">
          <?php foreach ( $deals as $i => $deal ) : ?>
          <li><button type="button" role="tab" aria-selected="<?php echo 0 === $i ? 'true' : 'false'; ?>" data-deal="<?php echo (int) $i; ?>"><span class="dl-figure"><?php echo esc_html( skrine_meta( $deal, 'list_figure' ) ); ?></span><span class="dl-client"><?php echo esc_html( skrine_meta( $deal, 'list_client' ) ); ?></span><span class="dl-sector"><?php echo esc_html( skrine_meta( $deal, 'list_sector' ) ); ?></span></button></li>
          <?php endforeach; ?>
        </ol>
      </div>
      <?php endif; ?>

      <div class="section-cta reveal">
        <a href="<?php skrine_e_url( 'deals_cta_link' ); ?>" class="btn btn--outline"><?php skrine_e( 'deals_cta_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </section>

    <!-- ============ IN THE SPOTLIGHT ============ -->
    <section class="section section--spotlight section--art" id="spotlight" data-watermark="Insights">
      <header class="section-head reveal">
        <p class="eyebrow"><?php skrine_e( 'spot_eyebrow' ); ?></p>
        <h2 class="section-title"><?php skrine_e( 'spot_title' ); ?></h2>
      </header>

      <div class="spotlight-grid">
        <?php foreach ( skrine_items( 'skrine_spotlight' ) as $s ) :
          $is_pub  = 'alert' !== skrine_meta( $s, 'type' );
          $classes = 'spot-card' . ( skrine_meta( $s, 'featured' ) ? ' spot-card--feature' : '' ) . ( $is_pub ? ' spot-card--pub' : ' spot-card--alert' ) . ' reveal';
          $img     = skrine_image_url( $s );
          $meta    = skrine_meta( $s, 'meta' );
          ?>
        <a href="<?php echo esc_url( skrine_link( skrine_meta( $s, 'link' ) ) ); ?>" class="<?php echo esc_attr( $classes ); ?>" data-tilt>
          <?php if ( $is_pub ) : ?>
          <div class="spot-cover spot-cover--photo">
            <?php if ( $img ) : ?>
            <img class="spot-cover-blur" src="<?php echo esc_url( $img ); ?>" alt="" aria-hidden="true" loading="lazy">
            <img class="spot-cover-img" src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( skrine_image_alt( $s ) ); ?>" loading="lazy">
            <?php endif; ?>
          </div>
          <?php else : ?>
          <div class="spot-cover spot-cover--alert">
            <?php if ( $img ) : ?><img class="spot-cover-photo" src="<?php echo esc_url( $img ); ?>" alt="" loading="lazy"><?php endif; ?>
          </div>
          <?php endif; ?>
          <div class="spot-body">
            <p class="spot-tagline"><span class="spot-pill spot-pill--<?php echo $is_pub ? 'pub' : 'alert'; ?>"><?php echo $is_pub ? 'Publication' : 'Alert'; ?></span><time datetime="<?php echo esc_attr( get_the_date( 'Y-m-d', $s ) ); ?>"><?php echo esc_html( get_the_date( 'd M Y', $s ) ); ?></time></p>
            <h3><?php echo esc_html( skrine_title( $s ) ); ?></h3>
            <?php if ( ! $is_pub && $meta ) : ?><p class="spot-meta"><?php echo esc_html( $meta ); ?></p><?php endif; ?>
            <span class="read-more"><?php echo $is_pub ? 'Read more' : 'Read alert'; ?> <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </a>
        <?php endforeach; ?>
      </div>

      <div class="section-cta reveal">
        <a href="<?php skrine_e_url( 'spot_cta_link' ); ?>" class="btn btn--outline"><?php skrine_e( 'spot_cta_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </section>


    <!-- ============ NEWS & EVENTS ============ -->
    <section class="section section--events section--art" id="events" data-watermark="News">
      <header class="section-head reveal">
        <p class="eyebrow"><?php skrine_e( 'news_eyebrow' ); ?></p>
        <h2 class="section-title"><?php skrine_e( 'news_title' ); ?></h2>
      </header>

      <!-- filled by home.js from the News stories; the latest story below shows without JavaScript -->
      <div class="ne-board reveal" id="newsEvents">
        <?php $latest = skrine_news_for_js( 1 ); if ( $latest ) : $n = $latest[0]; ?>
        <a href="<?php echo esc_url( $n['url'] ); ?>" class="ne-feature">
          <?php if ( $n['image'] ) : ?><img src="<?php echo esc_url( $n['image'] ); ?>" alt="" class="ne-feature-img"><?php endif; ?>
          <div class="ne-feature-body">
            <p class="ne-kicker"><span>Latest News</span><?php echo esc_html( $n['category'] . ' · ' . mysql2date( 'd M Y', $n['date'] ) ); ?></p>
            <h3><?php echo esc_html( $n['title'] ); ?></h3>
          </div>
        </a>
        <?php endif; ?>
      </div>

      <div class="section-cta reveal">
        <a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_news' ) ); ?>" class="btn btn--outline"><?php skrine_e( 'news_cta_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </section>


    <!-- ============ GLOBAL NETWORK ============ -->
    <section class="section section--network section--art" id="network" data-watermark="Global">
      <div class="network-wrap">
        <div class="network-copy reveal">
          <p class="eyebrow"><?php skrine_e( 'net_eyebrow' ); ?></p>
          <h2 class="section-title section-title--left"><?php skrine_e( 'net_title' ); ?></h2>
          <p class="network-lead"><?php echo skrine_sanitize_inline_html( skrine_mod( 'net_lead' ) ); ?></p>

          <ul class="network-stats">
            <?php for ( $k = 1; $k <= 3; $k++ ) :
              $num = trim( skrine_mod( "net_stat{$k}_num" ) );
              $val = (int) preg_replace( '/[^\d]/', '', $num );
              ?>
            <li><span class="ns-num"><?php if ( $val > 1 && preg_match( '/^[\d,]+$/', $num ) ) : ?><span class="count-up" data-to="<?php echo (int) $val; ?>"><?php echo esc_html( number_format( $val ) ); ?></span><?php else : echo esc_html( $num ); endif; ?><?php skrine_e( "net_stat{$k}_suffix" ); ?></span><span class="ns-label"><?php skrine_e( "net_stat{$k}_label" ); ?></span></li>
            <?php endfor; ?>
          </ul>

          <p class="network-body"><?php skrine_e( 'net_body' ); ?></p>

          <div class="network-desks">
            <p class="nd-label"><?php skrine_e( 'net_desks_label' ); ?> <span><?php skrine_e( 'net_desks_sub' ); ?></span></p>
            <div class="nd-cards" id="deskCards">
              <?php foreach ( array( 'china', 'india', 'mena' ) as $i => $desk ) : ?>
              <a href="<?php skrine_e_url( "desk_{$desk}_link" ); ?>" class="nd-card<?php echo 0 === $i ? ' is-active' : ''; ?>" data-desk="<?php echo esc_attr( $desk ); ?>">
                <span class="nd-region"><?php skrine_e( "desk_{$desk}_region" ); ?></span>
                <span class="nd-name"><?php skrine_e( "desk_{$desk}_name" ); ?></span>
                <span class="nd-local"<?php echo 'china' === $desk ? ' lang="zh"' : ''; ?>><?php skrine_e( "desk_{$desk}_local" ); ?></span>
                <span class="nd-go">Explore <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
              </a>
              <?php endforeach; ?>
            </div>
          </div>

          <img src="<?php skrine_e_img( 'net_logo' ); ?>" alt="Lex Mundi — Bringing the best together" class="network-logo">
        </div>

        <div class="network-globe reveal" aria-hidden="true">
          <canvas id="globe"></canvas>
          <span class="globe-pin">Kuala Lumpur</span>
          <span class="globe-pin globe-pin--desk" data-desk="china"><?php skrine_e( 'desk_china_name' ); ?></span>
          <span class="globe-pin globe-pin--desk" data-desk="india"><?php skrine_e( 'desk_india_name' ); ?></span>
          <span class="globe-pin globe-pin--desk" data-desk="mena"><?php skrine_e( 'desk_mena_name' ); ?></span>
        </div>
      </div>
    </section>

    <!-- ============ AWARDS ============ -->
    <section class="awards" id="awards">
      <canvas class="awards-guilloche" id="guilloche" aria-hidden="true"></canvas>
      <div class="awards-inner">
        <header class="awards-head reveal">
          <p class="eyebrow eyebrow--foil"><?php skrine_e( 'aw_eyebrow' ); ?></p>
          <h2 class="awards-title foil"><?php skrine_e( 'aw_title' ); ?></h2>
          <p class="awards-deck"><?php skrine_e( 'aw_deck' ); ?></p>
        </header>

        <div class="awards-lead">
          <?php for ( $k = 1; $k <= 2; $k++ ) :
            $num = (int) skrine_mod( "aw{$k}_num" );
            ?>
          <article class="award-lead reveal">
            <span class="award-rosette<?php echo 2 === $k ? ' award-rosette--badge' : ''; ?>"><img src="<?php skrine_e_img( "aw{$k}_badge" ); ?>" alt="<?php echo esc_attr( skrine_mod( "aw{$k}_badge_alt" ) ); ?>" loading="lazy"></span>
            <p class="award-src"><?php skrine_e( "aw{$k}_src" ); ?></p>
            <p class="award-big"><span class="foil count-up" data-to="<?php echo (int) $num; ?>"><?php echo esc_html( skrine_mod( "aw{$k}_num" ) ); ?></span><span class="award-big-label"><?php echo esc_html( str_replace( 'Tier ', "Tier\u{00A0}", skrine_mod( "aw{$k}_label" ) ) ); ?></span></p>
            <p class="award-list"><?php skrine_e( "aw{$k}_list" ); ?></p>
            <?php if ( '' !== trim( skrine_mod( "aw{$k}_note_num" ) . skrine_mod( "aw{$k}_note" ) ) ) : ?>
            <p class="award-note"><span class="foil"><?php skrine_e( "aw{$k}_note_num" ); ?></span> <?php skrine_e( "aw{$k}_note" ); ?></p>
            <?php endif; ?>
          </article>
          <?php endfor; ?>
        </div>

        <article class="award-banner reveal">
          <p class="award-src"><?php skrine_e( 'aw_banner_src' ); ?></p>
          <p class="award-banner-title foil"><?php skrine_e( 'aw_banner_title' ); ?></p>
        </article>

        <ul class="award-rest">
          <?php foreach ( skrine_items( 'skrine_award' ) as $a ) : ?>
          <li class="reveal"><span class="award-mark"><?php if ( skrine_image_url( $a ) ) : ?><img src="<?php echo esc_url( skrine_image_url( $a, 'medium' ) ); ?>" alt="<?php echo esc_attr( skrine_image_alt( $a ) ); ?>" loading="lazy"><?php endif; ?></span><span class="award-src"><?php echo esc_html( skrine_meta( $a, 'source' ) ); ?></span><?php echo esc_html( skrine_title( $a ) ); ?></li>
          <?php endforeach; ?>
        </ul>

        <div class="awards-cta reveal">
          <a href="<?php skrine_e_url( 'aw_cta_link' ); ?>" class="btn btn--foil"><?php skrine_e( 'aw_cta_label' ); ?> <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    </section>

  </main>

<?php get_footer();
