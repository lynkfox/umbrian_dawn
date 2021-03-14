<?php
if (!session_id()) session_start();

if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');

if(!defined('DISCORD_WEB_HOOK')) {
	http_response_code(500);
	die('No endpoint configured to send pings to');
}

$url_base = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . $_SERVER['SERVER_NAME'].dirname($_SERVER["REQUEST_URI"].'?');
$content = 'Tripwire ping in **' . $_REQUEST['systemText'] . "**\n" . $url_base . '/?system=' . $_REQUEST['systemName'] . "\n" . $_REQUEST['message'];

$data = array('content' => $content);

// use key 'http' even if you send the request to https://...
$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);
$context  = stream_context_create($options);
$result = @file_get_contents(DISCORD_WEB_HOOK, false, $context);

header('Content-type: application/json');
if ($result === FALSE) { 
	http_response_code(500);
	error_log(error_get_last()['message']);
	die(json_encode(array('error' => 'Failed to post to hook')));
}

echo json_encode(array('success' => true));

?>