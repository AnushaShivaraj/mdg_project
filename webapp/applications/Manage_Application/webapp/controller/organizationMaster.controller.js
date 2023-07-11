sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"MDG/ApplicationManagement/util/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat"
], function (Controller, formatter, Filter, FilterOperator, MessageToast, MessageBox, JSONModel, DateFormat) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.organizationMaster", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			this.getModelData(); //getting ORGanisationData
			this.getLicenseType(); //getting License Type data
			this.getApplicationInfo(); //getting Application info  Data
			this.getMRole(); //getting User Role Data

			if (!this.valueHelpForOrganization)
				this.valueHelpForOrganization = new sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.valueHelpForOrganization", this);
			this.getView().addDependent(this.valueHelpForOrganization);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("organizationMaster").attachPatternMatched(this._onObjectMatched, this);
			var oList = this.getView().byId("organizationList");
			//oList.getModel().updateBindings(true);
			//oList.getBinding("items").refresh(true);
			var oViewModel = this.getOwnerComponent().getModel("organisations");
			//	oList.setModel(oViewModel);
			this.getView().setModel(oViewModel);
		},
		_onObjectMatched: function (ev) {
			var dataUpdate = this.getOwnerComponent().getModel("refreshModel");
			if (dataUpdate !== undefined) {
				var data = dataUpdate.getData().value;
				if (data === true) {
					this.onInit();
					var oList = this.getView().byId("organizationList");
					oList.getModel().updateBindings(true);

				}
			}
		},
		getModelData: function () {
			var that = this;
			$.get("/OptimalCog/api/m-organisations?populate=*",
				function (res, respState) {
					var response = JSON.parse(res);
					console.log(response);
					that.idLength = response.data.length - 1;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "createdOrgId");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
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
					console.log(getLicenceType);
					var model = that.getView().getModel().getData().data;
					if (model === undefined) {
						that.getLicenseType();
					} else {
						model.licenceType = getLicenceType.data;
					}
				});
		},
		getMRole: function () {
			var that = this;
			$.get("/OptimalCog/api/mroles",
				function (ress, respState) {
					var getMroleType = JSON.parse(ress);
					console.log(getMroleType);
					var model = that.getView().getModel().getData().data;
					if (model === undefined) {
						that.getMRole();
					} else {
						model.MRoleData = getMroleType.data;
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
					var model = that.getView().getModel().getData().data;
					if (model === undefined) {
						that.getApplicationInfo();
					} else {
						model.app = getApplicationDetail.data;
					}
				});
		},
		handleOrganizationsListPress: function (oEvent) {
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
			this.id = oItem.getBindingContext().getPath().split("/")[2];
			var mModelData = this.getView().getModel().getData().data[this.id];
			mModelData.attributes.MRoleData = this.getView().getModel().getData().data.MRoleData;
			this.getOwnerComponent().setModel(mModelData, "selectedModelData");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("organizationDetail", {
				objectId: that.id
			});
		},
		onNavBack: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");
		},
		handleAddNewOrganization: function () {
			var organizationObj = {
				//Organization details with communication data
				"orgID": "",
				"name": "",
				"description": "",
				"orgEmail": "",
				"phone": "",
				"orgAddress": "",
				"allowedNoOfUsers": 0,
				"validfrom": "",
				"validto": "",
				"contactpersonfirstname": "",
				"contactpersonlastname": "",
				"contactpersonemail": "",
				"contactpersonphone": "",
				"licence_Type": "0",
				"applications": [],
				"licenceType": this.getView().getModel().getData().data.licenceType,
				"editable": true
			};
			var orgModel = new sap.ui.model.json.JSONModel(organizationObj);
			this.valueHelpForOrganization.setModel(orgModel);
			this.valueHelpForOrganization.open();
			// this.clearForm();
		},
		handleOrganizationCancel: function () {
			this.clearForm();
			this.valueHelpForOrganization.close();

		},

		handleOrganizationSave: function () {
			var that = this;
			if (this.handleValidationsForOrganization()) {
				//	if (that = this) {
				var organizationObj = this.valueHelpForOrganization.getModel().getData();
				//this.getOwnerComponent().getModel("organisations").getData().push(organizationObj);
				var orgID = 'ORG' + 10001 + parseInt(that.idLength + 1);
				//mapping selected Applications
				var mappId = organizationObj.applications;
				var ids = mappId.map(function (obj) {
					return obj.id;
				});
				var creatOrgPayload = {
					"orgID": orgID,
					"name": organizationObj.name,
					"description": organizationObj.description,
					"email": organizationObj.orgEmail,
					"phone": organizationObj.phone,
					"address": organizationObj.orgAddress,
					"allowedNoOfUsers": organizationObj.allowedNoOfUsers,
					"validFrom": organizationObj.validfrom,
					"validTo": organizationObj.validto,
					"m_license_type": [
						parseInt(organizationObj.licence_Type)
					],
					"m_applications": ids
				};
				/*----------------------------------------Integreation of Add New Organization START--------------------------------------------*/
				$.ajaxSetup({
					headers: {
						'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
					}
				});
				$.post("/OptimalCog/api/m-organisations", {
						"data": creatOrgPayload
					},
					function (response) {
						var resValue = JSON.parse(response);
						console.log(resValue.error);
						debugger;
						if (resValue.error) {
							MessageBox.error(resValue.error.message);
						} else {
							that.getView().setBusy(true);
							MessageToast.show(resValue.data.attributes.orgID + " Created Successfully!");
							that.createmRole(resValue.data.id);
						}
					});

				/*----------------------------------------Integreation of Add New Organization END--------------------------------------------*/
			} else {
				sap.m.MessageBox.error("Please fill the mandatory fields!");
			}
		},
		createmRole: function (orgIdValue) {
			var that = this;
			var a = that.idLength;
			var b = 1;
			var c = a + b;
			that.newroleinfo = {
				"roleID": "GFI10001" + c,
				"roleName": "Admin",
				"description": "Admin Activity",
				"m_organisation": [orgIdValue],
				"roleType": "Solution Role",
			};
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
					"data": that.newroleinfo
				},
				success: function (response) {
					var resValue = JSON.parse(response);
					debugger
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						that.createUser(resValue.data.id, that.newroleinfo.m_organisation);
					}
				}

			});
			/*----------------------------------------------CREATE A NEW ROLE END----------------------------------------------*/

		},

		createUser: function (receiveRoleId, receiveOrgId) {
			var that = this;
			var mRolesUserData = that.getView().getModel().getData().data.MRoleData;
			var valueHelpOrgData = that.valueHelpForOrganization.getModel().getData();
			debugger
			var data = that.getAppPermissionFormat(valueHelpOrgData);

			that.createUserData = {
				// "userID": 'RNI' + 1000 + parseInt(mRolesUserData.length + 1),
				"firstName": valueHelpOrgData.contactpersonfirstname,
				"username": valueHelpOrgData.contactpersonemail,
				"blocked": false,
				"lastName": valueHelpOrgData.contactpersonlastname,
				"phone": valueHelpOrgData.contactpersonphone,
				"email": valueHelpOrgData.contactpersonemail,
				"confirmed": true,
				"password": "Vaspp@123",
				"role": 1,
				"mrole": [receiveRoleId],
				"m_organisation": receiveOrgId,
				"appPermission": data
			};
			/*----------------------------------------Integreation of User Details START--------------------------------------------*/
			$.ajax({
				url: "/OptimalCog/api/users",
				type: "POST",
				headers: {
					"Content-Type": 'application/json',
					'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
				},
				data: JSON.stringify(that.createUserData),
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "User is not created Something went wrong!");
					} else {
						that.usersPermission(getValues.id, 	that.createUserData.m_organisation[0]);
					}
				}
			});
			/*----------------------------------------Integreation of User Details END--------------------------------------------*/
		},
		usersPermission: function (userId, orgId) {
			var that = this;
			var theUserId = {
				"users_permissions_user": [userId]
			}
			$.ajax({
				url: "/OptimalCog/api/m-organisations/" + orgId,
				type: "PUT",
				headers: {
					"Content-Type": 'application/json'
				},
				data: JSON.stringify({
					"data": theUserId
				}),
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "User is not created Something went wrong!");
					} else {
						that.onInit();
						that.handleOrganizationCancel();
						that.getView().setBusy(false);
					}
				}
			});
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
		handleValidationsForOrganization: function () {
			var contentIndex = [2, 4, 7, 9, 11, 16, 18, 20, 23, 25, 27, 29];
			var communicationPhone = this.valueHelpForOrganization.getContent()[0].getContent()[7].getValueState();
			var CommunicationEmail = this.valueHelpForOrganization.getContent()[0].getContent()[9].getValueState();
			var AdminEmail = this.valueHelpForOrganization.getContent()[0].getContent()[27].getValueState();
			var AdminPhone = this.valueHelpForOrganization.getContent()[0].getContent()[29].getValueState();
			var validationFlag = true;
			for (var i = 0; i < contentIndex.length; i++) {
				if (this.valueHelpForOrganization.getContent()[0].getContent()[contentIndex[i]].getValue().length == 0) {
					validationFlag = false;
					break;
				}
			}
			if (communicationPhone == "Error" || CommunicationEmail == "Error" || AdminEmail == "Error" || AdminPhone == "Error") {
				validationFlag = false;
			}
			if (this.valueHelpForOrganization.getContent()[0].getContent()[14].getSelectedKey().length == 0)
				validationFlag = false;
			return validationFlag;
		},
		clearForm: function () {

			this.valueHelpForOrganization.getContent()[0].getContent()[2].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[4].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[7].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[9].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[11].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[16].setDateValue();
			this.valueHelpForOrganization.getContent()[0].getContent()[18].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[20].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[23].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[25].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[27].setValue("");
			this.valueHelpForOrganization.getContent()[0].getContent()[29].setValue("");
		},
		handleDateRange: function (evt) {
			var selTime = evt.getSource().mProperties.value;
			var date1 = evt.getSource().getDateValue();
			var date2 = evt.getSource().getSecondDateValue();
			var diffTime = Math.abs(date2.getTime() - date1.getTime());
			var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			this.valueHelpForOrganization.getContent()[0].getContent()[16].setValue(selTime);
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
			//this.valueHelpForOrganization.getModel().updateBindings(true);
		},

		handleApplicationValueHelp: function (evt) {
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
			this.getView().getModel().updateBindings(true);
		},

		handleInputTokenDeleted: function (evt) {
			var sType = evt.getParameter("type");
			if (sType === "removed") {
				var sKey = evt.getParameter("removedTokens")[0].getProperty("key");
				var oModel = evt.getParameter("removedTokens")[0].getBindingContext().getModel();
				var aData = evt.getParameter("removedTokens")[0].getBindingContext().getModel().oData.applications;
				for (var i = 0, len = aData.length; i < len; i++) {
					var idx;

					if (aData[i].name === sKey) {
						idx = i;
					}
				}
				aData.splice(idx, 1);
				evt.getParameter("removedTokens")[0].getBindingContext().getModel().updateBindings();

			}
			// var appPath = evt.getParameter("removedTokens")[0].getBindingContext().sPath.split("/")[2];
			// evt.getParameter("removedTokens")[0].getBindingContext().getModel().oData.application.splice(appPath, 1);
		},

		handleConfirmAppList: function (evt) {
			var that = this;
			this.appObject = [];
			evt.getParameter("selectedItems").forEach(function (obj) {
				that.appObject.push(obj.getBindingContext().getProperty());
			});
			// for (var i = 0; i < this.appObject.length; i++) {
			// 	this.appObject[i].createdate = new Date().toString().split(' ').splice(1, 3).join(' ');
			// 	this.appObject[i].modifydate = new Date().toString().split(' ').splice(1, 3).join(' ');
			// }
			this.valueHelpForOrganization.getModel().getData()["applications"] = this.appObject;
			this.valueHelpForOrganization.getModel().updateBindings();
			//this.getView().getModel().updateBindings(true);

		},
		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("newValue");
			var aFilter = [];
			var oBinding = this.getView().byId("organizationList").getBinding("items");
			if (sQuery) {
				var fltrtype = new Filter("attributes/name", FilterOperator.Contains, sQuery);
				var fltrdesc = new Filter("attributes/description", FilterOperator.Contains, sQuery);
				var deafultFilters = [fltrtype, fltrdesc];
				aFilter = new Filter(deafultFilters, false);
				oBinding.filter(aFilter);
			} else {
				oBinding.filter(new Filter(aFilter, true));
			}
		},
		handleValidateOrganizationInputFieldsm: function (evt) {
			var regex = evt.getSource().getValue();
			var regex = regex = /\(?\+?\(?[0-9]{2}\)?[ ()]?([- ()]?\d[- ()]?){8,25}/;
			if (regex.test(evt.getSource().getValue()) === false) {
				evt.getSource().setValueState("Error");
				if (evt.getSource().getValue().length) {
					// MessageToast.show(this.oBundle.getText("invalidEntryMsgEmail"));
				} else {
					evt.getSource().setValueState("None");
				}
			} else {
				evt.getSource().setValueState("None");
			}
		},
		handleValidateOrganizationInputFieldse: function (evt) {
			var regex = evt.getSource().getValue();
			var regex = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
			if (regex.test(evt.getSource().getValue()) === false) {
				evt.getSource().setValueState("Error");
				if (evt.getSource().getValue().length) {
					// MessageToast.show(this.oBundle.getText("invalidEntryMsgEmail"));
				} else {
					evt.getSource().setValueState("None");
				}
			} else {
				evt.getSource().setValueState("None");
			}
		},
		handleAppListSearch: function (evt) {
				var that = this;
				var searchValue = evt.getParameter("value");
				if (searchValue.length > 0)
					this.AddappFragment.getBinding("items").filter(new sap.ui.model.Filter("name", "Contains", searchValue));
				else
					this.AddappFragment.getBinding("items").filter([]);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationMaster
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationMaster
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.ApplicationManagement.applications.ApplicationManagement.view.organizationMaster
		 */
		//	onExit: function() {
		//
		//	}

	});

});