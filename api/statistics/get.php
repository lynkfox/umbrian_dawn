<?php

if (isset($_REQUEST['characterID']) && $maskID) {
    $query = 'SELECT * FROM statistics WHERE characterID = :characterID AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':characterID', $_REQUEST['characterID']);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $output[] = $row;
    }
} else if ($maskID) {
    $query = 'SELECT * FROM statistics WHERE maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $output[] = $row;
    }
}