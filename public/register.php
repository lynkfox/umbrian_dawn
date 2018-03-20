<?php

if (!session_id()) session_start();

require('../db.inc.php');
require('../password_hash.php');

$code = 		isset($_REQUEST['code'])?$_REQUEST['code']:null;
$state =		isset($_REQUEST['state'])?$_REQUEST['state']:null;
$mode = 		isset($_REQUEST['mode'])?$_REQUEST['mode']:null;
$adminRoles = array('Director');
$adminTitles = array('Tripwire Admin');

/**
 * Generate a random string, using a cryptographically secure
 * pseudorandom number generator (random_int)
 *
 * For PHP 7, random_int is a PHP core function
 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
 *
 * @param int $length      How many characters do we want?
 * @param string $keyspace A string of all possible characters
 *                         to select from
 * @return string
 */
function random_str(
    $length,
    $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[random_int(0, $max)];
    }
    return $str;
}

if ($mode == 'user') {
	require('../esi.class.php');
	$esi = new esi();

	// Send user to the CCP SSO login page
	$esi->login(null, 'evessoregisteruser');
} else if ($mode == 'admin') {
	require('../esi.class.php');
	$esi = new esi();

	// Send user to the CCP SSO login page
	$esi->login('esi-characters.read_corporation_roles.v1 esi-characters.read_titles.v1', 'evessoregisteradmin');
} else if ($code && $state == 'evessoregisteruser') {
	require('../esi.class.php');
	$esi = new esi();

	if ($esi->authenticate($code)) {
		$query = 'SELECT userID FROM accounts LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':characterID', $esi->characterID, PDO::PARAM_INT);
		$stmt->execute();

		// User account already exists for this character, tell them to login
		if ($account = $stmt->fetchObject()) {
			header('Location: ./?error=register-account#register');
			exit();
		}

		$hasher = new PasswordHash(8, FALSE);
		$password = $hasher->HashPassword(random_str(20));
		$username = $esi->characterName;

		$query = 'INSERT INTO accounts (username, password) VALUES (:username, :password)';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':username', $username, PDO::PARAM_STR);
		$stmt->bindValue(':password', $password, PDO::PARAM_STR);
		$success = $stmt->execute();

		$userID = $mysql->lastInsertId();

		$character = $esi->getCharacter($esi->characterID);
		$corporation = $esi->getCorporation($character->corporation_id);

		$query = 'INSERT INTO characters (userID, characterID, characterName, corporationID, corporationName) VALUES (:userID, :characterID, :characterName, :corporationID, :corporationName)';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
		$stmt->bindValue(':characterID', $esi->characterID, PDO::PARAM_INT);
		$stmt->bindValue(':characterName', $esi->characterName, PDO::PARAM_STR);
		$stmt->bindValue(':corporationID', $character->corporation_id, PDO::PARAM_INT);
		$stmt->bindValue(':corporationName', $corporation->name, PDO::PARAM_STR);
		$stmt->execute();

		header('Location: ./?success=user#register#user');
		exit();
	} else {
		// Something crazy happened on CCP's end
		header('Location: ./?error=register-unknown#register');
		exit();
	}
} else if ($code && $state == 'evessoregisteradmin') {
	require('../esi.class.php');
	$esi = new esi();

	if ($esi->authenticate($code)) {
		$query = 'SELECT userID FROM accounts LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':characterID', $esi->characterID, PDO::PARAM_INT);
		$stmt->execute();

		// User account already exists for this character, tell them to login
		if (!$account = $stmt->fetchObject()) {
			header('Location: ./?error=registeradmin-account#register#admin');
			exit();
		}

		$roles = $esi->getCharacterRoles($esi->characterID);
		$titles = $esi->getCharacterTitles($esi->characterID);

		if (!empty(array_intersect($roles->roles, $adminRoles)) || !empty(array_intersect($titles, $adminTitles))) {
			$query = 'UPDATE characters SET admin = 1 WHERE characterID = :characterID';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':characterID', $esi->characterID, PDO::PARAM_INT);
			$stmt->execute();

			if (session_id()) $_SESSION['admin'] = 1;

			header('Location: ./?success=admin#register#admin');
			exit();
		} else {
			header('Location: ./?error=registeradmin-roles#register#admin');
			exit();
		}
	}
}

?>
