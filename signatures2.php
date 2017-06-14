<?php

require('db.inc.php');

class signature {
    public $id = null;
    public $signatureID = null;
    public $systemID = 0;
    public $type = ['combat', 'data', 'relic', 'ore', 'gas', 'wormhole'];
    public $name = null;
    public $bookmark = null;
    public $lifeTime = null;
    public $lifeLeft = null;
    public $lifeLength = 4320; //minutes (72hrs)
    public $createdByID = 0;
    public $createdByName = null;
    public $modifiedByID = 0;
    public $modifiedByName = null;
    public $modifiedTime = null;
    public $maskID = 0;

    function __construct($signature) {
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
    public $parentID = 0;
    public $childID = 0;
    public $type = null;
    public $life = ['stable', 'critical'];
    public $mass = ['stable', 'destab', 'critical'];
    // public $time = date('Y-m-d H:i:s'); // ???
    public $maskID = 0;

    function __construct($wormhole) {
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? $wormhole['type'] : $this->type;
        $this->life = in_array(strtolower($wormhole['life']), $this->life) ? $wormhole['life'] : $this->life[0];
        $this->mass = in_array(strtolower($wormhole['mass']), $this->mass) ? $wormhole['mass'] : $this->mass[0];
        $this->maskID = isset($wormhole['maskID']) && is_numeric($wormhole['maskID']) ? (float)$wormhole['maskID'] : $this->maskID;
    }
}

function add($signatures, $mysql) {

    foreach ($signatures as $signature) {
        // check if it is a wormhole or regular signature
        if (isset($signature['type']) && $signature['type'] == 'wormhole') {
            // WORMHOLE
        } else {
            $signature = new signature($signature);
            var_dump($signature);

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
                // $refresh['chainUpdate'] = true;
                return $output['resultSet'][] = $mysql->lastInsertId();
            } else {
                return $output['resultSet'][] = false;
            }
        }
    }
}


// Testing code
$output = array();
var_dump($_POST);
if (isset($_POST['signatures'])) {
    if (isset($_POST['signatures']['add'])) {
        $output = add($_POST['signatures']['add'], $mysql);
    }
}

var_dump($output);
