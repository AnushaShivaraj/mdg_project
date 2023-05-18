sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel"

	],

	function (Controller, Filter, FilterOperator, MessageToast, MessageBox, JSONModel) {
		"use strict";

		return Controller.extend("MDG.Help.controller.Master", {
			onInit: function () {
				var that = this;
				that.maxId = 100 + that.getOwnerComponent().getModel().getData().length;
				//this.getOwnerComponent().getModel.attachRequestCompleted(function () {
				//	that.maxId = 100 + that.getOwnerComponent().getModel().getData().length;
				//});

				this.getOwnerComponent().getRouter().getRoute("Master").attachPatternMatched(function (oEvent) {

					this.getView().getModel("appView").setProperty("/layout", "OneColumn");
					var index = oEvent.getParameter("arguments").id;
					this.index = Number(index);
					this.theHelpData();
					// var oModel = that.getOwnerComponent().getModel();
					// var oContext = new sap.ui.model.Context(oModel, "/" + index);
					// that.getView().setModel(oModel);
					// that.getView().setBindingContext(oContext);

					// that.byId("page").setTitle(oContext.getObject().moduleName + " Topics");
				}, this);

			},
			theHelpData: function () {
				var that = this;
				var orgId = that.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;
				$.ajax({
					url: "/OptimalCog/api/m-helps?filters[m_organisation][id][$eq]=" + orgId + "&filters[m_application][id][$eq]=" + this.index +
						"&populate=*",
					type: "GET",
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Something went wrong!");
						} else {
							var oModel = new sap.ui.model.json.JSONModel(getValues.data);
							that.getView().setModel(oModel);
							that.byId("itemlistId").removeSelections(true);
							that.getView().getModel().updateBindings(true);
							that.getView().getModel().refresh();
						}
					}
				});
			},
			// onAfterRendering: function () {
			// 	alert("Master page tiggered");
			// 	this.theHelpData();
			// },
			onSearch: function (evt) {
				if (evt.getParameter("newValue").length > 0) {
					this.getView().byId("itemlistId").getBinding("items").filter([new sap.ui.model.Filter("attributes/topic", "Contains", evt.getParameter(
						"newValue"))]);
					/*	var filter1 = new sap.ui.model.Filter("moduleName", "Contains", evt.getParameter("newValue"));
						var filter2 = new sap.ui.model.Filter("id", "Contains", evt.getParameter("newValue"));
						var filter3 = new sap.ui.model.Filter("country", "Contains", evt.getParameter("newValue"));
						var filter4 = new sap.ui.model.Filter("city", "Contains", evt.getParameter("newValue"));
						this.getView().byId("itemlistId").getBinding("items").filter(new sap.ui.model.Filter([filter1, filter2, filter3, filter4], false));*/
				} else
					this.getView().byId("itemlistId").getBinding("items").filter([]);

			},
			onNavBack: function () {
				this.getView().getModel("appView").setProperty("/layout", "OneColumn");
				// this.getOwnerComponent().getRouter().navTo("Help");
				this.getOwnerComponent().getRouter().navTo("Help", {}, true);
			},
			openAddHelpCustomer: function () {
				if (!this.AddHelpFragment) {
					this.AddHelpFragment = sap.ui.xmlfragment("MDG.Help.fragment.addHelp", this);
					// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
					// this.getView().addDependent(this.AddcustomerFragment);
				}

				this.AddHelpFragment.open();
			},

			handleUsersListPress: function (oEvent) {
				this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				//             this.getView().getModel("appView").setProperty("/previousPage", "Master");

				var topicIndex = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
				var mModel = new sap.ui.model.json.JSONModel(topicIndex);
				this.getOwnerComponent().setModel(mModel, "topicData");
				this.getOwnerComponent().getRouter().navTo("Detail", {
					id: topicIndex.id,
					moduleIndex: this.index
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

			handleAddHelpOkPress: function () {
				var that = this;
				var content = this.AddHelpFragment.getContent()[0].getContent();
				if (content[1].getValue() !== "" && content[3].getValue() !== "") {
					var oHelpDetails = {
						"topic": content[1].getValue(),
						"description": content[3].getValue(),
						"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
						"m_application": [this.index]
					};
					$.ajax({
						url: "/OptimalCog/api/m-helps",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": oHelpDetails
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "Not Created Something went wrong!");
							} else {
								// var oModel = this.getView().getModel();
								// var aHelp = this.getView().getBindingContext().getObject();
								MessageToast.show("New Topic Added succesfuly.");
								that.closeAddHelpFragment();
								// that.getView().getModel().updateBindings(true);
								that.theHelpData();
								that.getView().getModel().updateBindings(true);
							}
						}
					});
				} else {
					sap.m.MessageBox.error("Please enter a value for the required field");
				}
			},
			closeAddHelpFragment: function () {
				this.AddHelpFragment.close();
				this.clearData();
			},
			handleAddHelpCancelPress: function () {
				this.AddHelpFragment.close();
				this.clearData();
			},
			clearData: function () {
				var content = this.AddHelpFragment.getContent()[0].getContent();
				content[1].setValue("");
				content[3].setValue("");
			},

			onDialogNextButton: function () {
				if (this._oWizard.getProgressStep().getValidated()) {
					this._oWizard.nextStep();
				}

				this.handleButtonsVisibility();
			}

		});
	});