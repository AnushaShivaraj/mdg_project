sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"MDG/ApplicationManagement/util/formatter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox, formatter, DateFormat, Sorter) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.roleMaster", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.roleMaster
		 */
		onInit: function () {
			var that = this;
			that.updateRoleModel();
			if (!this.valueHelpForRoles)
				this.valueHelpForRoles = new sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.valueHelpForRoles", this);
			this.getView().addDependent(this.valueHelpForRoles);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("roleMaster").attachPatternMatched(function () {
				this.getView().getModel("appView").setProperty("/layout", "OneColumn");
				that.updateRoleModel();
				// var olist = this.getView().byId("roleList");
				// var oview = [];
				// var rolesData = this.getOwnerComponent().getModel("roles");
				// var logOnOrgId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
				// for (var i = 0; i < rolesData.getData().length; i++) {
				// 	if (rolesData.getData()[i].orgid == logOnOrgId) {
				// 		oview.push(rolesData.getData()[i]);
				// 	}
				// }
				// this.getOwnerComponent().getModel("roles").setData(oview);
				// olist.setModel(oview);
			}, this);
		},
		updateRoleModel: function () {
			var that = this;
			$.get("/OptimalCog/api/mroles?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData()
				.m_organisation.id +
				"&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.idLength = response.data.length - 1;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "createRoleModel");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				});
		},
		handleRolesListPress: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");
			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
		},
		_showDetail: function (oItem) {
			var that = this;
			this.selectedItem = oItem;
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			//this.id = oItem.getBindingContext().getObject().roleId;
			var selectedRow = oItem.getBindingContextPath().split("/")[2];
			var model = this.getView().getModel().getData().data;
			var selectedData = model[selectedRow]
			var jsonModel = new sap.ui.model.json.JSONModel(selectedData);
			this.getOwnerComponent().setModel(jsonModel, "selectedRoleData");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("roleDetail", {
				objectId: selectedData.id
			});
		},
		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("newValue");
			var aFilter = [];
			var oBinding = this.getView().byId("roleList").getBinding("items");
			if (sQuery) {
				var fltrtype = new Filter("attributes/roleName", FilterOperator.Contains, sQuery);
				var fltrdesc = new Filter("attributes/description", FilterOperator.Contains, sQuery);
				var deafultFilters = [fltrtype, fltrdesc];
				aFilter = new Filter(deafultFilters, false);
				oBinding.filter(aFilter);
			} else {
				oBinding.filter(new Filter(aFilter, true));
			}
		},
		handleAddNewRole: function () {
			this.valueHelpForRoles.open();
		},
		handleRolesFragmentCancel: function () {
			this.valueHelpForRoles.close();
		},
		handleRolesFragmentSave: function () {
			var that = this;
			var name = this.valueHelpForRoles.getContent()[0].getContent()[1].getValue();
			var des = this.valueHelpForRoles.getContent()[0].getContent()[3].getValue();
			var roleTyp = this.valueHelpForRoles.getContent()[0].getContent()[5].getSelectedKey();
			// if (roleTyp === "") {
			// 	roleTyp = "Functional role";
			// }
			var organizationId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;
			if (name.length > 0) {
				var newroleinfo = {
					"roleID": "GFI1000" + that.idLength,
					"roleName": name,
					"description": des,
					"roleType": roleTyp,
					"m_organisation": []
				};
				newroleinfo.m_organisation.push(organizationId);
				/*----------------------------------------------CREATE A NEW ROLE START----------------------------------------------*/
				$.ajaxSetup({
					headers: {
						'Authorization': "Bearer " + this.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
					}
				});
				$.ajax({
					type: "POST",
					url: "/OptimalCog/api/Mroles",
					data: {
						"data": newroleinfo
					},
					success: function (response) {
						var resValue = JSON.parse(response);
						console.log(resValue.error);
						if (resValue.error) {
							MessageBox.error(resValue.error.message);
						} else {
							MessageToast.show(resValue.data.attributes.roleID + " Role Created successfully", {
								closeOnBrowserNavigation: false
							});
							that.valueHelpForRoles.close();
							that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
							that.clearForm();
						}
					}
				});
				/*----------------------------------------------CREATE A NEW ROLE END----------------------------------------------*/

			} else {
				MessageBox.error(
					"Please fill the mandatory fields", {

					}
				);
			}

		},
		clearForm: function () {
			this.valueHelpForRoles.getContent()[0].getContent()[1].setValue("");
			this.valueHelpForRoles.getContent()[0].getContent()[3].setValue("");
			this.valueHelpForRoles.getContent()[0].getContent()[5].setSelectedKey(null);
		},
		onNavBack: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");
		},
		handleSortfragment: function () {
			if (!this.sortRoleFragment) {
				this.sortRoleFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.sortRoles", this);
			}

			this.sortRoleFragment.open();
		},
		// handleConfirm: function (oEvent) {
		// 	var oSortItem = oEvent.getParameter("sortItem");
		// 	var sColumnPath = "id";
		// 	var bDescending = oEvent.getParameter("sortDescending");
		// 	var aSorter = [];
		// 	if (oSortItem) {
		// 		sColumnPath = oSortItem.getKey();
		// 	}
		// 	aSorter.push(new Sorter(sColumnPath, bDescending));
		// 	var oList = this.getView().byId("roleList");
		// 	var oBinding = oList.getBinding("items");
		// 	oBinding.sort(aSorter);
		// }
		handleConfirm: function (oEvent) {
			var that = this;
			// selected key
			var oSortItem = oEvent.getParameter("sortItem");
			if (oSortItem !== undefined) {
				oSortItem = oSortItem.getKey();
			} else {
				oSortItem = "id";
			}
			var bDescending = oEvent.getParameter("sortDescending"); // if the descending button is selected or not

			if (bDescending === false) {
				var link = "/OptimalCog/api/mroles?populate=*&sort=" + oSortItem + ":ASC"
			} else {
				link = "/OptimalCog/api/mroles?populate=*&sort=" + oSortItem + ":DESC"
			}
			$.get(link,
				function (res, respState) {
					var response = JSON.parse(res);
					that.idLength = response.data.length - 1;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "createRoleModel");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				});

		}

	});

});