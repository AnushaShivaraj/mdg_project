sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("mdg.Org_Chart.controller.master", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mdg.Org_Chart.view.master
		 */
		onInit: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC",
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						that.getStatusOrgChart(getValues.data);
					}
				}
			});
		},
		//triggers on click of the inquiries in the list
		getStatusOrgChart: function (prgData) {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-org-charts?&populate=*",
				type: "GET",
				success: function (res) {
					var status = JSON.parse(res);
					if (status.error) {
						MessageBox.error(status.error.message + "Something went wrong!");
					} else {
						prgData.forEach(function (statusItem, index) {
							var orgChartitem = status.data[index];
							if (orgChartitem !== undefined) {
								if (orgChartitem.attributes.m_program.data) {
									if (statusItem.id === orgChartitem.attributes.m_program.data.id) {
										statusItem.attributes.status = orgChartitem.attributes.status
									} else {
										statusItem.attributes.status = "";
									}
								}
							} else {
								statusItem.attributes.status = "";
							}
						});
						that.getView().setModel(new sap.ui.model.json.JSONModel({
							"data": prgData
						}));
					}
				}
			});
		},
		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");
			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
				// oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
				//
			}

		},
		_showDetail: function (oItem) {
			var oModel = new sap.ui.model.json.JSONModel(oItem.getBindingContext().getObject());
			this.getOwnerComponent().setModel(oModel, "programDetails");
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				objectId: oItem.getBindingContext().getObject().id == undefined ? oItem.getBindingContext().getProperty("id") : oItem.getBindingContext()
					.getObject().id //oItem.getBindingContext().getProperty("_id")
			});
		},

		onOpenViewSettings: function (oEvent) {
			//	this.getAggregatedValuesForAuditType();
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = new sap.ui.xmlfragment("mdg.Org_Chart.fragment.viewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
			}
			var sDialogTab = "sort";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().sId;
				if (sButtonId.match("filter")) {
					sDialogTab = "filter";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			this._oViewSettingsDialog.open(sDialogTab);
		},
		onSearch: function (oEvent) {
			var that = this;
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery) {
				// var link = "/OptimalCog/api/m-programs?filters[id][$contains]=" + sQuery;
				var link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&filters[$or][0][id][$contains]=" + sQuery +
					"&filters[$or][1][name][$contains]=" + sQuery
			} else {
				link = "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC";
				// link = "/OptimalCog/api/m-programs?sort=id:ASC"
			}
			$.ajax({
				url: link,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					that.getStatusOrgChart(response.data);
				},
				error: function (res) {
					console.log(res);
				}
			});
		},
		onConfirmViewSettingsDialog: function (oEvent) {
			var that = this;
			// selected keydebugger

			var filterBy = oEvent.getParameter("filterCompoundKeys");
			var filterByValue = oEvent.getParameter("filterKeys");

			var oSortItem = oEvent.getParameter("sortItem");
			var bDescending = oEvent.getParameter("sortDescending"); // if the descending button is selected or not

			if (Object.keys(filterBy).length !== 0 && Object.keys(filterByValue).length !== 0) {
				if (oSortItem !== undefined) {
					oSortItem = oSortItem.getKey();
				} else {
					oSortItem = "id";
				}

				if (bDescending === false) {
					if (Object.keys(filterBy)[0] !== undefined && Object.keys(filterBy)[1] !== undefined) {
						var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
								"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
							"&filters[type][$contains]=" + Object.keys(filterByValue)[1] + "&sort=" + oSortItem + ":ASC";
					} else {
						if (Object.keys(filterBy)[0] === "status") {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":ASC";
						} else {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[type][$contains]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":ASC";
						}
					}
				} else {
					if (Object.keys(filterBy)[0] !== undefined && Object.keys(filterBy)[1] !== undefined) {
						var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
								"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
							"&filters[type][$contains]=" + Object.keys(filterByValue)[1] + "&sort=" + oSortItem + ":DESC";
					} else {
						if (Object.keys(filterBy)[0] === "status") {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":DESC";
						} else {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[type][$contains]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":DESC";
						}
					}
				}
				$.ajax({
					url: filterLink,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.getStatusOrgChart(response.data);
					},
					error: function (res) {
						console.log(res);
					}
				});
			}

			if (Object.keys(filterBy).length === 0 && Object.keys(filterByValue).length === 0) {
				if (oSortItem !== undefined) {
					oSortItem = oSortItem.getKey();
				} else {
					oSortItem = "id";
				}

				if (bDescending === false) {
					var link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&sort=" + oSortItem + ":ASC";
				} else {
					link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&sort=" + oSortItem + ":DESC";
				}
				$.ajax({
					url: link,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.getStatusOrgChart(response.data);
					},
					error: function (res) {
						console.log(res);
					}
				});
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf mdg.Org_Chart.view.master
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf mdg.Org_Chart.view.master
		 */
		onAfterRendering: function () {
			this.getView().setBusy(false);
		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf mdg.Org_Chart.view.master
		 */
		//	onExit: function() {
		//
		//	}

	});

});