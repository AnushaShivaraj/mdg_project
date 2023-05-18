sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.Home", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.Home
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("Home").attachPatternMatched(function () {
				var oModel = this.getOwnerComponent().getModel("side");

			}, this);
		},

		handleApplicationPress: function () {
			this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("applicationlist");
		},
		handleRolesPress: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("roleMaster");
		},
		handleUserPress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("userMaster");
		},
		handleSuperAdminPress: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("organizationMaster");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf MDG.ApplicationManagement.view.Home
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.ApplicationManagement.view.Home
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.ApplicationManagement.view.Home
		 */
		//	onExit: function() {
		//
		//	}

	});

});