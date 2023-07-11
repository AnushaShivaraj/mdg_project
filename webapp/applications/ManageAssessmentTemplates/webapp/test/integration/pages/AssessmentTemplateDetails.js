sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";
	var sViewName = "AssessmentTemplateDetails";
	Opa5.createPageObjects({
		onTheAppPage: {

			actions: {},

			assertions: {

				iShouldSeeTheApp: function () {
					return this.waitFor({
						id: "app",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The AssessmentTemplateDetails view is displayed");
						},
						errorMessage: "Did not find the AssessmentTemplateDetails view"
					});
				}
			}
		}
	});

});