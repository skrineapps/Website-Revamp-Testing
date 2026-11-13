<?php
/**
 * One news story. Uses the article page classes from alert.html / article.css.
 */
get_header();
while ( have_posts() ) :
	the_post();
	$terms = get_the_terms( get_the_ID(), 'skrine_news_cat' );
	$cat   = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0] : null;
	?>
  <main class="page-main ar-main" id="article">
    <nav class="ar-crumbs" aria-label="Breadcrumb">
      <a href="<?php echo esc_url( get_post_type_archive_link( 'skrine_news' ) ); ?>">News &amp; Events</a>
      <?php if ( $cat ) : ?>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <a href="<?php echo esc_url( get_term_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
      <?php endif; ?>
    </nav>

    <header class="ar-head reveal">
      <h1 class="ar-title"><?php the_title(); ?></h1>
      <p class="ar-meta"><?php echo esc_html( get_the_date( 'd M Y' ) ); ?></p>
    </header>

    <div class="ar-layout">
      <article class="ar-body">
        <?php if ( has_post_thumbnail() ) : ?>
          <figure><?php the_post_thumbnail( 'large', array( 'alt' => '' ) ); ?></figure>
        <?php endif; ?>
        <?php the_content(); ?>
      </article>
    </div>
  </main>
	<?php
endwhile;
get_footer();
