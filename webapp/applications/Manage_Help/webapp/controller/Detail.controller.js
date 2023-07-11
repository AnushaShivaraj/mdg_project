sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",

], function (Controller, Fragment, JSONModel, MessageToast, MessageBox, Context, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("MDG.Help.controller.Detail", {
		onInit: function () {
			var that = this;
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(function (oEvent) {
				// var usersModel = that.getOwnerComponent().getModel();
				that.path = oEvent.getParameter("arguments").id;

				var moduleIndex = oEvent.getParameter("arguments").moduleIndex;
				that.moduleIndex = moduleIndex;
				var topicdata = that.getView().getModel("topicData").getData();
				that.topicdata = topicdata;
				that.byId("title").setText("Module:-" + " " + topicdata.attributes.m_application.data.attributes.name);
				that.handleFaqData();
				that.getView().setBusy(true);
			});

			if (!this.AddHelpFragment) {
				this.AddHelpFragment = sap.ui.xmlfragment("MDG.Help.fragment.addHelp", this);

				this.getView().addDependent(this.AddHelpFragment);
			}

		},
		handleFaqData: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-help-faqs?sort=id:ASC&filters[m_help_topic][id][$eq]=" + that.path + "&populate=*",
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						var oModel = new JSONModel(getValues.data);
						that.byId("innerVbox").setModel(oModel);

						that.byId("topic").setText(getValues.data.length == "0" ? that.topicdata.attributes.topic : getValues.data[0].attributes.m_help_topic
							.data.attributes.topic);
						that.byId("topics").setText(getValues.data.length == "0" ? that.topicdata.attributes.topic : getValues.data[0].attributes.m_help_topic
							.data.attributes.topic);
						that.byId("desc").setText(getValues.data.length == "0" ? that.topicdata.attributes.description : getValues.data[0].attributes
							.m_help_topic.data.attributes.description);

						that.getView().setBusy(false);
					}
				}
			});
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
			// var tileIndex = this.getView().getModel("appView").getProperty("/tileIndex");
			this.getOwnerComponent().getRouter().navTo("Master", {
				id: this.moduleIndex
			});
		},

		handleWizardCancel: function () {

			// this.valueHelpForNewUser.getContent()[2].getContent()[5].setValueState("None");
			this.AddHelpFragment.close();
		},

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
			var file = oEvent.getParameter("files")[0];
			this.fileData = {
				fileName: file.name,
				mediaType: file.type,
				url: "",
				keyword: "",
				shortDescription: ""
			};
		},
		handleAddDocumentOkPress: function () {
			this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
			this.fileData.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
			this.getView().getBindingContext().getObject().documents.push(this.fileData);
			this.getView().getModel().updateBindings(true);

			this.handleAddUserCancelPress();
			MessageToast.show("Document added succesfuly.");
		},
		handleAddUserCancelPress: function () {
			this.AddDocumentFragment.close();
			this.clear();
		},

		openAddFAQBox: function () {
			if (!this.AddEditQuesFragment) {
				this.AddEditQuesFragment = sap.ui.xmlfragment("MDG.Help.fragment.addTopic", this);
				this.getView().addDependent(this.AddEditQuesFragment);
			}
			this.AddEditQuesFragment.setTitle("Add Help/FAQ");
			this.AddEditQuesFragment.getButtons()[0].setVisible(true);
			this.AddEditQuesFragment.getButtons()[1].setVisible(false);

			var data = {
				"Question": "",
				"Answer": ""
			};
			this.AddEditQuesFragment.setModel(new JSONModel(data));
			this.AddEditQuesFragment.open();
		},

		addFAQ: function () {
			var that = this;
			that.Faqdata = this.AddEditQuesFragment.getModel().getData();
			if (that.Faqdata.Question !== "" && that.Faqdata.Answer !== "") {
				var oFaqDetails = {
					"question": that.Faqdata.Question,
					"answer": that.Faqdata.Answer,
					"m_help_topic": [Number(that.path)],
				};
				$.ajax({
					url: "/OptimalCog/api/m-help-faqs",
					type: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": oFaqDetails
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Not Created Something went wrong!");
						} else {
							// MessageToast.show("New Topic Added succesfuly.");
							// that.closeAddHelpFragment();
							// that.getView().getModel().updateBindings(true);
							// that.getView().getModel().refresh();
							// that.getOwnerComponent().getModel("topicData").updateBindings(true);
							// that.getOwnerComponent().getModel("topicData").refresh();
							that.handleFaqData();
							// var oModel = that.getView().getModel();
							// that.getOwnerComponent().getModel().updateBindings(true);
							// that.getView().byId("innerVbox").getModel().updateBindings(true);
							that.AddEditQuesFragment.close();
							MessageToast.show("FAQ Added succesfuly.");
							// oModel.updateBindings(true);
							that.getView().setBusy(true);
						}
					}
				});
			} else {
				MessageBox.error("Please enter a value for the required field");
			}
		},
		openEditFAQBox: function (oEvent) {
			if (!this.AddEditQuesFragment) {
				this.AddEditQuesFragment = sap.ui.xmlfragment("MDG.Help.fragment.addTopic", this);
			}
			this.AddEditQuesFragment.setTitle("Edit Help/FAQ");
			this.AddEditQuesFragment.getButtons()[1].setVisible(true);
			this.AddEditQuesFragment.getButtons()[0].setVisible(false);

			var oContext = oEvent.getSource().getBindingContext();
			this.FAQIndex = oContext.getPath().split("/")[1];
			var data = oContext.getObject();
			this.AddEditQuesFragment.setModel(new JSONModel({
				"Question": data.attributes.question,
				"Answer": data.attributes.answer,
				"id": data.id
			}));
			this.AddEditQuesFragment.open();
		},

		DeleteFAQPress: function (ev) {
			var that = this;
			var selObjIndex = ev.getSource().getBindingContext().getObject().id;
			MessageBox.confirm("Confirm FQA Delete", {
				title: "Confirm Deletion",
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-help-faqs/" + selObjIndex,
							success: function (response) {
								var resValue = JSON.parse(response);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									that.handleFaqData();
									MessageToast.show("FAQ  Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									// MessageToast.show("Program Deleted sucessfully", {
									// 	closeOnBrowserNavigation: false
									// });
									// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									// oRouter.navTo("masterList");
									// that.onCloseDetailPress();
								}
							}
						});
						// that.onCloseDetailPress();
					}
				}
			});

		},

		updateFAQ: function (ev) {
			var that = this;
			var data = this.AddEditQuesFragment.getModel().getData();
			// var selFaqObj = ev.getSource().getBindingContext().getObject().id;
			if (data.Question !== "" && data.Answer !== "") {
				var oFaqDetails = {
					"question": data.Question,
					"answer": data.Answer
				};
				$.ajax({
					url: "/OptimalCog/api/m-help-faqs/" + data.id,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": oFaqDetails
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Not Updated Something went wrong!");
						} else {
							that.handleFaqData();
							that.AddEditQuesFragment.close();
							MessageToast.show("FAQ Updated succesfuly.");
							that.getOwnerComponent().getModel().updateBindings(true);
							that.getView().byId("innerVbox").getModel().updateBindings(true);
							that.AddEditQuesFragment.close();
							that.getView().setBusy(true);
						}
					}
				});
			} else {
				MessageBox.error("Please enter a value for the required field");
			}
		},

		handleAddQACancelPress: function () {
			this.AddEditQuesFragment.close();
		},
		handleEditHelpPress: function () {
			this.AddHelpFragment.setTitle("Edit Topic");
			this.AddHelpFragment.getContent()[0].getContent()[1].setValue(this.byId("topics").getText());
			this.AddHelpFragment.getContent()[0].getContent()[3].setValue(this.byId("desc").getText());
			this.AddHelpFragment.open();
		},
		handleDeleteHelpPress: function (ev) {
			var that = this;
			MessageBox.confirm("Confirm Help-Topic Delete", {
				title: "Confirm Deletion",
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {
						var topicIndex = Number(that.path);
						$.ajax({
							url: "/OptimalCog/api/m-helps/" + topicIndex,
							type: "DELETE",
							headers: {
								"Content-Type": 'application/json',
								"Authorization": "Bearer" + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
							},
							success: function (res) {
								var getValues = JSON.parse(res);
								if (getValues.error) {
									MessageBox.error(getValues.error.message + "data is not Delted Something went wrong!");
								} else {
									that.AddHelpFragment.close();
									that.handleFaqData();
									MessageToast.show("Topic  Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									that.getView().getModel().updateBindings(true);
									that.onCloseDetailPress();
								}
							}
						});
					}
				}
			});
		},
		handleAddHelpCancelPress: function () {
			this.AddHelpFragment.close();
		},
		handleAddHelpOkPress: function (ev) {
			var that = this;
			var topic = this.AddHelpFragment.getContent()[0].getContent()[1].getValue();
			var description = this.AddHelpFragment.getContent()[0].getContent()[3].getValue();
			if (topic !== "" && description !== "") {
				var oHelpDetails = {
					"topic": topic,
					"description": description
				};
				$.ajax({
					url: "/OptimalCog/api/m-helps/" + that.path,
					type: "PUT",
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
							that.handleFaqData();
							that.byId("topic").setText(topic);
							that.byId("topics").setText(topic);
							that.byId("desc").setText(description);
							that.getOwnerComponent().getModel().updateBindings(true);
							MessageToast.show("Topics updated successfully.", {
								closeOnBrowserNavigation: false
							});
							that.AddHelpFragment.close();
							that.onCloseDetailPress();
						}
					}
				});
			} else {
				sap.m.MessageBox.error("Please enter a value for the required field");
			}
		}

	});

});