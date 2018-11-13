/**
 * js_extensions.js
 * Some extensions to the built-in Javascript types.
 *
 * @author Nathan Campos <nathan@innoveworkshop.com>
 */

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
 * Format a date to be used as a value in a input with "date" type.
 *
 * @return String      Formatted string.
 */
Date.prototype.toInputValueFormat = function () {
	return this.getFullYear() + "-" + (this.getMonth() + 1).pad(2) + "-" +
		this.getDate().pad(2);
}

