/**
 * main.js
 * General script to make the whole webapp work.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

// Constants.
var base_url = "";
var currency_symbol = "&euro;";

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
 * Opens the entry edit modal.
 *
 * @param String action Action type (add or edit).
 */
var openEntryModal = function (action) {
	if (action == "add") {
		// Change things to reflect the Add action.
		$("#entry-modal .modal-title").text("Add Entry");
	}

	// Set the date to now.
	var date = new Date();
	date.setHours(0, 0, 0);
	$("#entry-edit-date").val(date.toInputValueFormat());

	$.get("/api/manage.php?action=list_categories", function (data) {
		// Populates the categories selection group.
		data.categories.forEach(function (category) {
			var option = $("<option>", { value: category.id });
			option.text(category.name);

			$("#entry-edit-category").append(option);
		});

		// Open the modal.
		$("#entry-modal").modal("show");
	});
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
	$.post(url, function (data) {
		// Everything is fine.
		console.log(data);
	}).fail(function (data) {
		// Something bad occured.
		console.error("Submit entry error", data);
		alert(data.error);
	});

	// Updates the list and hides the modal.
	dateRangeChanged(function () {
		$("#entry-modal").modal("hide");
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

