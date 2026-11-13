<?php
/**
 * Fallback for any page this proof of concept hasn't designed yet
 * (WordPress requires every theme to have an index.php).
 */
get_header();
?>
  <main class="page-main">
    <header class="page-head">
      <h1 class="page-title"><?php echo is_singular() ? esc_html( get_the_title() ) : esc_html( wp_get_document_title() ); ?></h1>
    </header>
    <section class="section">
      <?php
      if ( have_posts() ) {
        while ( have_posts() ) {
          the_post();
          is_singular() ? the_content() : printf( '<p><a href="%s">%s</a></p>', esc_url( get_permalink() ), esc_html( get_the_title() ) );
        }
      } else {
        echo '<p>This page hasn\'t been built in the new design yet.</p>';
      }
      ?>
    </section>
  </main>
<?php
get_footer();
