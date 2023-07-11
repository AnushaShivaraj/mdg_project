sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Context"
	],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast, MessageBox, JSONModel, Context) {
		"use strict";

		return Controller.extend("MDG.Customer.controller.AddNewCustomer", {

			onInit: function () {
				this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				this.getOwnerComponent().getRouter().getRoute("AddNewCustomer").attachPatternMatched(this.onObjectMatched, this);

				this.oDoc = {
					"fileName": "",
					"mediaType": "",
					"url": "",
					"keyword": "",
					"shortDescription": ""
				};
			},
			// ___onObjectMatched: function (oEvent) {
			// 	var that = this;
			// 	this.path = oEvent.getParameter("arguments").id;
			// 	this.newcustomer = {
			// 		"id": newId,
			// 		"customerName": "",
			// 		"email": "",
			// 		"cvTypeField": "",
			// 		"contact": "",
			// 		"contactPerson": "",
			// 		"contactEmail": "",
			// 		"contactPhone": "",
			// 		"contactDesignation": "",
			// 		"country": "",
			// 		"city": "",
			// 		"address": "",
			// 		"description": "",
			// 		"zipCode": "",
			// 		"documents": []
			// 	};
			// 	this.getView().setModel(new JSONModel(this.newcustomer));
			// },

			onObjectMatched: function (oEvent) {
				var that = this;
				//var lastCustId = this.getOwnerComponent().getModel("customerInfo").getData()[this.getOwnerComponent().getModel("customerInfo").getData().length - 1].custID;
				var lastCustId = this.getOwnerComponent().getModel("customerId").getData().id;
				//var newId = "CUST000" + (parseInt(lastCustId.match(/\d+/g)[0]) + 1);
				var a = 1;
				var c = lastCustId + a;
				var newId = "CUST010" + c;
				this.path = oEvent.getParameter("arguments").id;
				var task = oEvent.getParameter("arguments").AddCust;
				that.isAdd = task;
				if (task !== "Edit") {
					that.newcustomer = {
						"custID": newId, //I am changing id to custID
						"customerName": "",
						"cvTypeField": "",
						"description": "",
						"contact": "",
						"email": "",
						"address": "",
						"region1": "",
						"region2": "",
						"contactPerson": "",
						"contactEmail": "",
						"contactPhone": "",
						"country": "",
						"city": "",
						"zipCode": "",
						"isArchived": false,
						"m_documents": [],
						"m_organisation": []
					};
					that.getView().setModel(new JSONModel(that.newcustomer));
					that.path = that.getView().getModel("appView").oData.RequestIdSelected;
					this.getOwnerComponent().getModel().getData().push(that.newcustomer);
				} else {
					// that.path = that.getView().getModel("appView").oData.RequestIdSelected;
					// var usersModel = that.getOwnerComponent().getModel("customerInfo");
					// var oContext = new Context(usersModel, "/" + that.path);
					// that.newcustomer = oContext.getObject();
					// that.getView().setModel(new JSONModel(that.newcustomer));
					// that.getView().getModel().updateBindings(true);
					var usersModel = this.getOwnerComponent().getModel("custUpdateDetails").getData();

					var newDocuments = usersModel.m_documents.data;
					usersModel.m_documents = newDocuments;

					this.getView().setModel(new JSONModel(usersModel));
					this.ValidateCreateCust();
				}
			},

			// collectFileData1: function (oEvent) {
			// 	this.oDoc.fileName = oEvent.getParameters().files[0].name;
			// 	this.oDoc.mediaType = oEvent.getParameter("files")[0].type;
			// },

			___handleAddUserOkPress: function () {
				// this.fileData.keyword = this.byId("keyword").getValue();
				// this.fileData.shortDescription = this.byId("short").getValue();
				// this.newcustomer.documents.push(this.fileData);

				// this.getOwnerComponent().getModel().getData().push(this.newcustomer);
				// this.getOwnerComponent().getModel().updateBindings(true);
				this.getOwnerComponent().getModel("customerInfo").getData().push(this.newcustomer);
				this.getOwnerComponent().getModel("customerInfo").updateBindings(true);

				this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
				this.getOwnerComponent().getRouter().navTo("Master");

				this.getView().getModel("appView").getData().lastId = this.getView().getModel("appView").getData().lastId + 1;
			},

			handleAddUserOkPress: function () {
				// this.fileData.keyword = this.byId("keyword").getValue();
				// this.fileData.shortDescription = this.byId("short").getValue();
				// this.newcustomer.documents.push(this.fileData);
				var that = this;
				var Err = that.ValidateCreateCust();
				if (Err == 0) {
					if (that.isAdd == "Edit") {

						/*----------------------------------------Integreation of update customer START--------------------------------------------*/
						var updateModelData = that.getView().getModel().getData();
						updateModelData.m_documents.forEach(function (obj, index) {
							updateModelData.m_documents[index] = obj.id;
						});
						$.ajax({
							type: "PUT",
							url: "/OptimalCog/api/m-customers/" + updateModelData.id,
							data: {
								"data": updateModelData
							},
							success: function (res) {
								var resValue = JSON.parse(res);
								// console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("CUST1000" + resValue.data.id + " Customer Updated successfully", {
										closeOnBrowserNavigation: false
									});
									that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
									that.getOwnerComponent().getRouter().navTo("Master", {
										AddCust: "Edit"
									});
									//	MessageBox.success(resValue.data.attributes.vendID + "Vendor Created successfully");
									that.clearform();
								}
							}
						});
						/*----------------------------------------Integreation of update customer END--------------------------------------------*/

						//this.getOwnerComponent().getModel("customerInfo").updateBindings(true);

					} else {
						/*----------------------------------------Integreation of Add New Customer START--------------------------------------------*/
						var mOrg = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;
						// var newCustomerInfo = this.getView().getModel();
						// var newCustomerdata = newCustomerInfo.getData();
						that.newcustomer.m_organisation.push(mOrg);
						if (that.newcustomer.cvTypeField === "") {
							that.newcustomer.cvTypeField = "Customer Internal";
						}
						this.getOwnerComponent().getModel("customerInfo").getData().push(this.newcustomer);
						this.getOwnerComponent().getModel("customerInfo").updateBindings(true);

						that.newcustomer.m_documents.forEach(function (obj, index) {
							that.newcustomer.m_documents[index] = obj.id;
						});
						$.ajaxSetup({
							headers: {
								'Authorization': "Bearer " + this.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
							}
						});

						$.post("/OptimalCog/api/m-customers", {
								"data": that.newcustomer
							},
							function (response) {
								var resValue = JSON.parse(response);
								// console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									// that.handleDocUpload(resValue.data.id);
									MessageToast.show("CUST1000" + resValue.data.id + " Customer Details Add successfully", {
										closeOnBrowserNavigation: false
									});
									that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
									that.getOwnerComponent().getRouter().navTo("Master", {
										AddCust: "Add"
									});
									//	MessageBox.success(resValue.data.attributes.custID + " Created Successfully!");
									that.clearform();
									that.getOwnerComponent().getModel("customerInfo").updateBindings(true);
								}
							});

						/*----------------------------------------Integreation of Add New Customer END--------------------------------------------*/

					}

					this.getView().getModel("appView").getData().lastId = this.getView().getModel("appView").getData().lastId + 1;
				} else {
					this.getView().setBusy(false);

					var text = "Mandatory Fields are Required";
					MessageBox.error(text);
				}
			},
			handleWizardCancel: function () {
				this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
				// this.getOwnerComponent().getRouter().navTo("Master");
				this.clearform();
				this.getView().getModel("appView").setProperty("/layout", "OneColumn");
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
			collectFileData: function (oEvent) {
				var that = this;
				this.file = oEvent.getParameters().files[0];
				that.fileData = {
					name: this.file.name,
					type: this.file.type,
					url: "",
					keyword: "",
					shortDescription: ""
				};

			},
			// afterFragClose: function(oEvent){
			// 	oEvent.getSource().destroy();
			// },
			handleAddDocumentOkPress: function () {
				var that = this;
				that.fileName = that.AddDocumentFragment.getContent()[0].getContent()[0].getValue();
				that.keyword = that.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
				that.shortDescription = that.AddDocumentFragment.getContent()[0].getContent()[2].getValue();
				that.type = that.AddDocumentFragment.getContent()[0].getContent()[3].getSelectedKey();
				//var saveDocPath = that.getOwnerComponent().getModel().getData().length - 1;
				// that.getView().getModel().getData().m_documents.push(that.fileData);
				//	that.getView().getBindingContext().getObject().documents.push(that.fileData);
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
									//get the model and pass the id to document[]
									that.AddDocumentFragment.setBusy(false);
									that.getView().getModel().getData().m_documents.push(res.data);
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
						// console.log(res);
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
			},

			ValidateCreateCust: function () {
				var Err = 0;
				if (this.getView().byId("custName").getValue() == "" || this.getView().byId("custName").getValue() == null) {
					Err++;
					// this.getView().byId("custName").setValueState("Error");
				} else {
					this.getView().byId("custName").setValueState("None");
				}
				if (this.getView().byId("eml").getValue() == "" || this.getView().byId("eml").getValue() == null) {
					Err++;
					// this.getView().byId("eml").setValueState("Error");
				} else {
					this.getView().byId("eml").setValueState("None");
				}
				//anu
				if (this.getView().byId("contNum").getValue() == "" || this.getView().byId("contNum").getValue() == null) {
					Err++;
				} else {
					this.getView().byId("contNum").setValueState("None");
				}
				// if (this.getView().byId("contNum").getValue() === "") {
				// 	//	this.getview().getId(contNum).setValueState("Error");
				// 	//	this.getview().getId(contNum).setValueStateText("Please fill");
				// 	Err++
				// } else {
				// 	this.getview().getId(contNum).setValueState("Error");
				// 	var contNum = /^[0-9]+$/;
				// 	if (!value.match(contNum)) {
				// 		this.getview().getId(contNum).setValueState("Error");
				// 		//	this.getview().getId(empId).setValueStateText("Please fill digits");
				// 	}
				//anu
				if (this.getView().byId("abtCust").getValue() == "" || this.getView().byId("abtCust").getValue() == null) {
					Err++;
					// this.getView().byId("abtCust").setValueState("Error");
				} else {
					this.getView().byId("abtCust").setValueState("None");
				}
				if (this.getView().byId("addr").getValue() == "" || this.getView().byId("addr").getValue() == null) {
					Err++;
					// this.getView().byId("addr").setValueState("Error");
				} else {
					this.getView().byId("addr").setValueState("None");
				}
				if (this.getView().byId("cty").getValue() == "" || this.getView().byId("cty").getValue() == null) {
					Err++;
					// this.getView().byId("cty").setValueState("Error");
				} else {
					this.getView().byId("cty").setValueState("None");
				}
				if (this.getView().byId("crty").getValue() == "" || this.getView().byId("cty").getValue() == null) {
					Err++;
					// this.getView().byId("crty").setValueState("Error");
				} else {
					this.getView().byId("crty").setValueState("None");
				}
				if (this.getView().byId("contPerson").getValue() == "" || this.getView().byId("contPerson").getValue() == null) {
					Err++;
					// this.getView().byId("contPerson").setValueState("Error");
				} else {
					this.getView().byId("contPerson").setValueState("None");
				}
				if (this.getView().byId("perEml").getValue() == "" || this.getView().byId("perEml").getValue() == null) {
					Err++;
					// this.getView().byId("perEml").setValueState("Error");
				} else {
					this.getView().byId("perEml").setValueState("None");
				}
				if (this.getView().byId("perNum").getValue() == "" || this.getView().byId("perNum").getValue() == null) {
					Err++;
					// this.getView().byId("perNum").setValueState("Error");
				} else {
					this.getView().byId("perNum").setValueState("None");
				}
				return Err;
			},
			clearform: function () {
				var that = this;

				var Obj = {
					"custID": "",
					"customerName": "",
					"cvTypeField": "",
					"description": "",
					"contact": "",
					"email": "",
					"address": "",
					"region1": "",
					"region2": "",
					"contactPerson": "",
					"contactEmail": "",
					"contactPhone": "",
					"country": "",
					"city": "",
					"zipCode": "",
					"m_documents": [],
					"m_organisation": []
				};
				this.getView().setModel(new JSONModel(Obj));
				this.getView().getModel().updateBindings(true);
				//	this.getOwnerComponent().getModel("customerId").getData().id = "";
			},
			handleValidateContectNum: function (evt) {
				var userInput = evt.getSource().getValue();
				var sanitizedInput = userInput.replace(/\D/g, ''); // Remove non-numeric characters
				evt.getSource().setValue(sanitizedInput); // Update input field with sanitized input
			},
			// handleValidateContectNum: function (evt) {
			// 	var regex = evt.getSource().getValue();
			// 	var regex = regex = /\(?\+?\(?[0-9]{2}\)?[ ()]?([- ()]?\d[- ()]?){8,25}/;
			// 	if (regex.test(evt.getSource().getValue()) === false) {
			// 		evt.getSource().setValueState("Error");
			// 		if (evt.getSource().getValue().length) {
			// 			// MessageToast.show(this.oBundle.getText("invalidEntryMsgEmail"));
			// 		} else {
			// 			evt.getSource().setValueState("None");
			// 		}
			// 	} else {
			// 		evt.getSource().setValueState("None");
			// 	}
			// },
			emailValidateForVen: function (evt) {
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
			onSearch: function (oEvent) {
				var value = oEvent.getParameter("newValue");
				var afilter = [];
				if (value !== "") {
					var sfilter = new sap.ui.model.Filter("attributes/name", sap.ui.model.FilterOperator.Contains, value);
					afilter.push(sfilter);

					var objects = this.getView().byId("uploadData").getBinding("items");
					objects.filter(afilter);
				} else {
					// If the search value is empty, remove any existing filter
					this.getView().byId("uploadData").getBinding("items").filter([]);
				}
			},
			afterItemRemoved: function (evt) {
				var that = this;
				evt.getParameters().item.destroy();
				var selectedItem = evt.getParameters().item.getBindingContext().getObject();
				if (that.isAdd == "Edit") {
					var objPath = evt.getParameters().item.getBindingContext().getPath().split("/")[2];
					var records = that.getView().getModel().getData().m_documents;
					for (var i = 0; i < records.length; i++) {
						if (records[i].id == selectedItem.id) {
							var recordToDelete = records[i];
							break;
						}
					}
					var indexToDelete = records.indexOf(recordToDelete);

					// If the record is found, remove it from the array
					if (indexToDelete > -1) {
						records.splice(indexToDelete, 1);
					}
					// viewModel.m_documents.splice(1, objPath);
					that.getView().getModel().updateBindings();

				}
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
							MessageToast.show("Deleted Successfully");
						}
					},
					error: function (res) {
						MessageBox.error(res);
					},
				});
			}
		});
	});