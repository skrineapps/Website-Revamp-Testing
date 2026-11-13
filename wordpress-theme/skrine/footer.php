  <!-- ============ FOOTER ============ -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-member">
        <span class="member-label">Proud to be a<br>member of</span>
        <img src="<?php skrine_e_img( 'ft_logo' ); ?>" alt="Lex Mundi — Bringing the best together" class="member-logo">
      </div>

      <div class="footer-connect">
        <span>Connect with us</span>
        <a href="<?php skrine_e_url( 'ft_email' ); ?>" aria-label="Email"><i class="fa-regular fa-envelope"></i></a>
        <a href="<?php skrine_e_url( 'ft_linkedin' ); ?>" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
        <a href="<?php skrine_e_url( 'ft_wechat' ); ?>" aria-label="WeChat"><i class="fa-brands fa-weixin"></i></a>
      </div>
    </div>
    <p class="footer-legal">
      © 1963 – <span id="year"><?php echo esc_html( gmdate( 'Y' ) ); ?></span> Skrine. All rights reserved
      <span class="sep">|</span> <a href="<?php skrine_e_url( 'ft_disclaimer' ); ?>">Disclaimer</a>
      <span class="sep">|</span> <a href="<?php skrine_e_url( 'ft_pdpa' ); ?>">PDPA Notice</a>
    </p>
  </footer>

<?php wp_footer(); ?>
</body>
</html>
