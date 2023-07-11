sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"MDG/ApplicationManagement/util/formatter"
], function (Controller, Fragment, JSONModel, MessageToast, MessageBox, Context, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.userDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.userDetail
		 */
		onInit: function () {
			var that = this;
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getOwnerComponent().getRouter().getRoute("userDetail").attachPatternMatched(function (oEvent) {
				that.id = oEvent.getParameter("arguments").id;
				that.mApplication();
				//Mohammad Sohail Now I am getting selected list item data which is sending from master page! 
				this.getSelectedData = new sap.ui.model.json.JSONModel(this.getView().getModel("selectedUserData").getData());
				// this.getSelectedData.getData().id = that.id;
				this.getView().setModel(this.getSelectedData);

				var data = new sap.ui.model.json.JSONModel(this.getView().getModel("modelData").getData());
				// this.getSelectedData.getData().id = that.id;
				this.getView().setModel(data, "newModel");

				//Mohammad Sohail Comment the code.

				// that.getView().setModel(this.getOwnerComponent().getModel("users"));
				// var usersModel = that.getOwnerComponent().getModel("users");
				// that.path = oEvent.getParameter("arguments").id;
				// var oContext = new Context(usersModel, "/" + that.path);
				// that.getView().setBindingContext(oContext);
				// that.users = oContext.getObject();

			}, this);
			if (!this.AdduserFragment) {
				this.AdduserFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.addNewUser", this);
				this.getView().addDependent(this.AdduserFragment);
			}

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

		onCloseDetailPress: function () {
			this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			this.getOwnerComponent().getRouter().navTo("userMaster");
		},

		handleDeleteUserPress: function () {
			var that = this;
			MessageBox.confirm("Confirm User Delete", {
				title: "Confirm Deletion",
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {
						/*----------------------------------------Integreation of Delete Role START--------------------------------------------*/
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/users/" + that.id,
							success: function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("RNI100" + resValue.id + " User Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									that.onCloseDetailPress();
								}
							}
						});
						/*----------------------------------------Integreation of Delete Role END--------------------------------------------*/

						// var oModel = that.getView().getModel();
						// var aUser = oModel.getData();

						// var itemIndex = parseInt(that.path, 10);
						// aUser.splice(itemIndex, 1);
						// oModel.updateBindings(true);
						// MessageToast.show("User Deleted sucessfully", {
						// 	closeOnBrowserNavigation: false
						// });
						// that.onCloseDetailPress();
					}
				}
			});
		},
		mApplication: function () {
			var that = this;
			$.get("/OptimalCog/api/m-applications?populate=*&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data), "ManageApplication");
				});
		},
		handleAddPagesAccess: function () {
			if (!this.AddappFragment) {

				this.AddappFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.applicationList", this);
				this.getView().addDependent(this.AddappFragment);
			}
			// var orgid = this.getView().getBindingContext().getObject().orgid;
			// var orgdata = this.getOwnerComponent().getModel("organisations").getData();
			// var appl;
			// for (var i = 0; i < orgdata.length; i++) {
			// 	if (orgdata[i].orgid === orgid) {
			// 		appl = orgdata[i].applications;
			// 		break;
			// 	}
			// }
			var appNameList = this.getView().getModel("ManageApplication").getData();

			var appModel = new sap.ui.model.json.JSONModel(appNameList);
			this.AddappFragment.setModel(appModel);

			// var appNameList = [];
			// for (var s = 0; s < oModel.length; s++) {
			// 	appNameList.push(oModel[s]);
			// }

			var pageacc = this.getView().getModel().getData().appPermission;
			// var pageacc = oModel.appPermission.length;
			for (var j = 0; j < pageacc.length; j++) {
				// if (appNameList.attributes.applicationID.includes(pageacc[j])) {
				for (var k = 0; k < appNameList.length; k++) {
					if (appNameList[k].attributes.applicationID == pageacc[j].applicationid) {
						this.AddappFragment.getItems()[k].setSelected(true);
					}
				}
				// }
			}
			this.AddappFragment.open();
			// this.getOwnerComponent().getModel("appsModel").updateBindings(true);
		},
		getAppPermissionFormat: function (valueHelpOrgData) {
			var appPermissionData = valueHelpOrgData.applications;

			var UserPermission = [];
			for (var j = 0; j < appPermissionData.length; j++) {
				var modifyData = {
					"applicationid": valueHelpOrgData.applications[j].attributes.applicationID,
					"name": valueHelpOrgData.applications[j].attributes.name,
					"create": true,
					"read": true,
					"update": true,
					"delete": true
				};
				UserPermission.push(modifyData);
			}
			return UserPermission
		},
		// handleAppListSearch:function(evt){
		//     		var filter1 = new sap.ui.model.Filter("application", "Contains", evt.getParameter("newValue"));
		// this.getView().byId("itemlistId").getBinding("items").filter(new sap.ui.model.Filter([filter1], false));

		handleAppListSearch: function (evt) {
			if (evt.getParameter("value").length > 0)
				var data = [new sap.ui.model.Filter("attributes/name", "Contains", evt.getParameter("value"))];
			else
				var data = [];
			this.AddappFragment.getBinding("items").filter(data);
		},
		handleEditUserPress: function (oEvent) {
			var userObj = this.getView().getModel().getData();
			var model = this.getView().getModel("newModel").getData();
			userObj.customerInfo = model.customerInfo;
			userObj.mroles = model.mroles;
			userObj.vendorInfo = model.vendorInfo;

			var oModel = new sap.ui.model.json.JSONModel(userObj);
			this.AdduserFragment.setModel(oModel);
			this.AdduserFragment.open();
		},
		formatDate: function (date) {
			var format = date.split("/");
			return format[2] + "-" + format[1] + "-" + format[0]
		},
		handleAddUserCancelPress: function () {
			this.AdduserFragment.close();
		},
		// handleAddUserOkPress: function () {
		// 	var userData = this.AdduserFragment.getModel();

		// 	if (userData.firstName || userData.firstName !== '' || userData.lastname ||
		// 		userData.lastname !== '' || userData.email || userData.email !== '' || userData.contact || userData.contact !=
		// 		userData.userRole || userData.userRole !== '' || userData.city || userData.city !== '' || userData.address ||
		// 		userData.address !== '' || userData.zipCode || userData.zipCode !== '')
		// 		MessageBox.error("Please Fill The Mandatory Fields", {});
		// 	else {
		// 		this.getView().getModel().updateBindings(true);
		// 		MessageToast.show("User updated successfully.", {
		// 			closeOnBrowserNavigation: false
		// 		});
		// 		this.AdduserFragment.close();
		// 	}
		// },
		handleAddUserOkPressddd: function () {
			var userData = this.AdduserFragment.getModel().getData();

			if (userData.firstName == '' || userData.lastname == '' || userData.email == '' || userData.contact == "" || userData.role == '' ||
				userData.city == "" ||
				userData.address == '' || userData.zipCode == '')
				MessageBox.error("Please Fill The Mandatory Fields", {});
			else {
				this.getView().getModel().updateBindings(true);
				MessageToast.show("User updated successfully.", {
					closeOnBrowserNavigation: false
				});
				this.AdduserFragment.close();
			}
		},
		handleAddUserOkPress: function () {
			var that = this;
			var content = this.AdduserFragment.getContent()[1].getContent();
			var oUserDetails = {
				"firstName": content[1].getValue(),
				"lastName": content[5].getValue(),
				"status": content[7].getSelectedKey(),
				"username": content[9].getValue(),
				"email": content[9].getValue(),
				"phone": content[11].getValue(),
				"role": 1,
				"mrole": [Number(content[19].getSelectedKey())],
				"city": content[13].getValue(),
				"streerAddress": content[15].getValue(),
				"country": content[17].getValue(),
				"type": content[23].getSelectedKey(),
				"area": content[21].getSelectedKey(),
				"serviceStartDate": content[29].getValue(),
				"serviceEndDate": content[31].getValue(),
				"blocked": false,
				"confirmed": true
			};
			var serviceDateANdEnd = true;
			if (oUserDetails.type === 'Customer') {
				oUserDetails.m_customer = [Number(content[25].getSelectedKey())];
				if (oUserDetails.serviceStartDate == "" && oUserDetails.serviceEndDate == "") {
					serviceDateANdEnd = false;
				}
			} else if (oUserDetails.type === 'Vendor') {
				oUserDetails.m_vendor = [Number(content[27].getSelectedKey())];
				if (oUserDetails.serviceStartDate == "" && oUserDetails.serviceEndDate == "") {
					serviceDateANdEnd = false;
				}
			} else {
				delete oUserDetails.serviceEndDate;
				delete oUserDetails.serviceStartDate;
			}
			if (oUserDetails.firstName != '' && oUserDetails.lastName != '' && oUserDetails.email != '' && oUserDetails.phone !=
				'' && oUserDetails.mrole.length != 0 && oUserDetails.city != '' && oUserDetails.address != '' && serviceDateANdEnd === true) {

				/*----------------------------------------Integreation of update User detail START--------------------------------------------*/

				for (var prop in oUserDetails) {
					var value = oUserDetails[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						if (Array.isArray(value) && value.length === 0) {
							oUserDetails[prop] = [];
						} else {
							delete oUserDetails[prop];
						}
					}
				}
				$.ajax({
					url: "/OptimalCog/api/users/" + that.id,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify(oUserDetails),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message);
						} else {
							MessageToast.show(getValues.username + " User Updated succesfuly.", {
								closeOnBrowserNavigation: false
							});
							that.onCloseDetailPress();
						}
					}
				});
				/*----------------------------------------Integreation of update User detail END--------------------------------------------*/
			} else {
				MessageBox.error("Please Fill The Mandatory Fields", {});

			}
		},

		handleConfirmAppList: function (evt) {
			var that = this;
			var selectedItems = evt.getParameter("selectedItems");
			var selectedApplication = [];
			for (var i = 0; i < selectedItems.length; i++) {
				var appPermision = selectedItems[i].getBindingContext().getObject();
				var modifyData = {
					"applicationid": appPermision.attributes.applicationID,
					"name": appPermision.attributes.name,
					"create": false,
					"read": true,
					"update": false,
					"delete": false
				};
				selectedApplication.push(modifyData);
			}
			$.ajax({
				url: "/OptimalCog/api/users/" + that.id,
				type: "PUT",
				headers: {
					"Content-Type": 'application/json'
				},
				data: JSON.stringify({
					"appPermission": selectedApplication
				}),
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message);
					} else {
						MessageToast.show(getValues.id + " Access assign for " + getValues.username + " succesfuly."); // Debug statement
						// that.closeAdduserFragment();
						// that.updateModel();
						that.onCloseDetailPress();
					}
				}
			});

		},
		handleAccessPressed: function (evt) {
			// var selectedAppsItems = evt.getSource().getBindingContext().getObject();
			var oItems = this.byId("pagesAccessId").getItems();
			var updatedApplication = [];
			for (var i = 0; i < oItems.length; i++) {
				var appPermision = oItems[i].getBindingContext().getObject();
				updatedApplication.push(appPermision);
			}
			$.ajax({
				url: "/OptimalCog/api/users/" + this.id,
				type: "PUT",
				headers: {
					"Content-Type": 'application/json'
				},
				data: JSON.stringify({
					"appPermission": updatedApplication
				}),
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message);
					} else {
						MessageToast.show("Updated succesfully."); // Debug statement
						// that.onCloseDetailPress();
					}
				}
			});
		},
		handleDeletePageAccess: function (evt) {
			var that = this;
			var oTable = this.byId("pagesAccessId");
			var selectedApps = oTable.getSelectedItems();
			if (selectedApps.length === 0) {
				MessageToast.show(this.oBundle.getText("SelectApp"));
				return;
			} else {
				var oItems = oTable.getItems();
				var updatePermission = [];
				var selectedItem = Number(selectedApps[0].getBindingContext().getPath().split("/")[2]);
				oItems.splice(selectedItem, 1);

				var updatedApplication = [];
				for (var i = 0; i < oItems.length; i++) {
					var appPermision = oItems[i].getBindingContext().getObject();
					updatedApplication.push(appPermision);
				}
				$.ajax({
					url: "/OptimalCog/api/users/" + this.id,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"appPermission": updatedApplication
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message);
						} else {
							MessageToast.show("Deleted succesfully."); // Debug statement
							that.getView().byId("pagesAccessId").removeSelections(true);
							that.onCloseDetailPress();
						}
					}
				});
			}

			// var assignedApps = this.getOwnerComponent().getModel("users").getData()[this.path].appPermission;
			// for (var i = 0; i < assignedApps.length; i++) {
			// 	for (var j = 0; j < selectedApps.length; j++) {
			// 		selectedApp = selectedApps[j].getBindingContext().getObject();
			// 		if (assignedApps[i].applicationid == selectedApp.applicationid) {
			// 			this.getOwnerComponent().getModel("users").getData()[this.path].appPermission.splice(i, 1);
			// 			break;
			// 		}
			// 	}
			// }
			// this.getView().getModel().updateBindings(true);
			// this.byId("pagesAccessId").removeSelections(true);
		},

		//Formatters

		getBooleanCondition: function (flag) {
			if (flag == true || flag == "true") return true;
			else if (flag == false || flag == "false") return false;
		},
		isAppAssigned: function (appId) {
			if (appId) {
				var assignedApps = this.getView().getBindingContext().getObject().assignedApps;
				var returnVal = false;
				for (var i = 0; i < assignedApps.length; i++) {
					if (assignedApps[i].appId == appId) {
						returnVal = true;
						break;
					}
				}
				return returnVal;
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf MDG.ApplicationManagement.view.userDetail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.ApplicationManagement.view.userDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.ApplicationManagement.view.userDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});