<?php
/**
 * ResponseHelper.php
 * A simple helper class to abstract the whole response thing.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

class Response {
	/**
	 * Responds to the request with an error.
	 *
	 * @param string $description Error description.
	 * @param int    $http_code   HTTP error code.
	 * @param array  $opts        Additional information that you want in the error.
	 */
	public static function error($description, $http_code = 500, $opts = NULL) {
		http_response_code($http_code);
		$res = [
			"error" => $description
		];

		// Append the additional information.
		if (!is_null($opts)) {
			$res["more_info"] = $opts;
		}

		echo json_encode($res);
	}
}

?>

