sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"MDG/ApplicationManagement/util/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/format/DateFormat"
], function (Controller, formatter, Fragment, MessageToast, MessageBox, DateFormat) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.roleDetail", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.roleDetail
		 */
		onInit: function () {
			if (!this.valueHelpForRoles)
				this.valueHelpForRoles = new sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.valueHelpForRoles", this);
			this.getView().addDependent(this.valueHelpForRoles);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("roleDetail").attachPatternMatched(this._onObjectMatched, this);

			// var logOnOrgId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
			// var filter1 = new sap.ui.model.Filter("orgid", "Contains", logOnOrgId);

			// this.getView().byId("PartiesTableId").getBinding("items").filter(new sap.ui.model.Filter([filter1], false));
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			that.id = oEvent.getParameter("arguments").objectId;
			that.getUsers(that.id);
			//Mohammad Sohail Now I am getting selected list item data which is sending from master page! 
			this.getSelectedData = new sap.ui.model.json.JSONModel(this.getView().getModel("selectedRoleData").getData().attributes);
			this.getSelectedData.getData().id = that.id;
			this.getView().setModel(this.getSelectedData);

			//Mohammad Sohail Comment the code.

			// this.getView().setModel(this.getOwnerComponent().getModel("roles"));
			// this.context = new sap.ui.model.Context(this.getOwnerComponent().getModel("roles"), "/" + this.Path);
			// this.getView().setBindingContext(this.context);
			// var role = this.getOwnerComponent().getModel("roles").getData()[this.Path].roleName;
			// var users = this.getUsers(role);
			// var usersModel = new sap.ui.model.json.JSONModel(users);
			// this.getView().byId("userIconTabFilter").setModel(usersModel);
			// var obj = oEvent.getParameters().arguments;
			// this.role = obj;
		},
		getUsers: function (roleId) {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/users?populate=*&filters[mrole][id][$eq]=" + roleId + "&sort=id:ASC",
				type: "GET",
				headers: {
					"Content-Type": 'application/json'
				},
				success: function (res) {
					var getValues = JSON.parse(res);
					console.log(getValues.error);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
					} else {
						var oModel = new sap.ui.model.json.JSONModel(getValues);
						that.getView().setModel(oModel, "userModel");
					}
				}
			});

		},
		onCloseDetailPress: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("rolesMaster");
		},
		fullScreen: function () {
			this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			this.byId("enterFullScreen").setVisible(false);
			this.byId("exitFullScreen").setVisible(true);
		},

		exitFullScreen: function () {
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.byId("exitFullScreen").setVisible(false);
			this.byId("enterFullScreen").setVisible(true);
		},

		handleEditRolePress: function (evt) {

			var oView = this.getView();
			//this.editPath = evt.getSource().getBindingContext().getPath().split("/")[2];
			this.model = oView.getModel().getData();

			this.valueHelpForRoles.getContent()[0].getContent()[1].setValue(this.model.roleName);
			this.valueHelpForRoles.getContent()[0].getContent()[3].setValue(this.model.description);
			this.valueHelpForRoles.getContent()[0].getContent()[5].setSelectedKey(this.model.roleType);
			this.valueHelpForRoles.open();
		},
		handleRolesFragmentCancel: function () {
			this.valueHelpForRoles.close();
		},
		handleRolesFragmentSave: function () {
			var that = this;
			var name = this.valueHelpForRoles.getContent()[0].getContent()[1].getValue();
			var des = this.valueHelpForRoles.getContent()[0].getContent()[3].getValue();
			var type = this.valueHelpForRoles.getContent()[0].getContent()[5].getSelectedKey();
			var updateRoleInfo = {
				"roleName": name,
				"Description": des,
				"roleType": type,
				// "created-At": new Date().toLocaleDateString(),
				// "lastChanged-At": new Date().toLocaleDateString()
			};

			/*----------------------------------------Integreation of update application detail START--------------------------------------------*/

			$.ajax({
				type: "PUT",
				url: "/OptimalCog/api/mroles/" + that.id,
				data: {
					"data": updateRoleInfo
				},
				success: function (res) {
					var resValue = JSON.parse(res);
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						MessageToast.show(resValue.data.attributes.roleID + " Application details updated successfully!", {
							closeOnBrowserNavigation: false
						});
						//MessageToast.show(resValue.data.attributes.roleID + " Application details updated successfully!"); // Debug statement
						// that.updateModel();
						// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						// oRouter.navTo("rolesMaster");
						that.onCloseDetailPress();
						that.valueHelpForRoles.close();
					}
				}
			});
			/*----------------------------------------Integreation of update application detail END--------------------------------------------*/

			// var selected = that.getOwnerComponent().getModel("roles").getData()[that.editPath].roleId;
			// this.role = selected;
			// this.getOwnerComponent().getModel("roles").getData().forEach(function (obj, index) {
			// 	if (obj.roleId == that.role) {
			// 		that.getOwnerComponent().getModel("roles").getData()[that.editPath] = newroleinfo;
			// 		that.getOwnerComponent().getModel("roles").updateBindings(true);
			// 		that.getView().byId("itb1").getModel("roles").updateBindings(true);
			// 	}
			// });

		},
		handleDeleteRolePress: function (evt) {
			var that = this;
			this.appToDelete = evt.getSource().getBindingContext();
			sap.m.MessageBox.confirm(
				"Are you sure? the selected roles will be deleted.",
				function (oAction) {
					if (oAction == "OK") {

						/*----------------------------------------Integreation of Delete Role START--------------------------------------------*/
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/Mroles/" + that.id,
							success: function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show(resValue.data.attributes.roleID + " Role Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									that.onCloseDetailPress();
								}
							}
						});

						/*----------------------------------------Integreation of Delete Role END--------------------------------------------*/

						// var oModel = that.getView().getModel();
						// var aUser = oModel.getData();

						// var itemIndex = parseInt(that.Path, 10);
						// aUser.splice(itemIndex, 1);
						// oModel.updateBindings(true);
						// // that.getOwnerComponent().getModel("roles").getData().roles.splice(that.appToDelete.getPath().split("/")[1], 1);
						// // that.getOwnerComponent().getModel("roles").updateBindings(true);
						// MessageToast.show("Deleted Successfully.", {
						// 	closeOnBrowserNavigation: false
						// });
						// that.onCloseDetailPress();
					}

				});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf MDG.ApplicationManagement.view.roleDetail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.ApplicationManagement.view.roleDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.ApplicationManagement.view.roleDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});