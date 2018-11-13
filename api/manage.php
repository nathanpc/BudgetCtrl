<?php
/**
 * manage.php
 * Manages entries of money earned and spent.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

require_once "config.php";
require_once "DatabaseHelper.php";
require_once "ResponseHelper.php";

/**
 * Low-level request handling. This is basically a simple switch box.
 */
function handle_request() {
	$manage = new Manage();

	// Make sure we are always returning JSON.
	header("Content-type: application/json");
	
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		// Valid actions for POST: add.
		switch ($_GET["action"]) {
		case "add":
			// Add a new entry.
			$dt = new DateTime($_GET["dt"], new DateTimeZone("UTC"));

			$manage->add(
				(int)filter_input(INPUT_GET, "category", FILTER_SANITIZE_NUMBER_INT),
				$_GET["desc"],
				floatval(filter_input(INPUT_GET, "value", FILTER_SANITIZE_NUMBER_FLOAT, array("flags" => FILTER_FLAG_ALLOW_FRACTION | FILTER_FLAG_ALLOW_THOUSAND))),
				$dt->format("c")
			);
			break;
		default:
			// Invalid action.
			Response::error("Invalid action type: " . $_GET["action"], 405);
		}
	} else if ($_SERVER["REQUEST_METHOD"] == "GET") {
		// Valid actions for GET: list, get_categories.
		switch ($_GET["action"]) {
		case "list":
			// List entries.
			// Make from and to dates safer.
			$from = Database::sanitize_dt($_GET["from"]);
			$to = Database::sanitize_dt($_GET["to"]);

			$manage->list($from, $to);
			break;
		case "list_categories":
			$manage->list_categories();
			break;
		default:
			// Invalid action.
			Response::error("Invalid action type: " . $_GET["action"], 405);	
		}
	} else {
		// Invalid request type.
		Response::error("Invalid request type: " . $_SERVER["REQUEST_METHOD"], 405);
	}
}

class Manage {
	private $db;
	public $id;
	public $categories;

	/**
	 * Class constructor.
	 *
	 * @param int $id Entry ID.
	 */
	function __construct($id = NULL) {
		$this->db = new Database();
		$this->id = $id;

		$this->update_categories_cache();
	}

	/**
	 * Add an entry to the budget sheet.
	 *
	 * @param int    $category Entry category.
	 * @param string $desc     Description of the entry.
	 * @param float  $value    Entry value.
	 * @param string $dt       Date and UTC time of the entry in ISO8601 format.
	 */
	public function add($category, $desc, $value, $dt) {
		try {
			$this->id = $this->db->insert("Entries", [
				"cat_id" => $category,
				"dt" => $dt,
				"description" => $desc,
				"value" => $value
			]);
		} catch (Exception $e) {
			Response::error("An error occured while trying to insert the " .
				"entry into the database.", 500, [
				"sql_error" => $e->getMessage()
			]);

			return;
		}

		$res = [
			"id" => $this->id,
			"datetime" => [
				"iso8601" => $dt
			],
			"category" => [
				"id" => $category,
				"name" => "Testing"
			],
			"description" => $desc,
			"value" => $value
		];

		echo json_encode($res);
		// TODO: The application should then issue a img_upload to the returned ID.
	}

	/**
	 * Lists all the entries between two dates.
	 *
	 * @param string $from Initial date.
	 * @param string $to   Final date.
	 */
	public function list($from, $to) {
		$entries = $this->db->select("Entries", ["*"], "WHERE dt BETWEEN '$from' AND '$to' ORDER BY datetime(dt) DESC");
		$res = [
			"entries" => [],
			"count" => count($entries)
		];

		// Update the categories cache.
		$this->update_categories_cache();

		foreach ($entries as $row) {
			$item = [
				"id" => (int)$row["id"],
				"datetime" => [
					"iso8601" => $row["dt"]
				],
				"category" => [
					"id" => (int)$row["cat_id"],
					"name" => $this->get_category_name((int)$row["cat_id"])
				],
				"description" => $row["description"],
				"value" => floatval($row["value"])
			];

			// Push item to array of entries.
			array_push($res["entries"], $item);
		}

		echo json_encode($res);
	}

	/**
	 * Lists all the categories available.
	 */
	public function list_categories() {
		$cats = [
			"categories" => []
		];

		foreach ($this->categories as $cat) {
			$category = [
				"id" => $cat["id"],
				"name" => $cat["name"]
			];

			array_push($cats["categories"], $category);
		}

		echo json_encode($cats);
	}

	/**
	 * Updates the categories cache.
	 */
	private function update_categories_cache() {
		$this->categories = $this->db->select("Categories", ["*"], "ORDER BY name ASC");
	}

	/**
	 * Gets a category name from the ID.
	 *
	 * @param  int    $id Category ID.
	 * @return String     Category name or NULL if not found.
	 */
	private function get_category_name($id) {
		foreach ($this->categories as $cat) {
			if ((int)$cat["id"] == $id) {
				return $cat["name"];
			}
		}

		return NULL;
	}
}

// Handle the request.
handle_request();

?>

