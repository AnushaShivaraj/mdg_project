/*global QUnit*/

sap.ui.define([
	"EHS/ManageAssessmentTemplates/controller/AssessmentTemplateDetails.controller"
], function (Controller) {
	"use strict";

	QUnit.module("AssessmentTemplateDetails Controller");

	QUnit.test("I should test the AssessmentTemplateDetails controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});