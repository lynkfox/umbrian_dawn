<?php

class evesso {
    // https://sisilogin.testeveonline.com
    private static $loginUrl = 'https://login.eveonline.com/oauth';

    public $lastError = null;
    public $characterID = null;
    public $characterName = null;
    public $accessToken = null;
    public $refreshToken = null;
    public $tokenExpire = null;

    public function login($scope = NULL, $state = 'evessologin') {
        global $evessoClient, $evessoRedirect;

        $params = array(
            'response_type' => 'code',
            'redirect_uri' => $evessoRedirect,
            'client_id' => $evessoClient,
            'scope' => $scope,
            'state' => $state
        );

        header('Location: '. self::$loginUrl . '/authorize?' . http_build_query($params), true, 302);
    }

    public function authenticate($code) {
        global $evessoClient, $evessoSecret;

        $header = 'Authorization: Basic '.base64_encode($evessoClient.':'.$evessoSecret);
        $params = array(
            'grant_type' => 'authorization_code',
            'code' => $code
        );

        $curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, self::$loginUrl . '/token');
		curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

		$result = curl_exec($curl);

        if ($result === false) {
            $this->lastError = curl_error($curl);
            return false;
        }

        $response = json_decode($result);
        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:s', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        $header = 'Authorization: Bearer '. $this->accessToken;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, self::$loginUrl . '/verify');
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

        $result = curl_exec($curl);

        if ($result === false) {
            $this->lastError = curl_error($curl);
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->CharacterID)) {
            $this->lastError = 'No character ID returned';
            return false;
        }

        $this->characterID = $response->CharacterID;
        $this->characterName = $response->CharacterName;

        return true;
    }

    public function refresh($refreshToken) {
        global $evessoClient, $evessoSecret;

        $header = 'Authorization: Basic '.base64_encode($evessoClient.':'.$evessoSecret);
        $params = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken
        );

        $curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, self::$loginUrl . '/token');
		curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

		$result = curl_exec($curl);

        if ($result === false) {
            $this->lastError = curl_error($curl);
            return false;
        }

        $response = json_decode($result);

        if (!isset($response->access_token)) {
            return false;
        }

        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:s', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        return true;
    }
}

?>
