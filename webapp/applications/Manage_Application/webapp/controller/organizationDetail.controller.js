sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"MDG/ApplicationManagement/util/formatter",
	"sap/ui/core/format/DateFormat"
], function (Controller, MessageToast, MessageBox, formatter, DateFormat) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.organizationDetail", {
		formatter: formatter,
		onInit: function () {
			if (!this.valueHelpForOrganization)
				this.valueHelpForOrganization = new sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.valueHelpForOrganization", this);
			this.getView().addDependent(this.valueHelpForOrganization);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("organizationDetail").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			var Path = oEvent.getParameter("arguments").objectId;
			this.Path = Path;
			that.getModelData();
			that.getModel = this.getView().getModel("selectedModelData");
			//var data = getModel.attributes;
			//	this.getView().setModel(new sap.ui.model.json.JSONModel(getModel));

			// var CustomerData = this.getView().getModel("organisations");
			// this.getView().setModel(this.getOwnerComponent().getModel("organisations"));
			// this.context = new sap.ui.model.Context(this.getOwnerComponent().getModel("organisations"), "/" + Path);
			// this.getView().setBindingContext(this.context);
			// this.org = this.getView().getModel("organisations").getData()[Path];
			// var users = this.getUsersDet(this.org.orgid);
			// var roles = this.getRolesDet(this.org.orgid);
			// //var usersModel = new sap.ui.model.json.JSONModel(users);
			// var rolesModel = new sap.ui.model.json.JSONModel(roles);
			// //this.getView().byId("usersTableId").setModel(usersModel);
			// this.getView().byId("rolesTableId").setModel(rolesModel);
		},
		/*-----------------------------------------Fetching the Data of other modules-----------------------------------------*/
		getModelData: function () {
			var that = this;
			$.get("/OptimalCog/api/m-organisations?populate=*",
				function (res, respState) {
					var response = JSON.parse(res);
					console.log(response);
					var userPermissionData = response.data[that.Path].attributes.users_permissions_user.data;
					if (typeof userPermissionData === "object") {
						response.data[that.Path].attributes.users_permissions_user.data = [response.data[that.Path].attributes.users_permissions_user.data];
						if (userPermissionData === null) {
							response.data[that.Path].attributes.users_permissions_user.data = [];
						}
					}
					//attr(vari=0; i<res.attributes)
					// that.idLength = response.data.length - 1;
					// var modelData = new sap.ui.model.json.JSONModel({
					// 	"id": that.idLength
					// });
					// that.getOwnerComponent().setModel(modelData, "createdOrgId");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data[that.Path].attributes));
					that.mainPath = response.data[that.Path].id;
					that.typeOflicense = response.data[that.Path].attributes.m_license_type.data.id;
					that.getView().setBusy(true);
					that.getLicenseType();
				});
		},
		getLicenseType: function () {
			var that = this;
			$.ajaxSetup({
				headers: {
					'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
				}
			});
			$.get("/OptimalCog/api/m-license-types",
				function (ress, respState) {
					var getLicenceType = JSON.parse(ress);
					var model = that.getView().getModel().getData();
					if (model === undefined) {
						that.getLicenseType();
					} else {
						model.licenceType = getLicenceType.data;
						var model = new sap.ui.model.json.JSONModel(getLicenceType.data);
						that.getView().setModel(model, "licenceDetails")
						that.getApplicationInfo();
					}
				});
		},
		getApplicationInfo: function () {
			var that = this;
			$.ajaxSetup({
				headers: {
					'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
				}
			});
			$.get("/OptimalCog/api/m-applications",
				function (ress, respState) {
					var getApplicationDetail = JSON.parse(ress);
					console.log(getApplicationDetail);
					var model = that.getView().getModel().getData();
					if (model === undefined) {
						that.getApplicationInfo();
					} else {
						model.data = {
							"app": getApplicationDetail.data
						};
						that.getView().setBusy(false);
					}
				});
		},
		getUsersDet: function (orgid) {
			var that = this;
			var userModel = new sap.ui.model.json.JSONModel("model/users.json");
			userModel.attachRequestCompleted(function () {
				var usersData = userModel.getData(),
					org_users = [];
				for (var i = 0; i < usersData.length; i++) {
					if (usersData[i].orgid === orgid) {
						org_users.push(usersData[i]);
					}
				}
				var usersModel = new sap.ui.model.json.JSONModel(org_users);
				that.getView().byId("usersTableId").setModel(usersModel);
			});
		},
		getRolesDet: function (orgid) {
			var rolesData = this.getOwnerComponent().getModel("roles").getData(),
				org_roles = [];
			for (var i = 0; i < rolesData.length; i++) {
				if (rolesData[i].orgid === orgid) {
					org_roles.push(rolesData[i]);
				}
			}
			return org_roles;
		},
		onCloseDetailPress: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			this.onInit();
			var refreshModel = new sap.ui.model.json.JSONModel({
				"value": true
			});
			this.getOwnerComponent().setModel(refreshModel, "refreshModel")
			this.getOwnerComponent().getRouter().navTo("organizationMaster");
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
		handleDeleteOrganizationPress: function (evt) {
			var that = this;
			this.appToDelete = evt.getSource().getBindingContext();
			sap.m.MessageBox.confirm(
				"Are you sure? the selected roles will be deleted.",
				function (oAction) {
					if (oAction == "OK") {

						/*----------------------------------------Integreation of Delete ORG START--------------------------------------------*/
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-organisations/" + that.getModel.id,
							success: function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show(resValue.data.attributes.orgID + " Deleted Successfully.", {
										closeOnBrowserNavigation: false
									});
									that.onCloseDetailPress();
									that.onInit();
								}
							}
						});

						/*----------------------------------------Integreation of Delete ORG END--------------------------------------------*/

						// //To remove user related to organization
						// var logOnOrgId = that.getOwnerComponent().getModel("organisations").getData()[parseInt(that.Path)].orgid;
						// var usersData = that.getOwnerComponent().getModel("users").getData();
						// for (var i = 0; i < usersData.length; i++) {
						// 	if (usersData[i].orgid == logOnOrgId) {
						// 		usersData.splice(i);
						// 	}
						// }
						// //To Remove Organization
						// that.getOwnerComponent().getModel("organisations").getData().splice(that.appToDelete.getPath().split("/")[1], 1);

						// that.getOwnerComponent().getModel("organisations").updateBindings(true);
					}

				});
		},
		getNoOfDays: function (startDate, endDate) {
			if (startDate, endDate) {
				startDate = new Date(startDate);
				endDate = new Date(endDate);
				var diffTime = Math.abs(endDate.getTime() - startDate.getTime());
				var diffD = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				return diffD;
			} else return "";

		},
		handleEditOrganizationPress: function (evt) {
			var that = this;
			this.getView().setBusy(true);
			var oView = this.getView().getModel().getData();
			if (evt.getSource().getText() === "Edit") {
				oView.editable = false;
			}
			//this.editPath = evt.getSource().getBindingContext().getPath().split("/")[2];
			var editAppObj = oView.name;
			var des = oView.description;
			var phone = oView.phone;
			var email = oView.email;
			var addr = oView.address;
			var startdate = oView.validFrom;
			var enddate = oView.validTo;
			var NoOfDays = that.getNoOfDays(startdate, enddate);
			var users = oView.allowedNoOfUsers;
			var firstName = oView.users_permissions_user.data[0].attributes.firstName;
			var lastName = oView.users_permissions_user.data[0].attributes.lastName;
			var Email = oView.users_permissions_user.data[0].attributes.email;
			var contactNo = oView.users_permissions_user.data[0].attributes.phone;
			this.valueHelpForOrganization.getContent()[0].getContent()[14].setSelectedKey(that.typeOflicense);
			this.valueHelpForOrganization.getContent()[0].getContent()[2].setValue(editAppObj);
			this.valueHelpForOrganization.getContent()[0].getContent()[4].setValue(des);
			this.valueHelpForOrganization.getContent()[0].getContent()[7].setValue(phone);
			this.valueHelpForOrganization.getContent()[0].getContent()[9].setValue(email);
			this.valueHelpForOrganization.getContent()[0].getContent()[11].setValue(addr);
			this.valueHelpForOrganization.getContent()[0].getContent()[18].setValue(NoOfDays);
			this.valueHelpForOrganization.getContent()[0].getContent()[20].setValue(users);
			this.valueHelpForOrganization.getContent()[0].getContent()[23].setValue(firstName);
			this.valueHelpForOrganization.getContent()[0].getContent()[25].setValue(lastName);
			this.valueHelpForOrganization.getContent()[0].getContent()[27].setValue(Email);
			this.valueHelpForOrganization.getContent()[0].getContent()[29].setValue(contactNo);
			this.valueHelpForOrganization.getContent()[0].getContent()[16].setValue(startdate + " - " + enddate);
			that.valueHelpForOrganization.getContent()[0].getContent()[32].removeAllTokens();
			oView.m_applications.data.forEach(function (item) {
				that.valueHelpForOrganization.getContent()[0].getContent()[32].addToken(new sap.m.Token({
					key: item.attributes.name,
					text: item.attributes.name
				}));
			});
			this.getView().setBusy(false);
			this.valueHelpForOrganization.open();
		},

		// handleEditOrganizationPress: function(evt){
		// 	var that = this;
		// 	var oView = this.getView();
		// 	this.editPath = evt.getSource().getBindingContext().getPath().split("/")[1];
		// 	this.valueHelpForOrganization.setModel(this.getOwnerComponent().getModel("organisations"));
		// 	this.valueHelpForOrganization.setBindingContext(this.context);
		// 	this.valueHelpForOrganization.open();
		// },
		handleOrganizationCancel: function () {
			this.valueHelpForOrganization.close();
		},
		handleOrganizationSave: function () {
			var that = this;
			if (this.handleValidationsForOrganization()) {
				var organizationObj = this.valueHelpForOrganization.getModel().getData();
				organizationObj.LicensePeriod = this.valueHelpForOrganization.getContent()[0].getContent()[18].getValue();
				organizationObj.LicenseType = this.valueHelpForOrganization.getContent()[0].getContent()[14].getSelectedKey();
				organizationObj.NoOfDays = this.valueHelpForOrganization.getContent()[0].getContent()[18].getValue();

				// this.getView().getModel().getData().m_applications.data.forEach(function (item) {
				// 	that.valueHelpForOrganization.getContent()[0].getContent()[32].getTokens(new sap.m.Token({
				// 		key: item.id,
				// 		text: item.attributes.name
				// 	}));
				// });

				organizationObj["startdate"] = this.valueHelpForOrganization.getContent()[0].getContent()[16].getValue().split(" - ")[0];
				organizationObj["enddate"] = this.valueHelpForOrganization.getContent()[0].getContent()[16].getValue().split(" - ")[1];
				// the Main path of ORGID = that.mainPath
				var mappId = organizationObj.m_applications.data;
				var getOnlyId = mappId.map(function (obj) {
					return obj.id;
				});
				that.orgData = {
					"name": organizationObj.name,
					"description": organizationObj.description,
					"email": organizationObj.orgEmail,
					"phone": organizationObj.phone,
					"address": organizationObj.orgAddress,
					"allowedNoOfUsers": organizationObj.allowedNoOfUsers,
					"validFrom": organizationObj.startdate,
					"validTo": organizationObj.enddate,
					"m_applications": getOnlyId,
					"m_license_type": [Number(organizationObj.licence_Type)]
				};
				for (var prop in that.orgData) {
					var value = that.orgData[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						if (Array.isArray(value)) {
							that.orgData[prop] = []; // Set empty arrays to []
						} else {
							delete that.orgData[prop];
						}
					}
				}
				debugger;
				// var currentUserRole = that.getView().getModel("loggedOnUserModel").getData().mrole.roleName;
				// var mRolesUserData = that.getOwnerComponent().getModel("selectedModelData").attributes.MRoleData;
				// //if the user is Super admin
				// if (currentUserRole !== "Super Admin") {
				// 	for (var i = 0; i < mRolesUserData.length; i++) {
				// 		if (currentUserRole === mRolesUserData[i].attributes.roleName) {
				// 			that.UpdateRoleData = [mRolesUserData[i].id];
				// 			break;
				// 		}
				// 	}
				// 	orgData.mroles = that.UpdateRoleData;
				// }
				/*----------------------------------------Integreation of update Organization detail START--------------------------------------------*/
				$.ajax({
					url: "/OptimalCog/api/m-organisations/" + that.mainPath,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": that.orgData
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "User is not created Something went wrong!");
						} else {
							MessageToast.show(getValues.data.attributes.orgID + " Organization details updated successfully!", {
								closeOnBrowserNavigation: false
							});
							that.valueHelpForOrganization.close();
							that.getView().setBusy(false);
							that.onCloseDetailPress();
						}
					}
				});
				// $.ajax({
				// 	type: "PUT",
				// 	url: "/OptimalCog/api/m-organisations/" + that.mainPath,
				// 	data: JSON.stringify({
				// 		"data": orgData
				// 	}),
				// 	success: function (res) {
				// 		that.getView().setBusy(true);
				// 		var resValue = JSON.parse(res);
				// 		debugger
				// 		if (resValue.error) {
				// 			MessageBox.error(resValue.error.message);
				// 		} else {
				// 			MessageToast.show(resValue.data.attributes.orgID + " Organization details updated successfully!");
				// 			that.valueHelpForOrganization.close();
				// 			that.getView().setBusy(false);
				// 			that.onCloseDetailPress();
				// 		}
				// 	}
				// });
				// //Application detail will update
				// var appPermissionFormat = that.getAppPermissionFormat(organizationObj);
				// var updateUserData = {
				// 	"firstName": organizationObj.contactpersonfirstname,
				// 	"lastName": organizationObj.contactpersonlastname,
				// 	"phone": organizationObj.contactpersonphone,
				// 	"email": organizationObj.contactpersonemail,
				// 	"confirmed": true,
				// 	"blocked": false,
				// 	"mrole": that.UpdateRoleData,
				// 	"appPermission": appPermissionFormat
				// };
				// /*----------------------------------------Integreation of User Details START--------------------------------------------*/
				// var mainUserid = organizationObj.users_permissions_user.data[0].id;
				// debugger
				// $.ajax({
				// 	url: "/OptimalCog/api/users/" + mainUserid,
				// 	type: "PUT",
				// 	data: {
				// 		"data": updateUserData
				// 	},
				// 	success: function (res) {
				// 		var getValues = JSON.parse(res);
				// 		console.log(getValues.error);
				// 		debugger;
				// 		if (getValues.error) {
				// 			MessageBox.error(getValues.error.message + "User is not Updated Something went wrong!");
				// 		} else {
				// 			console.log("User Updated Successfully")
				// 			that.valueHelpForOrganization.close();
				// 			that.getView().setBusy(false);
				// 			that.onCloseDetailPress();
				// 		}
				// 	}
				// });
				/*----------------------------------------Integreation of User Details END--------------------------------------------*/

				/*----------------------------------------Integreation of update Organization detail END--------------------------------------------*/

				// var userData = {
				// 	"id": 'USR' + 100 + this.getOwnerComponent().getModel("roles").getData().length + 1,
				// 	"firstName": organizationObj.contactpersonfirstname,
				// 	"lastname": organizationObj.contactpersonlastname,
				// 	"email": organizationObj.contactpersonemail,
				// 	"password": "Vaspp@123",
				// 	"contact": organizationObj.contactpersonphone,
				// 	"role": "Admin",
				// 	"city": "",
				// 	"address": "",
				// 	"zipCode": "",
				// 	"orgid": organizationObj.orgid,
				// 	"appPermission": [{
				// 		"applicationid": "APP10005",
				// 		"name": "User Management",
				// 		"create": true,
				// 		"read": true,
				// 		"update": true,
				// 		"delete": true,
				// 		"description": "Process flow of the doing CRUD operations on the User Management"
				// 	}],
				// 	"createDate": new Date().toLocaleDateString(),
				// 	"editDate": new Date().toLocaleDateString(),
				// 	"applications": organizationObj.applications
				// };
				// var userInfo = this.getOwnerComponent().getModel("users").getData();
				// for (var i = 0; i < userInfo.length; i++) {
				// 	if (userInfo[i].orgid === this.org.orgid) {
				// 		userInfo[i] = userData;
				// 		break;
				// 	}
				// }
				// // this.getView().getModel("roles").getData().superAdmin.splice(that.Path, 1, orgData);
				// // this.getView().getModel("roles").updateBindings(true);
				// this.getView().getModel().getData()[this.Path] = orgData;
				// this.getView().getModel().updateBindings(true);

				// this.valueHelpForOrganization.close();

			} else {
				sap.m.MessageBox.error("Please fill the mandatory fields!");

			}
		},
		getAppPermissionFormat: function (organizationObj) {
			var appPermissionData = organizationObj.m_applications;

			var UserPermission = [];
			for (var j = 0; j < appPermissionData.length; j++) {
				var modifyData = {
					"applicationid": appPermissionData.data[j].attributes.applicationID,
					"name": appPermissionData.data[j].attributes.name,
					"create": true,
					"read": true,
					"update": true,
					"delete": true
				};
				UserPermission.push(modifyData);
			}
			return UserPermission
		},
		handleValidationsForOrganization: function () {
			var contentIndex = [2, 4, 7, 9, 11, 16, 18, 20, 23, 25, 27, 29],
				validationFlag = true;
			for (var i = 0; i < contentIndex.length; i++) {
				if (this.valueHelpForOrganization.getContent()[0].getContent()[contentIndex[i]].getValue().length == 0) {
					validationFlag = false;
					break;
				}
			}
			if (this.valueHelpForOrganization.getContent()[0].getContent()[14].getSelectedKey().length == 0)
				validationFlag = false;
			return validationFlag;
		},
		handleApplicationValueHelp: function (evt) {
			debugger
			if (!this.AddappFragment) {

				this.AddappFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.applicationList1", this);
				this.getView().addDependent(this.AddappFragment);
			}
			var items = this.AddappFragment.getItems();
			var appList = [];
			for (var i = 0; i < items.length; i++) {
				appList.push(this.AddappFragment.getItems()[i].mProperties.title);
			}
			var tokens = this.valueHelpForOrganization.getContent()[0].getContent()[32].getTokens();

			for (var j = 0; j < tokens.length; j++) {
				var selectedToken = this.valueHelpForOrganization.getContent()[0].getContent()[32].getTokens()[j].mProperties.key;
				if (appList.includes(selectedToken)) {
					for (var k = 0; k < items.length; k++) {
						if (this.AddappFragment.getItems()[k].mProperties.title == selectedToken) {
							this.AddappFragment.getItems()[k].setSelected(true);
						}
					}
				}
			}

			this.AddappFragment.open();
			this.getOwnerComponent().getModel("applications").updateBindings(true);
		},

		handleInputTokenDeleted: function (evt) {
			var that = this;
			var sType = evt.getParameter("type");
			if (sType === "removed") {
				var sKey = evt.getParameter("removedTokens")[0].getProperty("key");
				//var oModel = evt.getParameter("removedTokens")[0].getBindingContext().getModel();
				var aData = this.getView().getModel().getData().m_applications.data;
				for (var i = 0, len = aData.length; i < len; i++) {
					var idx;

					if (aData[0].attributes.name === sKey) {
						idx = i;
					}
				}
				aData.splice(idx, 1);
				//evt.getParameter("removedTokens")[0].getBindingContext().getModel().updateBindings(true);
				that.valueHelpForOrganization.getModel().updateBindings();
			}
			// var appPath = evt.getParameter("removedTokens")[0].getBindingContext().sPath.split("/")[2];
			// evt.getParameter("removedTokens")[0].getBindingContext().getModel().oData.application.splice(appPath, 1);
		},
		handleDateRange: function (evt) {
			var date1 = evt.getSource().getDateValue();
			var date2 = evt.getSource().getSecondDateValue();
			var diffTime = Math.abs(date2.getTime() - date1.getTime());
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			this.valueHelpForOrganization.getContent()[0].getContent()[16].setValue(date1 + "-" + date2);
			this.valueHelpForOrganization.getContent()[0].getContent()[18].setValue(diffDays);

			// var dateOne = new Date(date1);
			// var dateTwo = new Date(date2);

			// var ddOne = String(dateOne.getDate()).padStart(2, "0");
			// var mmOne = String(dateOne.getMonth() + 1).padStart(2, "0"); //January is 0!
			// var yyyyOne = dateOne.getFullYear();

			// var ddTwo = String(dateTwo.getDate()).padStart(2, "0");
			// var mmTwo = String(dateTwo.getMonth() + 1).padStart(2, "0"); //January is 0!
			// var yyyyTwo = dateTwo.getFullYear();

			this.valueHelpForOrganization.getModel().oData.startdate = new Date(new Date(date1).toString().split('GMT')[0] + ' UTC').toISOString()
				.split('T')[0];
			this.valueHelpForOrganization.getModel().oData.enddate = new Date(new Date(date2).toString().split('GMT')[0] + ' UTC').toISOString()
				.split('T')[0];

			this.valueHelpForOrganization.getModel().oData.validfrom = new Date(new Date(date1).toString().split('GMT')[0] + ' UTC').toISOString()
				.split('T')[0];;
			this.valueHelpForOrganization.getModel().oData.validto = new Date(new Date(date2).toString().split('GMT')[0] + ' UTC').toISOString()
				.split('T')[0];

			this.valueHelpForOrganization.getModel().updateBindings(true);
		},

		handleConfirmAppList: function (evt) {
			var that = this;
			this.updateObject = [];
			evt.getParameter("selectedItems").forEach(function (obj) {
				that.updateObject.push(obj.getBindingContext().getProperty());
			});
			// for (var i = 0; i < this.appObject.length; i++) {
			// 	this.appObject[i].createdate = new Date().toString().split(' ').splice(1, 3).join(' ');
			// 	this.appObject[i].modifydate = new Date().toString().split(' ').splice(1, 3).join(' ');
			// }
			that.valueHelpForOrganization.getModel().getData()["applications"] = that.updateObject;
			that.valueHelpForOrganization.getModel().getData().m_applications.data = that.updateObject;
			that.valueHelpForOrganization.getModel().updateBindings();

		},
		handleAppListSearch: function (evt) {
				var that = this;
				var searchValue = evt.getParameter("value");
				if (searchValue.length > 0)
					this.AddappFragment.getBinding("items").filter(new sap.ui.model.Filter("attributes/name}", "Contains", searchValue));
				else
					this.AddappFragment.getBinding("items").filter([]);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationDetail
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});