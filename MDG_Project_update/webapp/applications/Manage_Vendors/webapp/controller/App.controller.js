sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (Controller, Fragment) {
	"use strict";

	return Controller.extend("MDG.Vendor.controller.App", {
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