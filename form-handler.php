<?php
header('Content-Type: application/json');

$debug_id = function_exists('random_bytes')
  ? strtoupper(bin2hex(random_bytes(4)))
  : strtoupper(substr(md5(uniqid('', true)), 0, 8));
$log_file = __DIR__ . '/contact-form-errors.log';

if (
  ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' &&
  trim($_POST['form_type'] ?? '') === 'client_notification'
) {
  require __DIR__ . '/notification-handler.php';
  exit;
}

function log_contact_error($debug_id, $message, $context = []) {
  global $log_file;

  $entry = [
    'time' => date('c'),
    'debug_id' => $debug_id,
    'message' => $message,
    'context' => $context
  ];

  error_log('[Contact Form] ' . json_encode($entry));
  @file_put_contents($log_file, json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function json_response($success, $message, $status_code = 200, $debug_id = null) {
  http_response_code($status_code);
  echo json_encode([
    'success' => $success,
    'message' => $message,
    'debug_id' => $debug_id
  ]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(false, 'Invalid request method.', 405, $debug_id);
}

function field_value($name) {
  return trim($_POST[$name] ?? '');
}

function clean_text($value) {
  $value = trim($value);
  $value = str_replace(["\r", "\n"], ' ', $value);
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$recipient = 'hello@teemikemedia.com';
$copy_recipient = 'teemikemedia@gmail.com';
$site_name = 'Teemikemedia Agency';
$smtp_host = 'mail.teemikemedia.com';
$smtp_port = 465;
$smtp_username = 'hello@teemikemedia.com';
$smtp_password = 'Jesse5701@#$';
$smtp_from = 'hello@teemikemedia.com';

$honeypot = field_value('website');
$started_at = (int) field_value('form_started_at');
$submitted_at = time();

if ($honeypot !== '') {
  log_contact_error($debug_id, 'Honeypot field was filled.', [
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
  ]);
  json_response(true, 'Thank you. Your inquiry has been sent successfully.');
}

if ($started_at <= 0 || ($submitted_at - $started_at) < 3) {
  log_contact_error($debug_id, 'Timing spam check failed.', [
    'started_at' => $started_at,
    'submitted_at' => $submitted_at,
    'seconds_elapsed' => $submitted_at - $started_at
  ]);
  json_response(false, 'Please wait a moment before submitting the form.', 400, $debug_id);
}

$name = clean_text(field_value('full_name'));
$email = filter_var(field_value('email'), FILTER_SANITIZE_EMAIL);
$form_type = field_value('form_type') ?: 'contact';
$phone = clean_text(field_value('phone'));
$service = clean_text(field_value('service'));
$budget = clean_text(field_value('budget'));
$timeline = clean_text(field_value('timeline'));
$message = trim($_POST['message'] ?? '');
$message_clean = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$website_url_raw = field_value('website_url');
$website_url = filter_var($website_url_raw, FILTER_SANITIZE_URL);
$audit_goal = trim($_POST['audit_goal'] ?? '');
$audit_goal_clean = htmlspecialchars($audit_goal, ENT_QUOTES, 'UTF-8');
$performance_score = clean_text(field_value('performance_score'));
$performance_rating = clean_text(field_value('performance_rating'));
$performance_title = clean_text(field_value('performance_title'));
$performance_summary = trim($_POST['performance_summary'] ?? '');
$performance_summary_clean = htmlspecialchars($performance_summary, ENT_QUOTES, 'UTF-8');
$performance_answers = trim($_POST['performance_answers'] ?? '');
$performance_answers_clean = htmlspecialchars($performance_answers, ENT_QUOTES, 'UTF-8');
$performance_recommendations = trim($_POST['performance_recommendations'] ?? '');
$performance_recommendations_clean = htmlspecialchars($performance_recommendations, ENT_QUOTES, 'UTF-8');

$allowed_services = [
  'Business Website Design',
  'Landing Page Design',
  'Website Redesign',
  'Ecommerce Website',
  'SEO Setup',
  'Website Care'
];

if ($name === '' || strlen($name) < 2) {
  json_response(false, 'Please enter your full name.', 422, $debug_id);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_response(false, 'Please enter a valid email address.', 422, $debug_id);
}

$send_autoresponse = false;
$autoresponse_subject = '';
$autoresponse_body = '';

if ($form_type === 'website_performance_checker') {
  if ($website_url !== '' && !preg_match('/^https?:\/\//i', $website_url)) {
    $website_url = 'https://' . $website_url;
  }

  if (!filter_var($website_url, FILTER_VALIDATE_URL)) {
    json_response(false, 'Please enter a valid website link.', 422, $debug_id);
  }

  if ($performance_score === '' || $performance_rating === '') {
    json_response(false, 'The website score report is incomplete. Please calculate the score again.', 422, $debug_id);
  }

  if (
    strlen($performance_answers) > 5000 ||
    strlen($performance_recommendations) > 5000 ||
    strlen($performance_summary) > 2500
  ) {
    json_response(false, 'The website score report is too long. Please refresh and try again.', 422, $debug_id);
  }

  $subject = 'New Website Performance Checker Report - ' . $site_name;

  $email_body = "
New website performance checker submission from {$site_name}

Email Address: {$email}
Website Link: {$website_url}
Score: {$performance_score}
Rating: {$performance_rating}

Result:
" . ($performance_title ?: 'Website Performance Checker Result') . "
" . ($performance_summary_clean ?: 'Not provided') . "

Checklist Answers:
" . ($performance_answers_clean ?: 'Not provided') . "

Recommendations:
" . ($performance_recommendations_clean ?: 'Not provided') . "

Submitted From: " . ($_SERVER['HTTP_REFERER'] ?? 'Website performance checker') . "
IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "
";

  $send_autoresponse = true;
  $autoresponse_subject = 'Your website performance checker report';
  $autoresponse_body = "
Hi,

Thank you for using the Teemikemedia Agency Website Performance Checker.

Website reviewed:
{$website_url}

Your Score:
{$performance_score}

Rating:
{$performance_rating}

Result:
" . html_entity_decode(($performance_title ?: 'Website Performance Checker Result'), ENT_QUOTES, 'UTF-8') . "
" . html_entity_decode(($performance_summary_clean ?: 'Your website score has been generated.'), ENT_QUOTES, 'UTF-8') . "

Your Checklist Answers:
" . html_entity_decode(($performance_answers_clean ?: 'Not provided'), ENT_QUOTES, 'UTF-8') . "

Recommended Improvements:
" . html_entity_decode(($performance_recommendations_clean ?: 'Request a free website audit for a deeper review.'), ENT_QUOTES, 'UTF-8') . "

Want a deeper review? Request a free website audit:
https://teemikemedia.com/free-website-audit/

Best regards,
Teemikemedia Agency
hello@teemikemedia.com
";
} elseif ($form_type === 'website_audit') {
  if ($website_url !== '' && !preg_match('/^https?:\/\//i', $website_url)) {
    $website_url = 'https://' . $website_url;
  }

  if (!filter_var($website_url, FILTER_VALIDATE_URL)) {
    json_response(false, 'Please enter a valid website link.', 422, $debug_id);
  }

  if (strlen($audit_goal) > 2500) {
    json_response(false, 'Please shorten your audit notes and try again.', 422, $debug_id);
  }

  $subject = 'New Free Website Audit Request - ' . $site_name;

  $email_body = "
New free website audit request from {$site_name}

Full Name: {$name}
Email Address: {$email}
Website Link: {$website_url}

What They Want To Improve:
" . ($audit_goal_clean ?: 'Not provided') . "

Submitted From: " . ($_SERVER['HTTP_REFERER'] ?? 'Website audit form') . "
IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "
";

  $send_autoresponse = true;
  $autoresponse_subject = 'We received your free website audit request';
  $autoresponse_body = "
Hi {$name},

Thank you for requesting a free website audit from Teemikemedia Agency.

We have received your website link:
{$website_url}

Our team will review the website structure, mobile experience, trust signals, SEO foundation, and conversion flow. If we spot clear opportunities, we will follow up with practical recommendations.

Best regards,
Teemikemedia Agency
hello@teemikemedia.com
";
} else {
  if (!in_array($service, $allowed_services, true)) {
    json_response(false, 'Please choose the service you need.', 422, $debug_id);
  }

  if (strlen($message) < 20) {
    json_response(false, 'Please share a few more project details.', 422, $debug_id);
  }

  if (strlen($message) > 5000) {
    json_response(false, 'Please shorten your message and try again.', 422, $debug_id);
  }

  $subject = 'New Website Project Inquiry - ' . $site_name;

  $email_body = "
New project inquiry from {$site_name}

Full Name: {$name}
Email Address: {$email}
Phone Number: " . ($phone ?: 'Not provided') . "
Service Needed: {$service}
Estimated Budget: " . ($budget ?: 'Not selected') . "
Ideal Timeline: " . ($timeline ?: 'Not selected') . "

Project Details:
{$message_clean}

Submitted From: " . ($_SERVER['HTTP_REFERER'] ?? 'Website contact form') . "
IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "
";
}

$headers = [
  'From: Teemikemedia Website <hello@teemikemedia.com>',
  'Reply-To: ' . $name . ' <' . $email . '>',
  'To: Teemikemedia Agency <' . $recipient . '>',
  'Subject: ' . $subject,
  'Date: ' . date(DATE_RFC2822),
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'X-Mailer: PHP/' . phpversion()
];

function smtp_read($connection) {
  $response = '';

  while ($line = fgets($connection, 515)) {
    $response .= $line;

    if (isset($line[3]) && $line[3] === ' ') {
      break;
    }
  }

  return $response;
}

function smtp_command($connection, $command, $expected_code, &$debug_log = []) {
  $safe_command = $command === '.'
    ? 'DATA_END'
    : (preg_match('/^[A-Z]+/i', $command, $match) ? strtoupper($match[0]) : 'UNKNOWN');
  $logged_command = in_array($safe_command, ['AUTH'], true)
    ? 'AUTH LOGIN'
    : $command;

  if (
    $safe_command === 'UNKNOWN' ||
    !preg_match('/^(EHLO|AUTH|MAIL|RCPT|DATA|QUIT|\\.)/i', $command)
  ) {
    $logged_command = '[redacted credential exchange]';
  }

  $debug_log[] = 'CLIENT: ' . $logged_command;
  fwrite($connection, $command . "\r\n");
  $response = smtp_read($connection);
  $debug_log[] = 'SERVER: ' . trim($response);

  if (substr($response, 0, 3) !== (string) $expected_code) {
    throw new Exception('SMTP command failed at ' . $safe_command . '. Server response: ' . trim($response));
  }
}

function smtp_send_message($host, $port, $username, $password, $from, $to, $headers, $body, &$debug_log = []) {
  $debug_log[] = 'CONNECT: ssl://' . $host . ':' . $port;
  $connection = fsockopen('ssl://' . $host, $port, $errno, $errstr, 20);

  if (!$connection) {
    throw new Exception('SMTP connection failed. Error ' . $errno . ': ' . $errstr);
  }

  stream_set_timeout($connection, 20);

  $response = smtp_read($connection);
  $debug_log[] = 'SERVER: ' . trim($response);

  if (substr($response, 0, 3) !== '220') {
    fclose($connection);
    throw new Exception('SMTP server unavailable. Server response: ' . trim($response));
  }

  $host_name = $_SERVER['SERVER_NAME'] ?? 'teemikemedia.com';

  smtp_command($connection, 'EHLO ' . $host_name, 250, $debug_log);
  smtp_command($connection, 'AUTH LOGIN', 334, $debug_log);
  smtp_command($connection, base64_encode($username), 334, $debug_log);
  smtp_command($connection, base64_encode($password), 235, $debug_log);
  smtp_command($connection, 'MAIL FROM:<' . $from . '>', 250, $debug_log);
  smtp_command($connection, 'RCPT TO:<' . $to . '>', 250, $debug_log);
  smtp_command($connection, 'DATA', 354, $debug_log);

  $body = html_entity_decode($body, ENT_QUOTES, 'UTF-8');
  $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;
  $message = str_replace(["\r\n", "\r"], "\n", $message);
  $lines = explode("\n", $message);

  foreach ($lines as $line) {
    if (isset($line[0]) && $line[0] === '.') {
      $line = '.' . $line;
    }

    fwrite($connection, $line . "\r\n");
  }

  smtp_command($connection, '.', 250, $debug_log);
  smtp_command($connection, 'QUIT', 221, $debug_log);
  fclose($connection);

  return true;
}

$smtp_debug_log = [];

try {
  $sent = smtp_send_message(
    $smtp_host,
    $smtp_port,
    $smtp_username,
    $smtp_password,
    $smtp_from,
    $recipient,
    $headers,
    $email_body,
    $smtp_debug_log
  );
} catch (Exception $exception) {
  log_contact_error($debug_id, 'SMTP send failed.', [
    'error' => $exception->getMessage(),
    'smtp_host' => $smtp_host,
    'smtp_port' => $smtp_port,
    'smtp_encryption' => 'SSL',
    'recipient' => $recipient,
    'from_email' => $smtp_from,
    'sender_email' => $email,
    'reply_to' => $email,
    'service' => $service,
    'smtp_debug' => $smtp_debug_log
  ]);
  $sent = false;
}

if (!$sent) {
  json_response(false, 'Sorry, the form could not be sent right now. Debug ID: ' . $debug_id . '. Please check contact-form-errors.log on the server.', 500, $debug_id);
}

$copy_headers = [
  'From: Teemikemedia Website <hello@teemikemedia.com>',
  'Reply-To: ' . $name . ' <' . $email . '>',
  'To: Teemikemedia Gmail Copy <' . $copy_recipient . '>',
  'Subject: [Copy] ' . $subject,
  'Date: ' . date(DATE_RFC2822),
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'X-Mailer: PHP/' . phpversion()
];

$copy_debug_log = [];

try {
  smtp_send_message(
    $smtp_host,
    $smtp_port,
    $smtp_username,
    $smtp_password,
    $smtp_from,
    $copy_recipient,
    $copy_headers,
    "Backup copy of the website form submission.\n\nOriginal recipient: {$recipient}\n\n" . $email_body,
    $copy_debug_log
  );
} catch (Exception $exception) {
  log_contact_error($debug_id, 'SMTP Gmail copy failed.', [
    'error' => $exception->getMessage(),
    'smtp_host' => $smtp_host,
    'smtp_port' => $smtp_port,
    'smtp_encryption' => 'SSL',
    'recipient' => $copy_recipient,
    'from_email' => $smtp_from,
    'sender_email' => $email,
    'reply_to' => $email,
    'service' => $service,
    'smtp_debug' => $copy_debug_log
  ]);
}

if ($send_autoresponse) {
  $autoresponse_headers = [
    'From: Teemikemedia Agency <hello@teemikemedia.com>',
    'Reply-To: Teemikemedia Agency <hello@teemikemedia.com>',
    'To: ' . $name . ' <' . $email . '>',
    'Subject: ' . $autoresponse_subject,
    'Date: ' . date(DATE_RFC2822),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
  ];

  $autoresponse_debug_log = [];

  try {
    smtp_send_message(
      $smtp_host,
      $smtp_port,
      $smtp_username,
      $smtp_password,
      $smtp_from,
      $email,
      $autoresponse_headers,
      $autoresponse_body,
      $autoresponse_debug_log
    );
  } catch (Exception $exception) {
    log_contact_error($debug_id, 'Autoresponse failed.', [
      'error' => $exception->getMessage(),
      'smtp_host' => $smtp_host,
      'smtp_port' => $smtp_port,
      'smtp_encryption' => 'SSL',
      'recipient' => $email,
      'from_email' => $smtp_from,
      'smtp_debug' => $autoresponse_debug_log
    ]);

    json_response(false, 'Your submission was received, but the automatic email response could not be sent. Debug ID: ' . $debug_id . '.', 500, $debug_id);
  }
}

if ($form_type === 'website_audit') {
  $success_message = 'Thank you. Your free website audit request has been received. Please check your email for confirmation.';
} elseif ($form_type === 'website_performance_checker') {
  $success_message = 'Your website score is ready and the report has been sent to your email.';
} else {
  $success_message = 'Thank you. Your inquiry has been sent successfully.';
}

json_response(true, $success_message);
