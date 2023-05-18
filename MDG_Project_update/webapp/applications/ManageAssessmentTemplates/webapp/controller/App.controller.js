var appThis;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"EHS/ManageAssessmentTemplates/util/Formatter"
], function (Controller, Formatter) {
	"use strict";

	return Controller.extend("EHS.ManageAssessmentTemplates.controller.App", {
		Formatter:Formatter,
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
			// var factorsModel = new sap.ui.model.json.JSONModel();
			// factorsModel.loadData(jQuery.sap.getModulePath("EHS.ManageAssessmentTemplates.model", "/Factors.json"));
			/*this.getView().setModel(oViewModel, "appView");
			var sideContentModel = new sap.ui.model.json.JSONModel();
			sideContentModel.loadData(jQuery.sap.getModulePath("EHS.ManageAssessmentTemplates.model", "/sideContent.json"));
			sideContentModel.attachRequestCompleted(function(){
				that.getView().byId("sideNavigationList").setSelectedItem(that.getView().byId("sideNavigationList").getItem().getItems()[0]);
			});
			that.getView().byId("sideNavigationList").setModel(sideContentModel);*/
			/*	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("IndustryMaster");*/
			// that.getView().byId("sideNavigationList").setSelectedKey("home");
			
			// Hiding the Fiori Launchpad back button
			if(window.location.href.includes("flp")) {
				sap.ushell.Container.getRenderer("fiori2").hideHeaderItem("backBtn", false);
				// sap.ushell.Container.getRenderer("fiori2").showHeaderItem("backBtn", false); // for showing back the back button
			}
		},
		onAfterRendering: function () {

		},
		/*onSideNavButtonPress: function () {
			var oToolPage = this.getView().byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			//this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!bSideExpanded);
		},*/
		// onItemSelect: function (evt) {
		// 	// console.log(evt);
		// 	this.getView().getModel("appView").setProperty("/layout", "OneColumn");
		// 	var key = evt.getParameter("item").getKey();
		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	if (key === "home") {
		// 		// this.sideNavClose();
		// 		oRouter.navTo("Home");
		// 	} else if (key === "TemplateCreation") {
		// 		// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 		oRouter.navTo("AssessmentTemplateDetails");
		// 	} else if (key === "Industries") {
		// 		// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 		oRouter.navTo("IndustryMaster");
		// 	}
		// 	else if(key === "UserCreation"){
		// 		// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 		oRouter.navTo("CreateUsers");
		// 	}
		// 	else if(key === "Survey"){
		// 		// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 		oRouter.navTo("SurveyDetails");
		// 	}

		// }
	});
});