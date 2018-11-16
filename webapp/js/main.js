/**
 * main.js
 * General script to make the whole webapp work.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

// Constants.
var base_url = "";
var currency_symbol = "&euro;";
var entry_editing = {
	status: false,
	id: null
};

// Instances.
var entriesList = new EntriesList(base_url, currency_symbol);

/**
 * Date range change event.
 *
 * @param Function callback Called when everything has finished.
 */
var dateRangeChanged = function (callback) {
	var from = new Date($("#date-from").val());
	var to = new Date($("#date-to").val());

	// Set the hour and minutes to encompass the whole day.
	from.setHours(0, 0, 0);
	to.setHours(23, 59, 59);

	// Populate the entries list.
	entriesList.populateEntriesList(from, to, function () {
		if (typeof callback == "function") {
			callback();
		}	
	});
}

/**
 * Populates the categories selection box in the entry edit modal.
 *
 * @param Number id Category ID to be selected by default.
 */
var populateCategoriesSelection = function (id) {
	$.get("/api/manage.php?action=list_categories", function (data) {
		// Clear the categories.
		$("#entry-edit-category").html("");
		
		// Populates the categories selection group.
		data.categories.forEach(function (category) {
			var option = $("<option>", { value: category.id });
			option.text(category.name);

			$("#entry-edit-category").append(option);
		});

		// Select the correct category if specified.
		if (id !== undefined) {
			$("#entry-edit-category").val(id.toString());
		}

		// Open the modal.
		$("#entry-modal").modal("show");
	});
}

/**
 * Opens the entry edit modal.
 *
 * @param String action Action type (add or edit).
 * @param Number id     Entry ID.
 */
var openEntryModal = function (action, id) {
	if (action == "add") {
		// Change things to reflect the Add action.
		$("#entry-modal .modal-title").text("Add Entry");
		$("#entry-edit-delete").addClass("d-none")
		entry_editing.status = false;
		entry_editing.id = null;

		// Clear the fields.
		$("#entry-edit-description").val("");
		$("#entry-edit-value").val("");

		// Set the date to now.
		var date = new Date();
		date.setHours(0, 0, 0);
		$("#entry-edit-date").val(date.toInputValueFormat());

		// Populate the categories.
		populateCategoriesSelection();
	} else if (action == "edit") {
		// Change things to reflect the Edit action.
		$("#entry-modal .modal-title").text("Edit Entry");
		$("#entry-edit-delete").removeClass("d-none")
		entry_editing.status = true;
		entry_editing.id = id;

		// Get the entry information.
		$.get("/api/manage.php?action=edit&id=" + id, function (data) {
			var entry = data.entry;

			// Populate the easy ones.
			$("#entry-edit-description").val(entry.description);
			$("#entry-edit-value").val(entry.value.toFixed(2));
			populateCategoriesSelection(entry.category.id);

			// Populate the date.
			var date = new Date(entry.datetime.iso8601);
			$("#entry-edit-date").val(date.toInputValueFormat());
		});
	} else {
		// WTF?
		$("#entry-modal .modal-title").text("Invalid");
		return false;
	}
}

/**
 * Submits a new entry.
 */
var submitEntryInput = function () {
	var cat_id = $("#entry-edit-category").val();
	var desc = $("#entry-edit-description").val();
	var value = $("#entry-edit-value").val();
	var date = new Date($("#entry-edit-date").val());
	var url = "/api/manage.php?action=add&category=" + cat_id + "&desc=" + desc +
		"&value=" + value + "&dt=" + date.toISOString();

	// Change URL for edit.
	if (entry_editing.status) {
		url = "/api/manage.php?action=edit&id=" + entry_editing.id +
			"&category=" + cat_id + "&desc=" + desc + "&value=" + value +
			"&dt=" + date.toISOString();
	}

	// Request.
	$.post(url, function (data) {
		// Everything is fine.
		console.log(data);

		// Updates the list and hides the modal.
		dateRangeChanged(function () {
			$("#entry-modal").modal("hide");
		});
	}).fail(function (data) {
		// Something bad occured.
		console.error("Submit entry error", data);
		alert("Error while sumitting the entry: " + data.error);

		// Hide the modal.
		$("#entry-modal").modal("hide");
	});
}

/**
 * Deletes an entry.
 *
 * @param Number id Entry ID.
 */
var deleteEntry = function (id) {
	// Use the entry edit ID if nothing was specified.
	if (id === undefined) {
		id = entry_editing.id;
	}

	// Build the URL and send the request.
	var url = "/api/manage.php?action=delete&id=" + id.toString();
	$.post(url, function (data) {
		console.log(data);

		// Updates the list and hides the modal.
		dateRangeChanged(function () {
			$("#entry-modal").modal("hide");
		});
	});
}

/**
 * Things that are executed when the page is ready.
 */
$(document).ready(function () {
	var from = new Date();
	var to = new Date();

	// Set the default range for the past month.
	from.setMonth(to.getMonth() - 1);

	// Set the date ranges.
	$("#date-from").val(from.toInputValueFormat());
	$("#date-to").val(to.toInputValueFormat());

	// Trigger the range change event manually.
	dateRangeChanged();
});

