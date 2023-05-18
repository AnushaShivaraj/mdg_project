sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"MDG/Help/utl/formatter",
], function (Controller, Fragment, formatter) {
	"use strict";

	return Controller.extend("MDG.Help.controller.Help", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-applications?&populate=*",
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						var oModel = new sap.ui.model.json.JSONModel(getValues.data);
						that.getView().setModel(oModel);
						that.handleAddGenericTile();

					}
				}
			});

		},
		handleAddGenericTile: function () {
			var that = this;
			that.oGrid = that.byId("grid2");
			var aData = that.getView().getModel().getData();
			aData.forEach(function (oData) {
				var oTile = new sap.m.GenericTile({
					header: oData.attributes.name,
					customData: new sap.ui.core.CustomData({
						key: oData.id,
					}),
					press: [that.press, that],
					tileContent: new sap.m.TileContent({
						footer: "Help/FAQ",
						content: new sap.m.NumericContent({
							value: oData.attributes.m_help_topics.data.length === 0 ? "0" : oData.attributes.m_help_topics.data.length,
							icon: that.handleIcon(oData.attributes.name),
							withMargin: true
						})
					})
				});
				that.oGrid.addItem(oTile);
			});
		},
		handleIcon: function (appName) {
			if (appName === "Project Management") {
				return "sap-icon://project-definition-triangle"
			} else if (appName === "Manage Process") {
				return "sap-icon://manager"
			} else if (appName === "Manage Customers") {
				return "sap-icon://customer"
			} else if (appName === "Manage Vendors") {
				return "sap-icon://supplier"
			} else if (appName === "User Management") {
				return "sap-icon://collaborate"
			} else if (appName === "Report") {
				return "sap-icon://expense-report"
			} else if (appName === "Glossary") {
				return "sap-icon://form"
			} else if (appName === "Organization Chart") {
				return "sap-icon://business-objects-experience"
			} else if (appName === "RACI") {
				return "sap-icon://activities"
			} else if (appName === "Forms") {
				return "sap-icon://manager-insight"
			} else if (appName === "Planning Calendar") {
				return "sap-icon://calendar"
			} else {
				return ""
			}
		},
		press: function (oEvent) {
			var tileIndex,
				tileIndex = oEvent.getSource().getCustomData()[0].getProperty("key");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Master", {
				id: tileIndex
			});

			this.getView().getModel("appView").setProperty("/tileIndex", tileIndex);
		}

	});

});