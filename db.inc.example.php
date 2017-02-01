<?php

// EVE SDE table name
$eve_dump = 'eve_carnyx';

// EVE API userAgent
$userAgent = 'Tripwire Server - adminEmail@example.com';

// EVE SSO info
$evessoClient = 'clientID';
$evessoSecret = 'secret';
$evessoRedirect = 'http://localhost/login.php?mode=sso';

try {
    $mysql = new PDO(
        'mysql:host=localhost;dbname=tripwire_database;charset=utf8',
        'username',
        'password',
        Array(
            PDO::ATTR_PERSISTENT     => true
        )
    );
} catch (PDOException $error) {
    error_log($error->getMessage());
}

?>
