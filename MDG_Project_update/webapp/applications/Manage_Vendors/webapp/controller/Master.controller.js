sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/model/Sorter",
		"MDG/Vendor/utl/formatter"

	],

	function (Controller, Filter, FilterOperator, MessageBox, MessageToast, Sorter, formatter) {
		"use strict";

		return Controller.extend("MDG.Vendor.controller.Master", {
			formatter: formatter,
			onInit: function () {
				var that = this;
				//that.maxId = 100 + that.getOwnerComponent().getModel("vendorInfo").getData().length;
				that.updateModel();

				this.getOwnerComponent().getRouter().getRoute("Master").attachPatternMatched(function (oEvent) {
					that.getView().getModel("appView").setProperty("/layout", "OneColumn");
					that.updateModel();
					that.byId("itemlistId").removeSelections(true);
					this.getView().getModel("appView").getData().masterthis = this;
				}, this);

			},

			updateModel: function () {
				var that = this;
				var oModel = that.getOwnerComponent().getModel("vendorInfo");
				var logOnOrgId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
				// var users = [];
				//Filter VendorData BasedOn Organization
				// for (var k = 0; k < oModel.getData().length; k++) {
				// 	if (oModel.getData()[k].orgid == logOnOrgId)
				// 		users.push(oModel.getData()[k]);
				// }
				var custModel = new sap.ui.model.json.JSONModel(oModel.getData());
				that.getOwnerComponent().setModel(custModel);
				//var oContext = new Context(oModel, );
				this.getView().setModel(custModel);

				var usersData = that.getOwnerComponent().getModel("users").getData();
				var logOnUserId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;

				/*----------------------------------------Integreation of get Vendor Details START--------------------------------------------*/
				$.ajax({
					type: "GET",
					url: "/OptimalCog/api/m-vendors?filters[m_organisation][id][$eq]=" + logOnUserId + "&populate=*&sort=id:ASC",
					success: function (res, result) {
						var vendorDetail = JSON.parse(res);
						var idLength = vendorDetail.data.length - 1;
						var modelData = new sap.ui.model.json.JSONModel({
							"id": idLength
						});
						that.getOwnerComponent().setModel(modelData, "vendorId");
						that.getView().setModel(new sap.ui.model.json.JSONModel(vendorDetail));
					}
				});

				/*----------------------------------------Integreation of get Vendor Details END--------------------------------------------*/

				var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
				for (var i = 0; i < userPagePerm.length; i++) {
					if (userPagePerm[i].applicationid === 'APP10003') {
						this.appPagePerm = userPagePerm[i];
						break;
					}
				}
				this.getView().byId("addid").setVisible(this.appPagePerm.create);
				this.orgid = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
				var org_filter = new sap.ui.model.Filter("orgid", "Contains", this.orgid);
				this.getView().byId("itemlistId").getBinding("items").filter(new sap.ui.model.Filter([org_filter], false));
			},
			onUpload: function (evt) {
				var that = this;
				var file = evt.getParameter("files")[0]; // get the file from the FileUploader control
				var reader = new FileReader();
				reader.onload = function (e) {
					var data = e.target.result;
					var excelsheet = XLSX.read(data, {
						type: "binary"
					});
					excelsheet.SheetNames.forEach(function (sheetName) {
						var oExcelRow = XLSX.utils.sheet_to_row_object_array(excelsheet.Sheets[sheetName]); // this is the required data in Object format
						var jsonModel = new sap.ui.model.json.JSONModel(oExcelRow);
						that.getView().setModel(jsonModel, "localModel");
					});
				};
				reader.readAsBinaryString(file);
			},
			uploadUsers: function () {
				var that = this;
				if (this.getView().getModel("localModel")) {
					var oModel = this.getView().getModel("localModel").getData();

					let localArray = [];
					this.dialog.setBusy(true);
					for (let i = 0; i < oModel.length; i++) {
						var row = oModel[i];
						var obj = {
							"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
							"vendorName": row["Vendor Name"],
							"vendorEmail ": row["E-mail"],
							"cvTypeField": row["C and V Type field"],
							"vendorContact": row["Contact Number"],
							"vendorAddress": row.Address,
							"region1": row["Geographical Region"],
							"region2": row["Business Region"],
							"about": row["About Vendor"],
							"contactPerson": row["Contact Person Name"],
							"contactEmail": row["Contact Person E-mail"],
							"contactPhone": row["Contact Person Number"],
							"vendorCountry": row["Country/State"],
							"vendorCity": row.City,
							"zipCode": row["Postal Code"],
							"isArchived": false
						};
						var validateObj = true
						Object.keys(obj).forEach(function (key) {
							if (!obj[key] && key !== "isArchived") {
								validateObj = false
							}
						});
						if (validateObj === true) {
							$.ajax({
								url: "/OptimalCog/api/m-vendors",
								type: "POST",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": obj
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
										that.dialog.setBusy(false);
									} else {
										const length = oModel.length;
										if (length - 1 === i) {
											that.dialog.setBusy(false);
											that.dialog.close();
											MessageBox.success("Vendors Added successfully.");
											that.onInit();
										}
									}
								}
							});
						} else {
							debugger
							that.dialog.setBusy(false);
							// this.getView().getModel("errorModel").setData([{
							// 	"errorRows": row['Customer Name'],
							// 	"type": "Error"
							// }]);
							// this.getView().getModel("errorModel").updateBindings(true);
							// this.getView().byId("notifyStrip").setVisible(true);
						}
					}
				} else {
					MessageBox.error("Please Browse the file!");
				}
			},
			handleAddCancel: function () {
				this.dialog.close();
			},
			openNewFragment: function () {
				if (!this.dialog) {
					this.dialog = sap.ui.xmlfragment(this.getView().getId(), "MDG.Vendor.fragment.bulkUpload", this);
					this.getView().addDependent(this.dialog);
				}
				this.dialog.open();
			},
			onSearch: function (evt) {
				var filter1 = new sap.ui.model.Filter("attributes/vendorName", "Contains", evt.getParameter("newValue"));
				var filter2 = new sap.ui.model.Filter("attributes/vendID", "Contains", evt.getParameter("newValue"));
				var filter3 = new sap.ui.model.Filter("attributes/vendorCity", "Contains", evt.getParameter("newValue"));
				var filter4 = new sap.ui.model.Filter("attributes/vendorCountry", "Contains", evt.getParameter("newValue"));
				// var org_filter = new sap.ui.model.Filter("orgid", "Contains", this.orgid);
				// 				var filter4 = new sap.ui.model.Filter("country", "Contains", evt.getParameter("newValue"));
				this.getView().byId("itemlistId").getBinding("items").filter(new sap.ui.model.Filter([filter1, filter2, filter3, filter4], false));
			},
			onNavBack: function () {
				this.getView().getModel("appView").setProperty("/layout", "OneColumn");
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Home");
			},
			openAddNewVendor: function () {

				var that = this;

				this.getView().getModel("appView").setProperty("/layout", "EndColumnFullScreen");
				this.getOwnerComponent().getRouter().navTo("AddNewVendor", {
					AddVen: "Add"
				});
			},

			handleUsersListPress: function (oEvent) {
				this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getView().getModel("appView").setProperty("/previousPage", "Master");
				//Mohammad Sohail: sending the row path of the list
				var selectedRow = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
				var model = this.getView().getModel().getData().data;
				var selectedData = model[selectedRow]
				var jsonModel = new sap.ui.model.json.JSONModel(selectedData);
				this.getOwnerComponent().setModel(jsonModel, "selectedVendorData");
				//var vendId = oEvent.getSource().getSelectedItem().getBindingContext().getObject().id;
				this.getOwnerComponent().getRouter().navTo("VendorDetail", {
					id: selectedData.id
				});
			},

			collectFileData: function (oEvent) {
				var file = oEvent.getParameter("files")[0];
				this.fileData = {
					fileName: file.name,
					mediaType: file.type,
					url: "",
					keyword: "",
					shortDescription: ""
				};
			},

			handleAddUserOkPress: function () {
				var step1Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent();
				var step2Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent();
				var step3Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent();
				this.fileData.keyword = step3Content[1].getValue();
				this.fileData.shortDescription = step3Content[2].getValue();
				var newId = this.maxId + 1;
				var oUserDetails = {

					id: "VDR" + newId,
					customerName: step1Content[1].getValue(),
					email: step1Content[3].getValue(),
					contact: step1Content[5].getValue(),

					address: step1Content[7].getValue(),

					contactPerson: step2Content[1].getValue(),
					contactEmail: step2Content[3].getValue(),
					contactPhone: step2Content[5].getValue(),
					contactDesignation: step2Content[7].getValue(),
					documents: [this.fileData]
				};

				var oModel = this.getView().getModel();
				var aUsers = oModel.getData();
				aUsers.push(oUserDetails);
				oModel.updateBindings(true);
				this.maxId++;
				this.handleWizardCancel();
				MessageToast.show("New Customer added succesfuly.");
			},
			handleWizardCancel: function () {
				this.AddcustomerFragment.close();
				this.clearData();
			},
			clearData: function () {

				var step1Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent();
				var step2Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent();
				var step3Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent();
				step1Content[1].setValue("");
				step1Content[3].setValue("");
				step1Content[5].setValue("");
				step1Content[7].setValue("");
				step1Content[9].setValue("");

				step2Content[1].setValue("");
				step2Content[3].setValue("");
				step2Content[5].setValue("");
				step2Content[7].setValue("");

				step3Content[1].setValue("");
				step3Content[2].setValue("");
			},

			handleAddUserCancelPress: function () {
				this.AddcustomerFragment.close();
			},
			onDialogNextButton: function () {
				if (this._oWizard.getProgressStep().getValidated()) {
					this._oWizard.nextStep();
				}
				this.handleButtonsVisibility();
			},
			handleSortfragment: function () {
				if (!this.sortvendorFragment) {
					this.sortvendorFragment = sap.ui.xmlfragment("MDG.Vendor.fragment.sortVendor", this);

				}

				this.sortvendorFragment.open();
			},
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
					var link = "/OptimalCog/api/m-vendors?sort=" + oSortItem + ":ASC&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&populate=*";
				} else {
					link = "/OptimalCog/api/m-vendors?sort=" + oSortItem + ":DESC&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
							"loggedOnUserModel").getData().m_organisation.id +
						"&populate=*";
				}
				$.get(link,
					function (vendorDetail, respState) {
						vendorDetail = JSON.parse(vendorDetail);
						that.getView().setModel(new sap.ui.model.json.JSONModel(vendorDetail));
					});

			}

		});
	});