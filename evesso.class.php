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

    private function getAPI($url, $headers = array(), $params = false) {
		$url = self::$loginUrl . $url;

		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

        if ($params) {
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
        }

		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_USERAGENT, USER_AGENT);

		$result = curl_exec($curl);

        if ($result === false) {
            $this->lastError = curl_error($curl);
        }

		return $result;
	}

    public function login($scope = NULL, $state = 'evessologin') {
        $params = array(
            'response_type' => 'code',
            'redirect_uri' => EVE_SSO_REDIRECT,
            'client_id' => EVE_SSO_CLIENT,
            'scope' => $scope,
            'state' => $state
        );

        header('Location: '. self::$loginUrl . '/authorize?' . http_build_query($params), true, 302);
    }

    public function authenticate($code) {
        $headers = array('Authorization: Basic '.base64_encode(EVE_SSO_CLIENT.':'.EVE_SSO_SECRET));
        $params = array(
            'grant_type' => 'authorization_code',
            'code' => $code
        );

        $result = $this->getAPI('/token', $headers, $params);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->access_token)) {
            $this->lastError = 'Invalid reponse from ESI during token authentication. ' . $result;
            return false;
        }

        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:s', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        $headers = array('Authorization: Bearer '. $this->accessToken);

        $result = $this->getAPI('/verify', $headers);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->CharacterID)) {
            $this->lastError = 'Invalid reponse from ESI during verification. ' . $result;
            return false;
        }

        $this->characterID = $response->CharacterID;
        $this->characterName = $response->CharacterName;

        return true;
    }

    public function refresh($refreshToken) {
        $headers = array('Authorization: Basic '.base64_encode(EVE_SSO_CLIENT.':'.EVE_SSO_SECRET));
        $params = array(
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken
        );

        $result = $this->getAPI('/token', $headers, $params);

        if ($result === false) {
            return false;
        }

        $response = json_decode($result);
        if (!isset($response->access_token)) {
            $this->lastError = 'Invalid reponse from ESI during token refresh. ' . $result;
            return false;
        }

        $this->accessToken = $response->access_token;
        $this->tokenExpire = date('Y-m-d H:i:sP', time() + $response->expires_in);
        $this->refreshToken = $response->refresh_token;

        return true;
    }
}

?>
