sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	// "sap/ui/core/library",
	// "sap/ui/unified/library",
	"sap/ui/unified/DateTypeRange",
	'sap/ui/model/Sorter',
	"sap/ui/export/Spreadsheet"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, JSONModel,
	DateTypeRange, Sorter, Spreadsheet) {
	"use strict";

	// return Controller.extend("MDG.glossary.controller.main", {});
	return Controller.extend("MDG.glossary.controller.main", {
		onInit: function () {
			var that = this;
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			this.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var loggedOrg = that.getOwnerComponent().getModel("loggedOnUserModel").getData();
			try {
				if (!this.EditGlossary) {
					this.EditGlossary = sap.ui.xmlfragment(this.getView().getId(), "MDG.glossary.fragment.EditGlossary", this);
					if (this.EditGlossary) this.EditGlossary.setModel(i18nModel, "i18n");
				}
				if (!this.AddGlossary) {
					this.AddGlossary = sap.ui.xmlfragment(this.getView().getId(), "MDG.glossary.fragment.AddGlossary", this);
					if (this.AddGlossary) this.AddGlossary.setModel(i18nModel, "i18n");
				}
				that.fetchData().then((resValue) => {
					var that = this;
					var oModel = resValue.data;
					var logOnOrgId = loggedOrg.m_organisation.orgID;
					var users = [];
					//Filter GlossaryData BasedOn Organization
					for (var k = 0; k < oModel.length; k++) {
						if (oModel[k].attributes.m_organisation.data.attributes.orgID == logOnOrgId)
							users.push(oModel[k]);
					}
					var oModel = new sap.ui.model.json.JSONModel(users);
					that.getView().setModel(oModel);
					// var tabModel = new sap.ui.model.json.JSONModel(that.getOwnerComponent().getModel("glossary").getData());
					// that.getView().byId("glossaryTable").setModel(tabModel);
					// that.maxId = 100 + that.getOwnerComponent().getModel("glossary").getData().length;

					// // Imp
					// 	var userPagePerm = loggedOrg.appPermission;
					// 	for (var i = 0; i < userPagePerm.length; i++) {
					// 		if (userPagePerm[i].name === "Glossary") {
					// 			that.pagePerm = userPagePerm[i];
					// 			break;
					// 		}
					// 	}
					// 	that.orgid = loggedOrg.m_organisation.orgID;
					// //	Ask from kaviya
					// 	// var org_filter = new sap.ui.model.Filter("orgID", "Contains", that.orgid);
					// 	// // removed getBining("Items") BoodiGowda
					// 	// that.getView().byId("glossaryTable").getBinding().filter(new sap.ui.model.Filter([org_filter], false));
					// 	// that.getView().byId("addid").setVisible(that.pagePerm.create);
					// 	// that.getView().byId("deleteid").setVisible(that.pagePerm.delete);
					// 	// if (!that.pagePerm.update) {
					// 	// 	that.getView().byId("glossaryTable").setMode(sap.m.ListMode.None);
					// 	// }
				}).catch((error) => {
					console.error(error);
				});

			} catch (error) {
				console.log(error);
			}

		},
		fetchData: function () {
			var deferred = $.Deferred();
			$.ajax({
				type: "GET",
				url: "/OptimalCog/api/m-glossaries?filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
					.getData()
					.m_organisation.id + "&populate=*",
				success: function (response) {
					var resValue = JSON.parse(response);
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
						deferred.reject(resValue.error);
					} else {
						deferred.resolve(resValue);
					}
				},
				error: function (error) {
					deferred.reject(error);
				}
			});

			return deferred.promise();
		},
		handleSelectionChange: function (oEvent) {
			var gettingText = oEvent.getParameter("item").getProperty("text");

			if (gettingText === 'Bulk Upload') {
				this.getView().byId('fileUploader').setVisible(true);
				this.getView().byId('fileUploaderSimpleform').setVisible(true);
				this.getView().byId('fileLabel').setVisible(true);
				this.getView().byId('fileUploadButton').setVisible(true);
				this.getView().byId('createRecord').setVisible(false);
				this.getView().byId('addButtonId').setVisible(false);
			} else {
				this.getView().byId('fileUploader').setVisible(false);
				this.getView().byId('createRecord').setVisible(true);
				this.getView().byId('fileLabel').setVisible(false);
				this.getView().byId('fileUploaderSimpleform').setVisible(false);
				this.getView().byId('fileUploadButton').setVisible(false);
				this.getView().byId('addButtonId').setVisible(true);

			}
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
				this.AddGlossary.setBusy(true);
				for (let i = 0; i < oModel.length; i++) {
					var row = oModel[i];
					var obj = {
						m_organisation: [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
						classification: row.classification,
						terminology: row.Terminology,
						abbrevation: row.Abbrevation,
						definition: row["Universal Definition"],
						businessDef: row["Bussiness Definition"],
						techDef: row["Technical Definition"],
						financeDef: row["Financial Definition"],
						status: row.Status,
						char: row.Char,
						source: row.Source
					};
					if (!row.Terminology) {
						continue;
					}
					for (let key in obj) {
						if (obj.hasOwnProperty(key) && typeof obj[key] === 'undefined') {
							delete obj[key];
						}
					}
					// localArray.push(obj);

					$.ajax({
						url: "/OptimalCog/api/m-glossaries",
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
								MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
								that.AddGlossary.setBusy(false);
							} else {
								const length = oModel.length;
								if (length - 1 === i) {
									that.AddGlossary.setBusy(false)
									that.AddGlossary.close();
									MessageBox.success("Glossary created successfully.");
									that.getView().byId("glossaryTable").getModel().updateBindings(true);
									that.onInit();
								}
							}
						}
					});
					// this._showDetail(FragmentData);
				}
			} else {
				MessageToast.show("Please Browse the file!");
			}
		},
		onSearchGlossary: function (oEvent) {
			var searchVal = oEvent.getParameters().query === undefined ? oEvent.getParameters("query").newValue : oEvent.getParameters().query;

			// var oBinding = this.getView().getBindingContext();
			//	var oBinding = this.getView().byId("glossaryTable").getBinding("rows");
			if (searchVal) {
				//	var searchVal = oEvent.getParameter("newValue");

				var terminolgy = new sap.ui.model.Filter("attributes/terminology", sap.ui.model.FilterOperator.Contains, searchVal);
				var classfication = new sap.ui.model.Filter("attributes/classification", sap.ui.model.FilterOperator.Contains, searchVal);
				var abbre = new sap.ui.model.Filter("attributes/abbreviation", sap.ui.model.FilterOperator.Contains, searchVal);
				var defi = new sap.ui.model.Filter("attributes/definition", sap.ui.model.FilterOperator.Contains, searchVal);
				var source = new sap.ui.model.Filter("attributes/source", sap.ui.model.FilterOperator.Contains, searchVal);
				var oFilter = new sap.ui.model.Filter({
					filters: [terminolgy, classfication, abbre, defi, source],
					and: false
				});
				var oList = this.getView().byId("glossaryTable");
				oList.getBinding("rows").filter([oFilter]);
			} else {
				oList.getBinding("rows").filter([oFilter])
			}
		},
		openEditGlossary: function (evt) {
			var that = this;
			var glossaryData = evt.getSource().getBindingContext().getObject();
			this.glossryObjPath = glossaryData.id;
			//	var glossaryData = this.getView().getModel("glossary").getData()[this.editPath];
			var oData = {
				"m_organisation": glossaryData.attributes.m_organisation.data.id,
				"classification": glossaryData.attributes.classification,
				"terminology": glossaryData.attributes.terminology,
				"abbrevation": glossaryData.attributes.abbrevation,
				"definition": glossaryData.attributes.definition,
				"businessDef": glossaryData.attributes.businessDef,
				"techDef": glossaryData.attributes.techDef,
				"financeDef": glossaryData.attributes.financeDef,
				"status": glossaryData.attributes.status === null ? "" : glossaryData.attributes.status,
				"char": glossaryData.attributes.char,
				"source": glossaryData.attributes.source
			};
			var EditModel = new sap.ui.model.json.JSONModel(oData);
			//var statusGlo = EditModel.getData().status;
			//this.EditGlossary.getContent()[0].getContent()[17].setSelectedKey(statusGlo);
			this.EditGlossary.setModel(EditModel);
			this.EditGlossary.open();

		},
		handleEditGlossaryCancel: function () {
			this.EditGlossary.close();
			this.getView().byId("glossaryTable").removeSelections(true);
		},
		handleEditGlossary: function (evt) {
			var that = this;
			var Err = this.ValidateEditGlossaryFragment();
			if (Err == 0) {
				// this.getView().getModel().updateBindings(true);
				//	this.getView().byId("glossaryTable").getModel().getData()[this.editPath] = this.EditGlossary.getModel().getData();
				var editModel = this.EditGlossary.getModel().getData();
				for (var prop in editModel) {
					var value = editModel[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						delete editModel[prop];
					}
				}
				$.ajax({
					url: "/OptimalCog/api/m-glossaries/" + this.glossryObjPath,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": editModel
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						console.log(getValues.error);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
						} else {
							that.getView().byId("glossaryTable").getModel().updateBindings(true);
							MessageBox.success("Glossary updated successfully.");
							that.EditGlossary.close();
							that.onInit();
						}
					}
				});
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
				// this.getView().byId("glossaryTable").removeSelections(true);
			}
		},
		ValidateEditGlossaryFragment: function () {
			var Err = 0;
			if (this.EditGlossary.getContent()[0].getContent()[1].getValue() == "" || this.EditGlossary.getContent()[0].getContent()[1].getValue() ==
				null) {
				Err++;
				//	this.EditGlossary.getContent()[0].getContent()[1].setValueState("Error");
			} else {
				//	this.EditGlossary.getContent()[0].getContent()[1].setValueState("None");
			}

			// if (this.EditGlossary.getContent()[0].getContent()[5].getValue() == "" || this.EditGlossary.getContent()[0].getContent()[5].getValue() ==
			// 	null) {
			// 	Err++;
			//	this.EditGlossary.getContent()[0].getContent()[5].setValueState("Error");
			// } else {
			//	this.EditGlossary.getContent()[0].getContent()[5].setValueState("None");
			// }

			return Err;
		},
		handleAddGlossaryCancel: function () {
			var that = this;
			var Obj = {
				Terminology: "",
				Abbreviation: "",
				Definition: "",
				Source: ""
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(Obj);
			this.AddGlossary.setModel(fragmentModel);
			this.AddGlossary.close();
		},
		openAddNewGlossary: function (evt) {
			var that = this;
			var Obj = {
				"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
				"classification": "",
				"terminology": "",
				"abbrevation": "",
				"definition": "",
				"businessDef": "",
				"techDef": "",
				"financeDef": "",
				"status": "New",
				"source": "",
				"char": ""
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(Obj);
			this.AddGlossary.setModel(fragmentModel);
			this.AddGlossary.open();
		},
		handleAddGlossary: function () {
			var that = this;
			var Err = this.ValidateAddGlossaryFragment();
			if (Err == 0) {
				var FragmentData = this.AddGlossary.getModel().getData();

				for (var prop in FragmentData) {
					var value = FragmentData[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						delete FragmentData[prop];
					}
				}
				$.ajax({
					url: "/OptimalCog/api/m-glossaries",
					type: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": FragmentData
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						console.log(getValues.error);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
						} else {
							that.getView().byId("glossaryTable").getModel().updateBindings(true);
							MessageBox.success("Glossary created successfully.");
							that.onInit();

						}
					}
				});
				// this._showDetail(FragmentData);
				this.AddGlossary.close();
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}

		},
		ValidateAddGlossaryFragment: function () {
			var Err = 0;
			if (this.AddGlossary.getContent()[0].getContent()[1].getValue() == "" || this.AddGlossary.getContent()[0].getContent()[1].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[1].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[1].setValueState("None");
			}

			if (this.AddGlossary.getContent()[0].getContent()[5].getValue() == "" || this.AddGlossary.getContent()[0].getContent()[5].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[5].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[5].setValueState("None");
			}

			return Err;
		},

		/*delete*/
		delete: function () {
			this.getView().byId("glossaryTable").setMode(sap.m.ListMode.Delete);
			this.getView().byId("deleteid").setVisible(false);
			this.getView().byId("completedid").setVisible(true);

		},
		deletioncompleted: function () {
			this.getView().byId("glossaryTable").setMode(sap.m.ListMode.SingleSelectMaster);
			this.getView().byId("deleteid").setVisible(true);
			this.getView().byId("completedid").setVisible(false);

		},
		deleteGlossary: function (evt) {
			var that = this;
			that.index = evt.getSource().getBindingContext().getObject().id;
			MessageBox.confirm(that.oResourceBundle.getText("GlossaryDeleteConfirmMsg"), {
				title: that.oResourceBundle.getText("confirmdeletetext"),
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-glossaries/" + that.index,
							success: function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									that.getView().byId("glossaryTable").getModel().updateBindings(true);
									MessageBox.success("Glossary Deleted successfully.");
									that.onInit();
								}
							}
						});
					}
				}
			});

		},

		onExport: function () {
			var oData = this.getView().getModel().getData();
			var aColumns = this.createColumns();

			var oSettings = {
				workbook: {
					columns: aColumns
				},
				dataSource: oData,
				fileName: "Glossary.xlsx"
			};

			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
			oSpreadsheet.build();
		},

		createColumns: function () {

			return [{
				label: "classification",
				property: "attributes/classification"
			}, {
				label: "Terminology",
				property: "attributes/terminology"
			}, {
				label: "Abbreviation",
				property: "attributes/Abbreviation"
			}, {
				label: "Universal Definition",
				property: "attributes/definition"
			}, {
				label: "Bussiness Definition",
				property: "attributes/businessDef"
			}, {
				label: "Technical Definition",
				property: "attributes/techDef"
			}, {
				label: "Financial Definition",
				property: "attributes/financeDef"
			}, {
				label: "Status",
				property: "attributes/status"
			}, {
				label: "Source",
				property: "attributes/source"
			}, {
				label: "Char",
				property: "attributes/char"
			}];

		}

	});
});