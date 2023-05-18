sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"MDG/Program/util/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, formatter, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("MDG.Program.controller.FormsEntry", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.Program.applications.Manage_Programs.view.FormsEntry
		 */
		onInit: function () {

			this.getOwnerComponent().getRouter().getRoute("FormsEntry").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			this.Path = oEvent.getParameter("arguments").itemPath;
			this.programObjectPath = oEvent.getParameter("arguments").programObjectPath;
			this.projectObjectPath = oEvent.getParameter("arguments").projectObjectPath;
			// var selObject = this.getOwnerComponent().getModel("formsModel").getData()[oEvent.getParameter("arguments").itemPath];
			var formModel = new sap.ui.model.json.JSONModel(this.getView().getModel("formTemplateData").getData());
			this.getView().setModel(formModel, "ProgramModel");
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-doc-sections?populate=*&filters[m_doc_template][id][$eq]=" + this.Path,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					debugger
					var cModel = new sap.ui.model.json.JSONModel(response.data[0].attributes.questions);
					that.getView().setModel(cModel);
				},
				error: function (res) {
					MessageBox.error(res + "Something went wrong");
				}
			});
		},
		handleAllSectionsPress: function () {
			this.getView().byId("breadCrumbsId").setText(this.getOwnerComponent().getModel("i18n").getProperty("Section") + ":" +
				this.getOwnerComponent().getModel("i18n").getProperty("AllSections"));
			var selObject = this.getOwnerComponent().getModel("formsModel").getData()[this.Path];
			var formModel = new sap.ui.model.json.JSONModel(selObject);
			this.getView().setModel(formModel);
		},

		onSelectRadio1: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath().split("/");
			var questionPath = this.getView().getModel().getData().questions[path[2]];
			var SelectedOption = this.getView().getModel().getData().questions[path[2]].Options[path[4]].option;
			this.getView().getModel().getData()[2].weight = SelectedOption
		},
		onSelectCheckBox: function (oEvent) {
			var that = this;
			var path = oEvent.getSource().getBindingContext().getPath().split("/");

			var selectedItem = this.getView().getModel().getData().questions[path[2]].Options[path[4]].option;
			var SelectedItems = {
				SelItem: selectedItem
			};
			if (oEvent.getParameter("selected") == true) {
				this.getView().getModel().getData().questions[path[2]].AnsMultiC.push(SelectedItems);
			} else {
				this.getView().getModel().getData().questions[path[2]].AnsMultiC.forEach(function (item, i) {
					if (item.SelItem == selectedItem) {
						that.getView().getModel().getData().questions[path[2]].AnsMultiC.splice(i, 1);
					}
				});
			}
		},
		onSubFactorpress: function (evt) {
			this.getView().byId("questionPanel").getBinding("items").sort([]);
			var mode = this.getView().byId("sectionListId").getMode();
			if (mode == "SingleSelect") {
				this.path = evt.getParameters().listItem.getBindingContextPath().split("/");
				var factorsModel = this.getView().byId("sectionListId").getModel();
				var fac_name = factorsModel.oData.sub_Factors[this.path[2]].name;
				this.editSubSectionDialog.getContent()[0].getContent()[1].setValue(fac_name);
				this.editSubSectionDialog.open();
			} else {
				this.getView().byId("breadCrumbsId").setText(this.getOwnerComponent().getModel("i18n").getProperty("Section") + ":" + evt.getSource()
					.getSelectedItem()
					.getTitle());
				//	if (this.getView().byId("statusid").getValue() == "Draft" || this.getView().byId("statusid").getValue() == "Entwurf")
				if (this.getView().getModel().getData().Status == "Draft" || this.getView().getModel().getData().Status == "Entwurf")
					this.getView().byId("addQuesButId").setEnabled(true);
				var factorsModel = this.getView().byId("sectionListId").getModel();
				this.path = evt.getParameters().listItem.getBindingContext().getObject();
				var subfacid = this.path.Sub_Factor_ID;
				var aFilter = [];
				aFilter.push(new Filter("Sub_Factor_ID", "EQ", subfacid));
				var oList = this.getView().byId("questionPanel");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
			}
			if (this.isPhone) {
				this.getView().byId("questionBlock").setVisible(true);
				this.getView().byId("categoryRow").setVisible(false);
			}
		},
		handleAllCategoriesExpand: function (evt) {
			var aFilter = [];
			var oList = this.getView().byId("questionPanel");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
			this.getView().byId("sectionListId").removeSelections(true);
			this.getView().byId("breadCrumbsId").setText(this.getOwnerComponent().getModel("i18n").getProperty("Section") + ":" + this.getOwnerComponent()
				.getModel("i18n").getProperty("AllSections"));
			// this.getView().byId("addQuesButId").setEnabled(false);
			var aSorters = [];
			oList.getBinding("items").sort(aSorters);
			aSorters.push(new sap.ui.model.Sorter("subFactName", false, true));
			oList.getBinding("items").sort(aSorters);
		},
		onExportDoc: function () {
			var that = this;
			var modelData = this.getView().getModel().getData();
			this.getView().byId("meetingLink").setText(this.getView().byId("linkd").getValue());
			this.getView().byId("Area").setText(this.getView().byId("areaID").getValue());
			this.getView().byId("meetingLocation").setText(this.getView().byId("locID").getValue());
			this.getView().byId("meetingResponsile").setText(this.getView().byId("responsibleID").getValue());
			var oTarget = this.getView().byId("vBxReport"),
				$domTarget = oTarget.$()[0],
				sTargetContent = $domTarget.innerHTML;
			// updatedModel.updateBinding();
			var printWindow = window.open("", "", "height=800,width=800");
			// Constructing the report window for printing
			printWindow.document.write("<html><head><title></title>");
			printWindow.document.write(
				"<link rel='stylesheet' href='applications/Manage_Programs/webapp/css/style.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/layout/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/unified/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/table/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/suite/ui/commons/themes/sap_belize_plus/library.css'>"
				);
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/m/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/tnt/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/f/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write(
					"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/viz/themes/sap_belize_plus/library.css'>");
			printWindow
				.document.write('</head><body >');
			printWindow.document.write(sTargetContent);
			printWindow.document.write('</body></html>');
			//printWindow.close();
			// Giving time for rendering the page
			//printWindow.close();
			//this.getView().setBusy(true);
			//printWindow.document.close();
			setTimeout(function () {
				//that.getView().setBusy(false);
				//printWindow.open();
				printWindow.focus();
				printWindow.print();
				//that.onExportDoc();
			}, 6000);
			// Automatically closing the preview window once the user has pressed the "Print" or, "Cancel" button.
			printWindow.onafterprint = function () {
				setTimeout(function () {
					that.getView().setBusy(false);
					printWindow.close();
				}, 5000);
			};
		},
		clearData: function () {
			this.getView().byId("linkd").setValue("");
			this.getView().byId("areaID").setValue("");
			this.getView().byId("locID").setValue("");
			this.getView().byId("responsibleID").setValue("");
		},
		onSelectRadio: function (oEvent) {
			var selButton = oEvent.getParameter("selected");
			var path = oEvent.getSource().getBindingContext().getPath().split("/");
			var questionPath = this.getView().getModel().getData()[path[1]];
			var SelectedOption = this.getView().getModel().getData()[path[1]].Options[path[3]].weight = selButton;
			this.getView().getModel().updateBindings();
			// this.getView().getModel().getData()[path[1]].answer = SelectedOption
		},
		onSelectCheckBox: function (oEvent) {
			var that = this;
			var path = oEvent.getSource().getBindingContext().getPath().split("/");

			var selectedItem = this.getView().getModel().getData()[path[1]].Options[path[3]].weight = oEvent.getParameter("selected");
			this.getView().getModel().updateBindings();
			// var SelectedItems = {
			// 	SelItem: selectedItem,
			// 	Options: this.getView().getModel().getData().questions[path[2]].Options
			// };
			// if (oEvent.getParameter("selected") == true) {
			// 	this.getView().getModel().getData().questions[path[2]].SelItems.push(SelectedItems);
			// } else {
			// 	this.getView().getModel().getData().questions[path[2]].SelItems.forEach(function (item, i) {
			// 		if (item.SelItem == selectedItem) {
			// 			that.getView().getModel().getData().questions[path[2]].SelItems.splice(i, 1);
			// 		}
			// 	});
			// }
		},
		onNavBack: function () {
			// this.getOwnerComponent().getModel("appView").getProperty("/DetailListThis").getView().byId("formLists").removeSelections();
			// var bFullScreen = this.getView().getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			// this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			this.clearData();
			this.getView().getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detailDetail", {
				ProgramPath: this.programObjectPath,
				ProjectId: this.projectObjectPath
			});

		},
		onTextAreaChange: function (evt) {
			var objPath = evt.getSource().getBindingContext().getPath().split("/");
			var questionsModel = this.getView().getModel();
			var optionObj = questionsModel.getData()[objPath[1]].Options;
			questionsModel.getData()[objPath[1]].option = evt.getSource().getValue();
			questionsModel.updateBindings();
		},
		onDateSelect: function (evt) {
			var objPath = evt.getSource().getBindingContext().getPath().split("/");
			var questionsModel = this.getView().getModel();
			var optionObj = questionsModel.getData()[objPath[1]].Options;
			questionsModel.getData()[objPath[1]].option = moment(new Date()).format('MM-DD-YYYY');
			questionsModel.updateBindings();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf MDG.Program.applications.Manage_Programs.view.FormsEntry
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf MDG.Program.applications.Manage_Programs.view.FormsEntry
		 */
		onAfterRendering: function () {
			// this.oTarget = this.getView().byId("vBxReport");
			// this.$domTarget = this.oTarget.$()[0];
			// this.getView().getContent()[0].getContent()[1].setVisible(false);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf MDG.Program.applications.Manage_Programs.view.FormsEntry
		 */
		//	onExit: function() {
		//
		//	}

	});

});