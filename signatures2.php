<?php

require('db.inc.php');

class signature {
    public $id = null;
    public $signatureID = null;
    public $systemID = null;
    public $type = ['combat', 'data', 'relic', 'ore', 'gas', 'wormhole'];
    public $name = null;
    public $bookmark = null;
    public $lifeTime = null;
    public $lifeLength = 4320; //minutes (72hrs)
    public $lifeLeft = null;
    public $createdByID = null;
    public $createdByName = null;
    public $modifiedByID = null;
    public $modifiedByName = null;
    public $modifiedTime = null;
    public $maskID = 0;

    function __construct($signature) {
        $this->id = isset($signature['id']) ? $signature['id'] : $this->id;
        $this->signatureID = isset($signature['signatureID']) ? $signature['signatureID'] : $this->signatureID;
        $this->systemID = isset($signature['systemID']) && is_numeric($signature['systemID']) ? (int)$signature['systemID'] : $this->systemID;
        $this->type = isset($signature['type']) && in_array(strtolower($signature['type']), $this->type) ? $signature['type'] : $this->type[0];
        $this->name = isset($signature['name']) && !empty($signature['name']) ? $signature['name'] : $this->name;
        $this->bookmark = isset($signature['bookmark']) && !empty($signature['bookmark']) ? $signature['bookmark'] : $this->bookmark;
        $this->lifeTime = isset($signature['lifeTime']) && (bool)strtotime($signature['lifeTime']) ? date('Y-m-d H:i:s', strtotime($signature['lifeTime'])) : date('Y-m-d H:i:s');
        $this->lifeLength = isset($signature['lifeLength']) && is_numeric($signature['lifeLength']) ? (int)$signature['lifeLength'] : $this->lifeLength;
        $this->lifeLeft = isset($signature['lifeLeft']) && (bool)strtotime($signature['lifeLeft']) ? date('Y-m-d H:i:s', strtotime($signature['lifeLeft'])) : date('Y-m-d H:i:s', strtotime('+'.$this->lifeLength.' minutes'));
        $this->createdByID = isset($signature['createdByID']) && is_numeric($signature['createdByID']) ? (int)$signature['createdByID'] : $this->createdByID;
        $this->createdByName = isset($signature['createdByName']) && !empty($signature['createdByName']) ? $signature['createdByName'] : $this->createdByName;
        $this->modifiedByID = isset($signature['modifiedByID']) && is_numeric($signature['modifiedByID']) ? (int)$signature['modifiedByID'] : $this->modifiedByID;
        $this->modifiedByName = isset($signature['modifiedByName']) && !empty($signature['modifiedByName']) ? $signature['modifiedByName'] : $this->modifiedByName;
        $this->modifiedTime = date('Y-m-d H:i:s');
        $this->maskID = isset($signature['maskID']) && is_numeric($signature['maskID']) ? (float)$signature['maskID'] : $this->maskID;
    }
}

class wormhole {
    public $id = null;
    public $parentID = null;
    public $childID = null;
    public $type = null;
    public $life = ['stable', 'critical'];
    public $mass = ['stable', 'destab', 'critical'];
    // public $time = date('Y-m-d H:i:s'); // ???
    public $maskID = 0;

    function __construct($wormhole) {
        $this->id = isset($wormhole['id']) ? $wormhole['id'] : $this->id;
        $this->parentID = isset($wormhole['parentID']) ? $wormhole['parentID'] : $this->parentID;
        $this->childID = isset($wormhole['parentID']) ? $wormhole['parentID'] : $this->parentID;
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? $wormhole['type'] : $this->type;
        $this->life = isset($wormhole['life']) && in_array(strtolower($wormhole['life']), $this->life) ? $wormhole['life'] : $this->life[0];
        $this->mass = isset($wormhole['mass']) && in_array(strtolower($wormhole['mass']), $this->mass) ? $wormhole['mass'] : $this->mass[0];
        $this->maskID = isset($wormhole['maskID']) && is_numeric($wormhole['maskID']) ? (float)$wormhole['maskID'] : $this->maskID;
    }
}

function addSignature($signature, $mysql) {
    $signature = new signature($signature);

    $query = 'INSERT INTO signatures2 (signatureID, systemID, type, name, bookmark, lifeTime, lifeLeft, lifeLength, createdByID, createdByName, modifiedByID, modifiedByName, modifiedTime, maskID)
                VALUES (:signatureID, :systemID, :type, :name, :bookmark, :lifeTime, :lifeLeft, :lifeLength, :createdByID, :createdByName, :modifiedByID, :modifiedByName, :modifiedTime, :maskID)';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':signatureID', $signature->signatureID);
    $stmt->bindValue(':systemID', $signature->systemID);
    $stmt->bindValue(':type', $signature->type);
    $stmt->bindValue(':name', $signature->name);
    $stmt->bindValue(':bookmark', $signature->bookmark);
    $stmt->bindValue(':lifeTime', $signature->lifeTime);
    $stmt->bindValue(':lifeLeft', $signature->lifeLeft);
    $stmt->bindValue(':lifeLength', $signature->lifeLength);
    $stmt->bindValue(':createdByID', $signature->createdByID);
    $stmt->bindValue(':createdByName', $signature->createdByName);
    $stmt->bindValue(':modifiedByID', $signature->modifiedByID);
    $stmt->bindValue(':modifiedByName', $signature->modifiedByName);
    $stmt->bindValue(':modifiedTime', $signature->modifiedTime);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = $stmt->execute();

    if ($success) {
        return $mysql->lastInsertId();
    } else {
        return false;
    }
}

function addWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'INSERT INTO wormholes (parentID, childID, type, life, mass, maskID) VALUES (:parentID, :childID, :type, :life, :mass, :maskID)';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':parentID', $wormhole->parentID);
    $stmt->bindValue(':childID', $wormhole->childID);
    $stmt->bindValue(':type', $wormhole->type);
    $stmt->bindValue(':life', $wormhole->life);
    $stmt->bindValue(':mass', $wormhole->mass);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = $stmt->execute();

    if ($success) {
        return $mysql->lastInsertId();
    } else {
        return false;
    }
}

function updateSignature($signature, $mysql) {
    $signature = new signature($signature);

    $query = 'UPDATE signatures2 SET
                signatureID = :signatureID,
                systemID = :systemID,
                type = :type,
                name = :name,
                bookmark = :bookmark,
                lifeLeft = :lifeLeft,
                lifeLength = :lifeLength,
                modifiedByID = :modifiedByID,
                modifiedByName = :modifiedByName,
                modifiedTime = :modifiedTime,
                maskID = :maskID
            WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':signatureID', $signature->signatureID);
    $stmt->bindValue(':systemID', $signature->systemID);
    $stmt->bindValue(':type', $signature->type);
    $stmt->bindValue(':name', $signature->name);
    $stmt->bindValue(':bookmark', $signature->bookmark);
    $stmt->bindValue(':lifeLeft', $signature->lifeLeft);
    $stmt->bindValue(':lifeLength', $signature->lifeLength);
    $stmt->bindValue(':modifiedByID', $signature->modifiedByID);
    $stmt->bindValue(':modifiedByName', $signature->modifiedByName);
    $stmt->bindValue(':modifiedTime', $signature->modifiedTime);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = $stmt->execute();

    if ($success) {
        return $signature->id;
    } else {
        return false;
    }
}

function updateWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'UPDATE wormholes SET type = :type, life = :life, mass = :mass WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':type', $wormhole->type);
    $stmt->bindValue(':life', $wormhole->life);
    $stmt->bindValue(':mass', $wormhole->mass);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = $stmt->execute();

    if ($success) {
        return $wormhole->id;
    } else {
        return false;
    }
}

function removeSignature($signature, $mysql) {
    $signature = new signature($signature);

    $query = 'SET @disable_trigger = 1';
    $stmt = $mysql->prepare($query);
    $stmt->execute();

    $query = 'UPDATE signatures2 SET modifiedByID = :modifiedByID, modifiedByName = :modifiedByName, modifiedTime = :modifiedTime WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':modifiedByID', $signature->modifiedByID);
    $stmt->bindValue(':modifiedByName', $signature->modifiedByName);
    $stmt->bindValue(':modifiedTime', $signature->modifiedTime);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = @$stmt->execute();

    $query = 'SET @disable_trigger = NULL';
    $stmt = $mysql->prepare($query);
    $stmt->execute();

    $query = 'DELETE FROM signatures2 WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $signature->id);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = @$stmt->execute();

    if ($success) {
        return $signature->id;
    } else {
        return false;
    }
}

function removeWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'DELETE FROM wormholes WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = @$stmt->execute();

    if ($success) {
        return $wormhole->id;
    } else {
        return false;
    }
}


// Testing code
$output = array();
var_dump($_POST);
if (isset($_POST['signatures'])) {
    // Normal signatures
    if (isset($_POST['signatures']['add'])) {
        foreach ($_POST['signatures']['add'] AS $signature) {
            $output['resultSet'][] = addSignature($signature, $mysql);
        }
    }
    if (isset($_POST['signatures']['update'])) {
        foreach ($_POST['signatures']['update'] AS $signature) {
            $output['resultSet'][] = updateSignature($signature, $mysql);
        }
    }
    if (isset($_POST['signatures']['remove'])) {
        foreach ($_POST['signatures']['remove'] AS $signature) {
            $output['resultSet'][] = removeSignature($signature, $mysql);
        }
    }

    // Wormhole signatures
    if (isset($_POST['wormholes']['add'])) {
        foreach ($_POST['wormholes']['add'] AS $wormhole) {
            if (isset($wormhole['signatures']) && count($wormhole['signatures']) == 2) {
                $wormhole['wormhole']['parentID'] = addSignature($wormhole['signatures'][0], $mysql);
                $wormhole['wormhole']['childID'] = addSignature($wormhole['signatures'][1], $mysql);
                $output['resultSet'][] = addWormhole($wormhole['wormhole'], $mysql);
            }
        }
    }
    if (isset($_POST['wormholes']['update'])) {
        foreach ($_POST['wormholes']['update'] AS $wormhole) {
            if (isset($wormhole['signatures']) && count($wormhole['signatures']) == 2) {
                updateSignature($wormhole['signatures'][0], $mysql);
                updateSignature($wormhole['signatures'][1], $mysql);
                $output['resultSet'][] = updateWormhole($wormhole['wormhole'], $mysql);
            }
        }
    }
    if (isset($_POST['wormholes']['remove'])) {
        foreach ($_POST['wormholes']['remove'] AS $wormhole) {
            if (isset($wormhole['signatures']) && count($wormhole['signatures']) == 2) {
                removeSignature($wormhole['signatures'][0], $mysql);
                removeSignature($wormhole['signatures'][1], $mysql);
                $output['resultSet'][] = removeWormhole($wormhole['wormhole'], $mysql);
            }
        }
    }
}

var_dump($output);
