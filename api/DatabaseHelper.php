<?php
/**
 * DatabaseHelper.php
 * A simple class to help with the database operations.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

require_once "config.php";
#require_once "lib/Logger.php";

class Database {
	private $pdo;

	/**
	 * Class constructor.
	 *
	 * @param string $db_path Database path.
	 */
	function __construct($db_path = Config::DATABASE_PATH) {
		// Connects to the database.
		$this->pdo = new PDO("sqlite:" . $db_path);
	}

	/**
	 * Inserts a row into a specified table.
	 *
	 * @param  string $table Database table name.
	 * @param  array  $cols  Associative array with the column name and the value.
	 * @return int           ID of the newly inserted row or NULL if the query failed.
	 */
	public function insert($table, $cols) {
		// Create a new array for the keys.
		$kcols = array();
		foreach ($cols as $col => $val) {
			$kcols[":" . $col] = $val;
		}
		
		// Build the SQL query.
		$query = "INSERT INTO " . $this->strip_str($table) . "(" .
			implode(", ", array_keys($cols)) . ") VALUES(" .
			implode(", ", array_keys($kcols)) . ")";
		$sql = $this->pdo->prepare($query);

		// Execute the query and check if it failed.
		if (!$sql->execute($kcols)) {
			$err = $sql->errorInfo();

			throw new Exception($err[0] . " (" . $err[1] . "): " . $err[2]);
			return NULL;
		}

		// Return the ID of the newly inserted row.
		return (int)$this->pdo->lastInsertId();
	}

	/**
	 * Checks if a component exists.
	 *
	 * @param string $mpn Part number
	 * @param string $octopart_uid Octopart UID
	 * @return boolean False if it doesn't exist, PDO->Query if it does
	 */
	public function check_exists($mpn, $octopart_uid) {
		$sql = $this->pdo->prepare("SELECT * FROM Inventory WHERE mpn = :mpn AND octopart_uid = :octopart_uid");
		$success = $sql->execute(array(
			":mpn" => $mpn,
			":octopart_uid" => $octopart_uid));

		if (!$success) {
			#$this->log->post(Log::LVL_ERROR, __METHOD__ . ":" . __LINE__ . " Couldn't locate the component.");
			throw new Exception("Couldn't locate the component.");
		}

		if ($part = $sql->fetch()) {
			// The component exists!
			return $part;
		}

		return false;
	}

	/**
	 * Check if a string is "null" and make sure it becomes NULL.
	 *
	 * @param string $str String to nullify
	 *
	 * @return NULL or the original string
	 */
	public static function nullify($str) {
		if ($str == "null") {
			return NULL;
		}

		return $str;
	}

	/**
	 * Strips a string completely from anything that isn't a alphanumeric character.
	 *
	 * @param string $str String to be stripped
	 *
	 * @return string Stripped string.
	 */
	private function strip_str($str) {
		return preg_replace("/[^a-zA-Z0-9]+/", "", $str);
	}
}
?>
