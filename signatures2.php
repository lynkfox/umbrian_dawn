<?php

//

class signature {
    public $signatureID = '';
    public $systemID = 0;
    public $type = ['Wormhole', 'Combat', 'Data', 'Relic'];
    public $name = '';
    public $bookmark = ''; // ???? ^^^
    public $lifeTime = date();
    public $lifeLeft = date();
    public $lifeLength = 0;
    public $maskID = 0;
    public $createdByID = 0;
    public $createdByName = '';
    public $createdTime = date();
    public $modifiedByID = 0;
    public $modifiedByName = '';
    public $modifiedTime = date();
}

class wormhole {
    public $type = '';
    public $life = ['stable', 'critical'];
    public $mass = ['stable', 'destab', 'critical'];
    public $maskID = 0;
    public $time = date();
}


function add() {
    $signature = new signature();

}
