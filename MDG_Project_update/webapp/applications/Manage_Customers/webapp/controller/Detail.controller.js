sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"MDG/Customer/utl/formatter"

], function (Controller, Fragment, JSONModel, MessageToast, MessageBox, Context, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("MDG.Customer.controller.Detail", {
		formatter: formatter,
		onInit: function () {

			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var that = this;
			//giving button Visibility
			//FROM
			var usersData = that.getOwnerComponent().getModel("users").getData();
			var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;

			for (var i = 0; i < userPagePerm.length; i++) {
				if (userPagePerm[i].applicationid === 'APP10002') {
					this.appPagePerm = userPagePerm[i];
					break;
				}
			}
			this.getView().byId("deleteButtonId").setVisible(this.appPagePerm.delete);
			this.getView().byId("editButtonId").setVisible(this.appPagePerm.update);
			//TILL
			this.getOwnerComponent().getRouter().getRoute("CustDetail").attachPatternMatched(function (oEvent) {

				that.id = oEvent.getParameter("arguments").id;
				//Mohammad Sohail Now I am getting selected list item data which is sending from master page! 
				this.getSelectedData = new sap.ui.model.json.JSONModel(this.getView().getModel("selectedCustData").getData().attributes);
				this.getSelectedData.getData().id = parseInt(that.id);
				this.getView().setModel(this.getSelectedData);

				//Mohammad Sohail Comment the code.

				// var custModel = that.getOwnerComponent().getModel("customerInfo");
				// var custData = custModel.getData();
				// for (var c = 0; c < custData.length; c++) {
				// 	if (custData[c].id === that.id) {
				// 		that.path = c;
				// 		break;
				// 	}
				// }
				// this.getView().getModel("appView").oData.RequestIdSelected = this.path;
				// var oContext = new Context(custModel, "/" + that.path);
				// that.getView().setModel(new sap.ui.model.json.JSONModel(oContext.getObject()));

			}, this);
			if (!this.AddcustomerFragment) {
				this.AddcustomerFragment = sap.ui.xmlfragment("MDG.Customer.fragment.addNewCustomer", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddcustomerFragment);
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
			this.getOwnerComponent().getRouter().navTo("Master", {
				AddCust: "AddCust"
			});
		},
		onSearch: function (oEvent) {
			var value = oEvent.getParameter("newValue");
			var afilter = [];
			if (value !== "") {
				var sfilter = new sap.ui.model.Filter("attributes/name", sap.ui.model.FilterOperator.Contains, value);
				afilter.push(sfilter);

				var objects = this.getView().byId("UploadSet").getBinding("items");
				objects.filter(afilter);
			} else {
				// If the search value is empty, remove any existing filter
				this.getView().byId("UploadSet").getBinding("items").filter([]);
			}
		},
		handleDeleteUserPress: function () {
			var that = this;
			MessageBox.confirm("Confirm Customer Delete", {
				title: "Confirm Deletion",
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {

						/*----------------------------------------Integreation of Delete Customer START--------------------------------------------*/
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-customers/" + that.id,
							success: function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("Customer Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									that.onCloseDetailPress();
								}
							}
						});

						/*----------------------------------------Integreation of Delete Customer END--------------------------------------------*/

						// var oModel = that.getOwnerComponent().getModel("customerInfo");
						// var oModelData = oModel.getData();

						// //var oModel = that.getView().getModel();
						// //var aUser = oModel.getData();

						// var itemIndex = parseInt(that.path, 10);

						// oModelData.splice(itemIndex, 1);
						// oModel.updateBindings(true);
						// MessageToast.show("Customer Deleted sucessfully", {
						// 	closeOnBrowserNavigation: false
						// });
						// that.onCloseDetailPress();
					}
				}
			});
		},
		handleDocumentUpload: function () {
			if (!this.AddDocumentFragment) {

				this.AddDocumentFragment = sap.ui.xmlfragment("MDG.Customer.fragment.customerDocument", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddDocumentFragment);
			}
			var categoryTypeData = [{
				"category": "Minutes of Meeting"
			}, {
				"category": "Document"
			}, {
				"category": "Questionnaire"
			}, {
				"category": "Roadmap/Timeline"
			}, {
				"category": "Assessment"
			}, {
				"category": "Business Process"
			}, {
				"category": "Lean Specification"
			}, {
				"category": "Technical Specification"
			}, {
				"category": "IT Process"
			}];
			var categoryTypeModel = new sap.ui.model.json.JSONModel(categoryTypeData);
			this.AddDocumentFragment.getContent()[0].getContent()[3].setModel(categoryTypeModel);
			this.AddDocumentFragment.open();
			//         this.getOwnerComponent().getModel("appsModel").updateBindings(true);
		},
		// afterFragClose: function(oEvent){
		// 		oEvent.getSource().destroy();
		// 	},

		handleAppListSearch: function (evt) {
			if (evt.getParameter("value").length > 0)
				var data = [new sap.ui.model.Filter("application", "Contains", evt.getParameter("value"))];
			else
				var data = [];
			this.AddappFragment.getBinding("items").filter(data);

		},
		handleEditUserPress: function () {
			var userObj = this.getView().getModel().getData();
			// var userObj = this.getView().getBindingContext().getObject();
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent()[1].setValue(
				userObj.customerName);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent()[3].setValue(
				userObj.email);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent()[5].setValue(
				userObj.contact);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent()[7].setValue(
				userObj.address);
			// this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent()[9].setValue(userObj.customerName);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent()[1].setValue(
				userObj.contactPerson);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent()[3].setValue(
				userObj.contactEmail);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent()[5].setValue(
				userObj.contactPhone);
			// this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent()[7].setValue(
			// 	userObj.contactDesignation);

			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent()[1].setValue(
				userObj.keyword);
			this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent()[2].setValue(
				userObj.shortDescription);
			//this.addNewUser.getContent()[2].getContent()[9].setSelectedKey(userObj.roletype);
			this.AddcustomerFragment.open();

		},
		__handleEditUserPress: function () {
			var that = this;
			var sendVendordetails = new sap.ui.model.json.JSONModel(this.getView().getModel().getData());
			this.getOwnerComponent().setModel(sendVendordetails, "custUpdateDetails");
			this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			this.getOwnerComponent().getRouter().navTo("AddNewCustomer", {
				AddCust: "Edit"
			});
		},
		handleWizardCancel: function () {
			// this.valueHelpForNewUser.getContent()[2].getContent()[5].setValueState("None");
			this.AddcustomerFragment.close();
		},
		handleAddUserOkPress: function () {
			var that = this;
			var userObj = this.getView().getModel().getData();
			// var userObj = this.getView().getBindingContext().getObject();
			var content1 = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent();
			var content2 = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent();
			userObj.customerName = content1[1].getValue();
			userObj.email = content1[3].getValue();
			userObj.contact = content1[5].getValue();
			userObj.address = content1[7].getValue();

			userObj.contactPerson = content2[1].getValue();
			userObj.contactPhone = content2[3].getValue();
			userObj.contactEmail = content2[5].getValue();
			userObj.contactDesignation = content2[7].getValue();

			this.getView().getModel().updateBindings(true);
			// this.getOwnerComponent().getModel().getData().splice(this.path, 1, userObj);
			/*----------------------------------------Integreation of update Customer Details END--------------------------------------------*/
			$.ajax({
				url: "/OptimalCog/api/m-customers/" + that.id,
				type: "PUT",
				data: {
					"data": userObj
				},
				success: function (res) {
					var getValues = JSON.parse(res);
					console.log(getValues.error);
					debugger;
					if (getValues.error) {
						MessageBox.error(getValues.error.message);
					} else {
						MessageToast.show("Customer updated successfully.", {
							closeOnBrowserNavigation: false
						});
						that.AddcustomerFragment.close();
					}
				}
			});
		},
		/*----------------------------------------Integreation of update Customer details END--------------------------------------------*/

		handleConfirmAppList: function (evt) {
			var assignedApps = this.getView().getBindingContext().getObject().assignedApps;
			var selectedApps = evt.getParameter("selectedItems");
			var assignedAppsUpdated = [],
				exists;

			//Removing apps
			for (var m = 0; m < assignedApps.length; m++) {
				exists = false;
				for (var n = 0; n < selectedApps.length; n++) {
					var selectedApp = selectedApps[n].getBindingContext("appsModel").getObject();
					if (assignedApps[m].appId == selectedApp.appId) {
						exists = true;
						break;
					}
				}
				if (exists === true) {
					assignedAppsUpdated.push(assignedApps[m]);
				}
			}

		},
		press: function () {
			MessageBox.information("Navigating to the Help Section..... ");
		},
		collectFileData: function (oEvent) {
			// this.file = oEvent.getParameter("files")[0];
			// this.fileData = {
			// 	fileName: file.name,
			// 	mediaType: file.type,
			// 	url: "",
			// 	keyword: "",
			// 	shortDescription: "",
			// 	Category: ""
			// };
			var that = this;
			this.file = oEvent.getParameters().files[0];
			that.fileData = {
				name: this.file.name,
				type: this.file.type,
				url: "",
				keyword: "",
				Category: "",
				shortDescription: ""
			};
		},
		// handleAddDocumentOkPress: function () {
		// 	this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
		// 	this.fileData.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[2].getValue();
		// 	this.fileData.Category = this.AddDocumentFragment.getContent()[0].getContent()[3].getSelectedKey();
		// 	this.getOwnerComponent().getModel("customerInfo").getData()[this.path].documents.push(this.fileData);

		// 	// this.getView().getBindingContext().getObject().documents.push(this.fileData);
		// 	this.getView().getModel().updateBindings(true);
		// 	MessageToast.show("Document added succesfuly.");
		// 	this.getView().getModel().updateBindings(true);
		// 	this.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
		// 	this.AddDocumentFragment.getContent()[0].getContent()[1].setValue("");
		// 	this.AddDocumentFragment.getContent()[0].getContent()[2].setValue("");
		// 	this.AddDocumentFragment.close();
		// },
		handleAddDocumentOkPress: function () {
			var that = this;
			that.fileName = that.AddDocumentFragment.getContent()[0].getContent()[0].getValue();
			that.keyword = that.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
			that.shortDescription = that.AddDocumentFragment.getContent()[0].getContent()[2].getValue();
			that.type = that.AddDocumentFragment.getContent()[0].getContent()[3].getSelectedKey();

			// this.getView().setBusy(true);
			that.AddDocumentFragment.setBusy(true);

			var formData = new FormData();
			formData.append("files", that.file);
			$.ajax({
				url: "/OPTIMALCog_UploadFile/api/upload",
				type: "POST",
				processData: false,
				contentType: false,
				mimeType: "multipart/form-data",
				data: formData,

				success: function (res) {
					that.imageID = JSON.parse(res)[0].id;
					var obj = {
						data: {
							name: that.fileName,
							type: that.type,
							description: that.shortDescription,
							keywords: that.keyword,
							file: [that.imageID],
							m_customer: [that.id]
						},
					};
					$.ajax({
						url: "/OptimalCog/api/m-documents",
						type: "POST",
						headers: {
							"content-type": "application/json",
						},
						data: JSON.stringify(obj),
						dataType: "json",
						success: function (res) {
							if (res.error) {
								MessageBox.error(res.error.message);
								that.AddDocumentFragment.setBusy(false);
							} else {
								that.AddDocumentFragment.setBusy(false);
								//get the model and pass the id to document[]
								that.getView().getModel().getData().m_documents.data.push(res.data);
								that.getView().getModel().updateBindings(true);
								MessageToast.show("Document added succesfuly.");
								that.getView().getModel().updateBindings(true);
								that.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
								that.AddDocumentFragment.getContent()[0].getContent()[1].setValue("");
								that.AddDocumentFragment.getContent()[0].getContent()[2].setValue("");
								that.AddDocumentFragment.close();
							}
						},
					});
				},
				error: function (res) {
					console.log(res);
				},
			});
		},
		handleAddUserCancelPress: function () {
			this.AddDocumentFragment.close();
			this.clearDocfragment();
		},
		clearDocfragment: function () {
			this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].setValue("");
			this.fileData.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[2].setValue("");
			this.fileData.fileName = this.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
		},

		// afterItemRemoved: function (evt) {
		// 	var that = this;
		// 	evt.getParameters().item.destroy();
		// 	var selectedItem = evt.getParameters().item.getBindingContext().getObject();
		// 	var viewModel = this.getView().getModel().getData().documents;
		// 	viewModel.forEach(function (item, index) {
		// 		if (item.fileName == selectedItem.fileName) {
		// 			that.getView().getModel().getData().documents.splice(index, 1);
		// 			that.getView().getModel().updateBindings(true);
		// 		}
		// 	});
		// },
		afterItemRemoved: function (evt) {
			var that = this;
			evt.getParameters().item.destroy();
			var selectedItem = evt.getParameters().item.getBindingContext().getObject();
			// var viewModel = this.getView().getModel().getData().m_documents;
			// var selectedDocPath = parseInt(evt.getParameters().item.getBindingContext().getPath().split("/")[2]) + 1;
			// viewModel.forEach(function (item, index) {
			// 	if (item.fileName == selectedItem.fileName) {
			// 		that.getView().getModel().getData().m_documents.splice(index, 1);
			// 		that.getView().getModel().updateBindings(true);
			// 	}
			// });
			$.ajaxSetup({
				headers: {
					'Authorization': "Bearer " + this.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
				}
			});
			$.ajax({
				url: "/OptimalCog/api/m-documents/" + selectedItem.id,
				type: "DELETE",
				success: function (res) {
					if (res.error) {
						MessageBox.error(res.error.message);
					} else {
						MessageToast.show("Removed Successfully");
						that.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
						that.getOwnerComponent().getRouter().navTo("Master");
					}
				},
				error: function (res) {
					MessageBox.error(res);
				},
			});
		}

	});

});