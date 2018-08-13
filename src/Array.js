/*
This file contain Javascript functions related to arrays
Copyright © 2006-2018 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
*/

(function( Jjs, $, undefined ) {

	Jjs.Array = {};
	var me = Jjs.Array;

	/**
	 * Sort a "two-dimensional" array by a value in the subarrays
	 *
	 * @param {array} array - Array to be sorted
	 * @param {string} sortBy - Name of key in subarray with value to sort by
	 * @param {boolean} descending - Set to true to sort descendingly instead of ascendingly
	 * @return {array}
	 */
	me.arrayColumnSort = function(array, sortBy, descending) {
		return array.sort(dynamicSort(sortBy, descending));
	};
	function dynamicSort(property, descending) {
		var sortOrder = 1;
		if (descending) {
			sortOrder = -1;
		}
		return function (a,b) {
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	}

	/**
	 * Remove duplicates in an array
	 *
	 * Source: http://www.martienus.com/code/javascript-remove-duplicates-from-array.html
	 *
	 * @param {array} array - Array to be sorted
	 * @return {array}
	 */
	me.uniqueArray = function(array) {
		var r=new Array();
		o:for(var i=0,n=array.length;i<n;i++) {
			for(var x=0,y=r.length;x<y;x++) {
				if(r[x]==array[i]) {
					continue o;
				}
			}
			r[r.length]=array[i];
		}
		return r;
	};

}( window.Jjs = window.Jjs || {}, jQuery ));
