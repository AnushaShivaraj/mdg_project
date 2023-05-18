sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"MDG/ApplicationManagement/util/formatter",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Fragment, formatter, DateFormat, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.applicationlist", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.applicationlist
		 */
		onInit: function () {
			if (!this.valueHelpForApplication)
				this.valueHelpForApplication = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.valueHelpForApplication", this);
			this.getView().addDependent(this.valueHelpForApplication);
			if (!this.editApplication)
				this.editApplication = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.editApplication", this);
			this.getView().addDependent(this.editApplication);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("applicationlist").attachPatternMatched(function () {
				//	that.getView().getModel("appView").setProperty("/sideMenuVisible", true);
				// var oList = this.getView().byId("appTableId");
				// var oViewModel = this.getOwnerComponent().getModel("applications");
				// oList.setModel(oViewModel);
				// this.getView().setModel(oViewModel);
			}, this);
			this.updateModel();
		},
		updateModel: function () {
			var that = this;
			$.get("/OptimalCog/api/m-applications",
				function (res, respState) {
					var response = JSON.parse(res);
					that.idLength = response.data.length - 1;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "appId");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				});
		},
		handleAddApplication: function () {

			this.valueHelpForApplication.open();
		},
		handleApplicationCancel: function () {
			this.valueHelpForApplication.close();
		},
		handleApplicationSave: function () {
			var that = this;
			var oTable = this.getView().byId("appTableId");
			var oBinding = oTable.getBinding("items");
			var name = this.valueHelpForApplication.getContent()[0].getContent()[1].getValue();
			var des = this.valueHelpForApplication.getContent()[0].getContent()[3].getValue();
			var url = this.valueHelpForApplication.getContent()[0].getContent()[5].getValue();
			//var allValues = name + des + url;
			/*----------------------------------------Integreation of Add New Application START--------------------------------------------*/
			$.ajaxSetup({
				headers: {
					'Authorization': "Bearer " + this.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
				}
			});
			if (name.length > 0 && des.length > 0) {
				// Creating the JSON object for customer information
				var newCustInfo = {
					"applicationID": 'APP1001' + that.idLength,
					"name": name,
					"description": des,
					"url": url,
					"isArchived": false,
					"m_organisations": []
						//"createdate": new Date().toLocaleDateString(),
						//"modifydate": new Date().toLocaleDateString()

				};

				$.post("/OptimalCog/api/m-applications", {
						"data": newCustInfo
					},
					function (response) {
						var resValue = JSON.parse(response);
						if (resValue.error) {
							MessageBox.error(resValue.error.message);
						} else {
							MessageToast.show(resValue.data.attributes.applicationID + " Application details Add successfully");
							// MessageToast.show("Application added successfully!"); // Debug statement
							oBinding.refresh(true);
							that.updateModel();
							that.clearForm();
							that.valueHelpForApplication.close();
						}
					});

				/*----------------------------------------Integreation of Add New Application END--------------------------------------------*/

				// this.getOwnerComponent().getModel("applications").oData.push(newCustInfo);
				//this.getOwnerComponent().getModel("applications").updateBindings(true);

			} else {
				MessageBox.error(
					"Please Fill The Mandatory Fields", {

					}
				);
			}
		},
		clearForm: function () {
			this.valueHelpForApplication.getContent()[0].getContent()[1].setValue("");
			this.valueHelpForApplication.getContent()[0].getContent()[3].setValue("");
			this.valueHelpForApplication.getContent()[0].getContent()[5].setValue("");
		},
		handleEditAppPress: function (evt) {
			var oView = this.getView();
			this.editPath = evt.getSource().getBindingContext().getPath().split("/")[2];
			//var oTable = oView.byId("appTableId");
			this.model = this.getView().getModel().getData().data[this.editPath];

			var editName = this.model.attributes.name;
			var editDes = this.model.attributes.description;
			var editUrl = this.model.attributes.url;

			this.editApplication.getContent()[0].getContent()[1].setValue(editName);
			this.editApplication.getContent()[0].getContent()[3].setValue(editDes);
			this.editApplication.getContent()[0].getContent()[5].setValue(editUrl);

			this.editApplication.open();
		},
		handleApplicationSave1: function () {
			var oTable = this.getView().byId("appTableId");
			var oBinding = oTable.getBinding("items");

			var that = this;
			var name = this.editApplication.getContent()[0].getContent()[1].getValue();
			var des = this.editApplication.getContent()[0].getContent()[3].getValue();
			var url = this.editApplication.getContent()[0].getContent()[5].getValue();
			var updatedAppInfo = {
				"name": name,
				"description": des,
				"url": url
			};
			// that.getOwnerComponent().getModel("applications").getData()[this.editPath] = updatedCustInfo;
			// that.getOwnerComponent().getModel("applications").updateBindings(true);
			// this.getView().byId("txtUrl").getModel("aplications").updateBindings(true);
			// var model = new sap.ui.model.json.JSONModel(updatedCustInfo);
			// that.getView().setModel(model);

			/*----------------------------------------Integreation of update application detail START--------------------------------------------*/
			var mModel = this.model;

			$.ajax({
				type: "PUT",
				url: "/OptimalCog/api/m-applications/" + mModel.id,
				data: {
					"data": updatedAppInfo
				},
				success: function (res) {
					var resValue = JSON.parse(res);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						MessageToast.show(resValue.data.attributes.applicationID + " Application details updated successfully!"); // Debug statement
						oBinding.refresh(true);
						that.updateModel();
						that.editApplication.close();
						// that.clearform();
					}
				}
			});
			/*----------------------------------------Integreation of update application detail END--------------------------------------------*/
		},

		todayDate: function () {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MM/dd/YYYY"
			});
			return dateFormat.format(new Date());
		},
		handleAppSearch: function (evt) {
			var appName = new sap.ui.model.Filter("name", "Contains", evt.getParameter("newValue"));
			var appDesc = new sap.ui.model.Filter("description", "Contains", evt.getParameter("newValue"));
			var appDesc = new sap.ui.model.Filter("applicationid", "Contains", evt.getParameter("newValue"));
			// var appUrl = new sap.ui.model.Filter("link", "Contains", evt.getParameter("newValue"));
			var filterArr = new sap.ui.model.Filter([appName, appDesc], false);
			this.getView().byId("appTableId").getBinding("items").filter(filterArr);
		},
		// 	handleEditAppPress: function (evt) {
		// 	// this.editApp = true;
		// 	// this.editAppObj = evt.getSource().getBindingContext().getObject();
		// 	// this.valueHelpForApplication.setModel(new sap.ui.model.json.JSONModel(this.editAppObj));
		// 	// this.valueHelpForApplication.open();
		// 	this.editApplication.open();
		// 	this.fillForm();

		// },

		handleApplicationCancel1: function () {
			this.editApplication.close();
		},
		handleDeleteAppPress: function (evt) {
			var deletePath = evt.getSource().getBindingContext().getPath().split("/")[2];
			var that = this;
			this.appToDelete = evt.getSource().getBindingContext();

			sap.m.MessageBox.confirm(
				"Are you sure? the selected application will be deleted.",
				function (oAction) {
					if (oAction == "OK") {
						debugger;
						//var oTable = oView.byId("appTableId");
						var IndexModel = that.getView().getModel().getData().data[deletePath];

						/*----------------------------------------Integreation of Delete Customer START--------------------------------------------*/
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-applications/" + IndexModel.id,
							success: function (response) {
								var resValue = JSON.parse(response);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show(resValue.data.attributes.applicationID + " Application Deleted sucessfully");
									that.updateModel();
								}
							}
						});

						/*----------------------------------------Integreation of Delete Customer END--------------------------------------------*/

					}
				});
		},

		onNavBack: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");
		},

	});

});