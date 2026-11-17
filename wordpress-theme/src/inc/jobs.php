<?php
/**
 * Jobs and job applications.
 *   [skrine_jobs group="Lawyer"]  the "Open roles" list on the Careers page, from Jobs in wp-admin
 *   job.html?j=<slug>              the role page; its application form posts here (action skrine_apply)
 * Each application is saved under Jobs → Applications (the CV in a private folder, not the Media
 * Library) and emailed, with the CV attached, to the address in Skrine → Settings or on the job.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ---------- Careers page: open roles ---------- */
add_shortcode( 'skrine_jobs', function ( $atts ) {
	$atts = shortcode_atts( array( 'group' => 'Lawyer' ), $atts );
	if ( ! skrine_type_ready( 'skrine_job' ) ) {
		return skrine_part( 'jobs-' . sanitize_title( $atts['group'] ) );
	}
	$out = '';
	foreach ( skrine_query( 'skrine_job' ) as $p ) {
		if ( ( skrine_meta( $p->ID, 'group' ) ?: 'Lawyer' ) !== $atts['group'] ) {
			continue;
		}
		$label = skrine_meta( $p->ID, 'short_title' ) ?: $p->post_title;
		$out  .= '<li><a href="' . esc_attr( 'job.html?j=' . rawurlencode( $p->post_name ) ) . '">' . esc_html( $label ) . '</a></li>' . "\n";
	}
	return $out !== '' ? $out : '<li><span>No open roles at the moment. Follow us on LinkedIn to hear about new ones first.</span></li>';
} );

/* ---------- where applications go ---------- */
function skrine_default_apply_to() {
	return 'victoria.foo@skrine.com';
}

function skrine_emails( $list ) {
	return array_values( array_filter( array_map( 'trim', explode( ',', (string) $list ) ), 'is_email' ) );
}

function skrine_apply_recipients( $job_id = 0 ) {
	$to = $job_id ? skrine_emails( skrine_meta( $job_id, 'apply_to' ) ) : array();
	if ( ! $to ) {
		$to = skrine_emails( get_option( 'skrine_apply_to', skrine_default_apply_to() ) );
	}
	return $to ? $to : array( get_option( 'admin_email' ) );
}

/* the form needs to know where to send: printed on the job page only */
add_action( 'wp_head', function () {
	if ( skrine_template_slug() !== 'job' ) {
		return;
	}
	echo '<script>window.SKRINE_FORMS = ' . wp_json_encode( array( 'apply' => admin_url( 'admin-ajax.php' ) ) ) . ";</script>\n";
} );

/* ---------- Jobs → Applications ---------- */
add_action( 'init', function () {
	register_post_type( 'skrine_application', array(
		'labels'          => array(
			'name'          => 'Applications',
			'singular_name' => 'Application',
			'all_items'     => 'Applications',
			'edit_item'     => 'Application',
			'search_items'  => 'Search applications',
			'not_found'     => 'No applications yet.',
		),
		'public'          => false,
		'show_ui'         => true,
		'show_in_menu'    => 'edit.php?post_type=skrine_job',
		'supports'        => array( 'title' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

function skrine_application_fields() {
	return array(
		'role'       => 'Role',
		'name'       => 'Full name',
		'email'      => 'Email',
		'phone'      => 'Phone',
		'experience' => 'Experience / current stage',
		'current'    => 'Current or most recent position',
		'note'       => 'Cover note',
	);
}

/* the private folder for CVs: not listed, not reachable from the web on Apache, random file names */
function skrine_cv_dir() {
	$dir = trailingslashit( wp_upload_dir()['basedir'] ) . 'skrine-applications';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! file_exists( $dir . '/.htaccess' ) ) {
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		file_put_contents( $dir . '/index.php', "<?php\n// Silence.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	}
	return $dir;
}

function skrine_apply_fail( $message, $code = 400 ) {
	wp_send_json_error( array( 'message' => $message ), $code );
}

function skrine_apply_handler() {
	// spam checks: a hidden field people never see, a minimum time on the form, and a limit per connection
	if ( ! empty( $_POST['website'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		wp_send_json_success();
	}
	if ( (int) ( isset( $_POST['elapsed'] ) ? $_POST['elapsed'] : 0 ) < 3000 ) { // phpcs:ignore WordPress.Security.NonceVerification
		skrine_apply_fail( 'Please take a moment to check your details, then submit again.' );
	}
	$ip   = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$rate = 'skrine_apply_' . md5( $ip );
	$sent = (int) get_transient( $rate );
	if ( $sent >= 5 ) {
		skrine_apply_fail( 'We have received several applications from this connection. Please try again in an hour.', 429 );
	}

	$in  = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
	$get = function ( $k, $max = 200 ) use ( $in ) {
		return isset( $in[ $k ] ) ? mb_substr( sanitize_text_field( $in[ $k ] ), 0, $max ) : '';
	};
	$d = array(
		'name'       => $get( 'name' ),
		'email'      => sanitize_email( $get( 'email' ) ),
		'phone'      => $get( 'phone', 50 ),
		'experience' => $get( 'experience', 100 ),
		'current'    => $get( 'current' ),
		'note'       => isset( $in['note'] ) ? mb_substr( sanitize_textarea_field( $in['note'] ), 0, 5000 ) : '',
	);
	if ( empty( $in['consent'] ) ) {
		skrine_apply_fail( 'Please agree to the Personal Data Protection Notice.' );
	}
	if ( $d['name'] === '' || ! is_email( $d['email'] ) || $d['phone'] === '' ) {
		skrine_apply_fail( 'Please fill in your name, a valid email address and your phone number.' );
	}

	// the role: looked up from the job, not taken from the form
	$job_slug = isset( $in['job'] ) ? sanitize_title( $in['job'] ) : '';
	$job      = $job_slug ? get_page_by_path( $job_slug, OBJECT, 'skrine_job' ) : null;
	$job_id   = $job && $job->post_status === 'publish' ? (int) $job->ID : 0;
	$d['role'] = $job_id ? $job->post_title : ( $get( 'role' ) ?: 'General application' );

	// the CV
	if ( empty( $_FILES['cv'] ) || ! isset( $_FILES['cv']['error'] ) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK ) { // phpcs:ignore WordPress.Security.NonceVerification
		skrine_apply_fail( 'Please attach your CV (PDF or Word, up to 5 MB).' );
	}
	$file = $_FILES['cv']; // phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
	if ( (int) $file['size'] > 5 * MB_IN_BYTES ) {
		skrine_apply_fail( 'Your CV is larger than 5 MB. Please attach a smaller file.' );
	}
	$allowed = array(
		'pdf'  => 'application/pdf',
		'doc'  => 'application/msword',
		'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	);
	$check = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed );
	if ( empty( $check['ext'] ) ) {
		skrine_apply_fail( 'Please attach your CV as a PDF or Word document.' );
	}
	$stored = gmdate( 'Ymd-His' ) . '-' . wp_generate_password( 20, false ) . '.' . $check['ext'];
	$path   = skrine_cv_dir() . '/' . $stored;
	if ( ! move_uploaded_file( $file['tmp_name'], $path ) ) {
		skrine_apply_fail( 'Sorry, your CV could not be saved. Please try again.', 500 );
	}
	$original = sanitize_file_name( $file['name'] );
	set_transient( $rate, $sent + 1, HOUR_IN_SECONDS );

	// save it first, so nothing is lost if email fails
	$id = wp_insert_post( array(
		'post_type'   => 'skrine_application',
		'post_status' => 'publish',
		'post_title'  => $d['name'] . ' — ' . $d['role'],
	), true );
	if ( is_wp_error( $id ) ) {
		skrine_apply_fail( 'Sorry, your application could not be saved. Please try again.', 500 );
	}
	foreach ( $d as $k => $v ) {
		update_post_meta( $id, '_sk_' . $k, $v );
	}
	update_post_meta( $id, '_sk_job', $job_id );
	update_post_meta( $id, '_sk_cv_file', $stored );
	update_post_meta( $id, '_sk_cv_name', $original );

	// email, with the CV attached under its original name
	$to    = skrine_apply_recipients( $job_id );
	$lines = array( 'A new application was sent from the website.', '' );
	foreach ( skrine_application_fields() as $k => $label ) {
		if ( $k === 'note' ) {
			continue;
		}
		$lines[] = $label . ': ' . ( $d[ $k ] !== '' ? $d[ $k ] : '—' );
	}
	$lines[] = 'CV: ' . $original . ' (attached)';
	$lines[] = '';
	$lines[] = 'Cover note:';
	$lines[] = $d['note'] !== '' ? $d['note'] : '—';
	$lines[] = '';
	$lines[] = 'View in WordPress: ' . admin_url( 'post.php?post=' . $id . '&action=edit' );

	$tmpdir = trailingslashit( get_temp_dir() ) . 'skrine-cv-' . wp_generate_password( 8, false );
	wp_mkdir_p( $tmpdir );
	$attach = $tmpdir . '/' . ( $original ?: 'cv.' . $check['ext'] );
	copy( $path, $attach );
	$headers = array( 'Reply-To: ' . str_replace( array( "\r", "\n", '"' ), '', $d['name'] ) . ' <' . $d['email'] . '>' );
	$ok      = wp_mail( $to, 'Job application: ' . $d['role'] . ' — ' . $d['name'], implode( "\n", $lines ), $headers, array( $attach ) );
	@unlink( $attach ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	@rmdir( $tmpdir ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	update_post_meta( $id, '_sk_mail', ( $ok ? 'Sent to ' : 'Email could not be sent to ' ) . implode( ', ', $to ) . ' on ' . current_time( 'j M Y, g:i a' ) );

	wp_send_json_success();
}
add_action( 'wp_ajax_skrine_apply', 'skrine_apply_handler' );
add_action( 'wp_ajax_nopriv_skrine_apply', 'skrine_apply_handler' );

/* ---------- reading an application in wp-admin ---------- */
add_action( 'add_meta_boxes_skrine_application', function () {
	add_meta_box( 'skrine_application', 'Application', function ( $post ) {
		echo '<table class="form-table" role="presentation">';
		foreach ( skrine_application_fields() as $k => $label ) {
			$v = (string) get_post_meta( $post->ID, '_sk_' . $k, true );
			if ( $k === 'email' && $v ) {
				$v = '<a href="mailto:' . esc_attr( $v ) . '">' . esc_html( $v ) . '</a>';
			} elseif ( $k === 'role' && ( $job = (int) get_post_meta( $post->ID, '_sk_job', true ) ) ) {
				$v = '<a href="' . esc_url( get_edit_post_link( $job ) ) . '">' . esc_html( $v ) . '</a>';
			} else {
				$v = $v !== '' ? nl2br( esc_html( $v ) ) : '—';
			}
			echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . $v . '</td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		$cv = get_post_meta( $post->ID, '_sk_cv_name', true );
		echo '<tr><th scope="row">CV</th><td>';
		if ( $cv ) {
			echo '<a class="button" href="' . esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=skrine_cv&id=' . $post->ID ), 'skrine_cv_' . $post->ID ) ) . '">Download ' . esc_html( $cv ) . '</a>';
		} else {
			echo '—';
		}
		echo '</td></tr>';
		echo '<tr><th scope="row">Received</th><td>' . esc_html( get_the_date( 'j M Y, g:i a', $post ) ) . '</td></tr>';
		echo '<tr><th scope="row">Email</th><td>' . esc_html( get_post_meta( $post->ID, '_sk_mail', true ) ?: '—' ) . '</td></tr>';
		echo '</table>';
		echo '<p class="description">Applications contain personal data. Delete them (Move to Trash, then empty the trash) once they are no longer needed; the CV is deleted with them.</p>';
	}, 'skrine_application', 'normal', 'high' );
} );

add_filter( 'manage_skrine_application_posts_columns', function ( $cols ) {
	return array(
		'cb'           => $cols['cb'],
		'title'        => 'Applicant',
		'skrine_email' => 'Email',
		'skrine_phone' => 'Phone',
		'date'         => 'Received',
	);
} );
add_action( 'manage_skrine_application_posts_custom_column', function ( $col, $id ) {
	if ( $col === 'skrine_email' ) {
		echo esc_html( get_post_meta( $id, '_sk_email', true ) );
	} elseif ( $col === 'skrine_phone' ) {
		echo esc_html( get_post_meta( $id, '_sk_phone', true ) );
	}
}, 10, 2 );

/* CV download: signed-in staff only */
add_action( 'admin_post_skrine_cv', function () {
	$id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;
	check_admin_referer( 'skrine_cv_' . $id );
	if ( ! $id || get_post_type( $id ) !== 'skrine_application' || ! current_user_can( 'edit_post', $id ) ) {
		wp_die( 'Not allowed.', 403 );
	}
	$file = skrine_cv_dir() . '/' . basename( (string) get_post_meta( $id, '_sk_cv_file', true ) );
	if ( ! is_file( $file ) ) {
		wp_die( 'The CV file is missing.', 404 );
	}
	nocache_headers();
	header( 'Content-Type: application/octet-stream' );
	header( 'Content-Disposition: attachment; filename="' . str_replace( '"', '', (string) get_post_meta( $id, '_sk_cv_name', true ) ) . '"' );
	header( 'Content-Length: ' . filesize( $file ) );
	readfile( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	exit;
} );

/* deleting an application deletes its CV */
add_action( 'before_delete_post', function ( $id ) {
	if ( get_post_type( $id ) !== 'skrine_application' ) {
		return;
	}
	$f = (string) get_post_meta( $id, '_sk_cv_file', true );
	if ( $f ) {
		@unlink( skrine_cv_dir() . '/' . basename( $f ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	}
} );
