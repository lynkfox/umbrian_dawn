<?php

require('../db.inc.php');
if (!session_id()) session_start();

class signature {
    protected $id = null;
    protected $signatureID = null;
    protected $systemID = null;
    protected $type = ['combat', 'data', 'relic', 'ore', 'gas', 'wormhole'];
    protected $name = null;
    protected $bookmark = null;
    protected $lifeTime = null;
    protected $lifeLength = 259200; //seconds (72hrs)
    protected $lifeLeft = null;
    protected $createdByID = null;
    protected $createdByName = null;
    protected $modifiedByID = null;
    protected $modifiedByName = null;
    protected $modifiedTime = null;
    protected $maskID = 0;

    public function __construct(Array $signature = array()) {
        $this->id = isset($signature['id']) && is_numeric($signature['id']) ? (int)$signature['id'] : $this->id;
        $this->signatureID = isset($signature['signatureID']) && !empty($signature['signatureID']) ? $signature['signatureID'] : $this->signatureID;
        $this->systemID = isset($signature['systemID']) && is_numeric($signature['systemID']) ? (int)$signature['systemID'] : $this->systemID;
        $this->type = isset($signature['type']) && in_array(strtolower($signature['type']), $this->type) ? strtolower($signature['type']) : $this->type[0];
        $this->name = isset($signature['name']) && !empty($signature['name']) ? $signature['name'] : $this->name;
        $this->bookmark = isset($signature['bookmark']) && !empty($signature['bookmark']) ? $signature['bookmark'] : $this->bookmark;
        $this->lifeTime = isset($signature['lifeTime']) && (bool)strtotime($signature['lifeTime']) ? date('Y-m-d H:i:s', strtotime($signature['lifeTime'])) : date('Y-m-d H:i:s');
        $this->lifeLength = isset($signature['lifeLength']) && is_numeric($signature['lifeLength']) ? (int)$signature['lifeLength'] : $this->lifeLength;
        $this->lifeLeft = isset($signature['lifeLeft']) && (bool)strtotime($signature['lifeLeft']) ? date('Y-m-d H:i:s', strtotime($signature['lifeLeft'])) : date('Y-m-d H:i:s', strtotime('+'.$this->lifeLength.' seconds', strtotime($this->lifeTime)));
        $this->createdByID = isset($signature['createdByID']) && is_numeric($signature['createdByID']) ? (int)$signature['createdByID'] : $_SESSION['characterID'];
        $this->createdByName = isset($signature['createdByName']) && !empty($signature['createdByName']) ? $signature['createdByName'] : $_SESSION['characterName'];
        $this->modifiedByID = isset($signature['modifiedByID']) && is_numeric($signature['modifiedByID']) ? (int)$signature['modifiedByID'] : $_SESSION['characterID'];
        $this->modifiedByName = isset($signature['modifiedByName']) && !empty($signature['modifiedByName']) ? $signature['modifiedByName'] : $_SESSION['characterName'];
        $this->modifiedTime = isset($signature['modifiedTime']) && (bool)strtotime($signature['modifiedTime']) ? date('Y-m-d H:i:s', strtotime($signature['modifiedTime'])) : date('Y-m-d H:i:s');
        $this->maskID = (float)$_SESSION['mask'];
    }

    public function __get($property) {
        switch($property) {
            default:
                return $this->$property;
                break;
        }
    }

    public function __set($property, $value) {
        switch($property) {
            case 'id':
                $this->id = is_numeric($value) ? (int)$value : $this->id;
                break;
            case 'signatureID':
                $this->signatureID = $value;
                break;
            case 'systemID':
                $this->systemID = is_numeric($value) ? (int)$value : $this->systemID;
                break;
            case 'type':
                $this->type = in_array(strtolower($value), ['combat', 'data', 'relic', 'ore', 'gas', 'wormhole']) ? strtolower($value) : $this->type;
                break;
            case 'name':
                $this->name = $value;
                break;
            case 'bookmark':
                $this->bookmark = $value;
                break;
            case 'lifeTime':
                $this->lifeTime = (bool)strtotime($value) ? date('Y-m-d H:i:s', strtotime($value)) : $this->lifeTime;
                break;
            case 'lifeLength':
                $this->lifeLength = is_numeric($value) ? (int)$value : $this->lifeLength;
                break;
            case 'lifeLeft':
                $this->lifeLeft = is_numeric($value) ? date('Y-m-d H:i:s', strtotime('+'.(int)$value.' seconds')) : $this->lifeLeft;
                break;
            case 'createdByID':
                $this->createdByID = is_numeric($value) ? (int)$value : $this->createdByID;
                break;
            case 'createdByName':
                $this->createdByName = $value;
                break;
            case 'modifiedByID':
                $this->modifiedByID = is_numeric($value) ? (int)$value : $this->modifiedByID;
                break;
            case 'modifiedByName':
                $this->modifiedByName = $value;
                break;
            case 'modifiedTime':
                $this->modifiedTime = (bool)strtotime($value) ? date('Y-m-d H:i:s', strtotime($value)) : $this->modifiedTime;
        }
    }

    public function output() {
        return get_object_vars($this);
    }
}

class wormhole {
    protected $id = null;
    protected $parentID = null;
    protected $childID = null;
    protected $type = null;
    protected $life = ['stable', 'critical'];
    protected $mass = ['stable', 'destab', 'critical'];
    protected $maskID = 0;

    public function __construct(Array $wormhole = array()) {
        $this->id = isset($wormhole['id']) && is_numeric($wormhole['id']) ? (int)$wormhole['id'] : $this->id;
        $this->parentID = isset($wormhole['parentID']) && is_numeric($wormhole['parentID']) ? (int)$wormhole['parentID'] : $this->parentID;
        $this->childID = isset($wormhole['childID']) && is_numeric($wormhole['childID']) ? (int)$wormhole['childID'] : $this->childID;
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? $wormhole['type'] : $this->type;
        $this->life = isset($wormhole['life']) && in_array(strtolower($wormhole['life']), $this->life) ? strtolower($wormhole['life']) : $this->life[0];
        $this->mass = isset($wormhole['mass']) && in_array(strtolower($wormhole['mass']), $this->mass) ? strtolower($wormhole['mass']) : $this->mass[0];
        $this->maskID = (float)$_SESSION['mask'];
    }

    public function __get($property) {
        switch($property) {
            default:
                return $this->$property;
                break;
        }
    }

    public function __set($property, $value) {
        switch($property) {
            case 'id':
                $this->id = is_numeric($value) ? (int)$value : $this->id;
                break;
            case 'parentID':
                $this->parentID = is_numeric($value) ? (int)$value : $this->parentID;
                break;
            case 'childID':
                $this->childID = is_numeric($value) ? (int)$value : $this->childID;
                break;
            case 'type':
                $this->type = $value;
                break;
            case 'life':
                $this->life = in_array(strtolower($value), ['stable', 'critical']) ? strtolower($value) : $this->life;
                break;
            case 'mass':
                $this->mass = in_array(strtolower($value), ['stable', 'destab', 'critical']) ? strtolower($value) : $this->mass;
                break;
        }
    }

    public function output() {
        return get_object_vars($this);
    }
}

function fetchSignature($id, $mysql) {
    $query = 'SELECT * FROM signatures2 WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $signature = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $signature) {
        return array(true, new signature($signature));
    }

    return array(false, $stmt->errorInfo());
}

function fetchWormhole($id, $mysql) {
    $query = 'SELECT * FROM wormholes WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $wormhole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $wormhole) {
        return array(true, new wormhole($wormhole));
    }

    return array(false, $stmt->errorInfo());
}

function findWormhole($id, $mysql) {
    $query = 'SELECT * FROM wormholes WHERE (parentID = :id OR childID = :id) AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':maskID', $_SESSION['mask']);
    $success = $stmt->execute();
    $wormhole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($success && $wormhole) {
        return array(true, new wormhole($wormhole));
    }

    return array(false, $stmt->errorInfo());
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
        $signature->id = $mysql->lastInsertId();
        return array(true, $signature->output());
    }

    return array(false, $stmt->errorInfo());
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
        $wormhole->id = $mysql->lastInsertId();
        return array(true, $wormhole->output());
    }

    return array(false, $stmt->errorInfo());
}

function updateSignature(signature $signature, $mysql) {
    $query = 'UPDATE signatures2 SET
                signatureID = :signatureID,
                systemID = :systemID,
                type = :type,
                name = :name,
                bookmark = :bookmark,
                lifeLeft = DATE_ADD(lifeTime, INTERVAL :lifeLength SECOND),
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
    $stmt->bindValue(':lifeLength', $signature->lifeLength);
    $stmt->bindValue(':modifiedByID', $signature->modifiedByID);
    $stmt->bindValue(':modifiedByName', $signature->modifiedByName);
    $stmt->bindValue(':modifiedTime', $signature->modifiedTime);
    $stmt->bindValue(':maskID', $signature->maskID);
    $success = $stmt->execute();

    if ($success) {
        return array(true, $signature->output());
    }

    return array(false, $stmt->errorInfo());
}

function updateWormhole(wormhole $wormhole, $mysql) {
    $query = 'UPDATE wormholes SET type = :type, life = :life, mass = :mass WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':type', $wormhole->type);
    $stmt->bindValue(':life', $wormhole->life);
    $stmt->bindValue(':mass', $wormhole->mass);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = $stmt->execute();

    if ($success) {
        return array(true, $wormhole->output());
    }

    return array(false, $stmt->errorInfo());
}

function removeSignature(signature $signature, $mysql) {
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
        return array(true, $signature->id);
    }

    return array(false, $stmt->errorInfo());
}

function removeWormhole($wormhole, $mysql) {
    $wormhole = new wormhole($wormhole);

    $query = 'DELETE FROM wormholes WHERE id = :id AND maskID = :maskID';
    $stmt = $mysql->prepare($query);
    $stmt->bindValue(':id', $wormhole->id);
    $stmt->bindValue(':maskID', $wormhole->maskID);
    $success = @$stmt->execute();

    if ($success) {
        return array(true, $wormhole->id);
    }

    return array(false, $stmt->errorInfo());
}

if (isset($_POST['signatures'])) {
    // Add signatures
    if (isset($_POST['signatures']['add'])) {
        foreach ($_POST['signatures']['add'] AS $request) {
            if (isset($request['wormhole'])) {
                // Wormhole
                if (isset($request['signatures']) && count($request['signatures'])  > 0) {
                    list($result, $value) = addSignature($request['signatures'][0], $mysql);
                    if ($result) {
                        $parent = $value;
                        $request['wormhole']['parentID'] = $value['id'];
                        list($result, $value) = addSignature($request['signatures'][1], $mysql);
                        if ($result) {
                            $child = $value;
                            $request['wormhole']['childID'] = $value['id'];
                            list($result, $value) = addWormhole($request['wormhole'], $mysql);
                        } else {
                            list($failedResult, $signature) = fetchSignature($request['wormhole']['parentID'], $mysql);
                            removeSignature($signature, $mysql);
                        }
                    }
                    $output['resultSet'][] = array('result' => $result, 'value' => ($result ? null : $value));
                    if ($result) {
                      // Needs proper payload formatting
                      $output['results'][] = array('wormhole' => $value, 'signatures' => array($parent, $child));
                    }
                } else {
                  $output['resultSet'][] = array('result' => false, 'value' => 'Wormhole signatures missing');
                }
            } else {
                // Regular Signature
                list($result, $value) = addSignature($request, $mysql);
                $output['resultSet'][] = array('result' => $result, 'value' => ($result ? null : $value));
                if ($result) {
                  $output['results'][] = $value;
                }
            }
        }
    }
    // Update signatures
    if (isset($_POST['signatures']['update'])) {
        foreach ($_POST['signatures']['update'] AS $request) {
            if (isset($request['wormhole'])) {
                // Wormhole
                if (isset($request['signatures']) && count($request['signatures']) > 0) {
                    list($result, $signature) = fetchSignature($request['signatures'][0]['id'], $mysql);
                    if ($result && $signature) {
                        foreach ($request['signatures'][0] AS $property => $value) {
                            $signature->$property = $value;
                        }
                        // Modify some fields not passed in request
                        $signature->modifiedTime = date('Y-m-d H:i:s', time());
                        $signature->modifiedByID = $_SESSION['characterID'];
                        $signature->modifiedByName = $_SESSION['characterName'];

                        list($result, $value) = updateSignature($signature, $mysql);
                    }
                    if ($result && count($request['signatures']) == 2) {
                        list($result, $signature2) = fetchSignature($request['signatures'][1]['id'], $mysql);
                        if ($result && $signature2) {
                            foreach ($request['signatures'][1] AS $property => $value) {
                                $signature2->$property = $value;
                            }
                            // Modify some fields not passed in request
                            $signature2->modifiedTime = date('Y-m-d H:i:s', time());
                            $signature2->modifiedByID = $_SESSION['characterID'];
                            $signature2->modifiedByName = $_SESSION['characterName'];

                            list($result, $signature2) = updateSignature($signature2, $mysql);
                        } else {
                            // Used to be just a regular signature so we need ot add the 2nd signature
                            list($result, $signature2) = addSignature($request['signatures'][1], $mysql);
                        }
                    }

                    if ($result) {
                        list($result, $wormhole) = fetchWormhole($request['wormhole']['id'], $mysql);
                        if ($result && $wormhole) {
                            foreach ($request['wormhole'] AS $property => $value) {
                                $wormhole->$property = $value;
                            }
                            list($result, $value) = updateWormhole($wormhole, $mysql);
                        } else {
                            // Used to be just a regular signature
                            $request['wormhole']['parentID'] = $signature->id;
                            $request['wormhole']['childID'] = $signature2['id'];
                            list($result, $value) = addWormhole($request['wormhole'], $mysql);
                        }
                    }

                    $output['resultSet'][] = array('result' => $result, 'value' => $value);
                }
            } else {
                // Regular Signature
                list($result, $signature) = fetchSignature($request['id'], $mysql);
                if ($result && $signature) {
                    if ($result && $signature->type == 'wormhole') {
                        // Used to be a wormhole
                        list($result, $wormhole) = findWormhole($signature->id, $mysql);
                        if ($result && $wormhole->parentID == $signature->id) {
                            list($result, $signature2) = fetchSignature($wormhole->childID, $mysql);
                            removeSignature($signature2, $mysql);
                            removeWormhole(array('id' => $wormhole->id), $mysql);
                        } else {
                            list($result, $signature2) = fetchSignature($wormhole->parentID, $mysql);
                            removeSignature($signature2, $mysql);
                            removeWormhole(array('id' => $wormhole->id), $mysql);
                        }
                    }
                    foreach ($request AS $property => $value) {
                        $signature->$property = $value;
                    }
                    // Modify some fields not passed in request
                    $signature->modifiedTime = date('Y-m-d H:i:s', time());
                    $signature->modifiedByID = $_SESSION['characterID'];
                    $signature->modifiedByName = $_SESSION['characterName'];

                    list($result, $value) = updateSignature($signature, $mysql);
                    $output['resultSet'][] = array('result' => $result, 'value' => ($result ? null : $value));
                } else {
                    $output['resultSet'][] = array('result' => false, 'value' => 'Signature ID not found');
                }
            }
        }
    }
    // Delete signatures
    if (isset($_POST['signatures']['remove'])) {
        foreach ($_POST['signatures']['remove'] AS $request) {
            if (isset($request['parentID'])) {
                // Wormhole
                list($result, $signature) = fetchSignature($request['parentID'], $mysql);
                removeSignature($signature, $mysql);
                list($result, $signature) = fetchSignature($request['childID'], $mysql);
                removeSignature($signature, $mysql);
                list($result, $value) = removeWormhole(array('id' => $request['id']), $mysql);
                $output['resultSet'][] = array('result' => $result, 'value' => $value);
            } else {
                // Regular Signature
                list($result, $signature) = fetchSignature($request, $mysql);
                if ($result && $signature) {
                  list($result, $value) = removeSignature($signature, $mysql);
                  $output['resultSet'][] = array('result' => $result, 'value' => $value);
                } else {
                  $output['resultSet'][] = array('result' => false, 'value' => 'Signature ID not found');
                }
            }
        }
    }
}
