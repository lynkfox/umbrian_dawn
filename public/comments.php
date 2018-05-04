<?php
//***********************************************************
//	File: 		comments.php
//	Author: 	Daimian
//	Created: 	12/08/2014
//	Modified: 	12/12/2014 - Daimian
//
//	Purpose:	Handles saving/editing/deleting comments.
//
//	ToDo:
//
//***********************************************************
$startTime = microtime(true);

if (!session_id()) session_start();

if(!isset($_SESSION['userID'])) {
	http_response_code(403);
	exit();
}

require_once('../config.php');
require_once('../db.inc.php');

header('Content-Type: application/json');

$maskID = 		$_SESSION['mask'];
$characterID = 	$_SESSION['characterID'];
$characterName = $_SESSION['characterName'];
$systemID = 	isset($_REQUEST['systemID']) ? $_REQUEST['systemID'] : null;
$commentID = 	isset($_REQUEST['commentID']) ? $_REQUEST['commentID'] : null;
$comment = 		isset($_REQUEST['comment']) ? $_REQUEST['comment'] : null;
$mode = 		isset($_REQUEST['mode']) ? $_REQUEST['mode'] : null;
$output = 		null;

if ($mode == 'save') {
	$query = 'INSERT INTO comments (id, systemID, comment, created, createdByID, createdByName, modifiedByID, modifiedByName, maskID)
				VALUES (:commentID, :systemID, :comment, NOW(), :createdByID, :createdByName, :modifiedByID, :modifiedByName, :maskID)
				ON DUPLICATE KEY UPDATE
				systemID = :systemID, comment = :comment, modifiedByID = :modifiedByID, modifiedByName = :modifiedByName, modified = NOW()';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':comment', $comment);
	$stmt->bindValue(':createdByID', $characterID);
	$stmt->bindValue(':createdByName', $characterName);
	$stmt->bindValue(':modifiedByID', $characterID);
	$stmt->bindValue(':modifiedByName', $characterName);
	$stmt->bindValue(':maskID', $maskID);
	$output['result'] = $stmt->execute();

	if ($output['result']) {
		$query = 'SELECT id, created AS createdDate, createdByName, modified AS modifiedDate, modifiedByName FROM comments WHERE id = :commentID AND maskID = :maskID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':commentID', ($commentID ? $commentID : $mysql->lastInsertId()));
		$stmt->bindValue(':maskID', $maskID);
		$stmt->execute();
		$output['comment'] = $stmt->fetchObject();
	}
} else if ($mode == 'delete' && $commentID) {
	$query = 'DELETE FROM comments WHERE id = :commentID AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID);
	$stmt->bindValue(':maskID', $maskID);
	$output['result'] = $stmt->execute();
} else if ($mode == 'sticky' && $commentID) {
	$query = 'UPDATE comments SET systemID = :systemID WHERE id = :commentID AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID);
	$stmt->bindValue(':systemID', $systemID);
	$stmt->bindValue(':maskID', $maskID);
	$output['result'] = $stmt->execute();
}


$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
?>
