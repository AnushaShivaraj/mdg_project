sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("mdg.Org_Chart.controller.app", {
		onInit: function () {
			var oViewModel = new sap.ui.model.json.JSONModel({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				},
				previousPage: "Master",
				lastId:4
			});
			this.getView().setModel(oViewModel, "appView");
		}
	});
});