sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"EHS/ManageAssessmentTemplates/util/Formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Formatter, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("EHS.ManageAssessmentTemplates.controller.TemplateCreation", {
		Formatter: Formatter,
		onInit: function (evt) {
			var that = this;
			this.oBundle = this.getOwnerComponent().getModel("i18nModel").getResourceBundle();
			if (!this.addSubSectionDialog) {
				this.addSubSectionDialog = sap.ui.xmlfragment("EHS.ManageAssessmentTemplates.view.addSubSectionDialog", this);
			}
			if (!this.editSubSectionDialog) {
				this.editSubSectionDialog = sap.ui.xmlfragment("EHS.ManageAssessmentTemplates.view.editSubSectionDialog", this);
			}
			if (!this.addInfoDialog) {
				this.addInfoDialog = sap.ui.xmlfragment("EHS.ManageAssessmentTemplates.view.addInfoDialog", this);
			}
			var oModel = new JSONModel();
			this.isPhone = this.getOwnerComponent().getModel("device").getData().system.phone;

			// this.getView().byId("statusid").setValue("Draft");
			// var oData = {
			// 	"Count": 0,
			// 	"From": "",
			// 	"To": "",
			// 	"industry": "",
			// 	"Status": "Draft",
			// 	"LastChanged": "",
			// 	"Factor_name": "",
			// 	"description": "",
			// 	"type": this.oBundle.getText("Inspection"),
			// 	"subfactors": []
			// };
			// var factorsModel = new sap.ui.model.json.JSONModel(oData);
			// this.getView().setModel(factorsModel);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("TemplateCreation").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			this.ondonepress();
			// this.getView().setBusy(true);
			this.getFormTypeList();
			if (oEvent.getParameter("arguments").create == "false") {
				this.masterPath = oEvent.getParameter("arguments").index;
				var masterData = this.getOwnerComponent().getModel("selTemplateData").getData();
				that.getStatusUorN = masterData.attributes.docquestionsDetial === undefined ? true : false;
				// this.getView().byId("indusId").setSelectedKey(masterData.attributes.m_form_type.data.id.split(" – ")[0]);
				// this.getView().byId("indusId").setSelectedKey(masterData.attributes.m_form_type.data.id);
				var updateOdata = {
					"name": masterData.attributes.name,
					"validFrom": masterData.attributes.validFrom,
					"validTo": masterData.attributes.validTo,
					"status": masterData.attributes.status,
					"description": masterData.attributes.description,
					"subfactors": [],
					"questions": masterData.attributes.docquestionsDetial === undefined ? [] : masterData.attributes.docquestionsDetial.attributes.questions,
					"m_form_type": masterData.attributes.m_form_type.data.id
				};
				if (updateOdata.questions.length !== 0) {
					updateOdata.questions.forEach(function (item) {
						updateOdata.subfactors.push({
							"subFactName": item.subFactName,
							"Sub_Factor_ID": item.Sub_Factor_ID
						});
					});
				}
				this.create = oEvent.getParameter("arguments").create;

				if (masterData.attributes.createTemplate === "Yes") {
					// oEvent.getParameter("arguments").create = "true";
					this.create = "true";
					updateOdata.status = "Draft";
					masterData.attributes.status = "Draft";
				}
				var masterModel = new sap.ui.model.json.JSONModel(updateOdata);
				this.getView().setModel(masterModel);

				that.getView().byId("titleId").setEditable(true);
				that.getView().byId("questionDeleteId").setEnabled(true);
				that.getView().byId("menuButtons").setEnabled(true);
				that.getView().byId("descId").setEditable(true);
				that.getView().byId("startDateId").setEditable(true);
				that.getView().byId("subDateIdd").setEditable(true);
				// that.getView().byId("indusId").setEditable(true);
				that.getView().byId("publishId").setVisible(true);
				that.getView().byId("saveDraftId").setVisible(true);
				that.getView().byId("editbtnid").setVisible(true);
				that.getView().byId("deletebtnid").setVisible(true);
				that.getView().byId("addbtnid").setVisible(true);
				if (masterData.attributes.status == "Published") {
					that.getView().byId("titleId").setEditable(false);
					that.getView().byId("questionDeleteId").setEnabled(false);
					that.getView().byId("menuButtons").setEnabled(false);
					that.getView().byId("descId").setEditable(false);
					that.getView().byId("startDateId").setEditable(false);
					that.getView().byId("subDateIdd").setEditable(false);
					// that.getView().byId("indusId").setEditable(false);
					that.getView().byId("publishId").setVisible(false);
					that.getView().byId("saveDraftId").setVisible(false);
					that.getView().byId("editbtnid").setVisible(false);
					that.getView().byId("deletebtnid").setVisible(false);
					that.getView().byId("addbtnid").setVisible(false);
				}
			} else {
				var oData = {
					"Count": 0,
					"validFrom": "",
					"validTo": "",
					// "industry": "",
					"status": "Draft",
					// "LastChanged": "",
					"name": "",
					"description": "",
					"type": this.oBundle.getText("Inspection"),
					"subfactors": [],
					"questions": [],
					"template_ID": "Temp" + Math.floor(Math.random() * (999999 - 9))
				};
				this.create = "true";
				var factorsModel = new sap.ui.model.json.JSONModel(oData);
				this.getView().setModel(factorsModel);

				that.getView().byId("titleId").setEditable(true);
				that.getView().byId("questionDeleteId").setEnabled(true);
				that.getView().byId("menuButtons").setEnabled(true);
				that.getView().byId("descId").setEditable(true);
				that.getView().byId("startDateId").setEditable(true);
				that.getView().byId("subDateIdd").setEditable(true);
				// that.getView().byId("indusId").setEditable(true);
				that.getView().byId("publishId").setVisible(true);
				that.getView().byId("saveDraftId").setVisible(true);
				that.getView().byId("editbtnid").setVisible(true);
				that.getView().byId("deletebtnid").setVisible(true);
				that.getView().byId("addbtnid").setVisible(true);
				that.getView().byId("indusId").setSelectedKey("");
			}

			this.getView().byId("addQuesButId").setEnabled(false);

		},
		getFormTypeList: function () {
			var that = this;
			$.ajax({
				type: "GET",
				url: "/OptimalCog/api/m-form-types",
				success: function (response) {
					var resValue = JSON.parse(response);
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						var jsonModel = new sap.ui.model.json.JSONModel(resValue.data);
						that.getView().setModel(jsonModel, "formType");
					}
				}
			});
		},
		onSelectRadio: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath().split("/");
			this.getView().getModel().getData().questions[path[2]].Options[path[4]].weight = oEvent.getParameter("selected");
			this.getView().getModel().updateBindings();
		},
		onSelectCheckBox: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath().split("/");
			this.getView().getModel().getData().questions[path[2]].Options[path[4]].weight = oEvent.getParameter("selected");
			this.getView().getModel().updateBindings();
		},
		onTitleAdd1: function (evt) {
			var source = evt.getSource(),
				id = source.getId(),
				value = source.getValue();
			switch (true) {
			case id.includes("titleId"):
				if (value) {
					source.setValueState("None");
				} else {
					source.setValueStateText("Required").setValueState("Error");
				}
				break;
			}
		},
		handleChange: function (evt) {
			var source = evt.getSource(),
				id = source.getId(),
				key = source.getSelectedKey();
			switch (true) {
			case id.includes("typeId"):
				if (key) {
					source.setValueState("None");
					if (this.getView().getModel())
						this.getView().getModel().getData().type = this.getView().byId("typeId").getSelectedKey();
					// if(this.getView().getModel().getData().type)
				} else {
					source.setValueStateText("Required").setValueState("Error");
				}
				break;

			}
		},
		handleStartDateChange: function (evt) {
			var sDate = this.getView().byId("startDateId").getValue();
			var eDate = this.getView().byId("subDateIdd").getValue();
			//var From = EHS.Manager.model.formatter.dateFormatConvertion(sdate, edate);
			if (sDate != "") {
				this.getView().getModel().getData().From = this.formatDate(sDate);
			}
			if (eDate != "") {
				this.getView().getModel().getData().To = this.formatDate(eDate);
			}
			eDate = new Date(this.formatDate(eDate));
			sDate = new Date(this.formatDate(sDate));
			if (sDate != '') {
				this.getView().byId("subDateIdd").setMinDate(sDate);
				this.getView().byId("subDateIdd").setEnabled(true);
				this.getView().byId("startDateId").setValueState("None");
			}
			if (eDate !== '') {
				this.getView().byId("subDateIdd").setValueState("None");
			}
			if (sDate != '' && eDate != '' && sDate > eDate) {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(
					this.oBundle.getText("endDateErrMsg"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				this.getView().byId("subDateIdd").setValueState("Error");
			}
		},
		onAddSectionpress: function (evt) {
			this.addSubSectionDialog.getContent()[0].getContent()[1].setValue("");
			this.addSubSectionDialog.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18nModel");
			this.addSubSectionDialog.open();
		},
		onAddSubSectionSavePress: function (evt) {
			if (this.addSubSectionDialog.getContent()[0].getContent()[1].getValue() != "") {

				var newSubFacName = this.addSubSectionDialog.getContent()[0].getContent()[1].getValue();
				this.subfactorid = Math.floor(1000 + Math.random() * 9000);
				var subfactorsData = {
					"Sub_Factor_ID": this.subfactorid,
					"subFactName": newSubFacName
				};
				this.getView().getModel().getData().subfactors.push(subfactorsData);
				this.getView().getModel().updateBindings();
			} else {
				MessageToast.show(this.oBundle.getText("SectionNameEmpty"));
			}
			this.addSubSectionDialog.close();
		},
		onAddSubSectionSavePress1: function (evt) {
			if (this.addSubSectionDialog.getContent()[0].getContent()[1].getValue() != "") {
				var factorsModel = this.getView().byId("sectionListId").getModel();
				var newSubFacName = this.addSubSectionDialog.getContent()[0].getContent()[1].getValue();
				this.subfactorid = Math.floor(Math.random() * 20);
				var newSubFactor = {
					"id": this.subfactorid,
					"name": newSubFacName
				};
				if (factorsModel.getData().sub_Factors == undefined)
					factorsModel.getData().sub_Factors = [];
				factorsModel.oData.sub_Factors.push(newSubFactor);
				factorsModel.updateBindings(true);
				this.getView().byId("sectionListId").getItems()[this.getView().byId("sectionListId").getItems().length - 1].setSelected(true);
				this.getView().byId("addQuesButId").setEnabled(true);
				this.getView().byId("breadCrumbsId").setText(sap.ui.getCore().getModel("i18nModel").getProperty("Category") + ":" + newSubFactor.name);
				var aFilter = [];
				aFilter.push(new Filter("Sub_Factor_ID", "EQ", newSubFactor.id));
				var oList = this.getView().byId("questionPanel");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
				this.addSubSectionDialog.close();
			} else {
				MessageToast.show(this.oBundle.getText("SectionNameEmpty"));
			}
		},
		onAddSubSectionCancelPress: function (evt) {
			this.addSubSectionDialog.close();
		},
		onSubFactorpress: function (evt) {
			this.getView().byId("questionPanel").getBinding("items").sort([]);
			var mode = this.getView().byId("sectionListId").getMode();
			if (mode == "SingleSelect") {
				this.path = evt.getParameters().listItem.getBindingContextPath().split("/");
				var factorsModel = this.getView().byId("sectionListId").getModel();
				var fac_name = factorsModel.oData.subfactors[this.path[2]].subFactName;
				this.editSubSectionDialog.getContent()[0].getContent()[1].setValue(fac_name);
				this.editSubSectionDialog.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18nModel");
				this.editSubSectionDialog.open();
			} else {
				this.getView().byId("breadCrumbsId").setText(this.oBundle.getText("Section") + ": " + evt.getSource()
					.getSelectedItem()
					.getTitle());
				if (this.getView().byId("statusid").getValue() == "Draft" || this.getView().byId("statusid").getValue() == "Entwurf")
					this.getView().byId("addQuesButId").setEnabled(true);
				var factorsModel = this.getView().byId("sectionListId").getModel();
				this.path = evt.getParameters().listItem.getBindingContextPath().split("/")[2];
				// var subfacid = factorsModel.oData.subfactors[this.path].id;
				var subfacid = factorsModel.oData.subfactors[this.path].Sub_Factor_ID;

				var aFilter = [];
				aFilter.push(new Filter("Sub_Factor_ID", "EQ", subfacid));
				var oList = this.getView().byId("questionPanel");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
				// var factorsModel = this.getView().byId("sectionListId").getModel();
				// var path = evt.getParameters().listItem.getBindingContextPath().split("/");
				// var subfac = factorsModel.oData.Factors[path[2]].Factors[path[4]];
				// var index = factorsModel.oData.Factors[path[2]].Factors.indexOf(subfac);
				// var questionPanel = this.getView().byId("questionPanel");
				// var panel = this.getView().byId("panelid");
				if (this.create == "false") {
					// this.getOwnerComponent().getModel("DocAndQues").getData()[this.masterPath].Status == "Published"
					if (this.getView().getModel().getData().status == "Published") {
						this.getView().byId("addQuesButId").setEnabled(false);
					} else {
						this.getView().byId("addQuesButId").setEnabled(true);
					}
				} else this.getView().byId("addQuesButId").setEnabled(true);
				// questionPanel.bindAggregation("items", "/Factors/" + this.len + "/Factors/" + index + "/Questions", panel);

			}
			if (this.isPhone) {
				this.getView().byId("questionBlock").setVisible(true);
				this.getView().byId("categoryRow").setVisible(false);
			}
		},
		onEditSectionpress: function (evt) {
			if (this.getView().byId("sectionListId").getModel().getData().subfactors.length !== 0) {
				// this.getView().byId("listheader").setVisible(false);
				// this.getView().byId("listfooter").setVisible(true);
				this.getView().byId("sectionListId").removeSelections();
				this.getView().byId("addbtnid").setVisible(false);
				this.getView().byId("deletebtnid").setVisible(false);
				this.getView().byId("editbtnid").setVisible(false);
				this.getView().byId("donebtnid").setVisible(true);
				this.getView().byId("sectionListId").setMode("SingleSelect");
				var oList = this.getView().byId("questionPanel");
				var aFilter = [];
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
				this.getView().byId("breadCrumbsId").setText(sap.ui.getCore().getModel("i18nModel").getProperty("Category") + ":" + sap.ui.getCore()
					.getModel(
						"i18nModel").getProperty("AllCategories"));
				var aSorters = [];
				oList.getBinding("items").sort(aSorters);
				aSorters.push(new sap.ui.model.Sorter("subFactName", false, true));
				oList.getBinding("items").sort(aSorters);
			} else {
				sap.m.MessageToast.show(this.oBundle.getText("NoSectionToEdit"));
			}
		},
		ondeleteSubSectionpress: function (evt) {
			if (this.getView().byId("sectionListId").getModel().getData().subfactors.length !== 0) {
				this.getView().byId("addbtnid").setVisible(false);
				this.getView().byId("deletebtnid").setVisible(false);
				this.getView().byId("editbtnid").setVisible(false);
				this.getView().byId("donebtnid").setVisible(true);
				this.getView().byId("sectionListId").setMode("Delete");
				var aFilter = [];
				var oList = this.getView().byId("questionPanel");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
				// this.getView().byId("breadCrumbsId").setText(sap.ui.getCore().getModel("i18nModel").getProperty("Category") + ":" + sap.ui.getCore()
				// 	.getModel(
				// 		"i18nModel").getProperty("AllCategories"));
				var aSorters = [];
				oList.getBinding("items").sort(aSorters);
				aSorters.push(new sap.ui.model.Sorter("subFactName", false, true));
				oList.getBinding("items").sort(aSorters);
			} else {
				sap.m.MessageToast.show(this.oBundle.getText("NoSectionToDelete"));
			}
		},
		removeListSelection: function () {
			var list = this.getView().byId("sectionListId").getItems();
			for (var i = 0; i < list.length; i++) {
				list[i].setSelected(false);
			}
		},
		onEditSectionSavePress: function (evt) {
			var factorsModel = this.getView().byId("sectionListId").getModel();
			var newSubFacName = this.editSubSectionDialog.getContent()[0].getContent()[1].getValue();
			var cataText = this.getView().byId("breadCrumbsId").getText();
			if (cataText.indexOf(factorsModel.oData.subfactors[this.path[2]].subFactName) != (-1))
				this.getView().byId("breadCrumbsId").setText(this.oBundle.getText("Category") + " : " + newSubFacName)
			factorsModel.oData.subfactors[this.path[2]].subFactName = newSubFacName;
			factorsModel.updateBindings();
			this.removeListSelection();
			this.getView().byId("sectionListId").getModel().updateBindings();
			var ques = this.getView().byId("questionPanel").getModel().oData.questions;
			for (var k = 0; k < ques.length; k++) {
				if (ques[k].Sub_Factor_ID == factorsModel.oData.subfactors[this.path[2]].id)
					ques[k].subFactName = factorsModel.oData.subfactors[this.path[2]].subFactName;
			}
			if (cataText.indexOf(this.oBundle.getText("AllCategories")) != (-1)) {
				this.handleAllCategoriesExpand();
			}
			//this.getView().byId("questionPanel").getModel().updateBindings(true);
			this.editSubSectionDialog.close();

		},
		/*onEditSectionSavePress: function (evt) {
			var factorsModel = this.getView().byId("sectionListId").getModel();
			var newSubFacName = this.editSubSectionDialog.getContent()[0].getContent()[1].getValue();
			factorsModel.oData.sub_Factors[this.path[2]].name = newSubFacName;
			factorsModel.updateBindings(true);
			this.getView().byId("sectionListId").removeSelections();
			this.editSubSectionDialog.close();
			this.handleAllCategoriesExpand();
		},*/
		onEditDialogCancelPress: function (evt) {
			this.editSubSectionDialog.close();
		},
		addQuestion: function (evt) {
			// this.getView().byId("noQuestionTextId").setVisible(false);
			if (this.getView().byId("sectionListId").getSelectedItem() != null) {
				var path = this.getView().byId("sectionListId").getSelectedItem().getBindingContextPath().split("/")[2];
				var quesModel = this.getView().byId("questionPanel").getModel();
				if (this.getView().byId("questionPanel").getItems().length == 0) {
					this.count = this.getView().byId("questionPanel").getItems().length + 1;
					var newQuestion = {
						"Question_No": this.getView().byId("questionPanel").getItems().length + 1,
						"QuestionType": "Paragraph",
						"Sub_Factor_ID": this.getView().getModel().getData().subfactors[path].Sub_Factor_ID,
						"subFactName": this.getView().getModel().getData().subfactors[path].subFactName,
						"Question": "",
						"Options": [{
							"option": "",
							"weight": ""
						}]
					};
				} else {
					var newQuestion = {
						"Question_No": this.getView().byId("questionPanel").getItems().length + 1,
						"QuestionType": "Paragraph",
						"Sub_Factor_ID": this.getView().getModel().getData().subfactors[path].Sub_Factor_ID,
						"subFactName": this.getView().getModel().getData().subfactors[path].subFactName,
						"Question": "",
						"Options": [{
							"option": "",
							"weight": ""
						}]
					};
					this.count = this.count + 1;
				}
				this.getView().getModel().getData().questions.push(newQuestion);
				this.getView().getModel().updateBindings();
				var factorsModel = this.getView().byId("sectionListId").getModel();
				var subfacid = factorsModel.oData.subfactors[path].Sub_Factor_ID;
				var aFilter = [];
				aFilter.push(new Filter("Sub_Factor_ID", "EQ", subfacid));
				var oList = this.getView().byId("questionPanel");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
			} else {
				MessageToast.show("Please Select Category.")
			}
		},

		onNavBack: function (evt) {
			var that = this;
			MessageBox.confirm(this.oBundle.getText("NavBackCnfrmMsg"), {
				onClose: function (oAction) {
					if (oAction === "OK") {
						that.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
						that.getView().byId("questionArea").scrollTo(0, 0);
						var newTempData = that.getOwnerComponent().getModel("DocAndQues");

						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("RouteAssessmentTemplateDetails", {
							data: newTempData
						});
					}
				}
			});
			// this .clearData();
		},
		handleAddInfo: function (evt) {
			this.addInfoDialog.getContent()[0].getContent()[1].setValue(evt.getSource().getBindingContext().getObject().AdditionalInfo);
			this.addInfoPath = evt.getSource().getBindingContext().getPath().split("/");
			this.addInfoDialog.open();
		},
		onAddInfoSavePress: function (evt) {
			var quesModel = this.getView().byId("questionPanel").getModel();
			quesModel.getData().questions[0] = this.addInfoDialog.getContent()[0].getContent()[1].getValue();
			quesModel.updateBindings();
			this.addInfoDialog.close();
		},
		onAddInfoCancelPress: function (evt) {
			this.addInfoDialog.close();
		},
		panelCreation: function () {
			var that = this;
			var panel = new sap.m.Panel({
				expandable: true,
				expanded: true,
				width: "auto"
			}).setHeaderToolbar(new sap.m.Toolbar({
				"height": "3rem"
			}));
			var panelBar = panel.getHeaderToolbar();
			panelBar.addContent(new sap.m.Title({
				"text": "{Question_No}"
			}));
			panelBar.addContent(new sap.m.TextArea({
				value: "{Question}",
				placeholder: "Question",
				width: "35rem",
				liveChange: function () {}
			}));
			// var menu = new sap.m.MenuButton({tooltip:"Menu"});
			// menu.addItem(new)
			var menuButton = new sap.m.MenuButton({
				menu: new sap.m.Menu({
					tooltip: "Menu",
					items: [
						new sap.m.MenuItem({
							text: "Multiple Choice"
						}),
						new sap.m.MenuItem({
							text: "Single Choice"
						}),
						new sap.m.MenuItem({
							text: "Paragraph"
						}),
						new sap.m.MenuItem({
							text: "Delete",
							icon: "sap-icon://delete"
						})
					],
					itemSelected: function (evt) {
						var selectedText = evt.getParameter("item").getText();
						if (selectedText === "Multiple Choice") {
							var path = evt.getSource().getBindingContext().getPath().split("/");
							var factorsModel = that.getView().getModel();
							factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Question_Type = "Multiple Choice";
							factorsModel.updateBindings(true);
						} else if (selectedText === "Single Choice") {
							var path = evt.getSource().getBindingContext().getPath().split("/");
							var factorsModel = that.getView().getModel();
							factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Question_Type = "Single Choice";
							factorsModel.updateBindings(true);
						} else if (selectedText === "Paragraph") {
							var path = evt.getSource().getBindingContext().getPath().split("/");
							var factorsModel = that.getView().getModel();
							factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Question_Type = "Paragraph";
							factorsModel.updateBindings(true);
						} else {
							var path = evt.getSource().getBindingContext().getPath().split("/");
							var factorsModel = that.getView().getModel();
							factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions.splice(path[4], 1);
							factorsModel.updateBindings(true);
						}
					}
				})
			});
			panelBar.addContent(menuButton);
			var vbox = new sap.m.VBox({});
			var hbox = new sap.m.HBox({
				// 	// visible: "{path:'Question_Type',formatter:'Formatter.getTypeofQuestionForSingChoi'}"
				// 	visible: "{path:'Question_Type', formatter: 'function(value) {
				// 	console.log(value);
				// 	return parseInt(value);
				// }"
			}).setVisible({
				path: "Question_Type",
				formatter: Formatter.getTypeofQuestionForSingChoi
			});
			hbox.addItem(new sap.m.RadioButton({}));
			hbox.addItem(new sap.m.Input({
				value: "{option}",
				placeholder: "Option",
				width: "20rem",
				liveChange: function (evt) {
					var path = evt.getSource().getBindingContext().getPath().split("/");
					var factorsModel = that.getView().byId("questionPanel").getModel();
					var optionObj = factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Options;
					if (path[8] == optionObj.length - 1) {
						var newOption = {
							"option": "",
							"Question": factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Question,
							"weight": null
						};
						optionObj.push(newOption);
						factorsModel.updateBindings(true);
					}
				}
			}));
			hbox.addItem(new sap.m.Button({
				tooltip: "Delete Option",
				icon: "sap-icon://delete",
				type: "Transparent",
				press: function (evt) {
					var path = evt.getSource().getBindingContext().getPath().split("/");
					var factorsModel = that.getView().byId("questionPanel").getModel();
					factorsModel.oData.Factors[path[2]].Factors[path[4]].Questions[path[6]].Options.splice(path[8], 1);
					factorsModel.updateBindings(true);
				}
			}));
			hbox.addItem(new sap.m.Input({
				width: "4rem",
				placeholder: "Weight",
				value: "{weight}"
			}));
			//vbox.addItem(hbox);
			vbox.bindAggregation("items", {
				path: 'Options',
				template: hbox,
				templateShareable: true
			});
			panel.addContent(vbox);

			// var mvbox = new sap.m.VBox({});
			// var mhbox = new sap.m.HBox({
			// 	visible: "{path:'Question_Type',formatter:'Formatter.getTypeofQuestionForMultiChoi'}"
			// });
			// mhbox.addItem(new sap.m.CheckBox({}));
			// mhbox.addItem(new sap.m.Input({
			// 	value: "{option}",
			// 	placeholder: "Option",
			// 	width: "20rem",
			// 	liveChange: function () {}
			// }));
			// mhbox.addItem(new sap.m.Button({
			// 	tooltip: "Delete Option",
			// 	icon: "sap-icon://delete",
			// 	type: "Transparent",
			// 	press: function () {}
			// }));
			// mhbox.addItem(new sap.m.Input({
			// 	width: "4rem",
			// 	placeholder: "Weight",
			// 	value: "{weight}"
			// }));
			// //vbox.addItem(hbox);
			// mvbox.bindAggregation("items", {
			// 	path: 'Options',
			// 	template: hbox,
			// 	templateShareable: true
			// });
			// panel.addContent(mvbox);

			// var pvbox = new sap.m.VBox({});
			// var phbox = new sap.m.HBox({
			// 	visible: "{path:'Question_Type',formatter:'Formatter.getTypeofQuestionForPara'}"
			// });

			// phbox.addItem(new sap.m.TextArea({
			// 	placeholder: "Answer",
			// 	width: "20rem",
			// }));

			// //vbox.addItem(hbox);
			// pvbox.bindAggregation("items", {
			// 	path: 'Options',
			// 	template: hbox,
			// 	templateShareable: true
			// });
			// panel.addContent(pvbox);
			return panel;
		},
		onInputChange: function (evt) {
			var objPath = evt.getSource().getBindingContext().getPath().split("/");
			var questionsModel = this.getView().byId("questionPanel").getModel();
			var optionObj = questionsModel.getData().questions[objPath[2]].Options;
			if (objPath.length == 5) {
				// questionsModel.getData().questions[objPath[2]].Options[objPath[2]].option = evt.getSource().getValue();
				if (objPath[4] == optionObj.length - 1) {
					optionObj.push({
						option: "",
						weight: ""
					});
					questionsModel.updateBindings();
				}
			} else {
				questionsModel.getData().questions[objPath[2]].Question = evt.getSource().getValue();
				questionsModel.updateBindings();
			}
			// var objPath = evt.getSource().getBindingContext().getPath().split("/");
			// var questionsModel = this.getView().byId("questionPanel").getModel();

			// var optionObj = questionsModel.oData.questions[objPath[2]].options;
			// if (objPath[4] == optionObj.length - 1) {
			// 	// var newOption = {
			// 	// 	"option": "",
			// 	// 	"Question": questionsModel.oData.Questions[objPath[2]].Question,
			// 	// 	"weight": null
			// 	// };
			// 	// optionObj.push("newOption");
			// 	optionObj.push("");
			// 	questionsModel.updateBindings(true);
			// }
		},
		onTextAreaChange: function (evt) {
			var objPath = evt.getSource().getBindingContext().getPath().split("/");
			var questionsModel = this.getView().byId("questionPanel").getModel();
			// var optionObj = questionsModel.getData().questions[objPath[2]].Options;
			questionsModel.getData().questions[objPath[2]].Options[0].option = evt.getSource().getValue();
			questionsModel.updateBindings();
		},
		onSaveSubSectionpress: function (evt) {
			this.getView().byId("listheader").setVisible(true);
			this.getView().byId("listfooter").setVisible(false);
			this.getView().byId("sectionListId").setMode("SingleSelectMaster");
		},
		ondonepress: function (evt) {
			// var factorsModel = new sap.ui.model.json.JSONModel();
			// factorsModel.loadData(jQuery.sap.getModulePath("EHS.ManageAssessmentTemplates.model", "/Factors.json"));
			// this.getView().byId("sectionListId").setModel(factorsModel);
			this.getView().byId("editbtnid").setVisible(true);
			this.getView().byId("addbtnid").setVisible(true);
			this.getView().byId("deletebtnid").setVisible(true);
			this.getView().byId("donebtnid").setVisible(false);
			this.getView().byId("sectionListId").removeSelections();
			this.getView().byId("sectionListId").setMode("SingleSelectMaster");
		},
		handleSubSectionDelete: function (evt) {
			var path = evt.getParameters().listItem.getBindingContextPath().split("/");
			var factorsModel = this.getView().byId("sectionListId").getModel();
			var id = factorsModel.getData().subfactors[path[2]].Sub_Factor_ID;
			var quesModel = this.getView().byId("questionPanel").getModel();
			var ques = quesModel.getData().questions;
			for (var i = 0; i < ques.length; i++) {
				if (ques[i].Sub_Factor_ID == id) {
					ques.splice(i, 1);
				}
			}
			quesModel.updateBindings();
			factorsModel.oData.subfactors.splice(path[2], 1);
			factorsModel.updateBindings();

		},
		onMenuAction: function (evt) {
			// var path = evt.getSource().getParent().getParent().getBindingContext().getPath().split("/");
			// var factorsModel = this.getView().byId("questionPanel").getModel();
			// factorsModel.oData.Questions[path[2]].Question_Type =
			evt.getParameter("item").getBindingContext().getObject().QuestionType = evt.getParameter("item").getText();
			// if (evt.getParameter("item").getText() == "Multiple Choice") {
			// 	evt.getParameter("item").getBindingContext().getObject().SelItems = [];
			// } else if (evt.getParameter("item").getText() == "Single Choice") {
			// 	debugger;
			// 	evt.getParameter("item").getBindingContext().getObject().AnsSingleC = "";
			// }
			evt.getParameter("item").getBindingContext().getModel().updateBindings();
		},
		handleOptionDelete: function (evt) {
			var that = this;
			var objPath = evt.getSource().getBindingContext().getPath().split("/");
			var questionsModel = this.getView().byId("questionPanel").getModel();
			if (objPath[4] == 0) {
				MessageBox.error(that.oBundle.getText("optionerrorMssg"));
			} else {
				questionsModel.getData().questions[objPath[2]].Options.splice(objPath[4], 1);
				questionsModel.updateBindings();
			}
			/*	var questionsModel = this.getView().byId("questionPanel").getModel();
				var path = evt.getSource().getBindingContext().getPath().split("/");
				questionsModel.oData.questions[path[2]].option.splice(path[4], 1);
				questionsModel.updateBindings(true);*/
		},
		handleQuestionDelete: function (evt) {
			var that = this;
			var questionEvt = evt.getSource();
			var questionsModel = that.getView().byId("questionPanel").getModel();
			var path = questionEvt.getBindingContext().getPath().split("/");
			var id = questionEvt.getBindingContext().getObject().Sub_Factor_ID;
			questionsModel.getData().questions.splice(path[2], 1);
			var i = 1;
			questionsModel.getData().questions.forEach(function (ques) {
				if (ques.Sub_Factor_ID === id) {
					ques.Question_No = i++;
				}
			});
			questionsModel.updateBindings();
			/*if (questionsModel.getData().questions.length === 0)
				this.getView().byId("noQuestionTextId").setVisible(true);*/
			/*MessageBox.confirm("Are you sure want to delete the question?",{onClose:function(oEvent){
				if (oEvent == "OK") {
					var questionsModel = that.getView().byId("questionPanel").getModel();
					var path = questionEvt.getBindingContext().getPath().split("/");
					questionsModel.oData.questions.splice(path[2], 1);
					questionsModel.updateBindings(true);
				}
			}});*/
		},
		onSaveDraftPress: function (evt) {

			this.getView().setBusy(true);
			var that = this;
			// console.log(evt);
			var title = this.getView().byId("titleId").getValue();
			var desc = this.getView().byId("descId").getValue();
			var start = this.getView().byId("startDateId").getValue();
			var end = this.getView().byId("subDateIdd").getValue();

			var subsec = this.getView().byId("questionPanel").getModel().getData() !== null ? this.getView().byId("questionPanel").getModel().getData()
				.subfactors : [];

			var ques = this.getView().byId("questionPanel").getModel().getData() !== null ? this.getView().byId("questionPanel").getModel().getData()
				.questions : [];
			var err = 0;
			if (subsec.length > 0 && ques.length == 0) {
				// MessageToast.show("Add atleast 1 option to the section");
				err = 1;
			}

			// var duration = this.getView().byId("durationId").getValue();
			// var unit = this.getView().byId("unitId").getSelectedKey();
			if (title === "") {
				this.getView().byId("titleId").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			/*	if(desc === ""){
					this.getView().byId("descId").setValueState(sap.ui.core.ValueState.Error);
					err = 1;
				}*/
			if (this.getView().byId("indusId").getSelectedKey() == "") {
				this.getView().byId("indusId").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			if (start === "") {
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			if (end === "") {
				this.getView().byId("subDateIdd").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}

			var startDate = new Date(this.formatDate(this.getView().byId("startDateId").getValue()));
			var endDate = new Date(this.formatDate(this.getView().byId("subDateIdd").getValue()));

			if (startDate > endDate) {
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.Error);
				var dateFlag = true;
				err = 1;
			}
			// if (ques.length !== 0) {
			// 	var alreadySeen = [];
			// 	ques.forEach(function (str)) {
			// 		if (alreadySeen[str.Question]) {
			// 			// MessageBox.show(str.Question + " " + that.oBundle.getText("alreadyExists"));
			// 			err = 1;
			// 		} else {
			// 			alreadySeen[str.Question] = true;
			// 		}
			// 	});
			// }
			if (ques.length !== 0) {
				var alreadySeen = {};
				ques.forEach(function (question, index) {
					if (alreadySeen[question.Question] !== undefined || question.Question == "") {
						// MessageBox.show(question.Question + " " + that.oBundle.getText("alreadyExists"));
						err = 1;
					} else {
						alreadySeen[question.Question] = index;
					}
				});
			}

			if (err === 0) {
				this.getView().byId("titleId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("descId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("subDateIdd").setValueState(sap.ui.core.ValueState.None);
				// that.userId = this.getOwnerComponent().getModel("loggedOnUserModel").getData()._id;
				var mModel = this.getView().getModel().getData();
				var dvalidFrom = this.handleformatDate(this.getView().byId("startDateId").getValue());
				var dvalidTo = this.handleformatDate(this.getView().byId("subDateIdd").getValue());
				this.getView().setBusy(true);
				var newFactor = {
					"name": mModel.name,
					"validFrom": dvalidFrom,
					"validTo": dvalidTo,
					"status": "Draft",
					"description": mModel.description,
					// "questions": mModel.questions,
					"m_form_type": Number(this.getView().byId("indusId").getSelectedKey())
				};
				if (this.create === "true") {
					$.ajax({
						url: "/OptimalCog/api/m-doc-templates",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": newFactor
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "not created Something went wrong!");
							} else {
								that.getView().getModel().updateBindings(true);
								that.handleQuestion(getValues.data.id);
								MessageToast.show("created Successfully")
							}
						}
					});
				} else {
					that.docTem = this.getOwnerComponent().getModel("selTemplateData").getData();
					$.ajax({
						url: "/OptimalCog/api/m-doc-templates/" + that.docTem.id,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": newFactor
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							//	console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "not updated Something went wrong!");
							} else {
								that.getView().getModel().updateBindings(true);
								that.handleQuestion(getValues.data.id);
								MessageToast.show("updated Successfully");
							}
						}
					});
				}
				// if(this.getView().byId("typeId").getSelectedKey() === "Inspection" || this.getView().byId("typeId").getSelectedKey()==="Inspektion")
				// newFactor.industry=this.getView().byId("indusId").getSelectedKey();
				// else newFactor.industry=this.getView().byId("indusId2").getSelectedKey();
				// var TempData = this.getView().getModel().getData();
				// if (this.create == "false") {
				// 	this.getOwnerComponent().getModel("DocAndQues").getData().splice(this.masterPath, 1, newFactor);
				// } else {
				// 	this.getOwnerComponent().getModel("DocAndQues").getData().push(newFactor);
				// }

				// this.getView().getModel().setData(null);
				// var newTemplateModel = new sap.ui.model.json.JSONModel(newFactor);
				// this.getOwnerComponent().setModel(newTemplateModel, "newTemplateModel")
				// this.getView().setModel(newTemplateModel);
				// this.getView().getModel().updateBindings(true);
				// that.getView().setBusy(false);
				// var newTempData = that.getView().getModel();
				that.getView().setBusy(false);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("RouteAssessmentTemplateDetails");
				this.clearData();
				// var subfactno = 1,
				// 	quesErr = 0;
				// for (var i = 0; i < ques.length; i++) {
				// 	if (ques[i].Question == "") {
				// 		quesErr = 1;
				// 		MessageBox.error(that.oBundle.getText("EmptyQues"));
				// 		break;
				// 	}
				// }
				// if (quesErr == 0) {
				// 	newFactor.subfactors.forEach(function (subfact) {
				// 		subfact.subfactNo = subfactno++;
				// 	});
				// 	$.post('/ehs/saveFactor', newFactor, function (data) {
				// 		if (data == "OK") {
				// 			that.getView().setBusy(false);
				// 			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				// 			oRouter.navTo("RouteAssessmentTemplateDetails");
				// 			sap.m.MessageToast.show(that.oBundle.getText("SavedSuccessfully"));
				// 		} else {
				// 			that.getView().setBusy(false);
				// 			sap.m.MessageToast.show(that.oBundle.getText("Coudnotsavethedatapleasetryagain"));
				// 		}
				// 	});
				// } else {
				// 	that.getView().setBusy(false);
				// }
			} else {
				that.getView().setBusy(false);
				if (dateFlag)
					sap.m.MessageToast.show(that.oBundle.getText("endDateErrMsg"));
				else
					sap.m.MessageToast.show(that.oBundle.getText("FillMandatoryFields"));
			}
		},
		handleQuestion: function (docID) {
			var that = this;
			//	if (this.getView().getModel().getData().questions.length !== 0) {
			if (this.create === "true" || that.getStatusUorN === true) {
				var newFactor = {
					"name": this.getView().getModel().getData().subfactors[0].subFactName,
					"m_doc_template": [docID],
					"questions": this.getView().getModel().getData().questions
				};
				$.ajax({
					url: "/OptimalCog/api/m-doc-sections",
					type: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": newFactor
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						//	console.log(getValues.error);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "not created Something went wrong!");
						} else {
							that.getView().getModel().updateBindings(true);
							that.getView().setBusy(false);
						}
					}
				});
			} else {
				if (that.getStatusUorN === false) {
					var updateFactor = {
						"name": "section",
						"m_doc_template": [docID],
						"questions": this.getView().getModel().getData().questions
					};
					$.ajax({
						url: "/OptimalCog/api/m-doc-sections/" + that.docTem.attributes.docquestionsDetial.id,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": updateFactor
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							//	console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "not updated Something went wrong!");
							} else {
								that.getView().getModel().updateBindings(true);
								that.getView().setBusy(false);
							}
						}
					});
				}
			}

		},
		clearData: function () {
			this.getView().byId("indusId").setSelectedKey(null);
			this.getView().byId("titleId").setValue(null);
			this.getView().byId("descId").setValue(null);
			this.getView().byId("startDateId").setDateValue(null);
			this.getView().byId("subDateIdd").setDateValue(null);
			this.getView().byId("questionPanel").getItems().slice(0, this.getView().byId("questionPanel").getItems().length);
			this.getView().byId("sectionListId").getItems().slice(0, this.getView().byId("sectionListId").getItems().length)
		},
		onPublishPress: function (evt) {
			this.getView().setBusy(true);
			var that = this;
			// console.log(evt);
			var title = this.getView().byId("titleId").getValue();
			var desc = this.getView().byId("descId").getValue();
			var start = this.getView().byId("startDateId").getValue();
			var end = this.getView().byId("subDateIdd").getValue();
			var subsec = this.getView().byId("questionPanel").getModel().getData() !== null ? this.getView().byId("questionPanel").getModel().getData()
				.subfactors : [];

			var ques = this.getView().byId("questionPanel").getModel().getData() !== null ? this.getView().byId("questionPanel").getModel().getData()
				.questions : [];
			var err = 0;
			// var duration = this.getView().byId("durationId").getValue();
			// var unit = this.getView().byId("unitId").getSelectedKey();
			if (title === "") {
				this.getView().byId("titleId").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			/*	if(desc === ""){
					this.getView().byId("descId").setValueState(sap.ui.core.ValueState.Error);
					err = 1;
				}*/
			if (start === "") {
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			if (end === "") {
				this.getView().byId("subDateIdd").setValueState(sap.ui.core.ValueState.Error);
				err = 1;
			}
			var startDate = new Date(this.formatDate(this.getView().byId("startDateId").getValue()));
			var endDate = new Date(this.formatDate(this.getView().byId("subDateIdd").getValue()));
			if (startDate > endDate) {
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.Error);
				var dateFlag = true;
				err = 1;
			}
			if (ques.length !== 0) {
				var alreadySeen = [];
				ques.forEach(function (str) {
					if (alreadySeen[str.Question]) {
						//	MessageBox.show(str.Question + " " + that.oBundle.getText("alreadyExists"));
						err = 1;
					} else {
						alreadySeen[str.Question] = true;
					}
				});
			}
			if (err === 0) {
				this.getView().byId("titleId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("descId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("startDateId").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("subDateIdd").setValueState(sap.ui.core.ValueState.None);
				// that.userId = this.getOwnerComponent().getModel("loggedOnUserModel").getData()._id;

				var mModel = this.getView().getModel().getData();
				var dvalidFrom = this.handleformatDate(this.getView().byId("startDateId").getValue());
				var dvalidTo = this.handleformatDate(this.getView().byId("subDateIdd").getValue());

				var newPublishedFactor = {
					"name": mModel.name,
					"validFrom": dvalidFrom,
					"validTo": dvalidTo,
					"status": "Published",
					"description": mModel.description,
					"m_form_type": Number(this.getView().byId("indusId").getSelectedKey())
				};
				if (this.create == "true") {
					$.ajax({
						url: "/OptimalCog/api/m-doc-templates",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": newPublishedFactor
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							//	console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "not created Something went wrong!");
							} else {
								that.handleQuestion(getValues.data.id);
								that.getView().getModel().updateBindings(true);
								MessageToast.show("Published Successfully");
							}
						}
					});
				} else {
					that.docTem = this.getOwnerComponent().getModel("selTemplateData").getData();
					$.ajax({
						url: "/OptimalCog/api/m-doc-templates/" + that.docTem.id,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": newPublishedFactor
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							//	console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "not updated Something went wrong!");
							} else {
								that.handleQuestion(getValues.data.id);
								that.getView().getModel().updateBindings(true);
								MessageToast.show("Published Successfully");
							}
						}
					});
				}
				// this.getView().getModel().setData(null);
				// var newTemplateModel = new sap.ui.model.json.JSONModel(newFactor);
				// this.getOwnerComponent().setModel(newTemplateModel, "newTemplateModel")
				// this.getView().setModel(newTemplateModel);
				// this.getView().getModel().updateBindings(true);
				// that.getView().setBusy(false);
				// var newTempData = that.getView().getModel();
				that.getView().setBusy(false);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("RouteAssessmentTemplateDetails");
				this.clearData();
				// var subfactno = 1;
				// newFactor.subfactors.forEach(function (subfactitem) {
				// 	subfactitem.subfactNo = subfactno++;
				// });
				// $.post('/ehs/publishFactor', newFactor, function (data) {
				// 	if (data == "OK") {
				// 		that.getView().setBusy(false);
				// 		var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				// 		oRouter.navTo("RouteAssessmentTemplateDetails");
				// 		sap.m.MessageToast.show(that.oBundle.getText("PublishedSuccessfully"));
				// 	} else {
				// 		that.getView().setBusy(false);
				// 		sap.m.MessageToast.show(that.oBundle.getText("CoudnotPublishthedatapleasetryagain"));
				// 	}
				// });

			} else {
				that.getView().setBusy(false);
				if (dateFlag)
					sap.m.MessageToast.show(that.oBundle.getText("endDateErrMsg"));
				else
					sap.m.MessageToast.show(that.oBundle.getText("FillMandatoryFields"));
			}
		},
		formatDate: function (sdate) {
			// 	var date = new Date(sdate);
			// var year = date.getFullYear();
			// var month = date.getMonth() + 1;
			// var dt = date.getDate();

			// if (dt < 10) {
			// 	dt = '0' + dt;
			// }
			// if (month < 10) {
			// 	month = '0' + month;
			// }
			var date = sdate.split(".");

			return (date[1] + '-' + date[0] + '-' + date[2]);
			//	return (date[0] + '-' + date[1] + '-' + date[2]);
		},
		handleformatDate: function (sdate) {
			// 	var date = new Date(sdate);
			// var year = date.getFullYear();
			// var month = date.getMonth() + 1;
			// var dt = date.getDate();

			// if (dt < 10) {
			// 	dt = '0' + dt;
			// }
			// if (month < 10) {
			// 	month = '0' + month;
			// }
			var date = sdate.split(".");

			return (date[2] + '-' + date[1] + '-' + date[0]);
			//	return (date[0] + '-' + date[1] + '-' + date[2]);
		},
		handleAllCategoriesExpand: function (evt) {
			var aFilter = [];
			var oList = this.getView().byId("questionPanel");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
			this.getView().byId("sectionListId").removeSelections(true);
			// this.getView().byId("breadCrumbsId").setText(sap.ui.getCore().getModel("i18nModel").getProperty("Sections") + " : " + sap.ui.getCore()
			// 	.getModel(
			// 		"i18nModel").getProperty("AllSections"));
			this.getView().byId("addQuesButId").setEnabled(false);
			var aSorters = [];
			oList.getBinding("items").sort(aSorters);
			aSorters.push(new sap.ui.model.Sorter("subFactName", false, true));
			oList.getBinding("items").sort(aSorters);
		},

		_applySortGroup: function (oEvent) {
			this._oList.getBinding("items").sort([]);
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				var vGroup = this._oGroupFunctions[sPath];
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

		openCloseHeaderForCategory: function () {
				this.getView().byId("questionBlock").setVisible(false);
				this.getView().byId("sectionListId").removeSelections(true);
				this.getView().byId("categoryRow").setVisible(true);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf EHS.ManageAssessmentTemplates.view.TemplateCreation
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf EHS.ManageAssessmentTemplates.view.TemplateCreation
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf EHS.ManageAssessmentTemplates.view.TemplateCreation
		 */
		//	onExit: function() {
		//
		//	}

	});

});