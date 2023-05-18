/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"VASPP/MDGSystem/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});