// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ],
//     /**
//      * @param {typeof sap.ui.core.mvc.Controller} Controller
//      */
//     function (Controller) {
//         "use strict";

//         return Controller.extend("mdg_raci.RACI.controller.master", {
//             onInit: function () {

//             }
//         });
//     });
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("mdg_raci.RACI.controller.master", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mdg_raci.RACI.view.master
		 */
		onInit: function () {
			// var ProjectModel = this.getOwnerComponent().getModel("projectInfo");
			// this.getView().setModel(ProjectModel);
			// this.handleRaci();
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			// if (this.getOwnerComponent().getRouter().getRoute("master") !== undefined) {
			// 	this.getOwnerComponent().getRouter().getRoute("").attachPatternMatched(function (oEvent) {
			// 		this.handleRaci();
			// 	}, this);
			// }
			var userData = this.getOwnerComponent().getModel("loggedOnUserModel").getData();
			console.log(userData);
			this.handleRaci();
		},
		handleRaci: function () {
			var that = this;

			$.ajax({
				url: "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC",

				//	url: "/OptimalCog/api/m-programs?populate[0]=mracis&populate[1]=m_projects",

				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						var mModel = new sap.ui.model.json.JSONModel(getValues.data);
						that.getView().setModel(mModel, "Details");

					}
				}
			});
		},
		//triggers on click of the inquiries in the list
		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");
			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}

		},
		_showDetail: function (oItem) {
			// this.getOwnerComponent().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.navTo("detail", {
			// 	objectId: oItem.getBindingContext().getObject().id
			// });
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				//objectId: oItem.getBindingContext().getObject().id,
				objectId: oItem.getBindingContext("Details").getObject().id
			});
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("newValue");
			// var aFilter = [];
			// var oBinding = this.getView().byId("list").getBinding("items");
			if (sQuery !== "" && sQuery !== undefined) {

				var value = "/OptimalCog/api/m-programs?&populate=*&filters[$or][0][id][$contains]=" + sQuery +
					"&filters[$or][1][name][$contains]=" + sQuery + "&filters[$or][2][status][$contains]=" + sQuery

			} else {

				value = "/OptimalCog/api/m-programs?&populate=*"
			}
			var that = this;
			$.ajax({
				url: value,
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						var oModel = new sap.ui.model.json.JSONModel(getValues.data);
						that.getView().setModel(oModel);
						that.getView().getModel().updateBindings(true);
						that.getView().setModel(oModel, "Details");
					}
				}
			});
		},
		onOpenViewSettings: function (oEvent) {
			//	this.getAggregatedValuesForAuditType();
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = new sap.ui.xmlfragment("mdg_raci.RACI.fragment.viewSettingsDialog", this);
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
		onConfirmViewSettingsDialog: function (oEvent) {
			var filters = [];
			//to get Archived Data send ZERO(0) in Parameter
			this.filterforarchive(0);
			this._oList = this.getView().byId("list");
			this._oList.getBinding("items").filter([], "Application");
			if (oEvent.getParameters().filterItems.length > 0) {
				for (var a = 0; a < oEvent.getParameters().filterItems.length; a++) {
					filters.push(new sap.ui.model.Filter(oEvent.getParameters().filterItems[a].getParent().getKey(), "Contains", oEvent.getParameters()
						.filterItems[a].getKey()));
				}
				filters = filters.length == 1 ? filters : new sap.ui.model.Filter(filters, true);
				this._oList.getBinding("items").filter(filters, "Application");
			} else {
				this._oList.getBinding("items").filter([], "Application");
				//to get Not-Archived Data send ONE(1) in Parameter
				this.filterforarchive(1);
			}
			this._applySortGroup(oEvent);
		},

		filterforarchive: function (i) {

			var sQuery = "";
			if (i == 1) {
				sQuery = "Archived";
			}
			var aFilter = [];
			var oBinding = this.getView().byId("list").getBinding("items");
			if (sQuery) {
				var Status = new Filter("attributes/status", FilterOperator.NotContains, sQuery);

				var deafultFilters = [Status];
				aFilter = new Filter(deafultFilters, false);
				oBinding.filter(aFilter);
			} else {
				//Set empty filter array if no query found, in order to show the complete list of assessments
				oBinding.filter(new Filter(aFilter, true));
			}
		},
		_applySortGroup: function (oEvent) {
			this._oList.getBinding("items").sort([]);
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				var vGroup = this._oGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

	});

});