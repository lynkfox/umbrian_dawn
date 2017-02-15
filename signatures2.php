<?php

//

class signature {
    public $id = 0;
    public $signatureID = '';
    public $systemID = 0;
    public $type = ['Wormhole', 'Combat', 'Data', 'Relic'];
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
}


function add() {
    $signature = new signature();


}
