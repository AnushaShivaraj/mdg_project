sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("MDG.Program.controller.page", {
		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new sap.ui.model.json.JSONModel({
				busy: true,
				delay: 0,
				additionalPartners: [],
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
			this.getView().setModel(oViewModel, "appView");
			// 	this.Model = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("INQ.Inquiries") + "/model/Complaint.json");
			// this.getView().setModel(this.Model, "partiesModel");
			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				//	oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("masterList");

		}
	});
});