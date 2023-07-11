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

		return Controller.extend("MDG.Vendor.controller.AddNewVendor", {

			onInit: function () {
				this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				this.getOwnerComponent().getRouter().getRoute("AddNewVendor").attachPatternMatched(this.onObjectMatched, this);

				this.oDoc = {
					"fileName": "",
					"mediaType": "",
					"url": "",
					"keyword": "",
					"shortDescription": ""
				};
			},
			onObjectMatched: function (oEvent) {

				var task = oEvent.getParameter("arguments").AddVen;
				this.isAdd = task;
				if (task !== "Edit") {
					//var newId = "VDN1000" + (this.getOwnerComponent().getModel("vendorInfo").getData().length + 1);
					var dataLength = this.getOwnerComponent().getModel("vendorId").getData().id;
					var a = 2;
					var c = dataLength + a;
					var newId = "VDN1000" + c;
					this.newvendor = {
						"vendID": newId, //change id = vendid
						"vendorName": "",
						"vendorEmail": "",
						"vendorContact": "",
						"zipCode": "",
						"vendorAddress": "",
						"vendorCity": "",
						"vendorCountry": "",
						"region1": "",
						"region2": "",
						"about": "",
						"cvTypeField": "",
						"contactPerson": "",
						"contactEmail": "",
						"contactPhone": "",
						"isArchived": false,
						"m_documents": [],
						"m_organisation": []
					};
					this.getView().setModel(new JSONModel(this.newvendor));
					this.getOwnerComponent().getModel().getData().push(this.newvendor);
				} else {
					this.path = this.getView().getModel("appView").oData.RequestIdSelected;
					var usersModel = this.getOwnerComponent().getModel("editDetails").getData();
					// usersModel.m_documents = usersModel.m_documents.data;
					var newDocuments = usersModel.m_documents.data;
					usersModel.m_documents = newDocuments;
					debugger
					delete usersModel.m_csf;
					delete usersModel.m_deliverables;
					delete usersModel.m_organisation;
					delete usersModel.m_projects;

					this.getView().setModel(new JSONModel(usersModel));
					this.ValidateCreateVndr();
					//var oContext = new Context(usersModel, "/" + this.path);
					//	this.newvendor = oContext.getObject();
					//	this.getView().getModel().updateBindings(true);
				}
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
			// collectFileData: function (oEvent) {
			// 	this.oDoc.fileName = oEvent.getParameters().files[0].name;
			// 	this.oDoc.mediaType = oEvent.getParameter("files")[0].type;
			// },
			collectFileData: function (oEvent) {
				// var file = oEvent.getParameter("files")[0];
				// this.fileData = {
				// 	fileName: file.name,
				// 	mediaType: file.type,
				// 	url: "",
				// 	keyword: "",
				// 	shortDescription: ""
				// };
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

			handleAddUserOkPress: function () {

				var that = this;

				var Err = this.ValidateCreateVndr();
				if (Err == 0) {
					if (that.isAdd == "Edit") {

						/*----------------------------------------Integreation of update Vendor START--------------------------------------------*/

						var updateModelData = that.getView().getModel().getData();
						updateModelData.m_documents.forEach(function (obj, index) {
							updateModelData.m_documents[index] = obj.id;
						});

						$.ajax({
							type: "PUT",
							url: "/OptimalCog/api/m-vendors/" + updateModelData.id,
							data: {
								"data": updateModelData
							},
							success: function (res) {
								var resValue = JSON.parse(res);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("VDN1000" + resValue.data.id + " Vendor Updated successfully", {
										closeOnBrowserNavigation: false
									});
									that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
									that.getOwnerComponent().getRouter().navTo("Master");
									//	MessageBox.success(resValue.data.attributes.vendID + "Vendor Created successfully");
									that.clearform();
								}
							}
						});
						/*----------------------------------------Integreation of update Vendor END--------------------------------------------*/

						//this.getOwnerComponent().getModel("vendorInfo").updateBindings(true);

					} else {
						/*----------------------------------------Integreation of Add New Vendor START--------------------------------------------*/
						var mOrg = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;
						that.newvendor.m_organisation.push(mOrg);
						if (that.newvendor.cvTypeField === "") {
							that.newvendor.cvTypeField = "Vendor Direct";
						}
						that.getOwnerComponent().getModel().updateBindings();
						that.newvendor.m_documents.forEach(function (obj, index) {
							that.newvendor.m_documents[index] = obj.id;
						});
						$.ajaxSetup({
							headers: {
								'Authorization': "Bearer " + this.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
							}
						});
						$.ajax({
							type: "POST",
							url: "/OptimalCog/api/m-vendors",
							data: {
								"data": that.newvendor
							},
							success: function (response) {
								var resValue = JSON.parse(response);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("VDN1000" + resValue.data.id + " Vendor Created successfully", {
										closeOnBrowserNavigation: false
									});
									that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
									that.getOwnerComponent().getRouter().navTo("Master");
									that.getView().getModel("appView").getData().lastId = that.getView().getModel("appView").getData().lastId + 1;
									//	MessageBox.success(resValue.data.attributes.vendID + "Vendor Created successfully");
									that.clearform();
								}
							}
						});
					}

					// this.oDoc.keyword = this.byId("keyword").getValue();
					// this.oDoc.shortDescription = this.byId("short").getValue();
					// this.newvendor.documents.push(this.oDoc);
					/*----------------------------------------Integreation of Add New Vendor END--------------------------------------------*/
				} else {
					this.getView().setBusy(false);

					var text = "Mandatory Fields are Required";
					MessageBox.error(text);

				}

			},
			handleWizardCancel: function () {
				this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
				this.getOwnerComponent().getRouter().navTo("Master");
				this.clearform();
				// this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			},

			ValidateCreateVndr: function () {
				var Err = 0;
				if (this.getView().byId("vName").getValue() == "" || this.getView().byId("vName").getValue() == null) {
					Err++;
					// this.getView().byId("vName").setValueState("Error");
				} else {
					this.getView().byId("vName").setValueState("None");
				}
				if (this.getView().byId("vEml").getValue() == "" || this.getView().byId("vEml").getValue() == null) {
					Err++;
					// this.getView().byId("vEml").setValueState("Error");
				} else {
					this.getView().byId("vEml").setValueState("None");
				}
				if (this.getView().byId("contNum").getValue() == "" || this.getView().byId("contNum").getValue() == null) {
					Err++;
					// this.getView().byId("contNum").setValueState("Error");
				} else {
					this.getView().byId("contNum").setValueState("None");
				}
				if (this.getView().byId("vAbt").getValue() == "" || this.getView().byId("vAbt").getValue() == null) {
					Err++;
					// this.getView().byId("vAbt").setValueState("Error");
				} else {
					this.getView().byId("vAbt").setValueState("None");
				}
				if (this.getView().byId("vaddr").getValue() == "" || this.getView().byId("vaddr").getValue() == null) {
					Err++;
					// this.getView().byId("vaddr").setValueState("Error");
				} else {
					this.getView().byId("vaddr").setValueState("None");
				}
				if (this.getView().byId("vCty").getValue() == "" || this.getView().byId("vCty").getValue() == null) {
					Err++;
					// this.getView().byId("vCty").setValueState("Error");
				} else {
					this.getView().byId("vCty").setValueState("None");
				}
				if (this.getView().byId("vCtry").getValue() == "" || this.getView().byId("vCtry").getValue() == null) {
					Err++;
					// this.getView().byId("vCtry").setValueState("Error");
				} else {
					this.getView().byId("vCtry").setValueState("None");
				}
				if (this.getView().byId("vPerName").getValue() == "" || this.getView().byId("vPerName").getValue() == null) {
					Err++;
					// this.getView().byId("vPerName").setValueState("Error");
				} else {
					this.getView().byId("vPerName").setValueState("None");
				}
				if (this.getView().byId("vPerEml").getValue() == "" || this.getView().byId("vPerEml").getValue() == null) {
					Err++;
					// this.getView().byId("vPerEml").setValueState("Error");
				} else {
					this.getView().byId("vPerEml").setValueState("None");
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
					"vendID": "",
					"vendorName": "",
					"vendorEmail": "",
					"vendorContact": "",
					"zipCode": "",
					"vendorAddress": "",
					"vendorCity": "",
					"vendorCountry": "",
					"region1": "",
					"region2": "",
					"about": "",
					"cvTypeField": "",
					"contactPerson": "",
					"contactEmail": "",
					"contactPhone": "",
					"m_documents": [],
					"m_organisation": []
				};
				this.getView().setModel(new JSONModel(Obj));
				this.getView().getModel().updateBindings(true);
			},
			handleDocumentUpload: function () {
				if (!this.AddDocumentFragment) {

					this.AddDocumentFragment = sap.ui.xmlfragment("MDG.Vendor.fragment.vendorDocument", this);

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

			},
			// handleAddDocumentOkPress: function () {
			// 	this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
			// 	this.fileData.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[2].getValue();
			// 	var saveDocPath = this.getOwnerComponent().getModel().getData().length - 1;

			// 	this.getOwnerComponent().getModel().getData()[saveDocPath].documents.push(this.fileData);

			// 	// this.getView().getBindingContext().getObject().documents.push(this.fileData);
			// 	this.getView().getModel().updateBindings(true);
			// 	MessageToast.show("Vendor Document added succesfuly.");
			// 	this.getView().getModel().updateBindings(true);
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
			handleValidateContectNum: function (evt) {
				var userInput = evt.getSource().getValue();
				var sanitizedInput = userInput.replace(/\D/g, ''); // Remove non-numeric characters
				evt.getSource().setValue(sanitizedInput); // Update input field with sanitized input
			},
			
			// handleValidateContectNum: function (evt) {
			// 	var regex = evt.getSource().getValue();
			// 	var regex = /^[0-9]+$/;
			// 	if (regex.test(evt.getSource().getValue()) === false) {
			// 		evt.getSource().setValueState("Error");
			// 		this.NumErr = 1;
			// 		// if (evt.getSource().getValue().length) {
			// 		// 	// MessageToast.show(this.oBundle.getText("invalidEntryMsgEmail"));
			// 		// } else {
			// 		// 	evt.getSource().setValueState("None");
			// 		// }
			// 	} else {
			// 		evt.getSource().setValueState("None");
			// 		this.NumErr = 0;
			// 	}
			// },
			afterItemRemoved: function (evt) {
				var that = this;
				evt.getParameters().item.destroy();
				var selectedItem = evt.getParameters().item.getBindingContext().getObject();
				if (that.isAdd == "Edit") {
					var objPath = evt.getParameters().item.getBindingContext().getPath().split("/")[2];
					var records = this.getView().getModel("editDetails").getData().m_documents;
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