sap.ui.define([], function () {
	"use strict";
	return {

		getDateFormat: function (sDate) {

			if (sDate !== null && sDate !== undefined) {

				var sDate = new Date(sDate)
				return sDate;

			} else {

				var sDate = new Date("0000", "00", "00", "00", "00");
				return sDate;
			}

		},

		getEndDateFormat: function (sDate) {

			if (sDate !== null && sDate !== undefined) {

				var sDate = new Date(sDate)
				return sDate;

			} else {
				var sDate = new Date("0000", "00", "00", "00", "00");
				return sDate;
			}

		},

	};
});