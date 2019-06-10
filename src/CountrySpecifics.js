/*
This file contain Javascript functions related to information that is specific to a country, eg. address formatting, use of state and postal code fields etc.
Most functions require jQuery to be available.
Copyright © 2006-2019 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
*/

// See also: http://stackoverflow.com/questions/13438461/formatting-a-shipping-address-by-country-in-php-or-perl

(function( Jjs, $, undefined ) {

	Jjs.CountrySpecifics = {};
	var me = Jjs.CountrySpecifics;

	me.addressFieldOrder = function(forCountry, cityStateZipContainerSelector, citySelector, stateSelector, zipSelector, optionalContext) {
		var order;
		if ($.inArray(forCountry, ['US', 'CA', 'AU']) > -1) {
			order = ['city', 'state', 'zip'];
			if (cityStateZipContainerSelector) {
				$(cityStateZipContainerSelector, optionalContext)
					.append($(citySelector, optionalContext))
					.append($(stateSelector, optionalContext))
					.append($(zipSelector, optionalContext));
			}
		} else if ($.inArray(forCountry, ['GB']) > -1) {
			order = ['city', 'zip'];
			if (cityStateZipContainerSelector) {
				$(cityStateZipContainerSelector, optionalContext)
					.append($(citySelector, optionalContext))
					.append($(zipSelector, optionalContext));
			}
		} else {
			order = ['zip', 'city', 'state'];
			if (cityStateZipContainerSelector) {
				$(cityStateZipContainerSelector, optionalContext)
					.append($(zipSelector, optionalContext))
					.append($(citySelector, optionalContext))
					.append($(stateSelector, optionalContext));
			}
		}
		return order;
	};

	me.addressFieldLabels = function(forCountry, cityLabel, stateLabel, zipLabel, optionalContext) {
		var labels;
		if (forCountry == 'US') {
			labels = {
				city: 'City', _city: 'City',
				state: 'State', _state: 'State',
				zip: 'ZIP', _zip: 'Zip'
			};
		} else if (forCountry == 'CA') {
			labels = {
				city: 'City', _city: 'City',
				state: 'Province', _state: 'Province',
				zip: 'Postal Code', _zip: 'Postal_Code'
			};
		} else if (forCountry == 'AU') {
			labels = {
				city: 'Town / Suburb', _city: 'Town_Suburb',
				state: 'State / Territory', _state: 'State_Territory',
				zip: 'Postcode', _zip: 'Postcode'
			};
		} else if (forCountry == 'GB') {
			labels = {
				city: 'Town / City', _city: 'Town_City',
				state: '', _state: '',
				zip: 'Postcode', _zip: 'Postcode'
			};
		} else {
			labels = {
				city: 'City', _city: 'City',
				state: 'State / Province / Region (if required)', _state: 'State_Province_Region',
				zip: 'Postal Code', _zip: 'Postal_Code'
			};
		}

		if (cityLabel) $(cityLabel, optionalContext).html(labels.city);
		if (stateLabel) $(stateLabel, optionalContext).html(labels.state);
		if (zipLabel) $(zipLabel, optionalContext).html(labels.zip);

		return labels;
	};

	/**
	 * Get countries that require state/province in address
	 *
	 * Countries not listed here and not listed in countriesWithoutStateProvince() are countries where using state/province is optional.
	 *
	 * @see http://webmasters.stackexchange.com/questions/3206/what-countries-require-a-state-province-in-the-mailing-address
	 *
	 * @return {array}
	 */
	me.countriesRequiringStateProvince = function() {
		return ['US','CA','AU','CN','MX','MY','IT'];  //currently not an exhaustive list
	};

	/**
	 * Get countries that do not use state/province in address at all
	 *
	 * @return {array}
	 */
	me.countriesWithoutStateProvince = function() {
		return ['GB','DK','NO','SE'];  //not an exhaustive list at all!
	};

	/**
	 * Get countries that do not use postal codes
	 *
	 * @see https://gist.github.com/kennwilson/3902548
	 *
	 * @return {array}
	 */
	me.countriesWithoutPostalcodes = function() {
		return ['AO','AG','AW','BS','BZ','BJ','BW','BF','BI','CM','CF','KM','CG','CD','CK','CI','DJ','DM','GQ','ER','FJ','TF','GM','GH','GD','GN','GY','HK','IE','JM','KE','KI','MO','MW','ML','MR','MU','MS','NR','AN','NU','KP','PA','QA','RW','KN','LC','ST','SA','SC','SL','SB','SO','ZA','SR','SY','TZ','TL','TK','TO','TT','TV','UG','AE','VU','YE','ZW'];
	};

	/**
	 * Validate the zip/postal code for at specific country
	 *
	 * @see https://gist.github.com/kennwilson/3902548
	 *
	 * @param {object} options - Available options (opt.):
	 * 	- `reformat` : reformat the value according to the country's format, eg. for Canada "K1G6Z3" or "k1g-6z3" would be converted to "K1G 6Z3"
	 * 		- this flag can also cause less strict validation rules since we can now automatically fix small inconsistencies!
	 * 		- when used the reformatted value is returned if valid and false if returned if value is not valid
	 * 	- `US_allowZip4` : allow the format #####-#### in United States (http://en.wikipedia.org/wiki/ZIP_code)
	 * @return {boolean|string} - Normally boolean but if reformat flag is used: reformatted value if valid or false if invalid
	 */
	me.validateZip = function(forCountry, zipValue, options) {
		var isValid = false, doReformat;
		if (typeof options === 'undefined') options = {};
		doReformat = (options.reformat > -1 ? true : false);

		if (doReformat) {
			zipValue = (zipValue === null ? '' : $.trim(String(zipValue)));
		} else {
			zipValue = (zipValue === null ? '' : String(zipValue));
		}

		if (forCountry == 'US') {
			//exactly 5 digits or 5+4 if flag is set
			if (/^\d{5}$/.test(zipValue)) {
				isValid = true;
			} else if (options.US_allowZip4 > -1 && /^\d{5}\-\d{4}$/.test(zipValue)) {
				isValid = true;
			}
		} else if (forCountry == 'CA') {
			//require format "A1A 1A1", where A is a letter and 1 is a digit and with a space in the middle
			if (/^[A-Z]\d[A-Z][\.\- ]?\d[A-Z]\d$/i.test(zipValue)) {
				isValid = true;
				if (doReformat) {
					zipValue = zipValue.substr(0, 3).toUpperCase() +' '+ zipValue.slice(-3).toUpperCase();
				}
			}
		} else if (forCountry == 'GB') {
			//require format specified on http://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom#Validation
			if (/^([A-Z]{1,2}\d[A-Z]?|[A-Z]{1,2}\d{2})[\.\- ]?\d[A-Z][A-Z]$/i.test(zipValue)) {
				isValid = true;
				if (doReformat) {
					zipValue = zipValue.replace(/[^[A-Z]\d]/gi, '').slice(0, -3).toUpperCase() +' '+ zipValue.slice(-3).toUpperCase();
				}
			}
		} else if (forCountry == 'AU' || forCountry == 'DK' || forCountry == 'NO' || forCountry == 'AT' || forCountry == 'CH') {
			//exactly 4 digits
			if (/^\d{4}$/.test(zipValue)) {
				isValid = true;
			}
		} else if (forCountry == 'SE' || forCountry == 'DE' || forCountry == 'FI' || forCountry == 'ES' || forCountry == 'IT' || forCountry == 'FR') {
			//exactly 5 digits
			if (/^\d{5}$/.test(zipValue)) {
				isValid = true;
			}
		} else if (forCountry == 'NL') {
			//4 digits followed by 2 uppercase letters (http://en.wikipedia.org/wiki/Postal_codes_in_the_Netherlands)
			if (doReformat) {
				if (/^\d{4}[ \-]?[A-Z]{2}$/.test(zipValue)) {
					isValid = true;
				}
				zipValue = zipValue.substr(0, 4) +' '+ zipValue.slice(-2).toUpperCase();
			} else {
				if (/^\d{4} ?[A-Z]{2}$/.test(zipValue)) {
					isValid = true;
				}
			}
		} else if (forCountry == 'BR') {
			//5 digits, a dash, then 3 digits (http://en.wikipedia.org/wiki/List_of_postal_codes_in_Brazil)
			zipValue = zipValue.replace('.', '');  //some people seem to put a dot after the first two digits
			if (/^\d{5}-?\d{3}$/.test(zipValue)) {
				isValid = true;
				if (doReformat) {
					zipValue = zipValue.substr(0, 5) +'-'+ zipValue.slice(-3);
				}
			}
		} else if (forCountry == 'KR') {
			//3 digits, a dash, then 3 digits
			if (doReformat) {
				if (/^\d{3}[^\d]?\d{3}$/.test(zipValue)) {
					isValid = true;
					zipValue = zipValue.substr(0, 3) +'-'+ zipValue.slice(-3);
				}
			} else {
				if (/^\d{3}\-?\d{3}$/.test(zipValue)) {
					isValid = true;
				}
			}
		} else {
			//for all other countries don't do validation and assume it is valid
			isValid = true;
		}
		if (isValid && doReformat) {
			isValid = zipValue;
		}
		return isValid;
	};

	me.firstnameLastnameOrder = function(forCountry, firstnameSelector, lastnameSelector, optionalContext) {
		if ($.inArray(forCountry, ['US', 'CA', 'AU', 'NZ', /*Western Europe from here: */ 'AD', 'AT', 'BE', 'DK', 'FI', 'FR', 'DE', 'GR', 'IS', 'IE', 'IT', 'LI', 'LU', 'MT', 'MC', 'NL', 'NO', 'SM', 'SE', 'CH', 'GB']) > -1) {  // Western Europe: http://en.wikipedia.org/wiki/Western_Europe#Western_European_and_Others_Group
			order = ['firstname', 'lastname'];
			$(firstnameSelector, optionalContext).insertBefore($(lastnameSelector, optionalContext));
		} else {
			order = ['lastname', 'firstname'];
			$(lastnameSelector, optionalContext).insertBefore($(firstnameSelector, optionalContext));
		}
		return order;
	};

	me.dateFieldOrder = function(forCountry, dateContainerSelector, yearSelector, monthSelector, daySelector, optionalContext) {
		if ($.inArray(forCountry, ['US', 'CA']) > -1) {  //NOTE: .insertBefore() only works with element are next to each other (http://stackoverflow.com/questions/698301/is-there-a-native-jquery-function-to-switch-elements)
			order = ['month', 'day', 'year'];
			if (dateContainerSelector) {
				$(dateContainerSelector, optionalContext)
					.append($(monthSelector, optionalContext))
					.append($(daySelector, optionalContext))
					.append($(yearSelector, optionalContext));
			}
		} else if ($.inArray(forCountry, ['CN', 'HK', 'TW', 'HU', 'JP', 'KR', 'LT', 'MN']) > -1) {
			order = ['year', 'month', 'day'];
			if (dateContainerSelector) {
				$(dateContainerSelector, optionalContext)
					.append($(yearSelector, optionalContext))
					.append($(monthSelector, optionalContext))
					.append($(daySelector, optionalContext));
			}
		} else {
			order = ['day', 'month', 'year'];
			if (dateContainerSelector) {
				$(dateContainerSelector, optionalContext)
					.append($(daySelector, optionalContext))
					.append($(monthSelector, optionalContext))
					.append($(yearSelector, optionalContext));
			}
		}
	};

	/**
	 * Setup state input fields to automatically switch between text input and select based on the currently selected country
	 *
	 * Call this function once on page load.
	 *
	 * @param {string} stateFieldSelector - jQuery selector for the state input field
	 * @param {string} countryFieldSelector - jQuery selector for the country input field that should control the state
	 * @param {options} options - Available options:
	 * 	- `stateList` (req.) : object with list of states for each country
	 * 		- key must match the possible country dropdown values (preferrably ISO-3166 country code) and it's value should be an array of subarrays where 1st value is state code (value) and 2nd value is state name (label)
	 * 	- `ignoreNonExisting` : set to true to not add a non-existing state value to the dropdown when converting an existing text value
	 * @return {void} - Only modifies DOM
	 */
	me.setupStateInputHandling = function(stateFieldSelector, countryFieldSelector, options) {
		var me = this;

		if (!options) options = {};
		if (!options.stateList) options.stateList = me.basicCountryStatesList();

		var $state = $(stateFieldSelector);
		var $country = $(countryFieldSelector);
		var currMode = ($state.is('select') ? 'select' : 'input');  //source: https://stackoverflow.com/a/8388874/2404541
		var currStateValue = $state.val();
		var currCountryCode = $country.val();
		var foundSelected = false;

		if ((currMode == 'input' || currCountryCode !== $state.attr('data-country')) && options.stateList[currCountryCode]) {
			// Convert <input> to <select>

			var $select = $('<select>');
			$select.attr('data-country', currCountryCode);
			if ($state.attr('name')) $select.attr('name', $state.attr('name'));  //copy attributes from <input>
			if ($state.attr('class')) $select.attr('class', $state.attr('class'));
			if ($state.attr('style')) $select.attr('style', $state.attr('style'));
			if ($state.attr('id')) $select.attr('id', $state.attr('id'));
			if ($state.is(':disabled')) $select.prop('disabled', true);

			if (options.blankLabel !== false) {
				$select.append(
					$('<option>').val('').html( (options.blankLabel ? options.blankLabel : '') )
				);
			}

			$.each(options.stateList[currCountryCode], function(indx, val) {
				var isSelected = (currStateValue.toUpperCase() == val[0].toUpperCase() ? true : false);

				if (isSelected) foundSelected = true;

				$select.append(
					$('<option>').val(val[0]).html(val[1]).prop('selected', isSelected)
				);
			});

			if (currStateValue.length > 0 && foundSelected == false && options.ignoreNonExisting !== true) {
				$select.append(
					$('<option>').val(currStateValue).html(currStateValue).prop('selected', true)
				);
			}

			$($state).replaceWith($select);

		} else if (currMode == 'select' && typeof options.stateList[currCountryCode] == 'undefined') {
			// Convert <select> to <input>

			var $input = $('<input>');
			if ($state.attr('name')) $input.attr('name', $state.attr('name'));  //copy attributes from <input>
			if ($state.attr('class')) $input.attr('class', $state.attr('class'));
			if ($state.attr('style')) $input.attr('style', $state.attr('style'));
			if ($state.attr('id')) $input.attr('id', $state.attr('id'));
			if ($state.is(':disabled')) $input.prop('disabled', true);

			$input.val(currStateValue);

			$($state).replaceWith($input);
		}

		// Setup calling the method again whenever country changes
		if (options.__eventSetupDone !== true) {
			$country.on('change', function() {
				options.__eventSetupDone = true;
				me.setupStateInputHandling(stateFieldSelector, countryFieldSelector, options);
			});
		}
	};

	/**
	 * List of states for a few selected countries
	 *
	 * Used as default if full list is not provided. Full list in Allan Jensen's file `Country states worldwide - my master list.sql`.
	 *
	 * @return {object}
	 */
	me.basicCountryStatesList = function() {
		return {
			"AU":[
				["ACT","Australian Capital Territory"],["NSW","New South Wales"],["NT","Northern Territory"],["QLD","Queensland"],["SA","South Australia"],["TAS","Tasmania"],["VIC","Victoria"],["WA","Western Australia"]
			],
			"CA":[
				["AB","Alberta"],["BC","British Columbia"],["MB","Manitoba"],["NB","New Brunswick"],["NL","Newfoundland and Labrador"],["NT","Northwest Territories"],["NS","Nova Scotia"],["NU","Nunavut"],["ON","Ontario"],["PE","Prince Edward Island"],["QC","Quebec"],["SK","Saskatchewan"],["YT","Yukon Territories"]
			],
			"US":[
				["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["AP","Armed Forces Pacific"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["GU","Guam"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["PR","Puerto Rico"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["VI","US Virgin Islands"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
			]
		};
	};

	/**
	 * Return the minimum number of digits in phone number for a given country or country dialing code
	 *
	 * @param {string} forCountry - ISO country code (set to null if using forCountryCode instead)
	 * @param {string} forCountryCode - Country dialing code (set forCountry to null)
	 * @return {number}
	 */
	me.minimumPhoneNumDigits = function(forCountry, forCountryCode) {
		if (typeof forCountryCode == 'string') forCountryCode = parseInt(forCountryCode, 10);
		if ($.inArray(forCountry, ['US', 'CA']) > -1 || $.inArray(forCountryCode, [1]) > -1) {
			return 10;
		} else if ($.inArray(forCountry, ['DK', 'NO', 'SE']) > -1 || $.inArray(forCountryCode, [45, 47, 46]) > -1) {
			return 8;
		} else {
			// rest of the world (Solomon Islands have 5 digit phone numbers)
			return 5;
		}
	};

}( window.Jjs = window.Jjs || {}, jQuery ));
