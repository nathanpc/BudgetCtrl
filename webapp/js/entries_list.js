/**
 * entries_list.js
 * A script to manage the entries list in the main page.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

/**
 * Class constructor.
 *
 * @param String base_url        The API server base URL.
 * @param String currency_symbol Main currency to be used.
 */
function EntriesList(base_url, currency_symbol) {
	this.base_url = base_url;
	this.currency_symbol = currency_symbol;
}

/**
 * Creates an entry list item.
 *
 * @param  String     desc     Entry description.
 * @param  String     category Entry category.
 * @param  Number     value    Entry value.
 * @return DOMElement          Entry HTML element.
 */
EntriesList.prototype.createEntryItem = function (desc, category, value) {
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
	val_html.html(this.currency_symbol + " " + value.toFixed(2));
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
EntriesList.prototype.createEntryList = function (dt, items) {
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
			ul.append(this.createEntryItem(items[i].description,
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
EntriesList.prototype.populateTotalValue = function (total) {
	$("#final-report .total .value").html(this.currency_symbol + " " + total.toFixed(2));
}

/**
 * Populate the entries list.
 *
 * @param String   from     Initial date.
 * @param String   to       Final date.
 * @param Function callback Called when everything has finished.
 */
EntriesList.prototype.populateEntriesList = function (from, to, callback) {
	var self = this;

	$.ajax({
		url: this.base_url + "/api/manage.php?action=list&from=" +
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
			$("#list-container").append(self.createEntryList(day, data.entries));
		});

		// Set the total value.
		self.populateTotalValue(total);

		// Callback for the future.
		if (typeof callback == "function") {
			callback();
		}
	});
}

