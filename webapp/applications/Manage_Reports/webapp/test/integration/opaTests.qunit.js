/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"RRA/Re-risk_Assessments/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});