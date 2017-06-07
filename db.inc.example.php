<?php

date_default_timezone_set('UTC');

// Tripwire version
define('TRIPWIRE_VERSION', '0.8');

// EVE SDE table name
define('EVE_DUMP', 'eve_carnyx');

// EVE API userAgent
define('USER_AGENT', 'Tripwire Server - adminEmail@example.com');

// EVE SSO info
define('EVE_SSO_CLIENT', 'clientID');
define('EVE_SSO_SECRET', 'secret');
define('EVE_SSO_REDIRECT', 'http://localhost/login.php?mode=sso');

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
