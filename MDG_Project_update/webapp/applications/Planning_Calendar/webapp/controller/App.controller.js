var appThis;
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("MDG.Planning_Calendar.controller.App", {
		onInit: function () {
			var that = this;
			appThis= this;
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			oViewModel = new sap.ui.model.json.JSONModel({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				sideContent: this.getView().byId("sideNavigationList"),
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
			if(window.location.href.includes("flp")) {
				sap.ushell.Container.getRenderer("fiori2").hideHeaderItem("backBtn", false);
				// sap.ushell.Container.getRenderer("fiori2").showHeaderItem("backBtn", false); // for showing back the back button
			}
		}
	});
});