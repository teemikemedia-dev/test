<?php
header('Content-Type: application/json');

$debug_id = function_exists('random_bytes')
  ? strtoupper(bin2hex(random_bytes(4)))
  : strtoupper(substr(md5(uniqid('', true)), 0, 8));

$log_file = __DIR__ . '/client-notification-errors.log';

function log_notification_error($debug_id, $message, $context = []) {
  global $log_file;

  $entry = [
    'time' => date('c'),
    'debug_id' => $debug_id,
    'message' => $message,
    'context' => $context
  ];

  error_log('[Client Notification] ' . json_encode($entry));
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

function field_value($name) {
  return trim($_POST[$name] ?? '');
}

function clean_text($value) {
  $value = trim($value);
  $value = str_replace(["\r\n", "\r"], "\n", $value);
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function http_json_request($url, $method = 'GET', $body = null) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    if ($method === 'POST') {
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $status >= 400) {
      throw new Exception('HTTP request failed. Status: ' . $status . '. Error: ' . $error . '. Response: ' . $response);
    }

    return json_decode($response, true);
  }

  $options = [
    'http' => [
      'method' => $method,
      'timeout' => 20,
      'header' => "Content-Type: application/json\r\n"
    ]
  ];

  if ($method === 'POST') {
    $options['http']['content'] = json_encode($body);
  }

  $response = @file_get_contents($url, false, stream_context_create($options));

  if ($response === false) {
    throw new Exception('HTTP request failed using file_get_contents.');
  }

  return json_decode($response, true);
}

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

  $message = implode("\r\n", $headers) . "\r\n\r\n" . html_entity_decode($body, ENT_QUOTES, 'UTF-8');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(false, 'Invalid request method.', 405, $debug_id);
}

$firebase_api_key = 'AIzaSyCSWg6WtWb2KBO9c09a03o7nviOP_bRuhc';
$database_url = 'https://teemikemedia-dashboard-default-rtdb.firebaseio.com';
$smtp_host = 'mail.teemikemedia.com';
$smtp_port = 465;
$smtp_username = 'hello@teemikemedia.com';
$smtp_password = 'Jesse5701@#$';
$smtp_from = 'hello@teemikemedia.com';
$agency_copy = 'hello@teemikemedia.com';
$gmail_copy = 'teemikemedia@gmail.com';

$id_token = field_value('id_token');
$client_uid = clean_text(field_value('client_uid'));
$client_name = clean_text(field_value('client_name')) ?: 'Client';
$client_email = filter_var(field_value('client_email'), FILTER_SANITIZE_EMAIL);
$update_type = clean_text(field_value('update_type')) ?: 'Project Update';
$title = clean_text(field_value('title')) ?: 'Your Teemikemedia Agency dashboard has been updated';
$detail = clean_text(field_value('detail')) ?: 'A new project update has been published inside your client dashboard.';
$action_url = field_value('action_url') ?: 'dashboard.html';

if ($id_token === '') {
  json_response(false, 'Missing admin verification token.', 401, $debug_id);
}

if (!filter_var($client_email, FILTER_VALIDATE_EMAIL)) {
  json_response(false, 'The selected client does not have a valid email address.', 422, $debug_id);
}

try {
  $lookup = http_json_request(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . urlencode($firebase_api_key),
    'POST',
    ['idToken' => $id_token]
  );

  $admin_uid = $lookup['users'][0]['localId'] ?? '';

  if ($admin_uid === '') {
    throw new Exception('Firebase token did not return a user UID.');
  }

  $admin_record = http_json_request(
    $database_url . '/admins/' . rawurlencode($admin_uid) . '.json?auth=' . urlencode($id_token)
  );

  $is_admin = $admin_record === true ||
    (
      is_array($admin_record) &&
      isset($admin_record['approved']) &&
      $admin_record['approved'] === true
    );

  if (!$is_admin) {
    json_response(false, 'This account is not approved to send client notifications.', 403, $debug_id);
  }
} catch (Exception $exception) {
  log_notification_error($debug_id, 'Firebase admin verification failed.', [
    'error' => $exception->getMessage(),
    'client_uid' => $client_uid
  ]);

  json_response(false, 'Admin verification failed. Debug ID: ' . $debug_id, 403, $debug_id);
}

$dashboard_url = preg_match('/^https?:\/\//i', $action_url)
  ? $action_url
  : 'https://teemikemedia.com/' . ltrim($action_url, '/');
$subject = 'Teemikemedia Agency Project Update - ' . html_entity_decode($title, ENT_QUOTES, 'UTF-8');

$client_body = "
Hi " . html_entity_decode($client_name, ENT_QUOTES, 'UTF-8') . ",

There is a new update from Teemikemedia Agency.

Update Type:
" . html_entity_decode($update_type, ENT_QUOTES, 'UTF-8') . "

Update:
" . html_entity_decode($title, ENT_QUOTES, 'UTF-8') . "

Details:
" . html_entity_decode($detail, ENT_QUOTES, 'UTF-8') . "

You can log in to your client dashboard to view the latest project information:
{$dashboard_url}

Best regards,
Teemikemedia Agency
hello@teemikemedia.com
";

$headers = [
  'From: Teemikemedia Agency <hello@teemikemedia.com>',
  'Reply-To: Teemikemedia Agency <hello@teemikemedia.com>',
  'To: ' . html_entity_decode($client_name, ENT_QUOTES, 'UTF-8') . ' <' . $client_email . '>',
  'Subject: ' . $subject,
  'Date: ' . date(DATE_RFC2822),
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'X-Mailer: PHP/' . phpversion()
];

$smtp_debug_log = [];

try {
  smtp_send_message(
    $smtp_host,
    $smtp_port,
    $smtp_username,
    $smtp_password,
    $smtp_from,
    $client_email,
    $headers,
    $client_body,
    $smtp_debug_log
  );
} catch (Exception $exception) {
  log_notification_error($debug_id, 'Client notification send failed.', [
    'error' => $exception->getMessage(),
    'client_uid' => $client_uid,
    'client_email' => $client_email,
    'smtp_debug' => $smtp_debug_log
  ]);

  json_response(false, 'Client notification could not be sent. Debug ID: ' . $debug_id, 500, $debug_id);
}

foreach ([$agency_copy, $gmail_copy] as $copy_email) {
  $copy_debug_log = [];
  $copy_headers = [
    'From: Teemikemedia Agency <hello@teemikemedia.com>',
    'Reply-To: Teemikemedia Agency <hello@teemikemedia.com>',
    'To: Teemikemedia Notification Copy <' . $copy_email . '>',
    'Subject: [Client Notification Copy] ' . $subject,
    'Date: ' . date(DATE_RFC2822),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
  ];

  try {
    smtp_send_message(
      $smtp_host,
      $smtp_port,
      $smtp_username,
      $smtp_password,
      $smtp_from,
      $copy_email,
      $copy_headers,
      "A client notification was sent.\n\nClient: " . html_entity_decode($client_name, ENT_QUOTES, 'UTF-8') . "\nClient Email: {$client_email}\n\n" . $client_body,
      $copy_debug_log
    );
  } catch (Exception $exception) {
    log_notification_error($debug_id, 'Notification copy failed.', [
      'error' => $exception->getMessage(),
      'copy_email' => $copy_email,
      'smtp_debug' => $copy_debug_log
    ]);
  }
}

json_response(true, 'Client email notification sent.');
