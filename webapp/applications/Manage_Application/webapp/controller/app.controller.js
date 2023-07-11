sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/model/json/JSONModel',
	'sap/m/ResponsivePopover',
	'sap/m/MessagePopover',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/Link',
	'sap/m/Bar',
	'sap/ui/layout/VerticalLayout',
	'sap/m/NotificationListItem',
	'sap/m/MessagePopoverItem',
	'sap/ui/core/CustomData',
	'sap/m/MessageToast',
	'sap/ui/Device'
], function (Controller,
	Fragment,
	JSONModel,
	ResponsivePopover,
	MessagePopover,
	ActionSheet,
	Button,
	Link,
	Bar,
	VerticalLayout,
	NotificationListItem,
	MessagePopoverItem,
	CustomData,
	MessageToast,
	Device) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.app", {

		onInit: function () {
			var that = this;
			var oViewModel = new sap.ui.model.json.JSONModel({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				sideContent: this.getView().byId("sideNavigationList"),
				loginUserName: "",
				loginUserPassword: "",
				menuTabsVisibility: true,
				sideMenuVisible: false,
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
			this.getView().setModel(oViewModel, "appView");
			this.sideNavClose();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");

		},

		onSideNavButtonPress: function () {
			var oToolPage = this.getView().byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			oToolPage.setSideExpanded(!bSideExpanded);
		},
		sideNavClose: function () {
			var oToolPage = this.getView().byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			oToolPage.setSideExpanded(false);
		},
		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter('item');
			var sKey = oItem.getKey();
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			if (sKey === "home") {
				this.sideNavClose();
				this.getRouter().navTo("Home");
			} else if (sKey === "users") {
				var oRouter2 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter2.navTo("userMaster");
			} else if (sKey === "groups") {
				this.getRouter().navTo("groups");
			} else if (sKey === "roles") {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("roleMaster");
			} else if (sKey === "Super Admin") {
				this.getRouter().navTo("adminMaster");
			} else if (sKey === "Application") {
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter1.navTo("applicationlist");
			}
		},
	});
});