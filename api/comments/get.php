<?php

if (isset($_REQUEST['systemID']) && $maskID) {
    $query = 'SELECT * FROM comments WHERE (systemID = :systemID) AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':systemID', $_REQUEST['systemID']);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $output[] = $row;
    }
} else if ($maskID) {
    $query = 'SELECT * FROM comments WHERE maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':maskID', $maskID);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_CLASS);
    foreach ($rows as $row) {
      $output[] = $row;
    }
}
