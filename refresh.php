<?php
//	======================================================
//	File:		refresh.php
//	Author:		Josh Glassmaker (Daimian Mercer)
//
//	======================================================

// Verify access via Tripwire signon
if (!session_id()) session_start();

if(!isset($_SESSION['userID']) || $_SESSION['ip'] != $_SERVER['REMOTE_ADDR']) {
	$_SESSION = array();
	session_regenerate_id();
	session_destroy();
	exit();
}

header('Content-Type: application/json');
$startTime = microtime(true);

require_once('db.inc.php');

/**
// *********************
// Check and update session
// *********************
*/
$query = 'SELECT characterID, characterName, corporationID, corporationName, admin FROM characters WHERE userID = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
$stmt->execute();
if ($row = $stmt->fetchObject()) {
	$_SESSION['characterID'] = $row->characterID;
	$_SESSION['characterName'] = $row->characterName;
	$_SESSION['corporationID'] = $row->corporationID;
	$_SESSION['corporationName'] = $row->corporationName;
	$_SESSION['admin'] = $row->admin;
}

/**
// *********************
// Mask Check
// *********************
**/
$checkMask = explode('.', $_SESSION['mask']);
if ($checkMask[1] == 0 && $checkMask[0] != 0) {
	// Check custom mask
	$query = 'SELECT masks.maskID FROM masks INNER JOIN groups ON masks.maskID = groups.maskID WHERE masks.maskID = :maskID AND ((ownerID = :characterID AND ownerType = 1373) OR (ownerID = :corporationID AND ownerType = 2) OR (eveID = :characterID AND eveType = 1373) OR (eveID = :corporationID AND eveType = 2))';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':characterID', $_SESSION['characterID'], PDO::PARAM_INT);
	$stmt->bindValue(':corporationID', $_SESSION['corporationID'], PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $_SESSION['mask'], PDO::PARAM_STR);

	if ($stmt->execute() && $stmt->fetchColumn(0) != $_SESSION['mask'])
		$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
} else if ($checkMask[1] == 1 && $checkMask[0] != $_SESSION['characterID']) {
	// Force current character mask
	$_SESSION['mask'] = $_SESSION['characterID'] . '.1';
} else if ($checkMask[1] == 2 && $checkMask[0] != $_SESSION['corporationID']) {
	// Force current corporation mask
	$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
}

session_write_close();

/**
// *********************
// Core variables
// *********************
*/
$ip				= isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : die();
$instance		= isset($_REQUEST['instance']) ? $_REQUEST['instance'] : 0;
$version		= isset($_SERVER['SERVER_NAME'])? explode('.', $_SERVER['SERVER_NAME'])[0] : die();
$userID			= isset($_SESSION['userID']) ? $_SESSION['userID'] : die();
$maskID			= isset($_SESSION['mask']) ? $_SESSION['mask'] : die();
$systemID 		= isset($_REQUEST['systemID']) && !empty($_REQUEST['systemID']) ? $_REQUEST['systemID'] : null;
$systemName 	= isset($_REQUEST['systemName']) && !empty($_REQUEST['systemName']) ? $_REQUEST['systemName'] : null;
$activity 		= isset($_REQUEST['activity']) ? json_encode($_REQUEST['activity']) : null;
$refresh 		= array('sigUpdate' => false, 'chainUpdate' => false);

/**
// *********************
// Server notifications & user activity
// *********************
*/
$query = 'SELECT notify FROM active WHERE instance = :instance AND notify IS NOT NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->execute();
$stmt->rowCount() ? $output['notify'] = $stmt->fetchColumn() : null;

$query = 'SELECT characters.characterName, activity FROM active INNER JOIN characters ON active.userID = characters.userID WHERE maskID = :maskID AND instance <> :instance AND activity IS NOT NULL AND activity <> ""';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->execute();
$stmt->rowCount() ? $output['activity'] = $stmt->fetchAll(PDO::FETCH_OBJ) : null;

/**
// *********************
// Character Tracking
// *********************
*/
if (isset($_REQUEST['tracking'])) {
	foreach ($_REQUEST['tracking'] as $track) {
		$track['characterID'] 		= isset($track['characterID']) ? $track['characterID'] : null;
		$track['characterName'] 	= isset($track['characterName']) ? $track['characterName'] : null;
		$track['systemID'] 			= isset($track['systemID']) ? $track['systemID'] : null;
		$track['systemName'] 		= isset($track['systemName']) ? $track['systemName'] : null;
		$track['stationID'] 		= isset($track['stationID']) && !empty($track['stationID']) ? $track['stationID'] : null;
		$track['stationName'] 		= isset($track['stationName']) && !empty($track['stationName']) ? $track['stationName'] : null;
		$track['shipID'] 			= isset($track['shipID']) ? $track['shipID'] : null;
		$track['shipName'] 			= isset($track['shipName']) ? $track['shipName'] : null;
		$track['shipTypeID'] 		= isset($track['shipTypeID']) ? $track['shipTypeID'] : null;
		$track['shipTypeName'] 		= isset($track['shipTypeName']) ? $track['shipTypeName'] : null;

		$query = 'INSERT INTO tracking (userID, characterID, characterName, systemID, systemName, stationID, stationName, shipID, shipName, shipTypeID, shipTypeName, maskID)
		VALUES (:userID, :characterID, :characterName, :systemID, :systemName, :stationID, :stationName, :shipID, :shipName, :shipTypeID, :shipTypeName, :maskID)
		ON DUPLICATE KEY UPDATE
		systemID = :systemID, systemName = :systemName, stationID = :stationID, stationName = :stationName, shipID = :shipID, shipName = :shipName, shipTypeID = :shipTypeID, shipTypeName = :shipTypeName';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
		$stmt->bindValue(':characterID', $track['characterID'], PDO::PARAM_INT);
		$stmt->bindValue(':characterName', $track['characterName'], PDO::PARAM_STR);
		$stmt->bindValue(':systemID', $track['systemID'], PDO::PARAM_INT);
		$stmt->bindValue(':systemName', $track['systemName'], PDO::PARAM_STR);
		$stmt->bindValue(':stationID', $track['stationID'], PDO::PARAM_INT);
		$stmt->bindValue(':stationName', $track['stationName'], PDO::PARAM_STR);
		$stmt->bindValue(':shipID', $track['shipID'], PDO::PARAM_INT);
		$stmt->bindValue(':shipName', $track['shipName'], PDO::PARAM_STR);
		$stmt->bindValue(':shipTypeID', $track['shipTypeID'], PDO::PARAM_INT);
		$stmt->bindValue(':shipTypeName', $track['shipTypeName'], PDO::PARAM_STR);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
		$stmt->execute();
	}
}

/**
// *********************
// ESI
// note: must be below Character Tracking
// *********************
*/
if ($_REQUEST['mode'] == 'init' || isset($_REQUEST['esi'])) {
	$output['esi'] = array();

	if (isset($_REQUEST['esi']['delete'])) {
		$characterID = $_REQUEST['esi']['delete'];

		$query = 'DELETE FROM esi WHERE userID = :userID AND characterID = :characterID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
		$stmt->bindValue(':characterID', $characterID, PDO::PARAM_INT);
		$stmt->execute();
	}

	$query = 'SELECT characterID, characterName, accessToken, refreshToken, tokenExpire FROM esi WHERE userID = :userID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
	$stmt->execute();
	$characters = $stmt->fetchAll(PDO::FETCH_OBJ);
	foreach ($characters as $character) {
		if (strtotime($character->tokenExpire) < time('-1 minute')) {
			require_once("evesso.class.php");

			$evesso = new evesso();
			if ($evesso->refresh($character->refreshToken)) {
				$query = 'UPDATE esi SET accessToken = :accessToken, refreshToken = :refreshToken, tokenExpire = :tokenExpire WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':accessToken', $evesso->accessToken, PDO::PARAM_STR);
				$stmt->bindValue(':refreshToken', $evesso->refreshToken, PDO::PARAM_STR);
				$stmt->bindValue(':tokenExpire', $evesso->tokenExpire, PDO::PARAM_STR);
				$stmt->bindValue(':characterID', $character->characterID, PDO::PARAM_STR);
				$stmt->execute();

				$character->accessToken = $evesso->accessToken;
				$character->refreshToken = $evesso->refreshToken;
				$character->tokenExpire = $evesso->tokenExpire;
			} else {
				$query = 'DELETE FROM esi WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $character->characterID, PDO::PARAM_INT);
				$stmt->execute();

				unset($character);
				continue;
			}
		}

		$output['esi'][$character->characterID] = $character;
	}
}

/**
// *********************
// Signatures
// *********************
*/
$data = isset($_REQUEST['request']) ? json_decode(json_encode($_REQUEST['request'])) : null;
//$data = json_decode(file_get_contents('php://input'));
if ($data) {
	require('signatures.php');
	$signatures = new signatures();

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'rename') && $data->signatures->rename != null)
		$output['result'] = $signatures->rename($data->signatures->rename);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'delete') && $data->signatures->delete != null)
		$output['result'] = $signatures->delete($data->signatures->delete);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'add') && $data->signatures->add != null)
		$output['result'] = $signatures->add($data->signatures->add);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'update') && $data->signatures->update != null)
		$output['result'] = $signatures->update($data->signatures->update);
}

/**
// *********************
// Active Users
// *********************
*/
$query = 'INSERT INTO active (ip, instance, session, userID, maskID, systemID, systemName, activity, version)
			VALUES (:ip, :instance, :session, :userID, :maskID, :systemID, :systemName, :activity, :version)
			ON DUPLICATE KEY UPDATE
			maskID = :maskID, systemID = :systemID, systemName = :systemName, activity = :activity, version = :version, time = NOW(), notify = NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->bindValue(':session', session_id(), PDO::PARAM_STR);
$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
$stmt->bindValue(':systemName', $systemName, PDO::PARAM_STR);
$stmt->bindValue(':activity', $activity, PDO::PARAM_STR);
$stmt->bindValue(':version', $version, PDO::PARAM_STR);
$stmt->execute();

/**
// *********************
// Gathering data to output
// *********************
*/
if (isset($_REQUEST['mode']) && $_REQUEST['mode'] == 'init') {
	$output['signatures'] = Array();
	$systemID = $_REQUEST['systemID'];

	$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	while ($row = $stmt->fetchObject()) {
		$row->lifeTime = date('m/d/Y H:i:s e', strtotime($row->lifeTime));
		$row->lifeLeft = date('m/d/Y H:i:s e', strtotime($row->lifeLeft));
		$row->time = date('m/d/Y H:i:s e', strtotime($row->time));

		$output['signatures'][$row->id] = $row;
	}

	// Send server time for time sync
	$now = new DateTime();
	//$now->sub(new DateInterval('PT300S')); // Set clock 300 secounds behind
	$output['sync'] = $now->format("m/d/Y H:i:s e");

	// Grab chain map data
	$query = "SELECT DISTINCT signatures.id, signatureID, system, systemID, connection, connectionID, sig2ID, type, nth, sig2Type, nth2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM, mask FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273)) ORDER BY id ASC";
	#$query = "SELECT DISTINCT signatures.id, signatureID, system, CASE WHEN signatures.systemID = 0 THEN signatures.id ELSE signatures.systemID END AS systemID, connection, CASE WHEN connectionID IS NULL OR connectionID = 0 THEN signatures.id ELSE connectionID END AS connectionID, sig2ID, type, nth, sig2Type, nth2, class1.class, class2.class AS class2, (SELECT security FROM $eve_dump.mapSolarSystems WHERE solarSystemID = signatures.systemID) AS security, (SELECT security FROM $eve_dump.mapSolarSystems WHERE solarSystemID = connectionID) AS security2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM FROM signatures LEFT JOIN systems class1 ON class1.systemID = signatures.systemID LEFT JOIN systems class2 ON class2.systemID = connectionID WHERE life IS NOT NULL AND mask = :mask";
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	$output['chain']['map'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// System activity indicators
	$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills, mask FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND (mask = :mask OR ((sigs.systemID = 31000005 OR sigs.connectionID = 31000005) AND mask = 273))';
	#$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	$output['chain']['activity'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// Chain last modified
	$query = 'SELECT MAX(time) AS last_modified FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))';
	#$query = 'SELECT MAX(time) AS last_modified FROM signatures WHERE life IS NOT NULL AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$output['chain']['last_modified'] = $stmt->rowCount() ? $stmt->fetchColumn() : date('Y-m-d H:i:s', time());

	// Get occupied systems
	$query = 'SELECT systemID, COUNT(characterID) AS count FROM tracking WHERE maskID = :maskID GROUP BY systemID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$output['chain']['occupied'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// Get flares
	$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_INT);
	$stmt->execute();
	$result = $stmt->fetchAll(PDO::FETCH_CLASS);
	$output['chain']['flares']['flares'] = $result;
	$output['chain']['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());

	// Get Comments
	$query = 'SELECT id, comment, created AS createdDate, c.characterName AS createdBy, modified AS modifiedDate, m.characterName AS modifiedBy, systemID FROM comments LEFT JOIN characters c ON createdBy = c.characterID LEFT JOIN characters m ON modifiedBy = m.characterID WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	while ($row = $stmt->fetchObject()) {
		$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdBy' => $row->createdBy, 'modified' => $row->modifiedDate, 'modifiedBy' => $row->modifiedBy, 'sticky' => $row->systemID == 0 ? true : false);
	}
} else if ((isset($_REQUEST['mode']) && ($_REQUEST['mode'] == 'refresh')) || $refresh['sigUpdate'] == true || $refresh['chainUpdate'] == true) {
	$sigCount 		= isset($_REQUEST['sigCount']) ? $_REQUEST['sigCount'] : null;
	$sigTime 		= isset($_REQUEST['sigTime']) ? $_REQUEST['sigTime'] : null;
	$chainCount		= isset($_REQUEST['chainCount'])?$_REQUEST['chainCount']:null;
	$chainTime 		= isset($_REQUEST['chainTime'])?$_REQUEST['chainTime']:null;
	$flareCount 	= isset($_REQUEST['flareCount'])?$_REQUEST['flareCount']:null;
	$flareTime 		= isset($_REQUEST['flareTime'])?$_REQUEST['flareTime']:null;
	$commentCount 	= isset($_REQUEST['commentCount'])?$_REQUEST['commentCount']:null;
	$commentTime 	= isset($_REQUEST['commentTime'])?$_REQUEST['commentTime']:null;
	$systemID 		= isset($_REQUEST['systemID'])?$_REQUEST['systemID']:null;

	// Check if signatures changed....
	if ($refresh['sigUpdate'] == false) {
		$query = 'SELECT COUNT(id) AS count, MAX(time) AS modified FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();

		$row = $stmt->fetchObject();
		if ($sigCount != (int)$row->count || strtotime($sigTime) < strtotime($row->modified)) {
			$refresh['sigUpdate'] = true;
		}
	}

	if ($refresh['sigUpdate'] == true) {
		$output['signatures'] = Array();

		$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();

		while ($row = $stmt->fetchObject()) {
			$row->lifeTime = date('m/d/Y H:i:s e', strtotime($row->lifeTime));
			$row->lifeLeft = date('m/d/Y H:i:s e', strtotime($row->lifeLeft));
			$row->time = date('m/d/Y H:i:s e', strtotime($row->time));

			$output['signatures'][$row->id] = $row;
		}
	}

	// Check if chain changed....
	if ($refresh['chainUpdate'] == false && $chainCount !== null && $chainTime !== null) {
		$query = 'SELECT COUNT(id) AS chainCount, MAX(time) as chainTime FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();
		$row = $stmt->fetchObject();

		if ($row && $row->chainCount != $chainCount) {
			$refresh['chainUpdate'] = true;
		} else if ($row && $row->chainTime && $row->chainTime != $chainTime) {
			$refresh['chainUpdate'] = true;
		}
	}

	if ($refresh['chainUpdate'] == true) {
		$output['chain']['map'] = Array();

		$query = "SELECT DISTINCT signatures.id, signatureID, system, systemID, connection, connectionID, sig2ID, type, nth, sig2Type, nth2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM, mask FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273)) ORDER BY id ASC";
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
		$stmt->execute();

		$output['chain']['map'] = $stmt->fetchAll(PDO::FETCH_CLASS);

		// System activity indicators
		$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills, mask FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND (mask = :mask OR ((sigs.systemID = 31000005 OR sigs.connectionID = 31000005) AND mask = 273))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
		$stmt->execute();

		$output['chain']['activity'] = $stmt->fetchAll(PDO::FETCH_CLASS);

		$query = 'SELECT time AS last_modified FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273)) ORDER BY time DESC LIMIT 1';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
		$stmt->execute();

		$output['chain']['last_modified'] = $stmt->fetchColumn();
	}

	// Get flares
	if (isset($output['chain']) || ($flareCount != null && $flareTime != null)) {
		$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID ORDER BY time DESC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_INT);
		$stmt->execute();
		$result = $stmt->fetchAll(PDO::FETCH_CLASS);
		if (isset($output['chain']) || (count($result) != $flareCount || ($result && strtotime($result[0]->time) < strtotime($flareTime)))) {
			$output['chain']['flares']['flares'] = $result;
			$output['chain']['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());
		}
	}

	// Get occupied systems
	$query = 'SELECT systemID, COUNT(characterID) AS count FROM tracking WHERE maskID = :maskID GROUP BY systemID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	if ($result = $stmt->fetchAll(PDO::FETCH_CLASS)) {
		$output['chain']['occupied'] = $result;
	}

	// Check Comments
	$query = 'SELECT COUNT(id) AS count, MAX(modified) AS modified FROM comments WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$row = $stmt->fetch(PDO::FETCH_OBJ);
	if ((int)$commentCount != (int)$row->count || strtotime($commentTime) < strtotime($row->modified)) {
		$output['comments'] = array();
		// Get Comments
		$query = 'SELECT id, comment, created AS createdDate, c.characterName AS createdBy, modified AS modifiedDate, m.characterName AS modifiedBy, systemID FROM comments LEFT JOIN characters c ON createdBy = c.characterID LEFT JOIN characters m ON modifiedBy = m.characterID WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdBy' => $row->createdBy, 'modified' => $row->modifiedDate, 'modifiedBy' => $row->modifiedBy, 'sticky' => $row->systemID == 0 ? true : false);
		}
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);
echo json_encode($output);
