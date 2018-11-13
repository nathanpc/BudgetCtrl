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
 * Format a date to be used as a value in a input with "date" type.
 *
 * @return String      Formatted string.
 */
Date.prototype.toInputValueFormat = function () {
	return this.getFullYear() + "-" + (this.getMonth() + 1).pad(2) + "-" +
		this.getDate().pad(2);
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
	entriesList.populateEntriesList(from, to);
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

