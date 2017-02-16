<?php

class signature {
    public $id = 0;
    public $signatureID = '';
    public $systemID = 0;
    public $type = ['wormhole', 'combat', 'data', 'relic', 'ore', 'gas'];
    public $name = '';
    public $bookmark = '';
    public $lifeTime = date();
    public $lifeLeft = date();
    public $lifeLength = 0;
    public $createdByID = 0;
    public $createdByName = '';
    public $createdTime = date();
    public $modifiedByID = 0;
    public $modifiedByName = '';
    public $modifiedTime = date();
    public $maskID = 0;

    function __construct($signature) {

        $this->systemID = isset($signature['systemID']) && is_numeric($signature['systemID'])? (int)$signature['systemID'] : 0;
        $this->type = in_array(strtolower($signature['type']), $this->type) ? $signature['type'] : 'combat';
        $this->name = isset($signature['name']) && !empty($signature['name']) ? $signature['name'] : null;
        $this->bookmark = isset($signature['bookmark']) && !empty($signature['bookmark']) ? $signature['bookmark'] : null;

        $this->maskID = isset($signature['maskID']) && is_numeric($signature['maskID'])? (float)$signature['maskID'] : 0;
    }
}

class wormhole {
    public $id = 0;
    public $parentID = 0;
    public $childID = 0;
    public $type = '';
    public $life = ['stable', 'critical'];
    public $mass = ['stable', 'destab', 'critical'];
    public $time = date();
    public $maskID = 0;

    function __construct($wormhole) {
        $this->type = isset($wormhole['type']) && !empty($wormhole['type']) ? $wormhole['type'] : null;
        $this->life = in_array(strtolower($wormhole['life']), $this->life) ? $wormhole['life'] : 'stable';
        $this->mass = in_array(strtolower($wormhole['mass']), $this->mass) ? $wormhole['mass'] : 'stable';
        $this->maskID = isset($wormhole['maskID']) && is_numeric($wormhole['maskID'])? (float)$wormhole['maskID'] : 0;
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
