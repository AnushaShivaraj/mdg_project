/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"MDG/Program/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});