/*global QUnit*/

sap.ui.define([
	"MDG/Program/controller/page.controller"
], function (Controller) {
	"use strict";

	QUnit.module("page Controller");

	QUnit.test("I should test the page controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});