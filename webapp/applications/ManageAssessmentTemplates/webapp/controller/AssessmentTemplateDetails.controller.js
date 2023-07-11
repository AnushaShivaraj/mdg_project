sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"EHS/ManageAssessmentTemplates/util/Formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, Formatter, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("EHS.ManageAssessmentTemplates.AssessmentTemplateDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf EHS.ManageAssessmentTemplates.view.AssessmentTemplateDetails
		 */
		Formatter: Formatter,
		onInit: function () {
			this.getFormsData();
			// this.getFormsData();
			// this.getView().setBusy(true);
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getView().setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			// var oDataModel = this.getOwnerComponent().getModel("DocAndQues");
			// this.getView().setModel(oDataModel);
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("EHS.ManageAssessmentTemplates.view.templateSelectionDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("RouteAssessmentTemplateDetails").attachPatternMatched(this._onObjectMatched,
				this);

		},
		_onObjectMatched: function (evt) {
			var that = this;

			// var oDataModel = this.getOwnerComponent().getModel("DocAndQues");
			// this.getView().setModel(oDataModel);
			//	this.getView().getModel().updateBindings(true);
			this.getView().byId("draftListId").removeSelections();
			this.getView().byId("publishListId").removeSelections();
			this.getView().setBusy(true);
			this.getFormsData();
		},
		getFormsData: function () {
			var that = this;
			$.ajax({
				type: "GET",
				url: "/OptimalCog/api/m-doc-templates?populate=*",
				success: function (response) {
					var resValue = JSON.parse(response);
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						var totalTemplates = resValue.data.length - 1;
						resValue.data.totalTemplates = totalTemplates;
						var data = resValue.data;

						for (var i = 0; i < data.length; i++) {
							var validTo = data[i].attributes.validTo;
							// Current date now
							var now = new Date();
							var givenDate = new Date(validTo);
							if (givenDate.getTime() < now.getTime()) {
								data[i].attributes.status = "Archived";
							}
						}
						var jsonModel = new sap.ui.model.json.JSONModel(data);
						that.getView().setModel(jsonModel, "templateData");
						that.handleQuestionAnswers();
					}
				}
			});
		},
		handleQuestionAnswers: function () {
			var that = this;
			$.ajax({
				type: "GET",
				url: "/OptimalCog/api/m-doc-sections?populate=*",
				success: function (response) {
					var getQuestions = JSON.parse(response);
					//		console.log(getQuestions.error);
					if (getQuestions.error) {
						MessageBox.error(getQuestions.error.message);
					} else {
						var totalQuestions = getQuestions.data.length - 1;
						var getDocTemplateModel = that.getView().getModel("templateData").getData();

						getDocTemplateModel.totalQuestions = totalQuestions;
						// for (var i = 0; i < getDocTemplateModel.length; i++) {
						// 	getQuestions.data.forEach(function (items, index) {
						// 		if (items.attributes.m_doc_template.data.id === getDocTemplateModel[i].id) {
						// 			getDocTemplateModel[i].attributes.docquestionsDetial = getQuestions.data[index];
						// 		}
						// 	});
						// }
						for (var i = 0; i < getDocTemplateModel.length; i++) {
							for (var j = 0; j < getQuestions.data.length; j++) {
								if (getQuestions.data[j].attributes.m_doc_template.data !== null) {
									if (getQuestions.data[j].attributes.m_doc_template.data.id === getDocTemplateModel[i].id) {
										getDocTemplateModel[i].attributes.docquestionsDetial = getQuestions.data[j];
										break; // Exit the inner loop after the match is found
									}
								}
							}
						}

						that.getView().getModel("templateData").updateBindings();
						that.getView().setBusy(false);
						// var jsonModel = new sap.ui.model.json.JSONModel(getQuestions.data);
						// that.getView().setModel(jsonModel, "templateData");
					}
				}
			});
		},
		handleListItems: function (evt) {
			if (evt.getSource().getItems().length > 0)
				this.getView().setBusy(false);
		},
		handleChangeUserMenuPress: function (evt) {
			if (evt.getSource().getIcon() == "sap-icon://list") {
				evt.getSource().setIcon("sap-icon://grid");
				evt.getSource().setTooltip(this.oBundle.getText("gridView"));
				this.getView().byId("templateListId").setVisible(true);
				this.getView().byId("draftListId").setVisible(true);
				this.getView().byId("publishListId").setVisible(true);
				this.getView().byId("outDatedListId").setVisible(true);
				this.getView().byId("templateListId").setMode("SingleSelectMaster");
				this.getView().byId("draftListId").setMode("SingleSelectMaster");
				this.getView().byId("publishListId").setMode("SingleSelectMaster");
				this.getView().byId("outDatedListId").setMode("SingleSelectMaster");
				this.getView().byId("templatesId").setVisible(false);
				this.getView().byId("DraftId").setVisible(false);
				this.getView().byId("SubmitedId").setVisible(false);
				this.getView().byId("OutDateID").setVisible(false);
				this.getView().byId("deleteBtn").setVisible(true);

			} else {
				evt.getSource().setIcon("sap-icon://list");
				evt.getSource().setTooltip(this.oBundle.getText("listView"));
				this.getView().byId("templateListId").setVisible(false);
				this.getView().byId("draftListId").setVisible(false);
				this.getView().byId("publishListId").setVisible(false);
				this.getView().byId("outDatedListId").setVisible(false);
				this.getView().byId("templatesId").setVisible(true);
				this.getView().byId("DraftId").setVisible(true);
				this.getView().byId("SubmitedId").setVisible(true);
				this.getView().byId("OutDateID").setVisible(true);
				this.getView().byId("deleteBtn").setVisible(false);
				this.getView().byId("doneBtn").setVisible(false);
			}
		},
		handleSearchField: function (evt) {
			// var that = this;
			// var text = evt.getSource().getValue();
			var filter1 = new sap.ui.model.Filter("attributes/name", sap.ui.model.FilterOperator.Contains, evt.getSource().getValue());
			var filter2 = new sap.ui.model.Filter("attributes/description", sap.ui.model.FilterOperator.Contains, evt.getSource().getValue());
			// var filter3 = new sap.ui.model.Filter("industry", sap.ui.model.FilterOperator.Contains, evt.getSource().getValue());
			var deafultFilters = [filter1, filter2];
			var oFilter = new sap.ui.model.Filter(deafultFilters, false);
			this.getView().byId("templatesId").getBinding("items").filter(oFilter);
			this.getView().byId("DraftId").getBinding("items").filter(oFilter);
			this.getView().byId("SubmitedId").getBinding("items").filter(oFilter);
			this.getView().byId("OutDateID").getBinding("items").filter(oFilter);
			this.getView().byId("templateListId").getBinding("items").filter(oFilter);
			this.getView().byId("draftListId").getBinding("items").filter(oFilter);
			this.getView().byId("publishListId").getBinding("items").filter(oFilter);
			this.getView().byId("outDatedListId").getBinding("items").filter(oFilter);
		},
		onRefershPress: function (evt) {
			this._onObjectMatched();
			var that = this;
			// var factorsModel = new sap.ui.model.json.JSONModel();
			// factorsModel.loadData("/ehs/getFactorsByUserId?userId=" + that.userId);
			// var oModel = new sap.ui.model.json.JSONModel();
			// oModel.loadData("/ehs/getFactorUsageCount");
			// oModel.attachRequestCompleted(function () {
			// 	that.getView().byId("comparisonMicroChartId").setModel(oModel);
			// 	that.getView().byId("comparisonMicroChartId1").setModel(oModel);
			// });
			// var model = new sap.ui.model.json.JSONModel();
			// model.loadData("/ehs/getIndusFactorCount");
			// model.attachRequestCompleted(function () {
			// 	that.getView().byId("PublishedFormsVSDeptChartId").setModel(model);
			// 	that.getView().byId("PublishedFormsVSDeptChartId1").setModel(model);
			// });
			// var templateUsageModel = new sap.ui.model.json.JSONModel();
			// templateUsageModel.loadData("/ehs/getAssessmentTemplatesUsed");
			// this._oDialog.setModel(templateUsageModel);
			// factorsModel.attachRequestCompleted(function () {
			// 	that.getView().setModel(factorsModel);
			// 	that.getView().setBusy(false);
			// });
		},
		onCreateNewTemplate: function (evt) {
			var oDataModel1 = this.getView().getModel("templateData");
			this._oDialog.setModel(oDataModel1, "templates");
			this._oDialog.open();

		},
		handleCreateTemplateCancelPress: function (evt) {
			this._oDialog.close();
		},
		handleCreateTemplateTilePress: function (evt) {
			this._oDialog.close();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
			oRouter.navTo("TemplateCreation", {
				create: "true",
				template_ID: "true",
				index: "null"

			});
		},

		onAssessmentTemplatePress: function (evt) {
			var index = evt.getSource().getBindingContext("templates").getPath("/")[1];
			// var factorsModel = this.getView().getModel();
			var template_ID = evt.getSource().getBindingContext("templates").getObject().id;
			var temPlateselectedObj = evt.getSource().getBindingContext("templates").getObject();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			temPlateselectedObj.attributes.createTemplate = "Yes";
			var oModel = new sap.ui.model.json.JSONModel(temPlateselectedObj);
			this.getOwnerComponent().setModel(oModel, "selTemplateData");
			this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
			oRouter.navTo("TemplateCreation", {
				create: "false",
				template_ID: template_ID,
				index: index
			});
		},
		onNavBack: function (evt) {
			this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
			// window.history.go(-1);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");
		},
		// onTemplateFormPress: function (evt) {
		// 	console.log(evt);
		// },
		onGridPress: function (evt) {
			if (this.getView().byId("templatesId").getVisible()) {
				var index = evt.getSource().getTileContent()[0].getBindingContext().getPath().split("/")[1];
				return index;
			} else {
				var index = evt.getSource().getSelectedItem().getBindingContext().getPath().split("/")[1];
				return index;
			}
		},
		onDraftFormpress: function (evt) {
			// this.onGridPress();
			if (this.getView().byId("templatesId").getVisible()) {
				var index = evt.getSource().getTileContent()[0].getBindingContext("templateData").getPath().split("/")[1];
				var selObject = evt.getSource().getTileContent()[0].getBindingContext("templateData").getObject();
			} else {
				selObject = evt.getSource().getSelectedItem().getBindingContext("templateData").getObject();
				index = evt.getSource().getSelectedItem().getBindingContext("templateData").getPath().split("/")[1];
			}
			//var factorsModel = this.getView().getModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// var template_ID = factorsModel.getData()[index].template_ID;
			this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
			var oModel = new sap.ui.model.json.JSONModel(selObject);
			this.getOwnerComponent().setModel(oModel, "selTemplateData");
			oRouter.navTo("TemplateCreation", {
				create: false,
				template_ID: selObject.id,
				index: index
			});

		},
		onDelete: function (evt) {
			this.getView().byId("templateListId").setMode("Delete");
			this.getView().byId("draftListId").setMode("Delete");
			this.getView().byId("publishListId").setMode("Delete");
			this.getView().byId("outDatedListId").setMode("None");
			this.getView().byId("doneBtn").setVisible(true);
			this.getView().byId("deleteBtn").setVisible(false);
			this.getView().byId("button9").setVisible(false);

		},
		onTemplateDelete: function (evt) {
			var that = this;
			var index = evt.getParameter("listItem").getBindingContext("templateData").getObject().id;
			MessageBox.confirm(
				this.oBundle.getText("Areyousureyouwanttodelete"), {
					onClose: function (oAction) {
						if (oAction === "OK") {
							$.ajax({
								type: "DELETE",
								url: "/OptimalCog/api/m-doc-templates/" + index,
								success: function (response) {
									var resValue = JSON.parse(response);
									console.log(resValue.error);
									if (resValue.error) {
										MessageBox.error(resValue.error.message);
									} else {
										MessageToast.show("Deleted Successfully!");
										that.getFormsData();
									}
								}
							});
						}
					}
				});
		},

		onDone: function (evt) {
			this.getView().byId("templateListId").setMode("SingleSelectMaster");
			this.getView().byId("draftListId").setMode("SingleSelectMaster");
			this.getView().byId("publishListId").setMode("SingleSelectMaster");
			this.getView().byId("outDatedListId").setMode("SingleSelectMaster");
			this.getView().byId("doneBtn").setVisible(false);
			this.getView().byId("deleteBtn").setVisible(true);
			this.getView().byId("button9").setVisible(true);
		},

		onSubmittedFormPress: function (evt) {
			if (this.getView().byId("templatesId").getVisible()) {
				// var index = evt.getSource().getTileContent()[0].getBindingContext().getPath().split("/")[1];
				var index = evt.getSource().getTileContent()[0].getBindingContext("templateData").getPath().split("/")[1];
				var selObject = evt.getSource().getTileContent()[0].getBindingContext("templateData").getObject();
			} else {
				// var index = evt.getSource().getSelectedItem().getBindingContext().getPath().split("/")[1];
				selObject = evt.getSource().getSelectedItem().getBindingContext("templateData").getObject();
				index = evt.getSource().getSelectedItem().getBindingContext("templateData").getPath().split("/")[1];
			}
			/*var factorsModel = this.getView().getModel();
			var template_ID = factorsModel.getData()[index].template_ID;*/
			var oModel = new sap.ui.model.json.JSONModel(selObject);
			this.getOwnerComponent().setModel(oModel, "selTemplateData");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
			oRouter.navTo("TemplateCreation", {
				create: false,
				template_ID: selObject.id,
				index: index
			});
		},
		handleOutDatedFormPress: function (evt) {
				if (this.getView().byId("templatesId").getVisible()) {
					var index = evt.getSource().getTileContent()[0].getBindingContext("templateData").getPath().split("/")[1];
					var selObject = evt.getSource().getTileContent()[0].getBindingContext("templateData").getObject();
				} else {
					selObject = evt.getSource().getSelectedItem().getBindingContext("templateData").getObject();
					index = evt.getSource().getSelectedItem().getBindingContext("templateData").getPath().split("/")[1];
				}
				//var factorsModel = this.getView().getModel();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				// var template_ID = factorsModel.getData()[index].template_ID;
				this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
				selObject.attributes.status = "Archived";
				var oModel = new sap.ui.model.json.JSONModel(selObject);
				this.getOwnerComponent().setModel(oModel, "selTemplateData");
				this.getView().getContent()[0].getScrollDelegate().scrollTo(0, 0);
				oRouter.navTo("TemplateCreation", {
					// template_ID: selObject.id,
					// indus_ID: false,
					// create: false
					create: false,
					template_ID: selObject.id,
					index: index
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf EHS.ManageAssessmentTemplates.view.AssessmentTemplateDetails
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf EHS.ManageAssessmentTemplates.view.AssessmentTemplateDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf EHS.ManageAssessmentTemplates.view.AssessmentTemplateDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});