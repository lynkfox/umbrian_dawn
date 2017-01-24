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

require('db.inc.php');

header('Content-Type: application/json');

$output = null;

$query = 'SELECT players, status AS online, time FROM eve_api.serverStatus ORDER BY time DESC LIMIT 1';
$stmt = $mysql->prepare($query);
$stmt->execute();
$result = $stmt->fetch();
if ($result) {
	$output = $result;
	$output['time'] = strtotime($result->time) - time() + 180;
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
