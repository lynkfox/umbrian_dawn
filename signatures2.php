<?php

class signature {
    public $id = 0;
    public $signatureID = null;
    public $systemID = 0;
    public $type = ['wormhole', 'combat', 'data', 'relic', 'ore', 'gas'];
    public $name = null;
    public $bookmark = null;
    public $lifeTime = date('Y-m-d H:i:s');
    public $lifeLeft = date('Y-m-d H:i:s');
    public $lifeLength = 72;
    public $createdByID = 0;
    public $createdByName = null;
    public $modifiedByID = 0;
    public $modifiedByName = null;
    public $modifiedTime = date('Y-m-d H:i:s');
    public $maskID = 0;

    function __construct($signature) {
        $this->systemID = isset($signature['systemID']) && is_numeric($signature['systemID']) ? (int)$signature['systemID'] : $this->systemID;
        $this->type = in_array(strtolower($signature['type']), $this->type) ? $signature['type'] : $this->type[1];
        $this->name = isset($signature['name']) && !empty($signature['name']) ? $signature['name'] : $this->name;
        $this->bookmark = isset($signature['bookmark']) && !empty($signature['bookmark']) ? $signature['bookmark'] : $this->bookmark;
        $this->lifeTime = isset($signature['lifeTime']) && (bool)strtotime($signature['lifeTime']) ? date('Y-m-d H:i:s', strtotime($signature['lifeTime'])) : $this->lifeTime;
        $this->lifeLeft = isset($signature['lifeLeft']) && (bool)strtotime($signature['lifeLeft']) ? date('Y-m-d H:i:s', strtotime($signature['lifeLeft'])) : $this->lifeLeft;
        $this->lifeLength = isset($signature['lifeLength']) && is_numeric($signature['lifeLength']) ? (int)$signature['lifeLength'] : $this->lifeLength;
        $this->createdByID = isset($signature['createdByID']) && is_numeric($signature['createdByID']) ? (int)$signature['createdByID'] : $this->createdByID;
        $this->createdByName = isset($signature['createdByName']) && !empty($signature['createdByName']) ? $signature['createdByName'] : $this->createdByName;
        $this->modifiedByID = isset($signature['modifiedByID']) && is_numeric($signature['modifiedByID']) ? (int)$signature['modifiedByID'] : $this->modifiedByID;
        $this->modifiedByName = isset($signature['modifiedByName']) && !empty($signature['modifiedByName']) ? $signature['modifiedByName'] : $this->modifiedByName;
        $this->maskID = isset($signature['maskID']) && is_numeric($signature['maskID']) ? (float)$signature['maskID'] : $this->maskID;
    }
}

class wormhole {
    public $id = 0;
    public $parentID = 0;
    public $childID = 0;
    public $type = null;
    public $life = ['stable', 'critical'];
    public $mass = ['stable', 'destab', 'critical'];
    public $time = date('Y-m-d H:i:s'); // ???
    public $maskID = 0;

    function __construct($wormhole) {
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? $wormhole['type'] : $this->type;
        $this->life = in_array(strtolower($wormhole['life']), $this->life) ? $wormhole['life'] : $this->life[0];
        $this->mass = in_array(strtolower($wormhole['mass']), $this->mass) ? $wormhole['mass'] : $this->mass[0];
        $this->maskID = isset($wormhole['maskID']) && is_numeric($wormhole['maskID']) ? (float)$wormhole['maskID'] : $this->maskID;
    }
}

function add($signatures) {

    foreach ($signatures as $signature) {

        // check if it is a wormhole or regular signature
        if (isset($signature['systemID'])) {
            $signature = new signature($signature);

        } else {

        }
    }
}
