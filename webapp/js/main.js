/**
 * main.js
 * General script to make the whole webapp work.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

// Constants.
var base_url = "";
var currency_symbol = "&euro;";

/**
 * Creates an entry list item.
 *
 * @param  String     desc     Entry description.
 * @param  String     category Entry category.
 * @param  Number     value    Entry value.
 * @return DOMElement          Entry HTML element.
 */
var create_entry_item = function (desc, category, value) {
	// Root element.
	var li = $("<li>", { class: "list-group-item d-flex justify-content-between align-items-center entry-item" });

	// Description label.
	var desc_html = $("<span>");
	desc_html.text(desc + " ");
	var cat_html = $("<span>", { class: "category" });
	cat_html.html("&ndash; " + category);
	desc_html.append(cat_html);
	li.append(desc_html);

	// Value badge.
	var val_html = $("<span>", { class: "badge badge-primary badge-pill" });
	val_html.html(currency_symbol + " " + value.toFixed(2));
	li.append(val_html);

	return li;
}

/**
 * Creates a entry list for a given month.
 *
 * @param  Date       dt    Date of the list.
 * @param  Array      items Entries to be listed.
 * @return DOMElement       Entry list container.
 */
var create_entry_list = function (dt, items) {
	var root = $("<div>", { class: "month-entry mb-4" });
	
	// Date label.
	var date_label = $("<h4>");
	date_label.text(dt.toDateString());
	root.append(date_label);

	// Container and list.
	var list_container = $("<div>", { class: "container" });
	var ul = $("<ul>", { class: "list-group" });

	// Append items.
	for (var i = 0; i < items.length; i++) {
		var idt = new Date(items[i].datetime.iso8601);
		idt.setHours(0, 0, 0, 0);

		if (idt.valueOf() == dt.valueOf()) {
			ul.append(create_entry_item(items[i].description,
				items[i].category.name, items[i]["value"]));
		}
	}

	// Add the list container and its contents to the root element.
	list_container.append(ul);
	root.append(list_container);

	return root;
}

/**
 * Populates the total value label.
 *
 * @param Number total Total value.
 */
var populate_total_value = function (total) {
	$("#final-report .total .value").html(currency_symbol + " " + total.toFixed(2));
}

/**
 * Populate the entries list.
 *
 * @param String from Initial date.
 * @param String to   Final date.
 */
var populate_entries_list = function (from, to) {
	$.ajax({
		url: base_url + "/api/manage.php?action=list&from=" +
			from.toISOString() + "&to=" + to.toISOString()
	}).then(function (data) {
		var days = [];
		var total = 0;

		// Clear the list container.
		$("#list-container").html("");

		// Get the days from the entries list.
		data.entries.forEach(function (entry) {
			var old_dt = days[days.length - 1];
			var new_dt = new Date(entry.datetime.iso8601);
			new_dt.setHours(0, 0, 0, 0);

			// Check if this is the first item.
			if (old_dt == undefined) {
				old_dt = new_dt;
				days.push(new_dt);
			}

			// Check if the dates are different.
			if (old_dt.valueOf() != new_dt.valueOf()) {
				days.push(new_dt);
			}

			// Sum the values.
			total += entry.value;
		});

		// Populate it.
		days.forEach(function (day) {
			$("#list-container").append(create_entry_list(day, data.entries));
		});

		// Set the total value.
		populate_total_value(total);
	});
}

/**
 * Format a date to be used as a value in a input with "date" type.
 *
 * @param  Date   date Date to be converted.
 * @return String      Formatted string.
 */
var date_inputval_format = function (date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + "-" +
		date.getDate().pad(2);
}

/**
 * Pads a number with leading zeroes.
 *
 * @param  Number size Maximum number of digits.
 * @return String      Padded number.
 */
Number.prototype.pad = function (size) {
	var str = String(this);

	while (str.length < (size || 2)) {
		str = "0" + str;
	}

	return str;
}

/**
 * Date range change event.
 */
var dateRangeChanged = function () {
	var from = new Date($("#date-from").val());
	var to = new Date($("#date-to").val());

	// Set the hour and minutes to encompass the whole day.
	from.setHours(23, 59, 59);
	to.setHours(23, 59, 59);

	// Populate the entries list.
	populate_entries_list(from, to);
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
	$("#date-from").val(date_inputval_format(from));
	$("#date-to").val(date_inputval_format(to));

	// Trigger the range change event manually.
	dateRangeChanged();
});

