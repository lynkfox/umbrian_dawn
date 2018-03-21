<?php
//	======================================================
//	File:		signatures.php
//	Author:		Josh Glassmaker (Daimian Mercer)
//
//	======================================================
$startTime = microtime(true);

if (!session_id()) session_start();

// Check for login & admin permission - else kick
if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../db.inc.php');

if (isset($_REQUEST['init'])) {
	$query = 'SELECT time FROM eve_api.cacheTime WHERE type = "activity"';
	$stmt = $mysql->prepare($query);
	$stmt->execute();
	$row = $stmt->fetchObject();

	$time = strtotime($row->time) + 3600;
	$output['APIrefresh'] = date('m/d/Y H:i:s e', $time);
	$cache = $time < time() ? 10 : ($time - time()) - 30;

	$output['indicator'] = $time;
} else if (isset($_REQUEST['indicator'])) {
	$query = 'SELECT time FROM eve_api.cacheTime WHERE type = "activity"';
	$stmt = $mysql->prepare($query);
	$stmt->execute();
	$row = $stmt->fetchObject();

	if ($row && isset($_REQUEST['indicator']) && $_REQUEST['indicator'] < strtotime($row->time) + 3600) {
		$time = strtotime($row->time) + 3600;
		$output['APIrefresh'] = date('m/d/Y H:i:s e', $time);
		$cache = $time < time() ? 10 : ($time - time()) - 30;

		$output['indicator'] = $time;
	} else {
		$cache = 0;
		$output['result'] = false;
	}
}

header('Cache-Control: max-age='.$cache);
header('Expires: '.gmdate('r', time() + $cache));
header('Pragma: cache');
header('Content-Type: application/json');

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);

?>
