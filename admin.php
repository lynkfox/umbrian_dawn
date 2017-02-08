<?php
$startTime = microtime(true);

if (!session_id()) session_start();

// Check for login & admin permission - else kick
if(!isset($_SESSION['userID']) || $_SESSION['ip'] != $_SERVER['REMOTE_ADDR']) {
	http_response_code(403);
	exit();
}

session_write_close();

require_once('db.inc.php');
require_once('lib.inc.php');

header('Content-Type: application/json');

$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : null;
$mask = $_SESSION['mask'];
$output = null;

if ($mode == 'active-users' && (checkOwner($mask) || checkAdmin($mask))) {
	$query = 'SELECT IFNULL(instance + t.characterID, instance) AS id, c.characterID AS accountCharacterID, c.CharacterName AS accountCharacterName, t.characterID, t.characterName, t.systemID, t.systemName, t.shipName, t.shipTypeID, t.shipTypeName, t.stationID, t.stationName, lastLogin FROM active a INNER JOIN characters c ON a.userID = c.userID INNER JOIN userStats s ON a.userID = s.userID LEFT OUTER JOIN tracking t ON t.userID = a.userID AND t.maskID = a.maskID WHERE a.maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
} else if ($mode == 'user-stats' && (checkOwner($mask) || checkAdmin($mask))) {
	$maskCheck = explode('.', $mask);
	if ($maskCheck[1] == 2) {
		$query = 'SELECT s.userID AS id, characterName, corporationName, sigCount, systemsVisited, systemsViewed, loginCount, lastLogin FROM userStats s INNER JOIN characters c ON s.userID = c.userID WHERE corporationID = :corporationID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':corporationID', $maskCheck[0]);
	} else {
		$query = 'SELECT s.userID AS id, characterName, corporationName, sigCount, systemsVisited, systemsViewed, loginCount, lastLogin FROM userStats s INNER JOIN characters c ON s.userID = c.userID WHERE (corporationID IN (SELECT eveID FROM groups WHERE eveType = 2 AND joined = 1 AND maskID = :mask UNION SELECT ownerID FROM masks WHERE ownerType = 2 AND maskID = :mask) OR characterID IN (SELECT eveID FROM groups WHERE eveType = 1373 AND joined = 1 AND maskID = :mask UNION SELECT ownerID FROM masks WHERE ownerType = 1373 AND maskID = :mask))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $mask);
	}

	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
} else if ($mode == 'access-list' && (checkOwner($mask) || checkAdmin($mask))) {
	$maskCheck = explode('.', $mask);
	if ($maskCheck[1] == 2) {
		$query = 'SELECT c.characterID AS id, c.characterName, c.corporationID, c.corporationName, c.added FROM characters c WHERE corporationID = :corporationID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':corporationID', $maskCheck[0]);
	} else {
		$query = 'SELECT c.characterID AS id, c.characterName, c.corporationID, c.corporationName, c.added FROM characters c WHERE corporationID IN (SELECT eveID FROM groups WHERE eveType = 2 AND joined = 1 AND maskID = :mask UNION SELECT ownerID FROM masks WHERE ownerType = 2 AND maskID = :mask) UNION SELECT c.characterID AS id, c.characterName, c.corporationID, c.corporationName, c.added FROM characters c WHERE characterID IN (SELECT eveID FROM groups WHERE eveType = 1373 AND joined = 1 AND maskID = :mask UNION SELECT ownerID FROM masks WHERE ownerType = 1373 AND maskID = :mask)';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $mask);
	}

	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
