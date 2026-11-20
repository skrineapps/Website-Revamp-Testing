<?php
/**
 * Redirects from the old skrine.com addresses, and the Skrine → Settings page.
 *
 * Old addresses get a permanent (301) redirect, so search rankings and saved links carry over:
 *   1. Alerts, news stories, people, job openings, practice areas and sectors are matched to their
 *      new page automatically (old: /insights/alerts/may-2020/stamp-duty-exemption-on-qualifying-res).
 *   2. Everything else follows the list in Skrine → Settings ("old address → new page").
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function skrine_default_redirects() {
	return implode( "\n", array(
		'# One rule per line: old address → new page. A * at the end matches everything that starts that way.',
		'# The first rule that matches is used, so put specific rules above general ones.',
		'# Alerts, news stories, people, job openings, practice areas and sectors are matched automatically before these rules.',
		'/profile/our-story → our-story.html',
		'/profile/our-values → our-story.html',
		'/profile/global-network* → /#network',
		'/profile/award* → /#awards',
		'/profile* → our-story.html',
		'/experience/practice-areas* → capabilities.html',
		'/experience/industries* → sectors.html',
		'/experience/regional-desks* → /#network',
		'/experience* → capabilities.html',
		'/one-stop-centre* → capabilities.html',
		'/people* → people.html',
		'/news-events/upcoming → news-events.html#upcoming',
		'/news-events* → news-events.html',
		'/insights/publications* → publications.html',
		'/insights* → alerts.html',
		'/legal-insights → alerts.html',
		'/subscribe → alerts.html',
		'/more/career* → careers.html#join',
		'/more/life-at-skrine/skrine-dragons → skrine-dragons.html',
		'/more/life-at-skrine/socials-and-sports → sports-social.html',
		'/more/life-at-skrine/professional-development → professional-development.html',
		'/more/life-at-skrine* → careers.html#life',
		'/more/social-responsibility* → social-responsibility.html',
		'/more/contact → contact.html',
		'/more* → careers.html',
		'/search* → search.html',
		'/sitemap → /',
	) );
}

/* "old → new" lines → [ [ path, is_prefix, target ] ] */
function skrine_redirect_rules() {
	$rules = array();
	foreach ( preg_split( '/\r\n|\r|\n/', (string) get_option( 'skrine_redirects', skrine_default_redirects() ) ) as $line ) {
		$line = trim( $line );
		if ( $line === '' || $line[0] === '#' ) {
			continue;
		}
		if ( ! preg_match( '/^(\S+)\s*(?:→|->|=>|\s)\s*(\S+)$/u', $line, $m ) ) {
			continue;
		}
		$from   = strtolower( rawurldecode( preg_replace( '#^https?://[^/]+#i', '', $m[1] ) ) );
		$prefix = substr( $from, -1 ) === '*';
		$from   = trim( rtrim( $from, '*' ), '/' );
		$rules[] = array( $from, $prefix, $m[2] );
	}
	return $rules;
}

function skrine_redirect_target( $to ) {
	if ( preg_match( '#^https?://#i', $to ) ) {
		return $to;
	}
	return home_url( '/' . ltrim( $to, '/' ) );
}

/* the closest item for an old address's last part (old addresses were cut at 50 characters) */
function skrine_match_slug( $old, $map ) {
	if ( isset( $map[ $old ] ) ) {
		return $map[ $old ];
	}
	foreach ( $map as $slug => $id ) {
		if ( strlen( $old ) >= 12 && ( strpos( $slug, $old ) === 0 || strpos( $old, $slug ) === 0 ) ) {
			return $id;
		}
	}
	return 0;
}

function skrine_smart_redirect( $path ) {
	$seg = explode( '/', $path );
	$n   = count( $seg );
	$a   = $seg[0];
	$b   = isset( $seg[1] ) ? $seg[1] : '';
	$id  = 0;

	if ( $a === 'insights' && in_array( $b, array( 'alerts', 'covid-19-updates' ), true ) && $n >= 3 && skrine_type_ready( 'skrine_alert' ) ) {
		$id = skrine_match_slug( end( $seg ), skrine_item_map( 'skrine_alert' ) );
	} elseif ( $a === 'news-events' && $b === 'data' && $n >= 3 && skrine_type_ready( 'skrine_news' ) ) {
		$id = skrine_match_slug( end( $seg ), skrine_item_map( 'skrine_news' ) );
	} elseif ( $a === 'more' && $b === 'career' && $n === 4 && skrine_type_ready( 'skrine_job' ) ) {
		$id = skrine_match_slug( $seg[3], skrine_item_map( 'skrine_job' ) );
	} elseif ( $a === 'people' && $n === 3 && skrine_type_ready( 'skrine_person' ) ) {
		// old: /people/partners/tee-wei-herng-calvin; match on the words of the name in any order
		$words = array_filter( explode( '-', $seg[2] ) );
		foreach ( skrine_query( 'skrine_person' ) as $p ) {
			$name = array_filter( explode( '-', skrine_person_slug( $p->post_title ) ) );
			if ( $name && ( ! array_diff( $name, $words ) || ! array_diff( $words, $name ) ) ) {
				$id = $p->ID;
				break;
			}
		}
	} elseif ( $a === 'experience' && $b === 'practice-areas' && $n >= 3 && in_array( $seg[2], skrine_practice_slugs(), true ) ) {
		return home_url( 'practice-area.html?area=' . rawurlencode( $seg[2] ) );
	} elseif ( $a === 'experience' && $b === 'industries' && $n >= 3 && in_array( $seg[2], skrine_sector_slugs(), true ) ) {
		return home_url( 'sector.html?sector=' . rawurlencode( $seg[2] ) );
	}
	return $id ? get_permalink( $id ) : '';
}

add_action( 'template_redirect', function () {
	$path = rawurldecode( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	$home = rtrim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && strpos( $path, $home ) === 0 ) {
		$path = substr( $path, strlen( $home ) );
	}
	$path = strtolower( trim( $path, '/' ) );
	// the new site's own addresses are left alone
	if ( $path === '' || preg_match( '#\.(html?|php|xml|xsl|txt|js|css|json|ico|png|jpe?g|gif|webp|svg|pdf)$#', $path ) || preg_match( '#^(wp-|skrine-data/|feed|comments)#', $path ) ) {
		return;
	}
	$to = skrine_smart_redirect( $path );
	if ( ! $to ) {
		foreach ( skrine_redirect_rules() as $r ) {
			if ( $r[0] === $path || ( $r[1] && ( $r[0] === '' || strpos( $path, $r[0] ) === 0 ) ) ) {
				$to = skrine_redirect_target( $r[2] );
				break;
			}
		}
	}
	if ( $to ) {
		wp_redirect( $to, 301, 'Skrine' ); // phpcs:ignore WordPress.Security.SafeRedirect -- targets are set by admins in Skrine → Settings
		exit;
	}
}, 0 );

/* ---------- Skrine → Settings ---------- */
add_action( 'admin_menu', function () {
	add_submenu_page( 'skrine', 'Skrine settings', 'Settings', 'manage_options', 'skrine-settings', 'skrine_settings_page' );
}, 20 );

add_action( 'admin_init', function () {
	register_setting( 'skrine_settings', 'skrine_apply_to', array(
		'type'              => 'string',
		'default'           => skrine_default_apply_to(),
		'sanitize_callback' => function ( $v ) {
			$ok = skrine_emails( $v );
			if ( ! $ok ) {
				add_settings_error( 'skrine_apply_to', 'skrine_apply_to', 'Please enter at least one valid email address for job applications.' );
				return get_option( 'skrine_apply_to', skrine_default_apply_to() );
			}
			return implode( ', ', $ok );
		},
	) );
	register_setting( 'skrine_settings', 'skrine_redirects', array(
		'type'              => 'string',
		'default'           => skrine_default_redirects(),
		'sanitize_callback' => 'sanitize_textarea_field',
	) );
} );

function skrine_settings_page() {
	?>
	<div class="wrap">
		<h1>Skrine settings</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'skrine_settings' ); ?>
			<h2>Job applications</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="skrine_apply_to">Send applications to</label></th>
					<td>
						<input type="text" class="regular-text" id="skrine_apply_to" name="skrine_apply_to" value="<?php echo esc_attr( get_option( 'skrine_apply_to', skrine_default_apply_to() ) ); ?>">
						<p class="description">Email address(es), separated by commas. Each application arrives with the CV attached, and is also kept under
							<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=skrine_application' ) ); ?>">Jobs → Applications</a>.
							A single job can send to a different address (on the job's edit screen).</p>
					</td>
				</tr>
			</table>

			<h2>Redirects from the old website</h2>
			<p>Old skrine.com addresses are sent to the matching new page with a permanent redirect, so search rankings and saved links carry over.
				Alerts, news stories, people, job openings, practice areas and sectors are matched automatically; everything else follows these rules.</p>
			<textarea name="skrine_redirects" class="large-text code" rows="22"><?php echo esc_textarea( get_option( 'skrine_redirects', skrine_default_redirects() ) ); ?></textarea>
			<p class="description">Example: <code>/more/contact → contact.html</code>. Old pages with no rule and no match show the "not found" page.</p>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
