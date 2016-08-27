<?php

if (!session_id()) session_start();
session_write_close();

// Check for login & admin permission - else kick
if(!isset($_SESSION['userID'])){
	exit();
}

require('db.inc.php');
require('lib.inc.php');

header('Content-Type: application/json');

$startTime = microtime(true);
$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : null;
$mask = $_SESSION['mask'];
$output = null;

if ($mode == 'active-users' && (checkOwner($mask) || checkAdmin($mask))) {
    $query = 'SELECT a.userID + instance AS id, c.characterID AS accountCharacterID, c.characterName AS accountCharacterName, a.characterID, a.characterName, systemID, systemName, shipName, shipTypeID, shipTypeName, stationID, stationName, lastLogin FROM active a INNER JOIN characters c ON a.userID = c.userID INNER JOIN userStats s ON a.userID = s.userID WHERE maskID = :mask';
    $stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
} else if ($mode == 'access-list' && (checkOwner($mask) || checkAdmin($mask))) {
	$query = 'SELECT c.characterID, c.characterName, c.corporationID, c.corporationName, c.admin, c.added FROM groups g INNER JOIN characters c ON g.eveID = c.corporationID WHERE g.eveType = 2 AND maskID = :mask UNION SELECT c.characterID, c.characterName, c.corporationID, c.corporationName, c.admin, c.added FROM groups g INNER JOIN characters c ON g.eveID = c.characterID WHERE g.eveType =  AND maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
