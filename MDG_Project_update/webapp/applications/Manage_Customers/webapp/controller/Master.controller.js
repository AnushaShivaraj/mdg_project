sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/model/Sorter",
		"MDG/Customer/utl/formatter",
		"sap/ui/core/message/Message",
		"sap/ui/core/library",
		"sap/ui/core/Fragment"

	],

	function (Controller, Filter, FilterOperator, MessageBox, MessageToast, Sorter, formatter, Message, library, Fragment) {
		"use strict";
		// shortcut for sap.ui.core.ValueState
		var ValueState = library.ValueState;

		// shortcut for sap.ui.core.MessageType
		var MessageType = library.MessageType;
		return Controller.extend("MDG.Customer.controller.Master", {
			formatter: formatter,
			onInit: function () {
				var that = this;
				// that.maxId = 100 + that.getOwnerComponent().getModel().getData().length;
				//this.getOwnerComponent().getModel.attachRequestCompleted(function () {
				//	that.maxId = 100 + that.getOwnerComponent().getModel().getData().length;
				//});

				//var oContext = new Context(oModel, );

				that.updateModel();
				this.getOwnerComponent().getRouter().getRoute("Master").attachPatternMatched(function (oEvent) {
					that.sOrder = 'asc';
					that.sColumnPath = "id";
					that.getView().getModel("appView").setProperty("/layout", "OneColumn");
					that.updateModel();
					that.byId("itemlistId").removeSelections(true);
				}, this);
				var pModel = new sap.ui.model.json.JSONModel()
				this.getView().setModel(pModel, "errorModel");
				// set message model
				// var oMessageManager = sap.ui.getCore().getMessageManager();
				// this.getView().setModel(oMessageManager.getMessageModel(), "message");
			},
			updateModel: function () {
				var that = this;

				$.get("/OptimalCog/api/m-customers?filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData()
					.m_organisation.id + "&populate=*&sort=id:ASC",
					function (custDet, respState) {
						custDet = JSON.parse(custDet);
						console.log(custDet);
						var idLength = custDet.data.length - 1;
						var modelData = new sap.ui.model.json.JSONModel({
							"id": idLength
						});
						that.getOwnerComponent().setModel(modelData, "customerId");
						that.getView().setModel(new sap.ui.model.json.JSONModel(custDet));
					});
				//from here
				// var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
				// for (var i = 0; i < userPagePerm.length; i++) {
				// 	if (userPagePerm[i].applicationid === 'APP10002') {
				// 		this.appPagePerm = userPagePerm[i];
				// 		break;
				// 	}
				// }
				// this.getView().byId("addid").setVisible(this.appPagePerm.create);
				// this.orgid = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
				// var org_filter = new sap.ui.model.Filter("orgid", "Contains", this.orgid);
				// this.getView().byId("itemlistId").mBindingInfos.items.filter(new sap.ui.model.Filter([org_filter], false));
				//till here
				//from anu
				var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
				for (var i = 0; i < userPagePerm.length; i++) {
					if (userPagePerm[i].applicationid === 'APP10002') {
						this.appPagePerm = userPagePerm[i];
						break;
					}
				}
				this.getView().byId("addid").setVisible(this.appPagePerm.create);
				//till anu
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
							"customerName": row["Customer Name"],
							"cvTypeField": row["C and V Type field"],
							"contact": row["Contact Number"],
							"email": row["E-mail"],
							"address": row.Address,
							"region1": row["Geographical Region"],
							"region2": row["Business Region"],
							"description": row["About Customer"],
							"contactPerson": row["Contact Person Name"],
							"contactEmail": row["Contact Person E-mail"],
							"contactPhone": row["Contact Person Number"],
							"country": row.Country,
							"city": row.City,
							"zipCode": row["Postal Code"],
							"isArchived": false
						};
						var validateObj = true
						Object.keys(obj).forEach(function (key) {
							if (!obj[key] && key !== "isArchived") {
								validateObj = false
							}
						});
						if (validateObj === false) {
							$.ajax({
								url: "/OptimalCog/api/m-customers",
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
											MessageBox.success("Customer Added successfully.");
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
			onoSearch: function (evt) {
				var that = this;
				var searchVal = evt.getParameter("newValue");
				var filters = new sap.ui.model.Filter([
					new sap.ui.model.Filter("attributes/customerName", sap.ui.model.FilterOperator.Contains, searchVal),
					new sap.ui.model.Filter("attributes/city", sap.ui.model.FilterOperator.Contains, searchVal),
					new sap.ui.model.Filter("attributes/country", sap.ui.model.FilterOperator.Contains, searchVal),
					// new sap.ui.model.Filter("attributes/id", sap.ui.model.FilterOperator.Contains, searchVal)
				], false);
				var oList = this.getView().byId("itemlistId");
				oList.getBinding("items").aFilters.push(filters);
			},
			openNewFragment: function () {
				if (!this.dialog) {
					this.dialog = sap.ui.xmlfragment(this.getView().getId(), "MDG.Customer.fragment.bulkUpload", this);
					this.getView().addDependent(this.dialog);
				}
				this.dialog.open();
			},
			handleAddCancel: function () {
				this.dialog.close();
				this.getView().byId("notifyStrip").setVisible(false);
			},
			onSearch: function (evt) {
				var that = this;
				that.searchVal = evt.getParameter("newValue");
				if (that.searchVal !== "") {
					$.get("/OptimalCog/api/m-customers?filters[$or][0][customerName][$contains]=" + that.searchVal +
						"&filters[$or][1][city][$contains]=" + that.searchVal + "&filters[$or][2][country][$contains]=" + that.searchVal +
						"&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id +
						"&populate=*",
						function (custDet, respState) {
							custDet = JSON.parse(custDet);
							console.log(custDet);
							that.getView().setModel(new sap.ui.model.json.JSONModel(custDet));
						})
				} else {
					$.get("/OptimalCog/api/m-customers?filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData()
						.m_organisation.id + "&populate=*",
						function (custDet, respState) {
							custDet = JSON.parse(custDet);
							console.log(custDet);
							that.getView().setModel(new sap.ui.model.json.JSONModel(custDet));
						})
				}

			},
			onNavBack: function () {
				this.getView().getModel("appView").setProperty("/layout", "OneColumn");
				this.getRouter().navTo("Home");
			},
			__openAddNewCustomer: function () {
				var that = this;
				//	MessageToast.show("Title clicked");
				//	this.onCloseDetailPress();
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				this.getOwnerComponent().getRouter().navTo("AddNewCustomer");
			},

			openAddNewCustomer: function () {
				var that = this;
				//	MessageToast.show("Title clicked");
				//	this.onCloseDetailPress();
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
				this.getOwnerComponent().getRouter().navTo("AddNewCustomer", {
					AddCust: "Add"
				});
			},

			handleUsersListPress: function (oEvent) {
				this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getView().getModel("appView").setProperty("/previousPage", "Master");
				//Mohammad Sohail:  I am taking the path of the selected row of list item.
				debugger
				var selectedRow = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
				var model = this.getView().getModel().getData().data;
				var selectedData = model[selectedRow]
				var jsonModel = new sap.ui.model.json.JSONModel(selectedData);
				this.getOwnerComponent().setModel(jsonModel, "selectedCustData");

				// we didn't required custId we will directly send the selected object data through model
				this.getOwnerComponent().getRouter().navTo("CustDetail", {
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

			__handleAddUserOkPress: function () {
				var step1Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent();
				var step2Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent();
				var step3Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent();
				this.fileData.keyword = step3Content[1].getValue();
				this.fileData.shortDescription = step3Content[2].getValue();
				var newId = this.maxId + 1;
				var oUserDetails = {
					//id: 104, 
					//100 + this.getOwnerComponent().getModel("userInfo").getData().length + 1
					id: "CSN" + newId,
					customerName: step1Content[1].getValue(),
					email: step1Content[3].getValue(),
					contact: step1Content[5].getValue(),

					//city:step1Content[9].getValue()
					address: step1Content[7].getValue(),

					contactPerson: step2Content[1].getValue(),
					contactEmail: step2Content[3].getValue(),
					contactPhone: step2Content[5].getValue(),
					contactDesignation: step2Content[7].getValue()
						//,zipCode:step1Content[13].getValue()
						,
					documents: [this.fileData]
				};

				// oUserDetails.id = oUserDetails.id + 1;
				var oModel = this.getView().getModel();
				var aUsers = oModel.getData();
				aUsers.push(oUserDetails);
				oModel.updateBindings(true);
				this.maxId++;
				this.handleWizardCancel();
				MessageToast.show("New Customer added succesfuly.");
			},

			handleAddUserOkPress: function () {
				var step1Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[0].getContent()[0].getContent();
				var step2Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[1].getContent()[0].getContent();
				var step3Content = this.AddcustomerFragment.getContent()[0].getPages()[0].getContent()[0].getSteps()[2].getContent()[0].getContent();
				this.fileData.keyword = step3Content[1].getValue();
				this.fileData.shortDescription = step3Content[2].getValue();
				var newId = this.maxId + 1;
				var oUserDetails = {
					//id: 104, 
					//100 + this.getOwnerComponent().getModel("userInfo").getData().length + 1
					id: "CUST" + newId,
					customerName: step1Content[1].getValue(),
					email: step1Content[3].getValue(),
					contact: step1Content[5].getValue(),

					//city:step1Content[9].getValue()
					address: step1Content[7].getValue(),

					contactPerson: step2Content[1].getValue(),
					contactEmail: step2Content[3].getValue(),
					contactPhone: step2Content[5].getValue(),
					contactDesignation: step2Content[7].getValue()
						//,zipCode:step1Content[13].getValue()
						,
					documents: [this.fileData]
				};

				// oUserDetails.id = oUserDetails.id + 1;
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
				// this.valueHelpForNewUser.getContent()[2].getContent()[5].setValueState("None");
				this.AddcustomerFragment.close();
			},
			onDialogNextButton: function () {
				if (this._oWizard.getProgressStep().getValidated()) {
					this._oWizard.nextStep();
				}

				this.handleButtonsVisibility();
			},
			handleSortfragment: function () {
				if (!this.sortcustomerFragment) {
					this.sortcustomerFragment = sap.ui.xmlfragment("MDG.Customer.fragment.sortCustomer", this);

				}

				this.sortcustomerFragment.open();
			},
			// handleeConfirm: function (oEvent) {
			// 	var that = this;
			// 	// var oSortItem = oEvent.getParameter("sortItem")
			// 	// this.sColumnPath = "id"
			// 	// this.sOrder = "id";
			// 	// if (oSortItem) {
			// 	// 	this.sColumnPath = oSortItem.getKey();
			// 	// }

			// 	// if (oEvent.getParameter("sortDescending"))
			// 	// 	this.sOrder = "desc"

			// 	// $.get("/OptimalCog/api/m-customers?filters[$or][0][customerName][$contains]=" + that.searchVal +
			// 	// 		"&filters[$or][1][city][$contains]=" + that.searchVal + "&filters[$or][2][country][$contains]=" + that.searchVal +
			// 	// 		"&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id +
			// 	// 		"&populate=*&sort[0]=" + this.sColumnPath + "%3A" + this.sOrder,
			// 	// 		function (custDet, respState) {
			// 	// 			custDet = JSON.parse(custDet);
			// 	// 			console.log(custDet);
			// 	// 			that.getView().setModel(new sap.ui.model.json.JSONModel(custDet));
			// 	// 		})
			// 	var oSortItem = oEvent.getParameter("sortItem");
			// 	var sColumnPath = "id";
			// 	var bDescending = oEvent.getParameter("sortDescending");
			// 	var aSorter = [];
			// 	if (oSortItem) {
			// 		if (oSortItem.getKey() !== "id") {
			// 			sColumnPath = "attributes/" + oSortItem.getKey();
			// 		} else {
			// 			sColumnPath = oSortItem.getKey();
			// 		}
			// 	}
			// 	aSorter.push(new Sorter(sColumnPath, bDescending));
			// 	var oList = this.getView().byId("itemlistId");
			// 	var oBinding = oList.getBinding("items");
			// 	oBinding.sort(aSorter);
			// },
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
					var link = "/OptimalCog/api/m-customers?sort=" + oSortItem + ":ASC&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&populate=*";
				} else {
					link = "/OptimalCog/api/m-customers?sort=" + oSortItem + ":DESC&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
							"loggedOnUserModel").getData().m_organisation.id +
						"&populate=*";
				}
				$.get(link,
					function (custDet, respState) {
						custDet = JSON.parse(custDet);
						that.getView().setModel(new sap.ui.model.json.JSONModel(custDet));
					});

			}

		});
	});