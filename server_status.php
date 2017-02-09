<?php
//***********************************************************
//	File: 		server_status.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	2/14/2014 - Daimian
//
//	Purpose:	Handles pulling EVE server status & player count
//
//	ToDo:
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

// Check for login - else kick
if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('db.inc.php');

header('Content-Type: application/json');

$output = null;

$query = 'SELECT players, status AS online, time FROM eve_api.serverStatus ORDER BY time DESC LIMIT 1';
$stmt = $mysql->prepare($query);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
if ($result) {
	$output = $result;
	$output['time'] = strtotime($result['time']) - time() + 180;
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
