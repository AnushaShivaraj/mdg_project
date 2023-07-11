/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"MDG/ApplicationManagement/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});