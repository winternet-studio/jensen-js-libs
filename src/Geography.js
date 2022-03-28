/*
This file contain Javascript functions related to geography, eg. calculations with latitude/longitude
Copyright © 2006-2022 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
*/

(function(exports) {
	if (exports === null) {  //if true we are in a browser context => create a single variable on the window object instead
		if (typeof window.Jjs === 'undefined') window.Jjs = {};
		window.Jjs.Geography = {};
		exports = window.Jjs.Geography;
	}

	exports.bearingRhumbline = function($lat1, $lng1, $lat2, $lng2) {
		/*
		DESCRIPTION:
		- calculate the bearing of a rhumb-line (straight line on map), in degrees, from starting Point A to remote Point B
		- the bearing for a rhumb-line is constant all the way
		- source: http://webcache.googleusercontent.com/search?q=cache:o-7HcMkYfh0J:https://www.dougv.com/2009/07/13/calculating-the-bearing-and-compass-rose-direction-between-two-latitude-longitude-coordinates-in-php/+&cd=2&hl=no&ct=clnk
		INPUT:
		- $lat1 : latitude of Point A
		- $lng1 : longitude of Point A
		- $lat2 : latitude of Point B
		- $lng2 : longitude of Point B
		OUTPUT:
		- bearing (number)
		*/

		//difference in longitudinal coordinates
		$dLon = this.deg2rad($lng2) - this.deg2rad($lng1);

		//difference in the phi of latitudinal coordinates
		$dPhi = Math.log(Math.tan(this.deg2rad($lat2) / 2 + Math.PI / 4) / Math.tan(this.deg2rad($lat1) / 2 + Math.PI / 4));

		//we need to recalculate $dLon if it is greater than pi
		if (Math.abs($dLon) > Math.PI) {
			if ($dLon > 0) {
				$dLon = (2 * Math.PI - $dLon) * -1;
			} else {
				$dLon = 2 * Math.PI + $dLon;
			}
		}

		//return the angle, normalized
		return (this.rad2deg(Math.atan2($dLon, $dPhi)) + 360) % 360;
	};

	exports.pointFromBearingDistance = function($lat, $lng, $angle, $distance) {
		/*
		DESCRIPTION:
		- calculate the point (latitude/longitude) given a point of origin, a bearing, and a distance
		- source: http://www.etechpulse.com/2014/02/calculate-latitude-and-longitude-based.html
		INPUT:
		- $lat
		- $lng
		- $angle : bearing in degrees (0-360)
		- $distance : distance from the point in kilometers
		OUTPUT:
		- array where first entry is the new latitude, second entry the new longitude
		- example: array(60.6793281, 8.6953779)
		*/
		$new_latlng = [];
		$distance = $distance / 6371;
		$angle = this.deg2rad($angle);

		$lat1 = this.deg2rad($lat);
		$lng1 = this.deg2rad($lng);

		$new_lat = Math.asin(Math.sin($lat1) * Math.cos($distance) +
					  Math.cos($lat1) * Math.sin($distance) * Math.cos($angle));

		$new_lng = $lng1 + Math.atan2(Math.sin($angle) * Math.sin($distance) * Math.cos($lat1),
							  Math.cos($distance) - Math.sin($lat1) * Math.sin($new_lat));

		if (isNaN($new_lat) || isNaN($new_lng)) {
			return null;
		}

		$new_latlng[0] = this.rad2deg($new_lat);
		$new_latlng[1] = this.rad2deg($new_lng);

		return $new_latlng;
	};
	exports.deg2rad = function($input) {  //equivalent to PHP deg2rad()
		return $input * Math.PI / 180;
	};
	exports.rad2deg = function($input) {  //equivalent to PHP rad2deg()
		return $input * 180 / Math.PI;
	};

	/**
	 * Convert a latitude or longitude from Decimal Degrees to Degrees Minutes Seconds
	 *
	 * Eg. 55.68052, 12.56223  ===>  {degrees: 55, minutes: 40, seconds: 49, direction: 'N'}, {degrees: 12, minutes: 33, seconds: 44, direction: 'E'}
	 * To be shown eg. as `N 55° 40' 49.872", E 12° 33' 44.028"`
	 *
	 * @param {float} coordinate : The decimal degrees, eg. `59.7682642` or `-122.4726193`
	 * @param {string} type : Whether the decimal degrees is for a latitude or longitude: `lat` or `lng`
	 * @return {array} : Array with keys `degrees`, `minutes`, `seconds`, `direction`
	 */
	exports.convertCoordinateDecimalToDMS = function(coordinate, type) {
		var absolute = Math.abs(coordinate);
		var degrees = Math.floor(absolute);
		var minutesNotTruncated = (absolute - degrees) * 60;
		var minutes = Math.floor(minutesNotTruncated);
		var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

		var cardinalDirection;
		if (type == 'lat') {
			cardinalDirection = coordinate >= 0 ? 'N' : 'S';
		} else {
			cardinalDirection = coordinate >= 0 ? 'E' : 'W';
		}

		return {
			degrees: degrees,
			minutes: minutes,
			seconds: seconds,
			direction: cardinalDirection,
			textual: ''+ cardinalDirection +' '+ degrees +'° '+ minutes +"' "+ seconds +'"',
		}
	};

	exports.convertCoordinateDMSToDecimal = function(degrees, minutes, seconds, direction) {  //source: https://stackoverflow.com/a/1140335/2404541
		var dd = degrees + minutes/60 + seconds/(60*60);

		if (direction == 'S' || direction == 'W') {
			dd = dd * -1;
		} // Don't do anything for N or E
		return dd;
	};

})(typeof exports === 'undefined' ? null : exports);
