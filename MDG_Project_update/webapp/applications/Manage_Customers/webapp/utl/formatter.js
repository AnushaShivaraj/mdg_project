sap.ui.define([], function () {
	"use strict";

	return {
		formatCustomerId: function (id) {
			return "CUST" + (10000 + id);
		}
	};
});