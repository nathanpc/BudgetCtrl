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
		$kcols = [];
		foreach ($cols as $col => $val) {
			$kcols[":" . $col] = $val;
		}
		
		// Build the SQL query.
		$query = "INSERT INTO $table(" . implode(", ", array_keys($cols)) .
			") VALUES(" . implode(", ", array_keys($kcols)) . ")";
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
	 * Inserts a row into a specified table.
	 *
	 * @param  string $table Database table name.
	 * @param  array  $cols  Associative array with the column name and the value.
	 * @param  array  $where Associative array with column names and values to be matched.
	 */
	public function update($table, $cols, $where) {
		// Create a new array for the keys.
		$kcols = [];
		foreach ($cols as $col => $val) {
			$kcols[":$col"] = $val;
		}

		// More keys, now for the where array.
		foreach ($where as $col => $val) {
			$kcols[":w$col"] = $val;
		}
		
		// Build the SQL query.
		$query = "UPDATE $table SET ";
		foreach ($cols as $col => $val) {
			$query .= "$col = :$col, ";
		}
		$query = substr($query, 0, -2);
		$query .= " WHERE ";
		foreach ($where as $col => $val) {
			$query .= "$col = :w$col AND ";
		}
		$query = substr($query, 0, -4);

		// Execute the query and check if it failed.
		$sql = $this->pdo->prepare($query);
		if (!$sql->execute($kcols)) {
			$err = $sql->errorInfo();

			throw new Exception($err[0] . " (" . $err[1] . "): " . $err[2]);
			return NULL;
		}
	}

	/**
	 * Selects some rows from a table.
	 *
	 * @param  string $table Table name.
	 * @param  array  $cols  List of the column names to be fetched.
	 * @param  string $opts  Custom options for the SQL query.
	 * @return array         Associative array with all the rows.
	 */
	public function select($table, $cols, $opts = NULL) {
		// Build the SQL query.
		$query = "SELECT " . implode(", ", $cols) . "FROM $table";

		// Apply custom options.
		if (!is_null($opts)) {
			$query .= " $opts";
		}

		// Execute the query and check if it failed.
		$sql = $this->pdo->prepare($query);
		if (!$sql->execute()) {
			$err = $sql->errorInfo();

			throw new Exception($err[0] . " (" . $err[1] . "): " . $err[2]);
			return NULL;
		}

		return $sql->fetchAll();
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

	/**
	 * Sanitize a ISO8601 string to make it safer to use in a database query.
	 *
	 * @param  string $str ISO8601 string.
	 * @return string      Sanitized string.
	 */
	public static function sanitize_dt($str) {
		return preg_replace("/[^a-zA-Z0-9\s\-\:\+\.]+/", "", $str);
	}
}
?>
