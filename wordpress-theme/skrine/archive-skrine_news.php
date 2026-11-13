<?php
/**
 * News & Events list (/news-events/). Proof-of-concept version: a plain list
 * using the homepage's "More News" row style, not the full news-events.html page.
 */
get_header();
?>
  <main class="page-main">
    <header class="page-head reveal">
      <p class="eyebrow">Insights</p>
      <h1 class="page-title"><?php echo is_tax() ? esc_html( single_term_title( '', false ) ) : 'News &amp; Events'; ?></h1>
      <p class="page-intro">What's happening at Skrine — recognitions, firm news, and the conferences and seminars our lawyers are speaking at.</p>
    </header>

    <section class="section ne-list">
      <?php if ( have_posts() ) : ?>
        <ul>
          <?php while ( have_posts() ) : the_post();
            $terms = get_the_terms( get_the_ID(), 'skrine_news_cat' );
            $cat   = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name . ' · ' : '';
            ?>
            <li>
              <a href="<?php the_permalink(); ?>" class="ne-row">
                <?php if ( has_post_thumbnail() ) : the_post_thumbnail( 'medium', array( 'alt' => '', 'loading' => 'lazy' ) ); else : ?><span class="ne-row-noimg"></span><?php endif; ?>
                <span class="ne-row-text"><small><?php echo esc_html( $cat . get_the_date( 'd M Y' ) ); ?></small><?php the_title(); ?></span>
              </a>
            </li>
          <?php endwhile; ?>
        </ul>
        <?php the_posts_pagination(); ?>
      <?php else : ?>
        <p>No news yet. Add a story under <strong>News</strong> in the WordPress admin.</p>
      <?php endif; ?>
    </section>
  </main>
<?php
get_footer();
