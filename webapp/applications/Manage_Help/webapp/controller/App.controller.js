sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (Controller,Fragment) {
	"use strict";

	return Controller.extend("MDG.Help.controller.App", {
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
                previousPage: "Master"
			});
			this.getView().setModel(oViewModel, "appView");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Help");
			}
		
			
		
		
			
	});
		
	
		
	
});