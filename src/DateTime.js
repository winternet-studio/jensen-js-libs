/*
This file contain Javascript functions related to date and time
Copyright © 2006-2020 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
*/

(function( Jjs, $, undefined ) {

	Jjs.DateTime = {};
	var me = Jjs.DateTime;

	/**
	 * Convert a date to JS Date object (milliseconds)
	 *
	 * Can also be used to validate a date
	 *
	 * @param {string} mydate - Date to convert (must have a value)
	 * @param {string} format - Valid values are `dmy`, `mdy`, `ymd` added by a forth character which sets the delimiter which can be anything except a number
	 * @return {Date object|boolean} - Valid date returns a Date object, invalid date or empty value returns false
	 */
	me.dateToJsDate = function(mydate, format) {
		if (mydate.length == 0) {
			return false;
			// throw 'No date was given.';
		}
		if (!format || format.length != 4) {
			throw 'Configuration error. Date format has incorrect length: '+ format;
		}
		var year, month, day;
		var dateorder = format.substr(0, 3);
		var datesep = format.substr(3, 1);
		if (isinteger(datesep)) {
			throw 'Configuration error. Date delimiter is invalid: '+ format;
		}
		var parts = mydate.split(datesep);
		if (parts.length != 3) {
			return false;
			// throw 'Date is invalid: '+ format + mydate;
		}
		switch (dateorder) {
		case 'dmy': year = parts[2]; month = parts[1]; day = parts[0]; break;
		case 'mdy': year = parts[2]; month = parts[0]; day = parts[1]; break;
		case 'ymd': year = parts[0]; month = parts[1]; day = parts[2]; break;
		default:
			throw 'Configuration error. Date format is invalid: '+ dateorder;
		}
		// Check year and mont and other general checks
		if (!isinteger(year) || !isinteger(month) || !isinteger(day) || year < 0 || month < 0 || month > 12 || day < 0) {
			return false;
			//throw 'Date is invalid: '+ format + mydate;
		}
		// Check the day (date of month) part
		if (month == 2) {  //if February
			//February has 29 days in any year evenly divisible by four, EXCEPT for centurial years which are not also divisible by 400.
			var daysInFeb = (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
			if (day > daysInFeb) {
				return false;
			}
		} else {
			var monthdays = new Array(false, 31,28,31,30,31,30,31,31,30,31,30,31);
			var daysInMonth = monthdays[month];
			if (day > daysInMonth) {
				return false;
			}
		}
		return new Date(year, month-1, day);
	};

	/**
	 * Convert a time to JS Date object (milliseconds)
	 *
	 * Can also be used to validate a time.
	 *
	 * @param {string} mytime - Date to convert (must have a value)
	 * @param {string} format - Valid values are `hm` or `hms` followed by a last character that determines the seperator, eg.: `hm:`, `hms.`, `Hm:`
	 *   - to use 12-hour format and require am/pm appended change `h` to a capital `H`
	 *   - this gives you the following format options:
	 *     - hh:mm            (24hr clock)
	 *     - hh:mm:ss         (24hr clock)
	 *     - hh:mm [am|pm]    (12hr clock)
	 *     - hh:mm:ss [am|pm] (12hr clock)
	 * @return {Date object|boolean} - Valid date returns a Date object, invalid date or empty value returns false
	 */
	me.timeToJsDate = function(mytime, format) {
		mytime = mytime.replace(/ /, '');  //remove all spaces
		mytime = mytime.toLowerCase();  //ensure any am/pm is lower case
		if (mytime.length == 0) {
			return false;
			//throw 'No time was given.';
		}
		var match = format.match(/^([hH]ms?)([^hms0-9])$/);
		if (match) {
			var is12hr;
			var order = match[1];
			var timesep = match[2];
			if (order.substr(0, 1) == 'H') {
				is12hr = true;
				order = order.toLowerCase();  //make plain since we now use variable to know if 12-hour clock
			} else {
				is12hr = false;
			}
		} else {
			throw 'Configuration error. Time format is invalid: '+ format;
		}
		// Check value
		var ampmp;
		if (is12hr) {
			ampmp = '(am|pm)';
		} else {
			ampmp = '';
		}
		if (order == 'hm') {
			patt = '^(\\d{1,2})\\'+ timesep +'(\\d{1,2})()'+                        ampmp +'$';
		} else if (order == 'hms') {
			patt = '^(\\d{1,2})\\'+ timesep +'(\\d{1,2})\\'+ timesep +'(\\d{1,2})'+ ampmp +'$';
		}
		patt = new RegExp(patt);
		var parts = mytime.match(patt);
		if (parts) {  //check format
			var hours = parts[1];
			var minutes = parts[2];
			var seconds = parts[3];
			var isampm = parts[4];
			if (seconds.length == 0) {
				seconds = 0;
			}
			if (is12hr) {
				if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59 ) {  //check each digit group
					if (isampm == 'am' && hours == 12) {
						hours = 0;
					} else if (isampm == 'pm' && hours != 12) {
						hours = setinteger(hours) + 12;
					}
				} else {
					return false;
				}
			} else {
				if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59 ) {  //check each digit group
					//everything is okay
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
		var output = new Date();
		output.setHours(hours, minutes, seconds, 0);
		return output;
	};

	/**
	 * Convert several date formats (except Unix) to MySQL format
	 *
	 * Use date/time validation functions to ensure correct date/time values.
	 *
	 * A PHP equivalent with the same name exists, it works exactly the same way.
	 *
	 * @param {string} date - Date and/or time to convert
	 * @param {string} dateformat - Format of the date to convert. Valid values are `dmy`, `mdy`, `ymd` added by a forth character which sets the delimiter which can be anything except a number
	 * 	- set to false if datetime only contains a time value
	 * @param {string} timeformat - Format of the time to convert. Valid values are `hm`, `hms` added by a forth character which sets the delimiter which can be anything except a number
	 *   - if 12-clock it must be a cathe capitalized `H` (eg. `Hm` or `Hms`)
	 *   - examples:
	 *     - hh:mm            (24hr clock)
	 *     - hh:mm:ss         (24hr clock)
	 *     - hh:mm [am|pm]    (12hr clock, hh = (0)0-23, mm = (0)0-59, with or without space between time and am/pm)
	 *     - hh:mm:ss [am|pm] (12hr clock, hh = (0)1-12, mm = (0)0-59, with or without space between time and am/pm)
	 * @param {string} returnonfail - String to return if conversion fails
	 *   - provide string `source` to return the untouched datetime value
	 *   - IMPORTANT: if this is used you MUST validate the datetime later on before using it (preferrably on server-side)
	 * @return {string} - MySQL formatted date and/or time, or empty string if the values are empty, or if conversion fails and returnonfail is set, it's value is returned.
	 */
	me.toMysqlDateTime = function(datetime, dateformat, timeformat, returnonfail) {
		var skipfail;
		if (typeof returnonfail != 'undefined') {
			skipfail = true;
			if (returnonfail == 'source') {
				returnonfail = datetime;
			}
		}
		if (datetime) {
			var output = new Array(); var tmp, parts, iswhat, date, time, datedelimiter, timedelimiter;
			datetime = datetime.replace(/^\s*|\s*$/g, '');
			datetime = datetime.replace(/\s\s/g, '');  //ensure no double spaces
			datetime = datetime.replace(/\s(am|pm)/i, '$1');
			if (datetime.indexOf(' ') >= 0) {
				//both date AND time
				parts = datetime.split(' ');
				if (parts.length != 2) {
					if (skipfail) {
						return returnonfail;
					} else {
						throw 'Invalid date/time to convert to database format: '+ datetime;
					}
				} else {
					date = parts[0]; time = parts[1];
				}
			} else {
				//only date OR time
				datedelimiter = (dateformat===null||dateformat===false||dateformat==='' ? '¤' : dateformat.substr(3, 1));  //just set a character that is never used as separator so that the first if condition below will always fail
				timeformat = (typeof timeformat == 'undefined' || timeformat === null || timeformat === false ? '' : timeformat);
				timedelimiter = timeformat.substr(timeformat.length-1);
				if (datetime.indexOf(datedelimiter) >= 0) {  //the value contains the date delimiter => must be a date
					iswhat = 'date';
				} else if (datetime.indexOf(timedelimiter) >= 0) {  //the value contains the time delimiter => must be a time
					iswhat = 'time';
				} else {
					if (skipfail) {
						return returnonfail;
					} else {
						throw 'Could not determine if value was a date or a time: '+ datetime;
					}
				}
				switch (iswhat) {
					case 'date': date = datetime; time = false; break;
					case 'time': date = false; time = datetime; break;
				}
			}
			if (date) {
				var dateorder, y, m, d;
				dateorder = dateformat.substr(0, 3);
				datedelimiter = dateformat.substr(3, 1);
				if ((dateorder == 'dmy' || dateorder == 'mdy' || dateorder == 'ymd') && datedelimiter.length == 1) {
					parts = date.split(datedelimiter);
					if (parts.length != 3) {
						if (skipfail) {
							return returnonfail;
						} else {
							throw 'Invalid date format for converting to database format: '+ datetime;
						}
					}

					switch (dateorder) {
					case 'dmy':
						y=parts[2];
						m=parts[1];
						d=parts[0];
						break;
					case 'mdy':
						y=parts[2];
						m=parts[0];
						d=parts[1];
						break;
					case 'ymd':
						y=parts[0];
						m=parts[1];
						d=parts[2];
						break;
					}
					while (y.length<4) {
						y='0'+y;
					}
					while (m.length<2) {
						m='0'+m;
					}
					while (d.length<2) {
						d='0'+d;
					}
					tmp=y+'-'+m+'-'+d;
					output.push(tmp);
				} else {
					if (skipfail) {
						return returnonfail;
					} else {
						throw 'Invalid date format for converting to database format: '+ dateformat;
					}
				}
			}
			if (time) {
				var timeorder, ampm, hours, mins, secs;
				time = time.toLowerCase();
				var is12hr = (timeformat.indexOf('H') >= 0 ? true : false);
				timeformat = timeformat.toLowerCase();
				if (timeformat.length == 3) {
					timedelimiter = timeformat.substr(2, 1);
					timeorder = timeformat.substr(0, 2);
				} else if (timeformat.length == 4) {
					timedelimiter = timeformat.substr(3, 1);
					timeorder = timeformat.substr(0, 3);
				} else {
					if (skipfail) {
						return returnonfail;
					} else {
						throw 'Invalid time format for converting to database format: '+ timeformat;
					}
				}
				if ((timeorder == 'hm' || timeorder == 'hms') && datedelimiter.length == 1) {
					time = time.replace(/ /, '');
					if (is12hr) {
						if (time.indexOf('pm') < 0 && time.indexOf('am') < 0) {
							if (skipfail) {
								return returnonfail;
							} else {
								throw 'Missing am/pm in: '+ datetime;
							}
						}
						ampm = (time.indexOf('pm') >= 0 ? 'pm' : 'am');
						time = time.substr(0, time.length-2);
					}
					parts = time.split(timedelimiter);
					switch (timeorder) {
						case 'hm':  hours = parts[0]; mins = parts[1]; secs = '00'; break;
						case 'hms': hours = parts[0]; mins = parts[1]; secs = parts[2]; break;
					}
					if (is12hr) {
						if (ampm == 'pm' && hours <= 11) {
							hours = hours*1 + 12;  //*1 to ensure integer
						} else if (ampm == 'am' && hours == '12') {
							hours = '00';
						}
					}
					while (hours.length<2) {  //NOTE: only necessary with hours (mins and secs should always be provided in two digits anyway)
						hours='0'+hours;
					}
					output.push(hours +':'+ mins +':'+ secs);
				} else {
					if (skipfail) {
						return returnonfail;
					} else {
						throw 'Invalid time format for converting to database format: '+ timeformat;
					}
				}
			}
			return output.join(' ');
		} else {
			return '';
		}
	};

	me.checkDate = function(m, d, y) {
	  //  discuss at: http://phpjs.org/functions/checkdate/
	  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Pyerre
	  // improved by: Theriault
	  //   example 1: checkdate(12, 31, 2000);
	  //   returns 1: true
	  //   example 2: checkdate(2, 29, 2001);
	  //   returns 2: false
	  //   example 3: checkdate(3, 31, 2008);
	  //   returns 3: true
	  //   example 4: checkdate(1, 390, 2000);
	  //   returns 4: false

	  return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0))
		.getDate();
	};

	/**
	 * Combine two JS Date objects, one holding the date, the other holding the time
	 *
	 * @param {Date object} mydate
	 * @param {Date object} mytime
	 * @return {Date object}
	 */
	me.mergeDateTime = function(mydate, mytime) {
		var d = typeof mydate;
		var t = typeof mytime;
		if (d != 'object' || t != 'object') {
			throw 'Invalid parameters for combining date and time: '+ d +'-'+ t;
		}
		//NOTE: QUEST: could not use mydate as the base because it somehow was passed by reference and was changed!
		return new Date(mydate.getFullYear(), mydate.getMonth(), mydate.getDate(), mytime.getHours(), mytime.getMinutes(), mytime.getSeconds(), mytime.getMilliseconds() );
	};

	/**
	 * Add or subtract a specified period from a date
	 *
	 * This is better than just multiplying the timestamp because this takes daylight savings time into consideration.
	 *
	 * @param {Date object} time_obj
	 * @param {integer} adjust_by - The number, positive to add or negative to subtract, you want to adjust the time with
	 * @param {string} interval - The unit for the adjust_by number
	 * @return {Date object}
	 */
	me.timeAdd = function(time_obj, adjust_by, interval) {
		if (!adjust_by) {
			throw 'Missing adjustment number for adding time: '+ time_obj;
		}
		if (!interval) {
			throw 'Missing interval for adding time: '+ time_obj;
		}
		var newtime, timeadd_msecs, currtime_msecs;
		switch (interval) {
		case 'hour': case 'hours': case 'hr': case 'hrs':
			timeadd_msecs = adjust_by * 60 * 60 * 1000;
			break;
		case 'minute': case 'minutes': case 'min': case 'mins':
			timeadd_msecs = adjust_by * 60 * 1000;
			break;
		case 'second': case 'seconds': case 'sec': case 'secs':
			timeadd_msecs = adjust_by * 1000;
			break;
		case 'day': case 'days':
			timeadd_msecs = adjust_by * 24 * 60 * 60 * 1000;
			break;
		case 'month': case 'months':
			timeadd_msecs = adjust_by * 30 * 24 * 60 * 60 * 1000;
			break;
		case 'year': case 'years': case 'yr': case 'yrs':
			timeadd_msecs = adjust_by * 365 * 24 * 60 * 60 * 1000;
			break;
		default:
			throw 'Configuration error. Interval has not been defined: '+ interval;
		}
		currtime_msecs = time_obj.getTime();
		newtime = new Date(currtime_msecs + timeadd_msecs);
		return newtime;
	};

	/**
	 * Calculate difference between two Javascript time objects
	 *
	 * @param {Date object} time1 - (req.) Beginning date/time
	 * @param {Date object} time2 - (req.) Ending date/time
	 * @param {string} interval - (opt.) Measure to calculate the difference in (hours, days, etc. according to convertFromMilliseconds() )
	 * @return {integer} - The difference in the measure specified by interval argument. Remember the number might have decimals. If interval not specified, milliseconds are returned.
	 */
	me.timeDifference = function(time1, time2, interval) {
		var diff;
		diff = time2.getTime() - time1.getTime();
		if (interval) {
			return convertFromMilliseconds(diff, interval);
		} else {
			return diff;
		}
	};

	/**
	 * Calculate difference between now and a specified Javascript time object
	 *
	 * @param {Date object} time_obj - A Javascript time object
	 * @return {integer} - Time difference in milliseconds relative to now
	 */
	me.timeNowDifference = function(time_obj) {
		var diff;
		now_time = new Date();
		diff = new_time.getTime() - time_obj.getTime();
		return diff;
	};

	/**
	 * Rextually write a time period/duration with a single unit, either days, hours, minutes, seconds - depending on how long the duration is
	 *
	 * The function also returns a value ('general_guide') where the appropiate unit is automatically determined, based on what is meaningful for the reader to know (this will of course not be the exact time, but only a general guide)
	 *
	 * @param {integer} time - (req.) Duration/length in seconds (like unix timestamp)
	 * @param {string} unitNames - (opt.) Whether `short` (= abbreviated) or `long` unit names should be unised in the `general_guide`
	 * @param {integer} decimals (opt.) : number of decimals to use in the 'general_guide' number
	 * 	- can be used to obtain much greater precision
	 * @param {boolean} includeWeeks (opt.) : whether or not to use the time in weeks for the 'general_guide'
	 * 	- most often you would probably want to use the days up until you have one month
	 * @param {callable} txtFunc (opt.) : function that will return the translated texts defined below
	 *
	 * @return {object} - See code below. The unit for the `general_guide` is specified in `appropiate_unit`.
	 */
	me.timePeriodSingleUnit = function(opts) {
		//determine unit names
		var times = {}, rounded, roundDec, txt_;
		var lbl_secs_one,  lbl_mins_one,  lbl_hours_one,  lbl_days_one,  lbl_weeks_one,  lbl_mnths_one,  lbl_years_one;
		var lbl_secs_more, lbl_mins_more, lbl_hours_more, lbl_days_more, lbl_weeks_more, lbl_mnths_more, lbl_years_more;

		if (typeof opts.unitNames    == 'undefined') opts.unitNames = 'short';
		if (typeof opts.decimals     == 'undefined') opts.decimals = 0;
		if (typeof opts.includeWeeks == 'undefined') opts.includeWeeks = false;

		roundDec = function(number, decimals) {
			if (decimals == 0) {
				return Math.round(number);
			} else {
				var base = number * Math.pow(10, decimals);
				base = Math.round(base);
				return base / Math.pow(10, decimals);  //NOTE: this will not include ending zeros in the decimals. Eg. : roundDec(24.6001, 3) = 24.6 instead of 24.600
			}
		}

		if (typeof opts.txtFunc == 'undefined') {
			txt_ = function(tag, def, x) {
				return def;
			}
		} else {
			txt_ = opts.txtFunc;
		}

		switch (opts.unitNames) {
		case 'short':
			lbl_secs_one = txt_('second_short', 'sec.', '#'); lbl_secs_more = txt_('seconds_short', 'sec.', '#');
			lbl_mins_one = txt_('minute_short', 'min.', '#'); lbl_mins_more = txt_('minutes_short', 'min.', '#');
			lbl_hours_one = txt_('hour_short', 'hr', '#'); lbl_hours_more = txt_('hours_short', 'hrs', '#');
			lbl_days_one = txt_('day_short', 'day', '#'); lbl_days_more = txt_('days_short', 'days', '#');
			lbl_weeks_one = txt_('week_short', 'week', '#'); lbl_weeks_more = txt_('weeks_short', 'weeks', '#');
			lbl_mnths_one = txt_('month_short', 'month', '#'); lbl_mnths_more = txt_('months_short', 'months', '#');
			lbl_years_one = txt_('year_short', 'year', '#'); lbl_years_more = txt_('years_short', 'yrs', '#');
			break;
		case 'long':
			lbl_secs_one = txt_('second', 'second', '#'); lbl_secs_more = txt_('seconds', 'seconds', '#');
			lbl_mins_one = txt_('minute', 'minute', '#'); lbl_mins_more = txt_('minutes', 'minutes', '#');
			lbl_hours_one = txt_('hour', 'hour', '#'); lbl_hours_more = txt_('hours', 'hours', '#');
			lbl_days_one = txt_('day', 'day', '#'); lbl_days_more = txt_('days', 'days', '#');
			lbl_weeks_one = txt_('week', 'week', '#'); lbl_weeks_more = txt_('weeks', 'weeks', '#');
			lbl_mnths_one = txt_('month', 'month', '#'); lbl_mnths_more = txt_('months', 'months', '#');
			lbl_years_one = txt_('year', 'year', '#'); lbl_years_more = txt_('years', 'years', '#');
			break;
		default:
			throw 'Configuration error. Unit format not defined: '+ opts.unitNames;
		}
		//calculate the time in the different units
		times['seconds']  = opts.time;
		times['minutes']  = times['seconds'] / 60;
		times['hours']    = times['minutes'] / 60;
		times['days']     = times['hours'] / 24;
		times['days_rounded'] = roundDec(times['days'], opts.decimals);
		times['weeks']    = times['days'] / 7;
		times['months']   = times['days'] / 30;
		times['years']    = times['days'] / 365;
		if (Math.abs(times['seconds']) < 60) {  //NOTE: use Math.abs() so we also handle negative periods correctly
			rounded = roundDec(times['seconds'], opts.decimals);  //needed in Javascript version because resolution is greater than just seconds
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_secs_one : rounded +' '+ lbl_secs_more);
			times['appropiate_unit'] = 'seconds';
		} else if (roundDec(Math.abs(times['minutes']), opts.decimals) < 60) {
			rounded = roundDec(times['minutes'], opts.decimals);
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_mins_one : rounded +' '+ lbl_mins_more);
			times['appropiate_unit'] = 'minutes';
		} else if (roundDec(Math.abs(times['hours']), opts.decimals) < 24) {
			rounded = roundDec(times['hours'], opts.decimals);
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_hours_one : rounded +' '+ lbl_hours_more);
			times['appropiate_unit'] = 'hours';
		} else if ( (!opts.includeWeeks && Math.abs(times['days_rounded']) < 30)  ||  (opts.includeWeeks && Math.abs(times['days_rounded']) < 7) ) {  //if weeks are used, the period of using days is shorter
			times['general_guide'] = (times['days_rounded'] == 1 ? '1 '+ lbl_days_one : times['days_rounded'] +' '+ lbl_days_more);
			times['appropiate_unit'] = 'days';
		} else if (opts.includeWeeks && roundDec(Math.abs(times['weeks']), opts.decimals) < 5 && Math.abs(times['days']) < 30) {  //skip to month if 30 or more days
			rounded = roundDec(times['weeks'], opts.decimals);
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_weeks_one : rounded +' '+ lbl_weeks_more);
			times['appropiate_unit'] = 'weeks';
		} else if (roundDec(Math.abs(times['months']), opts.decimals) < 12) {
			rounded = roundDec(times['months'], opts.decimals);
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_mnths_one : rounded +' '+ lbl_mnths_more);
			times['appropiate_unit'] = 'months';
		} else {
			//else write in years
			rounded = roundDec(Math.abs(times['years']), opts.decimals);
			times['general_guide'] = (rounded == 1 ? '1 '+ lbl_years_one : rounded +' '+ lbl_years_more);
			times['appropiate_unit'] = 'years';
		}
		return times;
	};

	/**
	 * Formats a time period nicely
	 *
	 * @param {Date object} $fromdate
	 * @param {Date object} $todate
	 * @param {object} $flags - Available options:
	 *   - `2digitYear` : set true to only show 2 digits in the year(s)
	 *   - `noYear` : set true to not show year at all
	 *   - `alwaysAbbrevMonths` : set true to not spell out fully the short months March, April, May, June and July
	 *   - `neverAbbrevMonths` : set true to always spell out fully the month names
	 * @return {string} - Eg. "Dec. 3-5, 2010" or "Nov. 30 - Dec. 4, 2010" or "Dec. 27, 2010 - Jan. 2, 2011"
	 */
	me.formatTimePeriod = function($fromdate, $todate, $flags) {
		var $yrmode, $shortmonths, $frommonth, $tomonth, $fromyear, $toyear, $output;

		if (typeof $flags == 'undefined') $flags = '';
		$yrmode = ($flags.indexOf('2digitYear') > -1 ? '2dig' : ($flags.indexOf('noYear') > -1 ? 'noyr' : '4dig'));

		if ($flags.indexOf('neverAbbrevMonths') > -1) {
			$frommonth = $fromdate.formatDate('F');
			$tomonth = $todate.formatDate('F');
		} else if ($flags.indexOf('alwaysAbbrevMonths') == -1) {
			$shortmonths = ['3', '4', '5', '6', '7'];
			if ($shortmonths.indexOf($fromdate.formatDate('n')) > -1) {
				$frommonth = $fromdate.formatDate('F');
			} else {
				$frommonth = $fromdate.formatDate('M.');
			}
			if ($shortmonths.indexOf($todate.formatDate('n')) > -1) {
				$tomonth = $todate.formatDate('F');
			} else {
				$tomonth = $todate.formatDate('M.');
			}
		} else {
			$frommonth = $fromdate.formatDate('M.');
			$tomonth = $todate.formatDate('M.');
		}

		if ($yrmode !== 'noyr') {
			$fromyear = $fromdate.getFullYear().toString();
			$toyear = $todate.getFullYear().toString();
		} else {
			$fromyear = $toyear = '';
		}
		$output = $frommonth +' '+ $fromdate.formatDate('j');
		if ($frommonth == $tomonth && $fromyear == $toyear) {
			$output += '-'+ $todate.formatDate('j');
		} else if ($fromyear == $toyear) {
			//months are not the same
			$output += ' - '+ $tomonth +' '+ $todate.formatDate('j');
		} else {
			//years are not the same
			$output += ', '+ ($yrmode == '2dig' ? "'"+ $fromyear.substr(2) : $fromyear) +' - '+ $tomonth +' '+ $todate.formatDate('j');
		}
		if ($yrmode != 'noyr') {
			$output += ', '+ ($yrmode == '2dig' ? "'"+ $toyear.substr(2) : $toyear);
		}

		return $output;
	};

	/**
	 * Difference between web server time and the client/browser/local computer time
	 *
	 * This must function must be run AS SOON AS POSSIBLE after getting timestamp from the server
	 *
	 * @param {integer} curr_server_time - Current UNIX timestamp from server (seconds after 1970)
	 * @return {integer} - Time difference in milliseconds relative to server/correct time
	 *   - positive: client is ahead of actual time
	 *   - negative: client is behind actual time
	 *   - you can SUBTRACT this difference when doing time calculations on client time for getting correct time results (assuming server has the correct time)
	 */
	me.timeDiffServerClient = function(server_time) {
		var diff;
		client_time = new Date();
		server_time = new Date(server_time * 1000);
		diff = client_time.getTime() - server_time.getTime();
		window.curr_client_time_offset = diff; //set global variable
		return diff;
	};

	/**
	 * Get current time, with attempt to adjust for clients' incorrect clock setting
	 *
	 * return {Date object}
	 */
	me.getTime = function() {
		if (window.curr_client_time_offset) {  //check for global variable containing the client time offset from server time
			return new Date( (new Date()).getTime() - window.curr_client_time_offset);
		} else {
			return new Date();
		}
	};

	me.convertFromMilliseconds = function(milliseconds, interval) {
		var diffTarget;
		switch (interval) {
		case 'week': case 'weeks': case 'wk': case 'wks':
			diffTarget = milliseconds / 1000 / 60 / 60 / 24 / 7;
			break;
		case 'day': case 'days':
			diffTarget = milliseconds / 1000 / 60 / 60 / 24;
			break;
		case 'hour': case 'hours': case 'hr': case 'hrs':
			diffTarget = milliseconds / 1000 / 60 / 60;
			break;
		case 'minute': case 'minutes': case 'min': case 'mins':
			diffTarget = milliseconds / 1000 / 60;
			break;
		case 'second': case 'seconds': case 'sec': case 'secs':
			diffTarget = milliseconds / 1000;
			break;
		case 'millisecond': case 'milliseconds': case 'msec': case 'msecs':
			diffTarget = milliseconds;
			break;
		default:
			throw 'Interval has not been defined: '+ interval;
		}
		return diffTarget;
	};

	me.convertToMilliseconds = function(timePeriod, sourceInterval) {
		var diffTarget;
		switch (sourceInterval) {
		case 'week': case 'weeks': case 'wk': case 'wks':
			diffTarget = timePeriod * 1000 * 60 * 60 * 24 * 7;
			break;
		case 'day': case 'days':
			diffTarget = timePeriod * 1000 * 60 * 60 * 24;
			break;
		case 'hour': case 'hours': case 'hr': case 'hrs':
			diffTarget = timePeriod * 1000 * 60 * 60;
			break;
		case 'minute': case 'minutes': case 'min': case 'mins':
			diffTarget = timePeriod * 1000 * 60;
			break;
		case 'second': case 'seconds': case 'sec': case 'secs':
			diffTarget = timePeriod * 1000;
			break;
		default:
			throw 'Interval has not been defined: '+ sourceInterval;
		}
		return diffTarget;
	};

	/**
	 * Determine a person's age at a given date, when knowing their birth year and month
	 *
	 * @param {Date object} atDate - Date at which to calculate the person's age
	 * @param {integer} birthYear - (req.) Year person was born
	 * @param {integer} birthMonth - (req.) Month person was born
	 * @param {integer|string} birthday - (req.) Day of month person was born, or one of these strings if unknown:
	 *   - `chance_of_being_older`   : results in a chance people being actually older   than calculated here
	 *   - `chance_of_being_younger` : results in a chance people being actually younger than calculated here
	 * @return {integer} - Age
	 */
	me.calculateAge = function(atDate, birthYear, birthMonth, birthDay) {
		var age, atYear, atMonth, atDay, hadBirthdayInYear;
		if (!isinteger(birthDay) && birthDay != 'chance_of_being_older' && birthDay != 'chance_of_being_younger') {
			throw 'Invalid day of month for calculating age: '+ birthDay;
		}

		atYear = atDate.getFullYear();
		atMonth = atDate.getMonth()+1;
		atDay = atDate.getDate();

		// Set birth date of month if not provided
		if (birthDay == 'chance_of_being_older') {
			// NOTE: assuming their birth date on the 31st on the month results in some people being actually older   than this calculated age
			birthDay = 31;
		} else if (birthDay == 'chance_of_being_younger') {
			// NOTE: assuming their birth date on the  1st on the month results in some people being actually younger than this calculated age
			birthDay = 1;
		}

		age = atYear - birthYear;  //basic calculation
		if (new Date(atYear, atMonth, atDay) >= new Date(atYear, birthMonth, birthDay)) {  //the equal sign results in the person being the "new" age on the day of his/her birthdate
			hadBirthdayInYear = true;
		} else {
			hadBirthdayInYear = false;
		}
		if (!hadBirthdayInYear) {  //a person having bith
			age -= 1;  //person haven't had birth day yet in this year, subtract one
		}
		return age;
	};

}( window.Jjs = window.Jjs || {}, jQuery ));
