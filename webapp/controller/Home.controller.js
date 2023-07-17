sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/ui/core/ComponentContainer",
	"VASPP/MDGSystem/util/formatter",
], function (Controller, MessageToast, Dialog, Button, ButtonType, List, StandardListItem, Text, ComponentContainer, formatter) {
	"use strict";

	return Controller.extend("VASPP.MDGSystem.controller.Home", {
		formatter: formatter,
		onInit: function () {
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			var userData = JSON.parse(window.localStorage.getItem("loggedOnUserData"));

			if (userData && userData.autoLoggedOn) {
				this.byId("idVBox").removeStyleClass("slideDownAnimation");
			}
		},

		onAfterRendering: function () {
			var that = this;
			setTimeout(function () {
				that.byId("idVBox").removeStyleClass("slideDownAnimation");
			}, 5000);

		},

		sayTryLater: function () {
			MessageToast.show(this.oResourceBundle.getText("tryLater"));
		},
		displayAppList: function (evt) {
			var that = this;
			var AppList = [];

			this.navModelData = this.getOwnerComponent().getModel("navigationList").getData();
			if (!this.ApplicationPopover) {
				this.ApplicationPopover = new sap.ui.xmlfragment("VASPP.MDGSystem.fragment.AppListPopover", this);
				this.ApplicationPopover.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			}
			var tileId = evt.getSource().getParent().getParent().getId();
			switch (true) {
			case tileId.includes("OCog"):
				AppList.push({
					title: "User Management",
					id: "APP10005",
					key: "UsersManagement",
					componentName: "MDG.ApplicationManagement",
					"permittedRoles": ["superadmin", "administrator"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				}, {
					title: "Manage Resource Network",
					id: "APP10008",
					key: "org_chart",
					componentName: "mdg.Org_Chart",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				}, {
					title: "Manage RACI",
					id: "APP10009",
					key: "RACI",
					componentName: "mdg_raci.RACI",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				});
				break;
			case tileId.includes("TCog"):
				break;
			case tileId.includes("MCog"):
				AppList.push({
					title: "Manage Template",
					id: "APP10010",
					key: "Forms",
					componentName: "EHS.ManageAssessmentTemplates",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				}, {
					title: "Manage Event",
					id: "APP10011",
					key: "Calendar",
					componentName: "MDG.Planning_Calendar",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				});
				break;
			case tileId.includes("PCog"):
				AppList.push({
					title: "Manage Process",
					id: "APP10001",
					key: "Manage Programs",
					componentName: "MDG.Program",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				});
				break;
			case tileId.includes("ICog"):
				AppList.push({
					title: "Manage Glossary",
					id: "APP10007",
					key: "Glossary",
					componentName: "MDG.glossary",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				});
				break;
			case tileId.includes("ACog"):
				AppList.push({
					title: "Manage Customer",
					id: "APP10002",
					key: "Manage Customers",
					componentName: "MDG.Customer",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				}, {
					title: "Manage Vendor",
					id: "APP10003",
					key: "Manage Vendors",
					componentName: "MDG.Vendor",
					"permittedRoles": ["manager", "technici"],
					"permissions": {
						"create": false,
						"read": true,
						"update": false,
						"delete": false
					}
				});
				break;
			}

			this.ApplicationPopover.setModel(new sap.ui.model.json.JSONModel(AppList));
			this.ApplicationPopover.openBy(evt.getSource());
		},
		onPressApplication: function (oEvent) {
			var that = this,
				selectedItem = oEvent.getSource(),
				selectedItemObj = selectedItem.getBindingContext().getObject(),
				componentName = selectedItemObj.componentName,
				selectedItemKey = selectedItemObj.key;
			var logOnAppInfo = {
				componentName: selectedItemObj.componentName,
				selectedItemKey: selectedItemObj.key
			};
			var oModel = new sap.ui.model.json.JSONModel(logOnAppInfo);
			sap.ui.getCore().setModel(oModel, "logOnAppInfo");
			//that.glowControl("logo", true);

			if (this.getView().getParent().getParent().getSideExpanded()) {
				this.getView().getParent().getParent().setSideExpanded(false);
				// that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("expandMenu"));
			}

			var appComponentContainer;
			if (selectedItemObj.appUrl) {
				// var appUrl = window.location.origin + "\/" + selectedItemObj.projectName;
				appComponentContainer = new ComponentContainer({
					url: selectedItemObj.appUrl,
					height: "100%",
					name: componentName,
					propagateModel: true
				});
			} else {
				appComponentContainer = new ComponentContainer({
					height: "100%",
					name: componentName,
					propagateModel: true
				});
			}
			var aMainContents = this.getView().getParent().getParent().getMainContents();
			if (aMainContents.length === 2)
				this.getView().getParent().getParent().removeMainContent(1);
			aMainContents[0].setVisible(false);
			this.getView().getParent().getParent().addMainContent(appComponentContainer);

			appComponentContainer.attachComponentCreated(function () {
				// MessageToast.show("Component Created!");
				//that.glowControl("logo", false);
			});
			appComponentContainer.attachComponentFailed(function () {
				//	that.glowControl("logo", false);
				// MessageToast.show("Failed to load the application");
				console.error("Failed to load the application from the component " + componentName);
			});

		}

	});
});