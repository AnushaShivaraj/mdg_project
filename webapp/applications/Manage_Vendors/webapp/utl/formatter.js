sap.ui.define([], function () {
	"use strict";

	return {
		formatCustomerId: function (id) {
			return "VDN" + (10000 + id);
		}
	};
});