/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"RRA/Re-risk_Assessments/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});