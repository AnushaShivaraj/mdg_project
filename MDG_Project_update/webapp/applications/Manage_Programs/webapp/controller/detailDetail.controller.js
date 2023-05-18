sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Context",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"MDG/Program/util/formatter",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/format/DateFormat"
], function (Controller, Context, Fragment, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, formatter, library, Spreadsheet,
	DateFormat) {
	"use strict";

	return Controller.extend("MDG.Program.controller.detailDetail", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.Program.view.detailDetail
		 */
		onInit: function () {
			var that = this;

			var i18nModel = this.getOwnerComponent().getModel("i18n");
			// var ViewModel = {
			// 	isProjectArchived: false,
			// 	isProjectCancelled: false,
			// 	isProjectEditable: false,
			// 	isCRUDBtnsVisible: false,
			// 	isRetriveVisible: false

			// };

			//	var model = new JSONModel(ViewModel);
			//	this.getView().setModel(model, "DetailDetailView");
			if (!this.EditProject) {
				this.EditProject = sap.ui.xmlfragment(this.getView().getId(), "MDG.Program.fragment.EditProject", this);
				this.EditProject.setModel(i18nModel, "i18n");
				var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerdata").getData());
				//var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerInfo").getData());
				this.EditProject.getContent()[0].getContent()[14].setModel(customerModel);
				//this.EditProject.setModel(customerModel);
				var vendorsModel = new JSONModel(this.getOwnerComponent().getModel("vendorInfo").getData());
				this.EditProject.getContent()[0].getContent()[11].setModel(vendorsModel);
				//this.EditProject.setModel(vendorsModel);
				this.getView().addDependent(this.EditProject);
			}
			that.getOwnerComponent().getRouter().getRoute("detailDetail").attachPatternMatched(function (oEvent) {
				var usersModel = that.getOwnerComponent().getModel();
				var programJSONRoot = "/programs/";
				var projectJSONSRoot = "/Projects/";

				that.programObjectPath = parseInt(oEvent.getParameter("arguments").ProgramPath);
				that.projectObjectPath = parseInt(oEvent.getParameter("arguments").ProjectId);
				that.projectsDetails();
				that.mDocuments();
				that.getView().setBusy(true);
			});

		},
		projectsDetails: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-projects?&populate=*&filters[id][$eq]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					// for (var i = 0; i < response.data.length; i++) {
					// if (that.projectObjectPath === response.data[i].id) {
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data[0]));
					var milestoneData = that.getView().getModel().getData().attributes.m_milestones.data;
					var milestoneDataModel = new JSONModel(milestoneData);
					that.getView().setModel(milestoneDataModel, "mMileStoneModel");
					that.dataId = response.data[0].id;
					that.customerDetail();
					// break;
					// }
					// }

				},
				error: function (res) {}
			});
		},
		customerDetail: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-customers?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					var aModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(aModel, "customerInfo");
					that.vendorList();
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		vendorList: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-vendors?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "vendorInfo");
					that.mProjectTeam();
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mDocuments: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-documents?populate=*&filters[m_project][id]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "mDocuments");
					that.mFormType();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mFormType: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-form-types",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "mFormType");
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mProjectTeam: function () {
			var that = this;
			$.ajax({
				// url: "/OptimalCog/api/m-project-teams?populate=*",
				url: "/OptimalCog/api/m-project-teams?populate=*&filters[m_projects][id][$eq]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(cModel, "projectTeam");
					that.projectTeamDetails();
					that.getView().setBusy(false);
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		projectTeamDetails: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/users?populate=*&filters[mrole][roleType]=Functional role",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					var cModel = new sap.ui.model.json.JSONModel(response);
					that.getView().setModel(cModel, "usersDetails");
					that.projectMRoleDetails();
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		projectMRoleDetails: function () {
			var that = this;
			$.ajax({
				// url: "/OptimalCog/api/mroles?populate=*",
				url: "/OptimalCog/api/mroles?populate=*&filters[roleType]=Functional role",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(cModel, "mRolesDetails");

					// that.getView().setBusy(false);
					that.mcsfsDetails();
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mcsfsDetails: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-csfs?populate=*&filters[m_project][id]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					// console.log(response);
					// var taskData = [];
					that.mcsrfLength = response.data.length;
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(cModel, "mCsfDetails");
					that.mDclDetails();
					//	that.getView().setBusy(false);
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mDclDetails: function () {
			var that = this;
			$.ajax({
				// url: "/OptimalCog/api/m-deliverables?populate=*",
				url: "/OptimalCog/api/m-deliverables?populate=*&filters[m_project][id]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var zModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(zModel, "mDeliverableModel");
					that.mComments();
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mComments: function () {
			var that = this;
			$.ajax({
				// url: "/OptimalCog/api/m-comments?populate=*",
				url: "/OptimalCog/api/m-comments?populate=*&filters[m_project][id]=" + that.projectObjectPath,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(cModel, "userProjectComments");
					that.getView().setBusy(false);
				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		onConfirmVendorsPress: function (oEvent) {
			var that = this;
			this.VendorsObj = "";
			var selKey = oEvent.getSource().getSelectedKey();
			this.getView().getModel().getData().assignedVendors = [];
			//	this.getView().getModel().getData().assignedVendors.push(oEvent.getParameters().selectedItems[0]);
			this.getOwnerComponent().getModel("vendorInfo").getData().forEach(function (item, index) {
				if (item.vendor_Name == selKey) {
					that.VendorsObj = item;

				}
			});

			this.EditProject.getContent()[0].getContent()[14].setValue(oEvent.getSource().getSelectedKey());
			//	this.getView().getModel().updateBindings();

		},
		createColumns: function (i) {
			if (i == 1) {
				return [{
					label: "Name",
					property: "attributes/customerName"
				}, {
					label: "Email",
					property: "attributes/email"
				}, {
					label: "Contact",
					property: "attributes/contactPhone"
				}, {
					label: "City",
					property: "attributes/city"
				}, {
					label: "Country",
					property: "attributes/country"
				}];
			}
			if (i == 2) {
				return [{
					label: "Name",
					property: "attributes/vendorName"
				}, {
					label: "Email",
					property: "attributes/vendorEmail"
				}, {
					label: "Contact",
					property: "attributes/vendorContact"
				}, {
					label: "City",
					property: "attributes/vendorCity"
				}, {
					label: "Country",
					property: "attributes/vendorCountry"
				}];
			}
			if (i == 3) {
				return [{
					label: "Team Members",
					property: "attributes/users_permissions_user/data/attributes/firstName"
				}, {
					label: "Contact",
					property: "attributes/users_permissions_user/data/attributes/phone"
				}, {
					label: "Email",
					property: "attributes/users_permissions_user/data/attributes/email"
				}, {
					label: "Role",
					property: "attributes/mroles/data/0/attributes/roleName"
				}];
			}
			if (i == 4) {
				return [{
					label: "Milestone Name",
					property: "attributes/name"
				}, {
					label: "Milestone Description",
					property: "attributes/description"
				}, {
					label: "Start Date",
					property: "attributes/startDate"
				}, {
					label: "End Date",
					property: "attributes/endDate"
				}];
			}
		},

		onExport: function (oEvent) {

			//var binding = this.byId("CustomersTable").getBinding("items");
			var id = oEvent.getSource().getId().split("--")[1];
			var oData, oSheet;
			if (id == 'downloadButtonIDCustomers') {
				oData = oEvent.getSource().getModel().getData().attributes.m_customers.data;
				oSheet = new sap.ui.export.Spreadsheet({
					workbook: {
						columns: this.createColumns(1)
					},
					dataSource: oData,
					fileName: "customer.xlsx"
				});
				oSheet.build();
			}
			if (id == 'downloadButtonIDVendors') {
				oData = oEvent.getSource().getModel().getData().attributes.m_vendors.data;
				oSheet = new sap.ui.export.Spreadsheet({
					workbook: {
						columns: this.createColumns(2)
					},
					dataSource: oData,
					fileName: "vendor.xlsx"
				});
				oSheet.build();

			}
			if (id == 'downloadButtonIDteammember') {
				oData = this.getView().getModel("projectTeam").getData();
				oSheet = new sap.ui.export.Spreadsheet({
					workbook: {
						columns: this.createColumns(3)
					},
					dataSource: oData,
					fileName: "TeamMember.xlsx"
				});
				oSheet.build();

			}
			if (id == 'downloadButtonIDmilestone') {
				// oData = this.getView().getBindingContext().getObject().milestones;
				oData = oEvent.getSource().getModel().getData().attributes.m_milestones.data;
				oSheet = new sap.ui.export.Spreadsheet({
					workbook: {
						columns: this.createColumns(4)
					},
					dataSource: oData,
					fileName: "Milestone.xlsx"
				});
				oSheet.build();

			}
		},

		//handles print of Tasks Report
		handlePrintTask: function () {
			var oTarget = this.getView().byId("vBxReport"),
				$domTarget = oTarget.$()[0],
				sTargetContent = $domTarget.innerHTML;
			var printWindow = window.open("", "", "height=800,width=800");
			// Constructing the report window for printing
			printWindow.document.write("<html><head><title></title>");
			printWindow.document.write("<link rel='stylesheet' href='applications/Manage_Programs/webapp/css/style.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/layout/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/unified/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/table/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/suite/ui/commons/themes/sap_belize_plus/library.css'>"
			);
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/m/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/tnt/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/f/themes/sap_belize_plus/library.css'>");
			printWindow.document.write(
				"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/viz/themes/sap_belize_plus/library.css'>");
			printWindow.document.write('</head><body >');
			printWindow.document.write(sTargetContent);
			printWindow.document.write('</body></html>');
			// Giving time for rendering the page
			setTimeout(function () {
				printWindow.print();
			}, 2000);
			// Automatically closing the preview window once the user has pressed the "Print" or, "Cancel" button.
			printWindow.onafterprint = function () {
				setTimeout(function () {
					printWindow.close();
				}, 4000);
			};
		},
		handleAddProject: function (evt) {
			var that = this;
			var that = this;
			var Err = this.ValidateEditAddProjectFragment();
			if (Err == 0) {
				var FragmentData = this.EditProject.getModel().getData();
				//var programData = this.getView().getModel().getData().programs[that.sPath];
				var programData = this.getView().getModel().getData().attributes.m_program.data.attributes;
				if (new Date(programData.startDate) > new Date(FragmentData.attributes.startDate)) {
					sap.m.MessageBox.error("Start date is less than program start date");
				} else if (new Date(programData.endDate) < new Date(FragmentData.attributes.endDate)) {
					sap.m.MessageBox.error("End date is greater than program end date");
				} else {
					// var vendorsObjModel = that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].assignedVendors;
					// var vendorToUpdate = that.VendorsObject == undefined ? vendorsObjModel : that.VendorsObject;
					// that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].assignedVendors =
					// 	vendorToUpdate;
					// // that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].assignedVendors.push(
					// // 	vendorToUpdate);
					// if (!that.CustomerObject == "") {
					// 	var model = that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath];
					// 	var custObj = model.customer;
					// 	model.customer = this.CustomerObject == undefined ? custObj : this.CustomerObject;
					// }
					// var vendorObjModel = []
					// var customerObjModel = []
					// this.EditProject.getContent()[0].getContent()[11].getModel().getData().forEach(function (oitems) {
					// 	customerObjModel.push(oitems.id);
					// });
					// this.EditProject.getContent()[0].getContent()[14].getModel().getData().forEach(function (oitems) {
					// 	vendorObjModel.push(oitems.id);
					// });
					that.projectMaindata = {
						"name": FragmentData.attributes.name,
						"description": FragmentData.attributes.description,
						"startDate": FragmentData.attributes.startDate,
						"endDate": FragmentData.attributes.endDate,
						"priority": FragmentData.attributes.priority,
						"effort": JSON.parse(this.EditProject.getContent()[0].getContent()[11].getValue()),
						"progress": parseInt(FragmentData.attributes.progress)
					};
					for (var prop in that.projectMaindata) {
						var value = that.projectMaindata[prop];
						if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
							delete that.projectMaindata[prop];
						}
					}
					$.ajax({
						url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.projectMaindata
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
							} else {
								that.projectsDetails();
								MessageToast.show("Program updated Sucessfully!", {
									closeOnBrowserNavigation: false
								});
								that.getView().getModel().updateBindings();
								that.EditProject.close();
								// this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
								var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
								oRouter.navTo("detailList", {
									objectId: that.programObjectPath
								});
							}
						}
					});

				}
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}
		},
		onValueHelpRequestCustomer: function () {
			var that = this;
			if (!this.SelectCustomerDialog) {
				this.SelectCustomerDialog = sap.ui.xmlfragment("MDG.Program.fragment.SelectCustomerDialog", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.SelectCustomerDialog);
			}
			//	this.EditProject.getContent()[0].getContent()[11].setModel(new JSONModel([]));
			var fragmentModel = new sap.ui.model.json.JSONModel(this.getView().getModel("customerInfo").getData());
			this.SelectCustomerDialog.setModel(fragmentModel);

			// Get a reference to the SelectDialog control
			// var oSelectDialog = sap.ui.getCore().byId("mySelectedCustomers");
			var oSelectDialog = this.SelectCustomerDialog;

			// Get the model and data that is bound to the SelectDialog control
			var oModel = oSelectDialog.getModel();
			var aData = oModel.getProperty("/");

			// Find the items that should be pre-selected (based on some criteria)
			var aSelectedItems = [];
			// Tokens model data
			var editProjectTokens = this.EditProject.getContent()[0].getContent()[11].getModel().getData();

			for (var p = 0; p < editProjectTokens.length; p++) {
				for (var j = 0; j < aData.length; j++) {
					if (aData[j].id === editProjectTokens[p].id) {
						aSelectedItems.push(oSelectDialog.getItems()[j]);
					}
				}
			}
			for (var m = 0; m < aSelectedItems.length; m++) {
				aSelectedItems[m].setSelected(true);
			}

			this.SelectCustomerDialog.open();
		},
		onSelectCustomer: function (evt) {
			var that = this;
			var aContexts = evt.getParameter("selectedContexts");
			that.CustomerObject = [];
			evt.getParameters().selectedContexts.forEach(function (obj, index) {
				var appPresent = false;
				if (that.CustomerObject) {
					var access = that.CustomerObject;
					for (var i = 0; i < access.length; i++) {
						if (access[i].attributes.customerName == obj.getObject().attributes.customerName) {
							appPresent = true;
							break;
						}
					}
				}
				if (!appPresent)
					that.CustomerObject.push(obj.getObject());
			});
			//	this.AddProject.getModel().getData()["SelVendors"]= this.VendorsObject;
			this.EditProject.getContent()[0].getContent()[11].setModel(new JSONModel(this.CustomerObject));
			this.EditProject.getModel().updateBindings();

		},
		openEditProject: function (evt) {
			var that = this;
			// var ObjData = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath];
			var ObjData = this.getView().getModel().getData();

			var fragmentModel = new sap.ui.model.json.JSONModel(ObjData);
			this.EditProject.setModel(fragmentModel);
			this.EditProject.getContent()[0].getContent()[11].setValue(JSON.stringify(ObjData.attributes.effort));
			// this.EditProject.getContent()[0].getContent()[14].setModel(new JSONModel(ObjData.attributes.m_vendors.data));
			// this.EditProject.getContent()[0].getContent()[11].setModel(new JSONModel(ObjData.attributes.m_customers.data)); //setSelectedKey(ObjData.customer.customerName);
			this.EditProject.open();
		},
		onValueHelpRequestVendor: function () {
			var that = this;
			if (!this.SelectVendorsDialog) {
				this.SelectVendorsDialog = sap.ui.xmlfragment("MDG.Program.fragment.SelectVendorsDialog", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.SelectVendorsDialog);
			}
			//	this.EditProject.getContent()[0].getContent()[14].setModel(new JSONModel([]));
			var fragmentModel = new sap.ui.model.json.JSONModel(this.getView().getModel("vendorInfo").getData());
			this.SelectVendorsDialog.setModel(fragmentModel);

			// Get a reference to the SelectDialog control
			// var oSelectDialog = sap.ui.getCore().byId("mySelectedVendors");
			var oSelectDialog = this.SelectVendorsDialog;

			// Get the model and data that is bound to the SelectDialog control
			var oModel = oSelectDialog.getModel();
			var aData = oModel.getProperty("/");

			// Find the items that should be pre-selected (based on some criteria)
			var aSelectedItems = [];
			// Tokens model data
			var editProjectTokens = this.EditProject.getContent()[0].getContent()[14].getModel().getData();

			for (var p = 0; p < editProjectTokens.length; p++) {
				for (var j = 0; j < aData.length; j++) {
					if (aData[j].attributes.vendorName === editProjectTokens[p].attributes.vendorName) {
						aSelectedItems.push(oSelectDialog.getItems()[j]);
					}
				}
			}
			for (var m = 0; m < aSelectedItems.length; m++) {
				aSelectedItems[m].setSelected(true);
			}

			this.SelectVendorsDialog.open();
		},
		onSelectVendors: function (evt) {
			var that = this;
			var aContexts = evt.getParameter("selectedContexts");
			that.VendorsObject = [];
			aContexts.forEach(function (obj, index) {
				var appPresent = false;
				if (that.VendorsObject) {
					var access = that.VendorsObject;
					for (var i = 0; i < access.length; i++) {
						if (access[i].attributes.vendorName == obj.getObject().attributes.vendorName) {
							appPresent = true;
							break;
						}
					}
				}
				if (!appPresent)
					that.VendorsObject.push(obj.getObject());
			});
			this.EditProject.getContent()[0].getContent()[14].setModel(new JSONModel(this.VendorsObject));
			this.EditProject.getModel().updateBindings();

		},
		//onSearch Vendors ValueHelp press
		onSearchVendorsValueHelp: function (evt) {
			this.SelectVendorsDialog.getBinding("items").filter([new sap.ui.model.Filter("attributes/vendorName", sap.ui.model.FilterOperator
				.Contains,
				evt.getParameters().value)]);
		},

		// handling delete function on removing 
		handleProjectTokenDeleted: function (evt) {
			var that = this;
			if (this.EditProject.getContent()[0].getContent()[14].getModel().getData() === undefined) {
				that.EditProject.getContent()[0].getContent()[5].getModel().getData().forEach(function (obj, index) {
					if (obj.attributes.vendorName == evt.getParameters().removedTokens[0].getText()) {
						that.EditProject.getContent()[0].getContent()[14].getModel().getData().splice(index, 1);
						that.EditProject.getContent()[0].getContent()[14].getModel().updateBindings();
					}
				});
			} else {
				that.EditProject.getContent()[0].getContent()[14].getModel().getData().forEach(function (obj, index) {
					if (obj.attributes.vendorName == evt.getParameters().removedTokens[0].getText()) {
						that.EditProject.getContent()[0].getContent()[14].getModel().getData().splice(index, 1);
						that.EditProject.getContent()[0].getContent()[14].getModel().updateBindings();
					}
				});
			}
		},
		handleProjectCustomerTokenDeleted: function (evt) {
			var that = this;
			if (this.EditProject.getContent()[0].getContent()[11].getModel().getData() === undefined) {
				that.EditProject.getContent()[0].getContent()[5].getModel().getData().forEach(function (obj, index) {
					if (obj.attributes.customerName == evt.getParameters().removedTokens[0].getText()) {
						that.EditProject.getContent()[0].getContent()[11].getModel().getData().splice(index, 1);
						that.EditProject.getContent()[0].getContent()[11].getModel().updateBindings();
					}
				});
			} else {
				that.EditProject.getContent()[0].getContent()[11].getModel().getData().forEach(function (obj, index) {
					if (obj.attributes.customerName == evt.getParameters().removedTokens[0].getText()) {
						that.EditProject.getContent()[0].getContent()[11].getModel().getData().splice(index, 1);
						that.EditProject.getContent()[0].getContent()[11].getModel().updateBindings();
					}
				});
			}
		},
		handleInputTokenDeleted: function (evt) {
			var that = this;
			if (that.addMileStoneInfo.getModel().getData().nodes === undefined) {
				that.addMileStoneInfo.getContent()[0].getContent()[5].getModel().getData().forEach(function (obj, index) {
					if (obj.attributes.name == evt.getParameters().removedTokens[0].getText()) {
						that.addMileStoneInfo.getContent()[0].getContent()[5].getModel().getData().splice(index, 1);
						that.addMileStoneInfo.getModel().updateBindings();
					}
				});
			} else {
				that.addMileStoneInfo.getModel().getData().nodes.forEach(function (obj, index) {
					if (obj.attributes.name == evt.getParameters().removedTokens[0].getText()) {
						that.addMileStoneInfo.getModel().getData().nodes.splice(index, 1);
						that.addMileStoneInfo.getModel().updateBindings();
					}
				});
			}
		},
		//Search implimentation of add vendors fragment
		handleSearchAddVendorsFragment: function (evt) {
			this.assignedVendors.getBinding("items").filter([new sap.ui.model.Filter("attributes/vendorName", sap.ui.model.FilterOperator.Contains,
				evt.getParameters().value)]);
		},
		//Search implimentation of add Team member fragment
		handleSearchAddTeamMem: function (evt) {
			this.assignTeamFragment.getBinding("items").filter([new sap.ui.model.Filter("usersDetails>firstName", sap.ui.model.FilterOperator.Contains,
				evt.getParameters().value)]);
		},
		//Search implimentation select task Value help fragment
		onSearchSelectTaskValueHelp: function (evt) {
			this.SelectTaskDialog.getBinding("items").filter([new sap.ui.model.Filter("taskName", sap.ui.model.FilterOperator.Contains,
				evt.getParameters().value)]);
		},
		handleProjectCancel: function (evt) {
			var that = this;
			this.EditProject.close();
		},
		fullScreen: function () {
			this.getView().getModel("appView").setProperty("/layout", "EndColumnFullScreen");
			this.byId("enterFullScreen").setVisible(false);
			this.byId("exitFullScreen").setVisible(true);
		},

		exitFullScreen: function () {
			this.getView().getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
			this.byId("exitFullScreen").setVisible(false);
			this.byId("enterFullScreen").setVisible(true);
		},

		onCloseDetailPress: function () {
			//	this.getOwnerComponent().getModel("appView").getProperty("/DetailListThis").getView().byId("list2").removeSelections();
			var bFullScreen = this.getView().getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
		},
		// todelete Project from list 
		openDeleteProject: function (evt) {
			var that = this;
			MessageBox.confirm("Are you sure you want to delete Project?", {
				title: "Confirm Deletion",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {
					$.ajax({
						type: "DELETE",
						url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
						success: function (response) {
							var resValue = JSON.parse(response);
							console.log(resValue.error);
							if (resValue.error) {
								MessageBox.error(resValue.error.message);
							} else {
								that.getView().getModel().updateBindings();
								MessageToast.show("Project Deleted sucessfully", {
									closeOnBrowserNavigation: false
								});
								that.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
								var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
								oRouter.navTo("detailList", {
									objectId: that.programObjectPath
								});
							}
						}
					});
				}
			});
		},
		handleDeleteUserPress: function () {
			var that = this;
			MessageBox.confirm("Confirm Project Delete", {
				title: "Confirm Deletion",
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {

					if (oAction === "YES") {
						var oModel = that.getView().getModel();
						var aUser = oModel.getData();

						var itemIndex = parseInt(that.path, 10);
						aUser.splice(itemIndex, 1);
						oModel.updateBindings();
						MessageToast.show("Project Deleted sucessfully", {
							closeOnBrowserNavigation: false
						});
						that.onCloseDetailPress();
					}
				}
			});
		},
		handleAddPagesAccess: function () {
			if (!this.AddTask) {
				this.AddTask = sap.ui.xmlfragment("MDG.Program.fragment.AddTask", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddTask);
			}
			this.handleAddUserCancelPress();
			this.AddTask.getContent()[0].getContent()[3].setValue("New");
			this.AddTask.getContent()[0].getContent()[3].setVisible(true);
			this.AddTask.getContent()[0].getContent()[4].setVisible(false);
			//	var taskModel = new sap.ui.model.json.JSONModel(this.getView().getModel("projectTeam").getData);
			//	this.AddTask.getContent()[0].getContent()[20].setModel(taskModel);
			var projectTeamModel = this.getView().getModel().getData().attributes.m_vendors.data;
			var teamTaskModel = new JSONModel(this.getView().getModel("projectTeam").getData());
			this.AddTask.setModel(teamTaskModel);
			var projectTaskModel = new JSONModel(projectTeamModel);
			this.AddTask.setModel(projectTaskModel, "projectModel");
			this.isEditTask = false;
			this.AddTask.open();
		},
		handleAddDelAccess: function () {
			if (!this.addDeliver) {
				this.addDeliver = sap.ui.xmlfragment("MDG.Program.fragment.addDeliverable", this);
				// this.addDeliver.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.addDeliver);
			}
			// var obj = {
			// 	assignedTeamMember: this.getView().getModel("projectTeam").getData(),
			// 	assignedTo: "",
			// 	deadLineDate: "",
			// 	endDate: "",
			// 	startDate: "",
			// 	taskStatus: "",
			// 	taskName: "",
			// 	taskdesp: "",
			// 	dependentTask: "",
			// 	assignedvendor: this.getView().getModel().getData().attributes.m_vendors.data,
			// 	csf: "",
			// 	"Effort": "",
			// 	"Progress": "",
			// 	"Priority": ""
			// };
			// this.addDeliver.setModel(new sap.ui.model.json.JSONModel(obj));
			//assign team members
			this.addDeliver.getContent()[0].getContent()[18].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel("projectTeam").getData()));
			//assign Vendor
			this.addDeliver.getContent()[0].getContent()[20].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel().getData().attributes
				.m_vendors.data));
			this.addDeliver.getContent()[0].getContent()[3].setVisible(true);
			this.addDeliver.getContent()[0].getContent()[4].setVisible(false);
			this.addDeliver.getContent()[0].getContent()[3].setValue("New");
			//assign Dependent Task
			this.addDeliver.getContent()[0].getContent()[24].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel(
				"mDeliverableModel").getData()));
			// //if there was a dependent task exist:--
			// if (fragmentModel.attributes.dependentTask !== null) {
			// 	this.addDeliver.getContent()[0].getContent()[22].setSelectedIndex(0);
			// 	this.addDeliver.getContent()[0].getContent()[24].setSelectedKey(fragmentModel.attributes.dependentTask);
			// 	this.selectDepencyPress("Yes");
			// } else {
			// 	this.addDeliver.getContent()[0].getContent()[22].setSelectedIndex(1);
			// 	this.addDeliver.getContent()[0].getContent()[24].setSelectedKey("");
			// 	this.selectDepencyPress("No");
			// }

			//setting CSF module
			this.addDeliver.getContent()[0].getContent()[8].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel("mCsfDetails").getData()));
			this.isEditTask = false;
			this.addDeliver.open();
		},
		OnSelectYesToDepencyPress: function (evt) {
			var that = this;
			if (evt.getSource().getText() == "No") {
				this.AddTask.getContent()[0].getContent()[19].setVisible(false);
				this.AddTask.getContent()[0].getContent()[20].setVisible(false);
			} else {
				this.AddTask.getContent()[0].getContent()[19].setVisible(true);
				this.AddTask.getContent()[0].getContent()[20].setVisible(true);
			}

		},
		onDependencySelect: function (evt) {
			var that = this;
			var selectedTask = evt;
			//

		},
		onDeleteDoc: function (evt) {
			// console.log(evt);
			// alert("msg");
		},
		assignTeamMember: function () {
			if (!this.assignTeamFragment) {
				this.assignTeamFragment = sap.ui.xmlfragment("MDG.Program.fragment.assignTeamMembertoTheProject", this);
				this.getView().addDependent(this.assignTeamFragment);
			}

			sap.ui.getCore().byId("myDialog2")._getOkButton().setText("Add");
			var functionalConsultant = this.getView().getModel("usersDetails").getData();
			var mroles = this.getView().getModel("mRolesDetails").getData();
			var selectedRoles = this.getView().getModel("projectTeam").getData();

			for (var i = 0; i < functionalConsultant.length; i++) {
				functionalConsultant[i].mrolesData = mroles;
				for (var j = 0; j < selectedRoles.length; j++) {
					if (functionalConsultant[i].id === selectedRoles[j].attributes.users_permissions_user.data.id)
						functionalConsultant[i].selRolesId = selectedRoles[j].attributes.mroles.data[0].id;
				}
			}
			var userModel = new sap.ui.model.json.JSONModel(functionalConsultant);
			this.assignTeamFragment.setModel(userModel, "mAssinedMember");

			this.assignTeamFragment.open();

		},
		//on segmented btn change 
		onSelectionChange: function (evt) {
			var that = this;
			if (evt === "Teammember" || evt === "Vendor" || evt === "Joint") {
				var selectedSegBtn = evt;
			} else {
				selectedSegBtn = evt.getParameters().item.getKey();
			}
			if (selectedSegBtn == "Teammember") {
				this.AddTask.getContent()[0].getContent()[16].setVisible(true);
				this.AddTask.getContent()[0].getContent()[18].setVisible(false);
				this.AddTask.getContent()[0].getContent()[18].setSelectedKey(" ");
				this.AddTask.getContent()[0].getContent()[19].setVisible(true);
				this.AddTask.getContent()[0].getContent()[18].getModel().setProperty("/selectedVendor", "");

			} else if (selectedSegBtn == "Vendor") {
				this.AddTask.getContent()[0].getContent()[16].setVisible(false);
				this.AddTask.getContent()[0].getContent()[16].setSelectedKey(" ");
				this.AddTask.getContent()[0].getContent()[16].getModel().setProperty("/selectedMemeber", "");
				this.AddTask.getContent()[0].getContent()[18].setVisible(true);
			} else {
				this.AddTask.getContent()[0].getContent()[18].setVisible(true);
				this.AddTask.getContent()[0].getContent()[16].setVisible(true);
			}
		},
		onTeamMemberRoleChange: function (evt) {
			var that = this;
			var selKey = evt.getSource().getSelectedKey();
			evt.getSource().getBindingContext("TeamMember").getObject().tmRole = selKey;
			this.getView().getModel().updateBindings();
		},
		addVendors: function () {
			if (!this.assignedVendors) {
				this.assignedVendors = sap.ui.xmlfragment("MDG.Program.fragment.addVendortoProject", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.assignedVendors);
			}
			sap.ui.getCore().byId("myDialog1")._getOkButton().setText("Add");
			var vendorModel = new JSONModel(this.getView().getModel("vendorInfo").getData());
			this.assignedVendors.setModel(vendorModel);
			this.assignedVendors.open();
		},
		addcustomer: function () {
			if (!this.assignedCustomers) {
				this.assignedCustomers = sap.ui.xmlfragment("MDG.Program.fragment.addCustomerToProject", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.assignedCustomers);
			}
			sap.ui.getCore().byId("myDialog13")._getOkButton().setText("Add");
			var customerModel = new JSONModel(this.getView().getModel("customerInfo").getData());
			this.assignedCustomers.setModel(customerModel);
			this.assignedCustomers.open();
		},
		handleAppListSearch: function (evt) {
			if (evt.getParameter("value").length > 0)
				var data = [new sap.ui.model.Filter("application", "Contains", evt.getParameter("value"))];
			else
				var data = [];
			this.AddTask.getBinding("items").filter(data);

		},
		handleEditUserPress: function () {

			var userObj = this.getView().getBindingContext().getObject();
			this.AdduserFragment.getContent()[0].getContent()[1].setValue(userObj.firstName);
			this.AdduserFragment.getContent()[0].getContent()[3].setValue(userObj.lastname);
			this.AdduserFragment.getContent()[0].getContent()[5].setValue(userObj.email);
			this.AdduserFragment.getContent()[0].getContent()[7].setValue(userObj.contact);
			this.AdduserFragment.getContent()[0].getContent()[9].setValue(userObj.city);
			this.AdduserFragment.getContent()[0].getContent()[11].setValue(userObj.zipCode);
			this.AdduserFragment.getContent()[0].getContent()[13].setSelectedKey(userObj.role);
			this.AdduserFragment.getContent()[0].getContent()[15].setValue(userObj.address);
			//this.addNewUser.getContent()[2].getContent()[9].setSelectedKey(userObj.roletype);
			this.AdduserFragment.open();

		},
		handleAddUserCancelPress: function () {
			this.AddTask.getContent()[0].getContent()[14].setSelectedKey(null);
			this.AddTask.getContent()[0].getContent()[16].setSelectedKey(null);
			this.AddTask.getContent()[0].getContent()[12].setValue(null);
			this.AddTask.getContent()[0].getContent()[10].setValue(null);
			this.AddTask.getContent()[0].getContent()[8].setValue(null);
			this.AddTask.getContent()[0].getContent()[3].setValue(null);
			this.AddTask.getContent()[0].getContent()[1].setValue(null);
			this.AddTask.getContent()[0].getContent()[6].setValue(null);

			this.AddTask.close();
		},
		handleAddDelCancelPress: function () {
			this.addDeliver.getContent()[0].getContent()[16].setSelectedKey(null);
			this.addDeliver.getContent()[0].getContent()[18].setSelectedKey(null);
			this.addDeliver.getContent()[0].getContent()[14].setValue(null);
			this.addDeliver.getContent()[0].getContent()[12].setValue(null);
			this.addDeliver.getContent()[0].getContent()[10].setValue(null);
			this.addDeliver.getContent()[0].getContent()[3].setValue(null);
			this.addDeliver.getContent()[0].getContent()[1].setValue(null);
			this.addDeliver.getContent()[0].getContent()[6].setValue(null);

			this.addDeliver.close();
		},
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleSearchCustomerPress: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("attributes/customerName", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		/*onaddTeamConfirm: function (oEvent) {
			var itemPresent = false;
			var leng = oEvent.getParameters().selectedItems.length;
			for (var i = 0; i < leng; i++) {
				var oSelected = oEvent.getParameters().selectedItems[i].getBindingContext().getObject();
				var tableItems = this.getView().byId("assignTeamMembers").getItems();
				for (var j = 0; j < tableItems.length; j++) {
					if (tableItems[j].getCells()[0].getText() == (oSelected.firstName + " " + oSelected.lastname)) {
						itemPresent = true;
						break;
					}
				}
				if (!itemPresent) {
					this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assigned_teammember.push(
						oSelected);
					var assignmtm = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assigned_teammember;
					assignmtm[assignmtm.length - 1].role = oEvent.getParameters().selectedItems[i].getCells()[3].getSelectedKey();
					this.getView().getModel().updateBindings();
					var oBinding = oEvent.getSource().getBinding("items");
					oBinding.filter([]);
					this.getView().getModel().refresh();
				}
			}
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length && itemPresent == false) {
				MessageToast.show("Team Member Added Successfully!");
			} else
				MessageToast.show("Team Member is already present!");

		},*/
		onaddTeamConfirm: function (oEvent) {
			var that = this;
			if (oEvent.getParameters().selectedItems.length > 0) {
				for (var i = 0; i < oEvent.getParameters().selectedItems.length; i++) {
					that.Userobj = oEvent.getParameters().selectedItems[i].getBindingContext("mAssinedMember").getObject();

					var role = parseInt(oEvent.getParameters().selectedItems[i].getCells()[3].getSelectedKey());

					var roleModelCollection = this.getView().getModel("mRolesDetails").getData();
					var mRoleDesignation = [];
					//want to get role id so we can add with them
					for (var q = 0; q < roleModelCollection.length; q++) {
						if (roleModelCollection[q].id === role) {
							mRoleDesignation.push(roleModelCollection[q].id);
							break;
						}
					}
					// var checkMember = that.getView().getModel("projectTeam").getData();
					// if (checkMember.length != 0) {
					// 	for (var k = 0; k < checkMember.length; k++) {
					// 		if (that.Userobj.id === checkMember[k].attributes.users_permissions_user.data.id) {
					// 			that.duplicateID = false;
					// 			MessageBox.error(that.Userobj.firstName + " it is already in the Project");
					// 			break;
					// 		} else {
					// 			that.duplicateID = true;
					// 		}
					// 	}
					// } else {
					// 	that.duplicateID = true;
					// }
					// if (that.duplicateID === true) {
					that.linkProjectTeam = {
						"m_projects": [that.projectObjectPath],
						"users_permissions_user": [that.Userobj.id],
						"mroles": mRoleDesignation
					};
					$.ajax({
						url: "/OptimalCog/api/m-project-teams",
						type: "POST",
						data: {
							"data": that.linkProjectTeam
						},
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
							} else {
								// that.getView().getModel("mRolesDetails").updateBindings();
								// that.getView().getModel("usersDetails").updateBindings();
								// that.getView().getModel().updateBindings();
								that.projectsDetails();
								that.mcsfsDetails();
							}
						}
					});

					// this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assigned_teammember.push(
					// 	obj);
				}
			} else {
				MessageToast.show("Please select a member to add to project!");
			}
		},
		handleListItemPress: function (evt) {
			var that = this;
			this.isEditTask = true;
			this.taskPath = evt.getSource().getBindingContext("mCsfDetails").getPath().split("/")[1];
			if (!this.AddTask) {
				this.AddTask = sap.ui.xmlfragment("MDG.Program.fragment.AddTask", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddTask);
			}
			var taskStatData = [{
				"taskStatus": "New"
			}, {
				"taskStatus": "In Progress"
			}, {
				"taskStatus": "Completed"
			}];
			//	var taskStatusModel = new sap.ui.model.json.JSONModel(taskStatData);
			var fragmentModel = this.getView().getModel("mCsfDetails").getData()[this.taskPath];
			this.AddTask.getContent()[0].getContent()[3].setVisible(true);
			this.AddTask.getContent()[0].getContent()[4].setVisible(false);
			//	this.AddTask.getContent()[0].getContent()[4].setEditable(false);
			//	this.AddTask.getContent()[0].getContent()[4].setModel(taskStatusModel);
			if (fragmentModel.attributes.m_deliverable.data !== null) {
				this.AddTask.getContent()[0].getContent()[3].setValue(fragmentModel.attributes.m_deliverable.data.attributes.status);
			}
			this.AddTask.getContent()[0].getContent()[12].setValue(fragmentModel.attributes.deadLineDate);
			this.AddTask.getContent()[0].getContent()[10]
				.setValue(fragmentModel.attributes.endDate);
			this.AddTask.getContent()[0].getContent()[8].setValue(fragmentModel.attributes.startDate);
			this.AddTask.getContent()[0].getContent()[1].setValue(fragmentModel.attributes.name);
			this.AddTask.getContent()[0].getContent()[6].setValue(fragmentModel.attributes.description);
			this.AddTask.getContent()[0].getContent()[20].setValue(fragmentModel.attributes.effort);
			this.AddTask.getContent()[0].getContent()[22].setValue(fragmentModel.attributes.progress);
			this.AddTask.getContent()[0].getContent()[24].setSelectedKey(fragmentModel.attributes.priority);

			var projectTeamModel = this.getView().getModel().getData().attributes.m_vendors.data;
			var teamModel = new JSONModel(this.getView().getModel("projectTeam").getData());
			this.AddTask.setModel(teamModel);
			if (fragmentModel.attributes.users_permissions_user.data !== null) {
				this.AddTask.getContent()[0].getContent()[16].getModel().setProperty("/selectedMemeber", fragmentModel.attributes.users_permissions_user
					.data.attributes.firstName);
			}
			//	this.AddTask.getContent()[0].getContent()[16].mProperties.selectedKey = fragmentModel.attributes.users_permissions_user.data.attributes.firstName;
			var projectTaskModel = new JSONModel(projectTeamModel);
			this.AddTask.getContent()[0].getContent()[18].setModel(projectTaskModel, "projectModel");
			if (fragmentModel.attributes.m_vendor.data !== null) {
				var sVendorData = fragmentModel.attributes.m_vendor.data.attributes.vendorName;
				this.AddTask.getContent()[0].getContent()[18].getModel().setProperty("/selectedVendor", sVendorData);
				this.AddTask.getContent()[0].getContent()[18].setSelectedKey(sVendorData);
			}
			//	this.AddTask.getContent()[0].getContent()[16].mProperties.selectedKey = fragmentModel.attributes.m_vendor.data.attributes.vendorName;
			//	this.AddTask.setModel(projectTaskModel, "projectModel");

			if (fragmentModel.attributes.m_vendor.data == null || fragmentModel.attributes.m_vendor.data == "") {
				this.AddTask.getContent()[0].getContent()[14].setSelectedKey("Teammember");
				this.onSelectionChange("Teammember");
			} else if (fragmentModel.attributes.users_permissions_user.data == null ||
				fragmentModel.attributes.users_permissions_user.data == "") {
				this.AddTask.getContent()[0].getContent()[14].setSelectedKey("Vendor");
				this.onSelectionChange("Vendor");
			} else {
				this.AddTask.getContent()[0].getContent()[14].setSelectedKey("Joint");
				this.onSelectionChange("Joint");
			}
			this.AddTask.getModel().updateBindings();
			this.AddTask.open();

		},
		handleListItemDelPress: function (evt) {
			var that = this;
			this.isEditTask = true;
			this.taskPath = evt.getSource().getBindingContext("mDeliverableModel").sPath.split("/")[1];
			if (!this.addDeliver) {
				this.addDeliver = sap.ui.xmlfragment("MDG.Program.fragment.addDeliverable", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.addDeliver);
			}
			var taskStatData = [{
				"taskStatus": "New"
			}, {
				"taskStatus": "In-Progress"
			}, {
				"taskStatus": "Completed"
			}];
			var taskStatusModel = new sap.ui.model.json.JSONModel(taskStatData);
			var fragmentModel = this.getView().getModel("mDeliverableModel").getData()[this.taskPath];
			//setting CSF module
			this.addDeliver.getContent()[0].getContent()[8].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel("mCsfDetails").getData()));
			this.addDeliver.getContent()[0].getContent()[8].setSelectedKey(fragmentModel.attributes.m_csf.data === null ? "" : fragmentModel
				.attributes
				.m_csf.data.id);
			this.addDeliver.getContent()[0].getContent()[3].setVisible(false);
			this.addDeliver.getContent()[0].getContent()[4].setVisible(true);
			this.addDeliver.getContent()[0].getContent()[4].setModel(taskStatusModel);
			this.addDeliver.getContent()[0].getContent()[4].setSelectedKey(fragmentModel.attributes.status);

			this.addDeliver.getContent()[0].getContent()[14].setValue(fragmentModel.attributes.deadlineDate);
			this.addDeliver.getContent()[0].getContent()[12].setValue(fragmentModel.attributes.endDate);
			this.addDeliver.getContent()[0].getContent()[10].setValue(fragmentModel.attributes.startDate);

			this.addDeliver.getContent()[0].getContent()[1].setValue(fragmentModel.attributes.name);
			this.addDeliver.getContent()[0].getContent()[6].setValue(fragmentModel.attributes.description);

			//assign Dependent Task
			this.addDeliver.getContent()[0].getContent()[24].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel(
				"mDeliverableModel").getData()));
			//if there was a dependent task exist:--
			if (fragmentModel.attributes.dependentTask !== null) {
				this.addDeliver.getContent()[0].getContent()[22].setSelectedIndex(0);
				this.addDeliver.getContent()[0].getContent()[24].setSelectedKey(fragmentModel.attributes.dependentTask);
				this.selectDepencyPress("Yes");
			} else {
				this.addDeliver.getContent()[0].getContent()[22].setSelectedIndex(1);
				this.addDeliver.getContent()[0].getContent()[24].setSelectedKey("");
				this.selectDepencyPress("No");
			}
			//assign team members
			this.addDeliver.getContent()[0].getContent()[18].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel("projectTeam")
				.getData()));
			this.addDeliver.getContent()[0].getContent()[18].setSelectedKey(fragmentModel.attributes.users_permissions_user.data === null ?
				null : fragmentModel.attributes.users_permissions_user.data.id);
			//assign Vendor
			this.addDeliver.getContent()[0].getContent()[20].setModel(new sap.ui.model.json.JSONModel(this.getView().getModel().getData().attributes
				.m_vendors.data));
			this.addDeliver.getContent()[0].getContent()[20].setSelectedKey(fragmentModel.attributes.m_vendor.data === null ? null :
				fragmentModel.attributes.m_vendor.data.id);

			this.addDeliver.getContent()[0].getContent()[26].setValue(fragmentModel.attributes.effort);
			this.addDeliver.getContent()[0].getContent()[28].setValue(fragmentModel.attributes.progress);
			this.addDeliver.getContent()[0].getContent()[30].setSelectedKey(fragmentModel.attributes.priority);
			if (fragmentModel.attributes.m_vendor.data == null || fragmentModel.attributes.m_vendor.data == "") {
				this.addDeliver.getContent()[0].getContent()[16].setSelectedKey("Teammember");
				this.onSelectionDeliverable("Teammember");
			} else if (fragmentModel.attributes.users_permissions_user.data == null ||
				fragmentModel.attributes.users_permissions_user.data == "") {
				this.addDeliver.getContent()[0].getContent()[16].setSelectedKey("Vendor");
				this.onSelectionDeliverable("Vendor");
			} else {
				this.addDeliver.getContent()[0].getContent()[16].setSelectedKey("Joint");
				this.onSelectionDeliverable("Joint");
			}

			this.addDeliver.open();
		},
		onSelectionDeliverable: function (evt) {
			var that = this;
			if (evt === "Teammember" || evt === "Vendor" || evt === "Joint") {
				var selectedSegBtn = evt;
			} else {
				selectedSegBtn = evt.getParameters().item.getKey();
			}
			if (selectedSegBtn == "Teammember") {
				this.addDeliver.getContent()[0].getContent()[17].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[18].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[20].setSelectedKey("");

				this.addDeliver.getContent()[0].getContent()[19].setVisible(false);
				this.addDeliver.getContent()[0].getContent()[20].setVisible(false);

			} else if (selectedSegBtn == "Vendor") {
				this.addDeliver.getContent()[0].getContent()[17].setVisible(false);
				this.addDeliver.getContent()[0].getContent()[18].setVisible(false);

				this.addDeliver.getContent()[0].getContent()[19].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[20].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[18].setSelectedKey("");
			} else {
				this.addDeliver.getContent()[0].getContent()[17].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[18].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[19].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[20].setVisible(true);
			}
		},
		selectDepencyPress: function (evt) {
			var that = this;
			if (evt === "No" || evt === "Yes") {
				var selectedBtn = evt;
			} else {
				selectedBtn = evt.getSource().getText();
			}
			if (selectedBtn == "No") {
				this.addDeliver.getContent()[0].getContent()[23].setVisible(false);
				this.addDeliver.getContent()[0].getContent()[24].setVisible(false);
			} else {
				this.addDeliver.getContent()[0].getContent()[23].setVisible(true);
				this.addDeliver.getContent()[0].getContent()[24].setVisible(true);
			}

		},
		onConfirm: function (oEvent) {
			var that = this;
			var selectVendorPath = oEvent.getParameters().selectedItems;
			if (selectVendorPath.length > 0) {
				var vendorData = [];
				for (var i = 0; i < selectVendorPath.length; i++) {
					var getPath = selectVendorPath[i].getBindingContext().getPath().split("/")[1];
					var vendorDataModel = this.getView().getModel("vendorInfo").getData()[getPath];
					that.getView().getModel().getData().attributes.m_vendors.data.push(vendorDataModel);
				}
				var cutomerProjectdata = that.getView().getModel().getData().attributes.m_vendors.data;
				cutomerProjectdata.map(function (itemPre) {
					vendorData.push(itemPre.id);
				});
				//	var modelData = that.getView().getModel().getData();
				that.updateVendorData = {
					"m_vendors": vendorData
				};
				$.ajax({
					url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
					type: "PUT",
					data: {
						"data": that.updateVendorData
					},
					success: function (res) {
						var getValues = JSON.parse(res);
						console.log(getValues.error);
						if (getValues.error) {
							MessageBox.error(getValues.error.message);
						} else {
							MessageToast.show("Vendor Added Successfully!");
							//that.updateModel();
							//	this.getView().getModel("ProgramsModel").updateBindings();
							that.projectsDetails();
							that.getView().getModel().updateBindings();
							that.getView().getModel().refresh();
							that.vendorFragmentCancelPress();
						}
					}
				});
			} else {
				MessageToast.show("first select the item!");
			}

		},
		onConfirmCustomer: function (oEvent) {
			var that = this;
			//	var itemPresent = false;
			var selecetedCustPath = oEvent.getParameters().selectedItems;
			if (selecetedCustPath.length > 0) {
				var customerData = [];
				for (var i = 0; i < selecetedCustPath.length; i++) {
					var getPath = selecetedCustPath[i].getBindingContext().getPath().split("/")[1];
					var customerModelData = this.getView().getModel("customerInfo").getData()[getPath];
					that.getView().getModel().getData().attributes.m_customers.data.push(customerModelData);
				}
				var cutomerProjectdata = that.getView().getModel().getData().attributes.m_customers.data;
				cutomerProjectdata.map(function (itemPre) {
					customerData.push(itemPre.id);
				});
				//	var modelData = that.getView().getModel().getData();
				that.updateCustomerData = {
					"m_customers": customerData
				};
				$.ajax({
					url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
					type: "PUT",
					data: {
						"data": that.updateCustomerData
					},
					success: function (res) {
						var getValues = JSON.parse(res);
						console.log(getValues.error);
						if (getValues.error) {
							MessageBox.error(getValues.error.message);
						} else {
							MessageToast.show("Customer Added Successfully!");
							//that.updateModel();
							//	this.getView().getModel("ProgramsModel").updateBindings();
							that.projectsDetails();
							that.getView().getModel().updateBindings();
							that.getView().getModel().refresh();
							that.handleClose();
						}
					}
				});
			} else {
				MessageToast.show("first select the item!");
			}
			// var oSelected = oEvent.getParameters().selectedItems[0].getBindingContext("customerdata").getObject(); //.customer[selecetedCustPath];
			// var tableItems = this.getView().byId("CustomersTable").getItems();
			// for (var j = 0; j < tableItems.length; j++) {
			// 	if (tableItems[j].getCells()[0].getText() == oSelected.customerName) {
			// 		itemPresent = true;
			// 		break;
			// 	}
			// }
			// if (!itemPresent)
			// 	this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].customer.push(
			// 		oSelected);
			// var oBinding = oEvent.getSource().getBinding("items");
			// oBinding.filter([]);
			// this.getView().getModel().updateBindings();
			// this.getView().getModel().refresh();

			// var aContexts = oEvent.getParameter("selectedContexts");
			// if (aContexts && aContexts.length && itemPresent == false) {
			// 	MessageToast.show("Customer Added Successfully!");
			// } else
			// 	MessageToast.show("Customer is already present!");

		},
		handleClose: function () {
			// this.assignedCustomers.close();

		},
		vendorFragmentCancelPress: function () {
			// this.valueHelpForNewUser.getContent()[2].getContent()[5].setValueState("None");
			this.assignedVendors.close();
		},

		assignTeamMemberFragmentCancelPress: function () {
			// this.valueHelpForNewUser.getContent()[2].getContent()[5].setValueState("None");
			this.assignTeamFragment.close();
		},

		handleAddTaskOkPress: function () {
			var that = this;
			var taskStatus;
			var formData = this.AddTask.getContent()[0].getContent();
			var projectData = this.getView().getModel().getData();
			if (new Date(projectData.attributes.startDate) > new Date(formData[8].getValue())) {
				sap.m.MessageBox.error("Start date is less than project start date");
			} else if (new Date(projectData.attributes.endDate) < new Date(formData[10].getValue())) {
				sap.m.MessageBox.error("End date is greater than project end date");
			} else {
				if (this.isEditTask) {
					if (formData[3].getValue() == "") {
						taskStatus = formData[4].getValue();
					} else {
						taskStatus = formData[3].getValue();
					}
					debugger;
					var fragmentModel = this.getView().getModel("mCsfDetails").getData()[that.taskPath];
					var upteamMemberArray = [];
					that.upDateModel = this.getView().getModel("projectTeam").getData();
					that.upDateModel.forEach(function (items) {
						if (items.attributes.users_permissions_user.data.attributes.firstName === that.upDateModel.selectedMemeber) {
							upteamMemberArray.push(items.attributes.users_permissions_user.data.id);
						}
					});
					var upAssignVendorArray = [];
					projectData.attributes.m_vendors.data.forEach(function (items) {
						if (items.attributes.vendorName === that.upDateModel.selectedVendor) {
							upAssignVendorArray.push(items.id);
						}
					});
					that.updateCSFTask = {
						"users_permissions_user": upteamMemberArray,
						//	"assignedTo": formData[18].getSelectedKey(),
						"deadLineDate": that.upDateModel.deadLineDate,
						"endDate": that.upDateModel.endDate,
						"startDate": that.upDateModel.startDate,
						//	"taskStatus": taskStatus,
						"name": that.upDateModel.taskName,
						"description": that.upDateModel.taskdesp,
						//	"dependentTask": that.upDateModel21.getSelectedItem == null ? '' : that.upDateModel21.getSelectedItem.getText,
						"m_vendor": upAssignVendorArray,
						"effort": that.upDateModel.Efforts,
						"progress": that.upDateModel.Progress,
						"priority": that.upDateModel.Priority
					};
					if (that.updateCSFTask.name == "" || that.updateCSFTask.startDate == "" ||
						that.updateCSFTask.deadLineDate == "" || that.updateCSFTask.priority == "" || that.updateCSFTask.name == undefined || that.updateCSFTask
						.startDate == undefined ||
						that.updateCSFTask.deadLineDate == undefined || that.updateCSFTask.priority == undefined) {
						MessageBox.error("Enter the values!");
					} else {
						for (var prop in that.updateCSFTask) {
							var value = that.updateCSFTask[prop];
							if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
								if (Array.isArray(value) && value.length === 0) {
									that.updateCSFTask[prop] = [];
								} else {
									delete that.updateCSFTask[prop];
								}
							}
						}
						$.ajax({
							url: "/OptimalCog/api/m-csfs/" + fragmentModel.id,
							type: "PUT",
							headers: {
								"Content-Type": 'application/json'
							},
							data: JSON.stringify({
								"data": that.updateCSFTask
							}),
							success: function (res) {
								var getValues = JSON.parse(res);
								console.log(getValues.error);
								if (getValues.error) {
									MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
								} else {
									that.projectsDetails();
									that.getView().getModel().updateBindings();
									//that.handleAddUserCancelPress();
									that.AddTask.close();

								}
							}
						});

					}

				} else {
					if (formData[3].getValue() == "") {
						taskStatus = formData[4].getValue();
					} else {
						taskStatus = formData[3].getValue();
					}
					var teamMemberArray = [];
					var checkModel = this.getView().getModel("projectTeam").getData();
					checkModel.forEach(function (items) {
						if (items.attributes.users_permissions_user.data.attributes.firstName === formData[16].getSelectedKey()) {
							teamMemberArray.push(items.attributes.users_permissions_user.data.id);
						}
					});
					var assignVendorArray = [];
					projectData.attributes.m_vendors.data.forEach(function (items) {
						if (items.attributes.vendorName === formData[18].getSelectedKey()) {
							assignVendorArray.push(items.id);
						}
					});
					that.addCSFPayload = {
						"csfID": "CSF1000" + parseInt(that.mcsrfLength + 1),
						"users_permissions_user": teamMemberArray,
						//	"assignedTo": formData[18].getSelectedKey(),
						"deadLineDate": formData[10].getValue(),
						"endDate": formData[10].getValue(),
						"startDate": formData[8].getValue(),
						//	"taskStatus": taskStatus,
						"name": formData[1].getValue(),
						"description": formData[6].getValue(),
						//	"dependentTask": formData[21].getSelectedItem() == null ? '' : formData[21].getSelectedItem().getText(),
						"m_vendor": assignVendorArray,
						"effort": formData[20].getValue(),
						"progress": formData[22].getValue(),
						"priority": formData[24].getSelectedKey(),
						"m_project": [projectData.id]
					};

					if (that.addCSFPayload.name == "" || that.addCSFPayload.startDate == "" || that.addCSFPayload.deadLineDate == "" || that.addCSFPayload
						.priority == "") {
						MessageBox.error("Enter the values!");
					} else {
						for (var prop in that.addCSFPayload) {
							var value = that.addCSFPayload[prop];
							if (value == "" || value == undefined || typeof value === "number" && isNaN(value) || Array.isArray(value) && value.length ===
								0) {
								delete that.addCSFPayload[prop];
							}
						}
						$.post("/OptimalCog/api/m-csfs", {
								"data": that.addCSFPayload
							},
							function (response) {
								var resValue = JSON.parse(response);
								console.log(resValue.error);
								debugger
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									that.getView().getModel().updateBindings();
									//that.handleAddUserCancelPress();
									that.projectsDetails();
									that.AddTask.close();
								}
							});
					}
				}
			}

		},
		handleAddDelOkPress: function () {
			var that = this;
			var taskStatus;
			if (this.isEditTask) {
				//var userData = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath];
				var formData = this.addDeliver.getContent()[0].getContent();
				if (formData[3].getValue() == "") {
					taskStatus = formData[4].getValue();
				} else {
					taskStatus = formData[4].getValue();
				}
				that.updateTask = {
					"users_permissions_user": formData[16].getSelectedKey() === "Vendor" ? [] : [parseInt(formData[18].getSelectedKey())],
					"deadlineDate": formData[14].getValue(),
					"endDate": formData[12].getValue(),
					"startDate": formData[10].getValue(),
					"status": taskStatus,
					"name": formData[1].getValue(),
					"description": formData[6].getValue(),
					"dependentTask": formData[22].getSelectedIndex() == 1 ? "" : formData[24].getSelectedItem().getText(),
					"m_vendor": formData[16].getSelectedKey() === "Teammember" ? [] : [parseInt(formData[20].getSelectedKey())],
					"m_csf": formData[8].getSelectedKey(),
					"effort": parseInt(formData[26].getValue()),
					"progress": parseInt(formData[28].getValue()),
					"priority": formData[30].getSelectedKey(),
				};
				if (that.updateTask.name == "" || that.updateTask.startDate == "" ||
					that.updateTask.deadlineDate == "" || that.updateTask.priority == "") {
					MessageBox.error("Enter the values!");
				} else {
					for (var prop in that.updateTask) {
						var value = that.updateTask[prop];
						if (value == "" || value == undefined || typeof value === "number" && isNaN(value) || Array.isArray(value) && value.length ===
							0) {
							if (Array.isArray(that.updateTask[prop]) === true) {
								that.updateTask[prop] = [];
							} else {
								delete that.updateTask[prop];
							}
						}
					}
					var fragdel = this.getView().getModel("mDeliverableModel").getData()[this.taskPath];
					$.ajax({
						url: "/OptimalCog/api/m-deliverables/" + fragdel.id,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.updateTask
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
							} else {
								that.projectsDetails();
								that.getView().getModel().updateBindings();
								//that.handleAddUserCancelPress();
								that.addDeliver.close();

							}
						}
					});

				}
			} else {

				//	var userData = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath];

				var formData = this.addDeliver.getContent()[0].getContent();
				if (formData[3].getValue() == "") {
					taskStatus = formData[4].getValue();
				} else {
					taskStatus = formData[3].getValue();
				}
				that.createTask = {
					"deliverablesID": "DCL1000" + parseInt(that.mDeliverablesLength + 1),
					"users_permissions_user": formData[16].getSelectedKey() === "Vendor" ? '' : [parseInt(formData[18].getSelectedKey())],
					// "deadlineDate": formData[14].getValue(),
					"deadlineDate": formData[12].getValue(),
					"endDate": formData[12].getValue(),
					"startDate": formData[10].getValue(),
					"status": "New",
					"name": formData[1].getValue(),
					"description": formData[6].getValue(),
					"dependentTask": formData[22].getSelectedIndex() == 1 ? '' : formData[24].getSelectedItem().getText(),
					"m_vendor": formData[16].getSelectedKey() === "Teammember" ? '' : [parseInt(formData[20].getSelectedKey())],
					"m_csf": formData[8].getSelectedKey(),
					"effort": parseInt(formData[26].getValue()),
					"progress": parseInt(formData[28].getValue()),
					"priority": formData[30].getSelectedKey(),
					"m_project": [that.projectObjectPath]
				};
				if (that.createTask.name == "" || that.createTask.startDate == "" ||
					that.createTask.deadlineDate == "" || that.createTask.priority == "") {
					MessageBox.error("Enter the values!");
				} else {
					for (var prop in that.createTask) {
						var value = that.createTask[prop];
						if (value == "" || value == undefined || typeof value === "number" && isNaN(value) || Array.isArray(value) && value.length ===
							0) {
							delete that.createTask[prop];
						}
					}
					$.ajax({
						url: "/OptimalCog/api/m-deliverables",
						type: "POST",
						data: {
							"data": that.createTask
						},
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error("Something went wroung!")
							} else {
								that.projectsDetails();
								MessageBox.success("deliverable Add Successfully!")
								that.getView().getModel().updateBindings();
								//that.handleAddUserCancelPress();
								that.addDeliver.close();

							}
						}
					});
				}
			}
		},
		userNameClicked: function (evt) {
			var that = this;

			this.getView().getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
			this.getOwnerComponent().getRouter().navTo("ProccessFlowView");

		},
		deleteTeamMember: function (evt) {
			var that = this;
			//	var selectedContexts = this.getView().byId("assignTeamMembers").getSelectedContexts();
			var selectedItemsData = this.getView().byId("assignTeamMembers").getSelectedItems();
			if (selectedItemsData.length > 0) {
				MessageBox.confirm("Are you sure you want to delete?", {
					title: "Confirm Deletion",
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction === "YES") {
							var mmProjectTeamData = that.getView().getModel().getData("projectTeam");
							for (var i = selectedItemsData.length - 1; i >= 0; i--) {
								//var personData = selectedItemsData[c].getBindingContext("projectTeam").getObject();
								var personDataIndex = parseInt(selectedItemsData[i].getBindingContext("projectTeam").getPath().split("/")[1]);
								mmProjectTeamData.attributes.m_project_teams.data.splice(personDataIndex, 1);
							}
							that.getView().getModel("projectTeam").updateBindings();
							that.getView().getModel("projectTeam").refresh(true);
							var updateProjectTeam = mmProjectTeamData.attributes.m_project_teams.data;

							var teamArray = [];

							updateProjectTeam.map(function (item) {
								teamArray.push(item.id);
							});
							if (teamArray.length === 0) {
								teamArray = [];
							}
							that.updateTeamData = {
								"m_project_teams": teamArray
							};
							$.ajax({
								url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.updateTeamData
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									console.log(getValues.error);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
									} else {
										MessageToast.show("Deleted Successfully!");
										that.projectsDetails();
										that.getView().getModel().updateBindings();
										that.getView().getModel().refresh();
									}
								}
							});
						}
					}
				});
			} else {
				MessageToast.show("Please select atleast one item.");
			}

			// var selectedContexts = "0";
			/*if (selectedContexts.length > 0) {
				var TaskPresentForSelectedItems = false,
					tasksDeletionArr = [];
				var tasks = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].csf;
				for (var k = 0; k < tasks.length; k++) {
					for (var c = 0; c < selectedItemsData.length; c++) {
						if (tasks[k].assignedTeamMember == selectedItemsData[c].getCells()[0].getText()) {
							TaskPresentForSelectedItems = true;
							tasksDeletionArr.push(k);
						}
					}
				}
				if (!TaskPresentForSelectedItems) {
					for (var t = selectedContexts.length - 1; t >= 0; t--) {
						this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assigned_teammember.splice(
							selectedContexts[t].sPath.split('/assigned_teammember/')[1], 1);
						try {
							this.getView().byId("assignTeamMembers").getItems()[selectedContexts[t].sPath.split('/assigned_teammember/')[1]].setSelected(
								false);
						} catch (e) {}
					}
					this.getView().getModel().updateBindings();
				} else {
					sap.m.MessageBox.warning(
						//	"Selected Team Member are assigned to some tasks, this will delete the assigned tasks the deleted team member. Are you sure you want to delete the Team Member.", {
						"Selected Team Member assigned to some tasks, unable to delete the Team Member.", {

							onClose: function (oEvent) {
								if (oEvent == "OK") {
									// for (var t = selectedContexts.length - 1; t >= 0; t--) {
									// that.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assigned_teammember.splice(
									// 		selectedContexts[t].sPath.split('/assigned_teammember/')[1], 1);
									// 	try {
									// 		that.getView().byId("assignTeamMembers").getItems()[selectedContexts[t].sPath.split('/assigned_teammember/')[1]].setSelected(
									// 			false);
									// 	} catch (e) {}
									// }
									// for (var x = 0; x < tasksDeletionArr.length; x++) {
									// 	this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].csf.splice(tasksDeletionArr[x], 1);
									// }
									// that.getView().getModel().updateBindings();
								}
							}
						});
				}
			} else {
				sap.m.MessageBox.warning("Please select atleast one item.");
			}*/
		},
		//adds control to enter new notes
		addNewNotes: function () {
			var that = this;
			this.editMilestoneFlag = false;
			if (!this.addMileStoneInfo) {
				this.addMileStoneInfo = sap.ui.xmlfragment("MDG.Program.fragment.addMileStoneInfo", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.addMileStoneInfo);
			}
			// var milestoneobj = {
			// 	"attributes/name": "",
			// 	"attributes/description": "",
			// 	"startDate_M": "",
			// 	"endDate_M": "",
			// 	"status": "Success",
			// 	// "nodes": [],
			// 	// "lanes": []
			// };
			this.addMileStoneInfo.getContent()[0].getContent()[1].setValue("");
			this.addMileStoneInfo.getContent()[0].getContent()[3].setValue("");

			var tokens = new JSONModel([]);
			this.addMileStoneInfo.getContent()[0].getContent()[5].setModel(tokens);
			// var mileStoneModelData = new sap.ui.model.json.JSONModel(milestoneobj);
			// this.addMileStoneInfo.setModel(mileStoneModelData);
			// this.addMileStoneInfo.getModel().updateBindings();
			this.addMileStoneInfo.open();

		},
		OnMileStoneEditPress: function (evt) {
			var that = this;
			this.editMilestoneFlag = true;
			if (!this.addMileStoneInfo) {
				this.addMileStoneInfo = sap.ui.xmlfragment("MDG.Program.fragment.addMileStoneInfo", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.addMileStoneInfo);
			}
			//MileStone object
			that.mileStone = evt.getSource().getBindingContext("mMileStoneModel").getObject();
			//var mileStone = this.getView().getModel().getData().attributes.m_milestones.data[milestoneTablePath];
			this.TaskArr = [];
			//checking if the milestone is linked with which MCSF details
			var tasksLinked = that.getView().getModel("mCsfDetails").getData();
			tasksLinked.forEach(function (item, index) {
				if (item.attributes.m_milestone.data === null) {

				} else {
					if (that.mileStone.id == item.attributes.m_milestone.data.id) {
						that.TaskArr.push(item);
					}
				}
			});
			for (var i = 0; i < that.TaskArr.length; i++) {
				this.addMileStoneInfo.getContent()[0].getContent()[5].addToken(new sap.m.Token({
					key: that.TaskArr[i].id,
					text: that.TaskArr[i].attributes.name
				}));
			}

			that.mileStone.nodes = that.TaskArr;
			that.mileStone.lanes = that.TaskArr;
			this.addMileStoneInfo.getContent()[0].getContent()[5].setModel(new JSONModel(that.mileStone.nodes));
			this.addMileStoneInfo.getContent()[0].getContent()[1].setValue(that.mileStone.attributes.name);
			this.addMileStoneInfo.getContent()[0].getContent()[3].setValue(that.mileStone.attributes.description);

			// var editObject = new sap.ui.model.json.JSONModel();
			// this.addMileStoneInfo.setModel(editObject, "newModelData");

			this.addMileStoneInfo.open();
		},
		onValueHelpRequest: function () {
			var that = this;
			if (!this.SelectTaskDialog) {
				this.SelectTaskDialog = sap.ui.xmlfragment("MDG.Program.fragment.SelectTaskDialog", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.SelectTaskDialog);
			}
			// if (this.TaskArr != undefined) {
			// 	var fragmentModel = new sap.ui.model.json.JSONModel(that.TaskArr);
			// 	this.SelectTaskDialog.setModel(fragmentModel);
			// } else {
			var taskTokenModel = new sap.ui.model.json.JSONModel(this.getView().getModel("mCsfDetails").getData());
			this.SelectTaskDialog.setModel(taskTokenModel);
			//	}
			// Get a reference to the SelectDialog control
			var oSelectDialog = sap.ui.getCore().byId("mySelectDialog");

			// Get the model and data that is bound to the SelectDialog control
			var oModel = oSelectDialog.getModel();
			var aData = oModel.getProperty("/");

			// Find the items that should be pre-selected (based on some criteria)
			var aSelectedItems = [];
			// Tokens model data
			var milestoneTokensData = this.addMileStoneInfo.getContent()[0].getContent()[5].getModel().getData();

			for (var p = 0; p < milestoneTokensData.length; p++) {
				for (var j = 0; j < aData.length; j++) {
					if (aData[j].attributes.name === milestoneTokensData[p].attributes.name) {
						aSelectedItems.push(oSelectDialog.getItems()[j]);
					}
				}
			}
			for (var m = 0; m < aSelectedItems.length; m++) {
				aSelectedItems[m].setSelected(true);
			}

			this.SelectTaskDialog.open();
		},
		onSelectTask: function (evt) {
			var that = this;
			var aContexts = evt.getParameter("selectedContexts");
			that.appObject = [];
			evt.getParameters().selectedContexts.forEach(function (obj, index) {
				var appPresent = false;
				if (that.appObject) {
					var access = that.appObject;
					var path = obj.getPath().split("/")[1];
					for (var i = 0; i < access.length; i++) {
						if (access[i].taskName == obj.getModel().getData()[path].attributes.name) {
							appPresent = true;
							break;
						}
					}
				}
				if (!appPresent)
					that.appObject.push(obj.getModel().getData()[path]);
			});
			this.addMileStoneInfo.getModel().getData()["nodes"] = this.appObject;
			this.addMileStoneInfo.getModel().getData()["lanes"] = this.appObject;
			this.addMileStoneInfo.getModel().updateBindings();
			this.addMileStoneInfo.getContent()[0].getContent()[5].getModel().setData(this.appObject);
			this.addMileStoneInfo.getContent()[0].getContent()[5].getModel().updateBindings();

		},
		comparingDates: function (dateList) {
			// Convert dates to Date objects and set the first date as the smallest date
			var smallestDate = new Date(dateList[0]);
			var longestDate = new Date(dateList[0]);

			// Loop through remaining dates and update smallestDate variable if current date is smaller
			for (var i = 1; i < dateList.length; i++) {
				var currentDate = new Date(dateList[i]);
				if (currentDate < smallestDate) {
					smallestDate = currentDate;
				} else if (currentDate > longestDate) {
					longestDate = currentDate;
				}
			}
			// var minDate = new Date(smallestDate);
			// var maxDate = new Date(longestDate);

			// Convert smallest and longest dates to ISO strings and extract yyyy-MM-dd portion
			var minDate = smallestDate.toISOString().slice(0, 10);
			var maxDate = longestDate.toISOString().slice(0, 10);

			// Create an object with smallestDate and longestDate properties
			var result = {
				smallestDate: minDate,
				longestDate: maxDate,
			};

			// Return the result object
			return result;

		},
		onAdd: function () {
			var that = this;
			// var nodeid = 0;
			// var lane_Position = 0;
			var err = this.ValidateMilestoneFragmentFields();
			if (err == 0) {
				if (!this.editMilestoneFlag) {
					var FragmentData = this.addMileStoneInfo.getModel().getData();
					var selTokensId = [];
					var mileStoneLength = this.getView().getModel("mMileStoneModel").getData();
					var milestoneTokens = this.addMileStoneInfo.getContent()[0].getContent()[5].getModel().getData();
					for (var h = 0; h < milestoneTokens.length; h++) {
						var tokenId = milestoneTokens[h].id;
						selTokensId.push(tokenId);
					}
					// //getting current data
					// var currentDate = new Date();
					// var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					// 	pattern: "yyyy-MM-dd"
					// });
					// var formattedDate = oDateFormat.format(currentDate);
					var selCsfDates = [];

					milestoneTokens.forEach(function (csfDates) {
						selCsfDates.push(csfDates.attributes.startDate);
						selCsfDates.push(csfDates.attributes.endDate);
					});

					var returnStartAndEndDate = that.comparingDates(selCsfDates);

					that.mileStoneObj = {
						"milestoneID": "MILE1000" + parseInt(mileStoneLength.length + 1),
						"name": this.addMileStoneInfo.getContent()[0].getContent()[1].getValue(),
						"description": this.addMileStoneInfo.getContent()[0].getContent()[3].getValue(),
						"status": "In-Progress",
						"m_csfs": selTokensId,
						"startDate": returnStartAndEndDate.smallestDate,
						"endDate": returnStartAndEndDate.longestDate,
						"m_program": [that.programObjectPath],
						"m_project": [that.projectObjectPath]
					};

					$.ajax({
						url: "/OptimalCog/api/m-milestones",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.mileStoneObj
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Created Something went wrong!");
							} else {
								MessageToast.show("Milestone Added successfully!");
								that.projectsDetails();
								that.getView().getModel().updateBindings();
								// this.getView().getModel("ProgramsModel").updateBindings();
								that.addMileStoneInfo.close();

							}
						}
					});

					// for (var i = 0; i < FragmentData.nodes.length; i++) {
					// 	nodeid++;
					// 	FragmentData.nodes[i].id = nodeid;
					// 	FragmentData.nodes[i].lane = lane_Position;
					// 	FragmentData.nodes[i].taskStatus = "In Progress";
					// 	FragmentData.status = "Warning";
					// 	if (nodeid == FragmentData.nodes.length) {
					// 		FragmentData.nodes[i].children = [];
					// 	} else {
					// 		FragmentData.nodes[i].children = [nodeid];
					// 	}

					// 	FragmentData.lanes[i].id = lane_Position;
					// 	FragmentData.lanes[i].position = lane_Position;
					// 	lane_Position++;
					// }
					// this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].milestones.push(
					// 	FragmentData);
					// var csf = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].csf;
					// for (var j = 0; j < FragmentData.nodes.length; j++) {

					// 	for (var k = 0; k < csf.length; k++) {
					// 		if ((csf[k].taskName == FragmentData.nodes[j].taskName)) {
					// 			csf[k].milestoneName = FragmentData.milestoneName;
					// 		}
					// 	}

					// }

					//Setting Milestone StartDate and End Date
					// if (FragmentData.nodes.length == 1) {
					// 	FragmentData.startDate_M = FragmentData.nodes[0].startDate.split("/").join("-");
					// 	FragmentData.endDate_M = FragmentData.nodes[0].endDate.split("/").join("-");
					// } else {
					// 	var dates = [];
					// 	var startDates;
					// 	var endDates;
					// 	for (var a = 0; a < FragmentData.nodes.length; a++) {
					// 		//To get Standared Date Format
					// 		if (FragmentData.nodes[a].startDate.includes("/")) {
					// 			startDates = FragmentData.nodes[a].startDate.split("/").reverse().join("-");
					// 		} else {
					// 			startDates = FragmentData.nodes[a].startDate.split("-").reverse().join("/");
					// 		}
					// 		dates.push(new Date(startDates));
					// 		if (FragmentData.nodes[a].endDate.includes("/")) {
					// 			endDates = FragmentData.nodes[a].endDate.split("/").reverse().join("-");
					// 		} else {
					// 			endDates = FragmentData.nodes[a].endDate.split("-").reverse().join("/");
					// 		}
					// 		dates.push(new Date(endDates));
					// 	}
					// 	var maxDate = (new Date(Math.max.apply(null, dates))).toLocaleDateString('pt-PT');
					// 	var minDate = (new Date(Math.min.apply(null, dates))).toLocaleDateString('pt-PT');
					// 	FragmentData.startDate_M = minDate.split("/").join("-");
					// 	FragmentData.endDate_M = maxDate.split("/").join("-");
					// }
				} else {
					var updateTokenId = [];
					var milestoneToken = this.addMileStoneInfo.getContent()[0].getContent()[5].getModel().getData();
					for (var e = 0; e < milestoneToken.length; e++) {
						var token_id = milestoneToken[e].id;
						updateTokenId.push(token_id);
					}
					var selCsfDat = [];

					milestoneToken.forEach(function (csfDates) {
						selCsfDat.push(csfDates.attributes.startDate);
						selCsfDat.push(csfDates.attributes.endDate);
					});

					var returnDates = that.comparingDates(selCsfDat);
					that.mileStoneObj = {
						"name": this.addMileStoneInfo.getContent()[0].getContent()[1].getValue(),
						"description": this.addMileStoneInfo.getContent()[0].getContent()[3].getValue(),
						"status": "In-Progress",
						"m_csfs": updateTokenId,
						"startDate": returnDates.smallestDate,
						"endDate": returnDates.longestDate
					};
					$.ajax({
						url: "/OptimalCog/api/m-milestones/" + that.mileStone.id,
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.mileStoneObj
						}),
						success: function (res) {
							var getValues = JSON.parse(res);
							console.log(getValues.error);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
							} else {
								MessageToast.show("Milestone Updated successfully!");
								that.projectsDetails();
								that.getView().getModel().updateBindings();
								// this.getView().getModel("ProgramsModel").updateBindings();
								that.addMileStoneInfo.close();

							}
						}
					});
				}
				// this.getView().getModel().updateBindings();
				// // this.getView().getModel("ProgramsModel").updateBindings();
				// this.addMileStoneInfo.close();

			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}
		},
		ValidateMilestoneFragmentFields: function () {
			var err = 0;
			if (this.addMileStoneInfo.getContent()[0].getContent()[1].getValue() == "" || this.addMileStoneInfo.getContent()[0].getContent()[
					1]
				.getValue() ==
				null) {
				err++;
			} else {

			}
			if (this.addMileStoneInfo.getContent()[0].getContent()[3].getValue() == "" || this.addMileStoneInfo.getContent()[0].getContent()[
					3]
				.getValue() ==
				null) {
				err++;
			} else {

			}
			if (this.addMileStoneInfo.getContent()[0].getContent()[5].getTokens().length == 0) {
				err++;
			} else {

			}

			return err;
		},
		onClear: function () {
			var that = this;
			this.addMileStoneInfo.getContent()[0].getContent()[1].setValue("");
			this.addMileStoneInfo.getContent()[0].getContent()[3].setValue("");
			// var milestoneobj = {
			// 	milestoneName: "",
			// 	milestonedes: "",
			// 	startDate_M: "",
			// 	endDate_M: "",
			// 	status: "Success"
			// };
			// var fragmentModel = new sap.ui.model.json.JSONModel(milestoneobj);
			// this.addMileStoneInfo.setModel(fragmentModel);
			this.addMileStoneInfo.close();

		},
		handleDeleteTask: function (evt) {
			var that = this;

			var SelItemlen = this.getView().byId("pagesAccessId").getSelectedItems();
			var tableItems = this.getView().byId("pagesAccessId").getItems();
			if (SelItemlen.length > 0) {
				var path = this.getView().byId("pagesAccessId").getSelectedContexts()[0].sPath.split("/")[6];
				MessageBox.confirm("Are you sure you want to delete task?", {
					title: "Confirm Deletion",
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {

						// if (oAction === "YES") {
						// 	var oModel = that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath];
						// 	var csf = oModel.csf;
						// 	var dleteArr = [];
						// 	var index = "";
						// 	for (var k = 0; k < csf.length; k++) {
						// 		for (var i = 0; i < SelItemlen; i++) {
						// 			if (csf[k].taskName == that.getView().byId("pagesAccessId").getSelectedContexts()[i].getObject().taskName) {
						// 				dleteArr.push(that.getView().byId("pagesAccessId").getSelectedContexts()[i].getObject());
						// 			}
						// 		}
						// 	}
						// 	for (var l = 0; l < dleteArr.length; l++) {
						// 		csf.forEach(function (item, index) {
						// 			if (item.taskName == dleteArr[l].taskName) {
						// 				csf.splice(index, 1);
						// 			}
						// 		});
						// 	}
						// 	that.byId("pagesAccessId").removeSelections(true);
						// 	that.getView().getModel().updateBindings();
						// 	MessageToast.show("Task Deleted sucessfully");
						// }
						if (oAction === "YES") {
							var mmCSFtaskDetails = that.getView().getModel().getData();
							for (var i = SelItemlen.length - 1; i >= 0; i--) {
								//var personData = selectedItemsData[c].getBindingContext("projectTeam").getObject();
								var taskDataIndex = parseInt(SelItemlen[i].getBindingContext("mCsfDetails").getPath().split("/")[1]);
								mmCSFtaskDetails.attributes.m_csfs.data.splice(taskDataIndex, 1);
							}
							that.getView().getModel().updateBindings();
							that.getView().getModel().refresh(true);
							var updateProjectTeam = mmCSFtaskDetails.attributes.m_csfs.data;

							var teamArray = [];

							updateProjectTeam.map(function (item) {
								teamArray.push(item.id);
							});
							if (teamArray.length === 0) {
								teamArray = [];
							}
							that.updateTaskData = {
								"m_csfs": teamArray
							};
							$.ajax({
								url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.updateTaskData
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									console.log(getValues.error);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
									} else {
										MessageToast.show("Deleted Successfully!");
										that.projectsDetails();
										that.getView().getModel().updateBindings();
										that.getView().getModel().refresh();
									}
								}
							});
						}
					}
				});
			} else {
				sap.m.MessageBox.warning("Please select atleast one item.");
			}
		},
		handleDeleteTask3: function (evt) {
			var that = this;

			var SelItemlen = this.getView().byId("pagesAccessId3").getSelectedItems();
			var tableItems = this.getView().byId("pagesAccessId3").getItems();
			if (SelItemlen.length > 0) {
				var path = this.getView().byId("pagesAccessId3").getSelectedContexts()[0].sPath.split("/")[6];
				MessageBox.confirm("Are you sure you want to delete?", {
					title: "Confirm Deletion",
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction === "YES") {
							var mmMainProjectModel = that.getView().getModel().getData();
							for (var i = SelItemlen.length - 1; i >= 0; i--) {
								var taskDataIndex = parseInt(SelItemlen[i].getBindingContext("mDeliverableModel").getPath().split("/")[1]);
								mmMainProjectModel.attributes.m_deliverables.data.splice(taskDataIndex, 1);
							}

							that.getView().getModel().updateBindings();
							that.getView().getModel().refresh(true);
							var updateDeliverableData = mmMainProjectModel.attributes.m_deliverables.data;

							var deliverableArray = [];

							updateDeliverableData.map(function (item) {
								deliverableArray.push(item.id);
							});
							if (deliverableArray.length === 0) {
								deliverableArray = [];
							}
							that.updateDeliverData = {
								"m_deliverables": deliverableArray
							};
							$.ajax({
								url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.updateDeliverData
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									console.log(getValues.error);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
									} else {
										MessageToast.show("Deleted Successfully!");
										that.projectsDetails();
										that.getView().getModel().updateBindings();
										that.getView().getModel().refresh();
									}
								}
							});
						}
					}
				});
			} else {
				sap.m.MessageBox.warning("Please select atleast one item.");
			}
		},

		OnToggleDeletePress: function () {
			var that = this;
			if (!this.getView().byId("Processflow").getContent()[3].getVisible()) {
				this.getView().byId("Processflow").getContent()[3].setVisible(true);
				this.getView().byId("Processflow").getContent()[1].setVisible(false);
				this.getView().byId("Processflow").getContent()[2].setVisible(false);
			} else {
				this.getView().byId("Processflow").getContent()[3].setVisible(false);
				this.getView().byId("Processflow").getContent()[1].setVisible(true);
				this.getView().byId("Processflow").getContent()[2].setVisible(false);
			}
		},
		allMileStoneData: function (milestoneId) {
			return new Promise(function (resolve, reject) {
				$.ajax({
					url: "/OptimalCog/api/m-milestones?populate=*",
					type: "GET",
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							// If there was an error, reject the promise with the error message
							reject(getValues.error.message + " Something went wrong!");
						} else {
							var selMileStoneData = null;
							for (var k = 0; k < getValues.data.length; k++) {
								if (getValues.data[k].id === milestoneId) {
									// If the milestone is found, set the result and resolve the promise
									selMileStoneData = getValues.data[k];
									break;
								}
							}
							if (selMileStoneData) {
								resolve(selMileStoneData);
							} else {
								// If the milestone is not found, reject the promise with an error message
								reject("Milestone not found");
							}
						}
					},
					error: function (xhr, status, error) {
						// If there was an error during the request, reject the promise with the error message
						reject(error);
					}
				});
			});
		},
		processFlowData: function (selcsfsData) {
			var that = this;
			if (selcsfsData.length !== 0) {
				for (var h = 0; h < selcsfsData.length; h++) {
					var CsfsDetails = selcsfsData[h];
					var nodes = {
						"id": CsfsDetails.id,
						"lane": h,
						"title": CsfsDetails.attributes.name,
						"titleAbbreviation": CsfsDetails.attributes.m_milestone.data.attributes.name,
						"children": [],
						//	"state": "Positive",
						"stateText": CsfsDetails.attributes.m_deliverable.data === null ? "" : CsfsDetails.attributes.m_deliverable.data.attributes.status,
						"focused": true,
						"highlighted": false,
						"texts": ["Start Date: " + CsfsDetails.attributes.startDate, "End Date: " + CsfsDetails.attributes.endDate],
						"assignedTeamMember": CsfsDetails.attributes.users_permissions_user.data === null ? "" : CsfsDetails.attributes.users_permissions_user
							.data.attributes.firstName + " " + CsfsDetails.attributes.users_permissions_user.data.attributes.lastName,
						"assignedTo": CsfsDetails.attributes.m_vendor.data === null ? "" : CsfsDetails.attributes.m_vendor.data.attributes.vendorName
					};
					if (h !== 0) {
						that.getView().getModel("mMileStoneModel").getData().nodes[h - 1].children.push(selcsfsData[h].id);
					}
					for (var key in nodes) {
						if (typeof nodes[key] !== "string" && !Array.isArray(nodes[key]) && typeof nodes[key] !== "boolean" && nodes[key] !==
							undefined) {
							nodes[key] = nodes[key].toString();
						}
					}
					var lanesData = {
						"id": h,
						"icon": CsfsDetails.attributes.m_deliverable.data === null ? "" : CsfsDetails.attributes.m_deliverable.data.attributes.status,
						"label": CsfsDetails.attributes.m_deliverable.data === null ? "" : CsfsDetails.attributes.m_deliverable.data.attributes.status,
						"position": h
					};
					for (var Lkey in lanesData) {
						if (typeof lanesData[Lkey] !== "string" && lanesData[Lkey] !== undefined) {
							if (Lkey !== "position") {
								lanesData[Lkey] = lanesData[Lkey].toString();
							}
						}
					}
					// that.getView().getModel("mMileStoneModel").getData().nodes.assignedTeamMember = dataOfMileStone.attributes.name;
					that.getView().getModel("mMileStoneModel").getData().nodes.push(nodes);
					that.getView().getModel("mMileStoneModel").getData().lanes.push(lanesData);
				}
			}
		},
		ToggleProcessflowView: function (evt) {
			this.getView().byId("processflow").setZoomLevel("One");
			var that = this;
			if (this.getView().byId("chartContainer").getFullScreen()) {
				window.history.go(-1);
			}
			if (evt.getParameters().selectedItem) {
				var sPath = parseInt(evt.getParameters().selectedItem.getBindingContext("mMileStoneModel").getPath().split("/")[1]);
				that.objectOfMileStone = evt.getParameters().selectedItem.getBindingContext("mMileStoneModel").getObject();
				// var SelMileStonemodel = that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].milestones[
				// 	sPath];
				this.allMileStoneData(that.objectOfMileStone.id)
					.then(function (dataOfMileStone) {
						var mileStonesData = dataOfMileStone;
						var selcsfsData = [];
						var csfsData = that.getView().getModel("mCsfDetails").getData();
						csfsData.forEach(function (matchCsfs) {
							mileStonesData.attributes.m_csfs.data.forEach(function (nestedArray) {
								if (nestedArray.id === matchCsfs.id) {
									selcsfsData.push(matchCsfs);
								}
							});
						});
						that.getView().getModel("mMileStoneModel").getData().nodes = [];
						that.getView().getModel("mMileStoneModel").getData().lanes = [];
						//setting the data
						that.processFlowData(selcsfsData);

						// this.getView().getModel("processFlowModel").getData().lanes = SelMileStonemodel.lanes;
						// this.getView().getModel(
						// 	"processFlowModel").getData().nodes = SelMileStonemodel.nodes;
						that.getView().getModel("mMileStoneModel").updateBindings();

						if (!that.getView().byId("Processflow").getContent()[2].getVisible()) {
							that.getView().byId("Processflow").getContent()[1].setVisible(false);
							that.getView().byId("Processflow").getContent()[2].setVisible(true);
						} else {
							that.getView().byId("Processflow").getContent()[1].setVisible(true);
							that.getView().byId("Processflow").getContent()[2].setVisible(false);
						}
					})
					.catch(function (err) {
						var error = "An error occurred: " + err.message;
						console.error(error);
					});
			}
		},
		onIconTabSel: function (evt) {
			var that = this;
			if (evt.getParameters().selectedKey == "IconTabBarMileStone") {
				this.getView().byId("Processflow").getContent()[1].setVisible(true);
				this.getView().byId("Processflow").getContent()[2].setVisible(false);

			}

		},
		handleDocumentUpload: function () {
			if (!this.AddDocumentFragment) {
				this.AddDocumentFragment = sap.ui.xmlfragment("MDG.Program.fragment.customerDocument", this);
				this.AddDocumentFragment.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
				this.getView().addDependent(this.AddDocumentFragment);
			}
			var csf = new JSONModel(this.getView().getModel().getData().attributes.m_csfs.data);
			this.AddDocumentFragment.getContent()[0].getContent()[3].setModel(csf);
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
			this.AddDocumentFragment.getContent()[0].getContent()[4].setModel(categoryTypeModel);
			this.AddDocumentFragment.open();
			//         this.getOwnerComponent().getModel("appsModel").updateBindings();
		},
		handleDocumentCreate: function () {
			if (!this.createDocumentFragment) {
				this.createDocumentFragment = sap.ui.xmlfragment("MDG.Program.fragment.createDocument", this);
				this.createDocumentFragment.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.createDocumentFragment);
			}
			var oModel = this.getView().getModel("mFormType").getData();
			this.createDocumentFragment.setModel(new sap.ui.model.json.JSONModel(oModel));
			this.createDocumentFragment.open();
		},
		handleCreateDocCancelPress: function () {
			this.createDocumentFragment.close();
		},
		collectFileData: function (oEvent) {
			// this.uploadFile = oEvent.getParameter("files");
			// this.fileData = {
			// 	fileName: this.uploadFile[0].name,
			// 	mediaType: this.uploadFile[0].type,
			// 	url: "",
			// 	keyword: "",
			// 	shortDescription: "",
			// 	LinkedTask: "",
			// 	Category: ""
			// };
			var that = this;
			this.file = oEvent.getParameters().files[0];
			that.fileData = {
				name: this.file.name,
				type: this.file.type,
				url: "",
				keyword: "",
				LinkedTask: "",
				shortDescription: "",
				Category: ""
			};
		},
		onSearch: function (oEvent) {
			var value = oEvent.getParameter("newValue");
			var afilter = [];
			if (value !== "") {
				var sfilter = new sap.ui.model.Filter("attributes/name", sap.ui.model.FilterOperator.Contains, value);
				afilter.push(sfilter);

				var objects = this.getView().byId("updloadSetID").getBinding("items");
				objects.filter(afilter);
			} else {
				// If the search value is empty, remove any existing filter
				this.getView().byId("updloadSetID").getBinding("items").filter([]);
			}
		},
		handleAddDocumentOkPress: function () {
			var that = this;
			that.fileName = this.AddDocumentFragment.getContent()[0].getContent()[0].getValue();
			that.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].getValue();
			that.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[2].getValue();
			that.LinkedTask = this.AddDocumentFragment.getContent()[0].getContent()[3].getSelectedKey();
			that.Category = this.AddDocumentFragment.getContent()[0].getContent()[4].getSelectedKey();

			var newForm = new FormData();
			newForm.append("files", that.file);
			that.AddDocumentFragment.setBusy(true);
			$.ajax({
				url: "/OPTIMALCog_UploadFile/api/upload",
				type: "POST",
				processData: false,
				contentType: false,
				mimeType: "multipart/form-data",
				data: newForm,

				success: function (res) {
					that.imageID = JSON.parse(res)[0].id;
					var obj = {
						data: {
							name: that.fileName,
							type: that.Category,
							description: that.shortDescription,
							keywords: that.keyword,
							m_project: [that.projectObjectPath],
							file: [that.imageID],
							m_csf: [that.LinkedTask]
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
								// that.getView().getModel().getData().attributes.m_documents.data.push(res.data);
								that.mDocuments();
								// console.log("File uploaded successfully");
								//	this.handleDocclosePress();
								MessageToast.show("Document added succesfuly.");
								that.getView().getModel().updateBindings();
								that.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
								that.AddDocumentFragment.getContent()[0].getContent()[1].setValue("");
								that.AddDocumentFragment.getContent()[0].getContent()[2].setValue("");
								that.AddDocumentFragment.close();
							}
						},
					});
				},
				error: function (res) {
					MessageBox.error(JSON.parse(res.responseText).error.message);
					that.AddDocumentFragment.setBusy(false);
				},
			});
		},
		afterItemRemoved: function (evt) {
			var that = this;
			debugger
			evt.getParameters().item.destroy();
			var selectedItem = evt.getParameters().item.getBindingContext("mDocuments").getObject();
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
						that.mDocuments();
					}
				},
				error: function (res) {
					MessageBox.error(res);
				},
			});
		},
		OnTaskLinkedChange: function (evt) {
			var that = this;
			var taskName = evt.getSource().getSelectedKey();
			this.fileData.LinkedTask = taskName;

		},
		handleDocclosePress: function () {
			this.AddDocumentFragment.close();
			this.clearDocfragment();
		},
		clearDocfragment: function () {
			//	this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
			this.fileData.keyword = this.AddDocumentFragment.getContent()[0].getContent()[1].setValue("");
			this.fileData.shortDescription = this.AddDocumentFragment.getContent()[0].getContent()[2].setValue("");
			this.fileData.fileName = this.AddDocumentFragment.getContent()[0].getContent()[0].setValue("");
		},
		deleteMileStone: function (evt) {
			var that = this;
			var deleteObj = evt.getSource().getBindingContext("mMileStoneModel").getObject().id;

			$.ajax({
				type: "DELETE",
				url: "/OptimalCog/api/m-milestones/" + deleteObj,
				success: function (response) {
					var resValue = JSON.parse(response);
					console.log(resValue.error);
					if (resValue.error) {
						MessageBox.error(resValue.error.message);
					} else {
						MessageToast.show("Program Deleted sucessfully");
						that.getView().getModel("mMileStoneModel").updateBindings();
						that.projectsDetails();
						that.getView().getModel().updateBindings();
					}
				}
			});

			// that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].milestones.forEach(
			// 	function (
			// 		item, index) {
			// 		if (deleteObj.milestoneName == item.milestoneName) {

			// 			that.getView().getModel().getData().programs[that.programObjectPath].Projects[that.projectObjectPath].milestones.splice(
			// 				index,
			// 				1);
			// 			that.getView().getModel().updateBindings();

			// 		}
			// 	});
		},
		deletecustomer: function (oEvent) {
			var that = this;
			//	var itemPresent = false;
			var selecetedCustPath = this.getView().byId("CustomersTable").getSelectedItems();
			if (selecetedCustPath.length > 0) {
				//	var path = this.getView().byId("CustomersTable").getSelectedContexts()[0].sPath.split("/")[6];
				MessageBox.confirm("Are you sure you want to delete customer?", {
					title: "Confirm Deletion",
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {

						if (oAction === "YES") {
							var customerData = [];
							for (var i = selecetedCustPath.length - 1; i >= 0; i--) {
								var getPath = parseInt(selecetedCustPath[i].getBindingContext().getPath().split("/")[4]);
								var modelData = that.getView().getModel().getData().attributes.m_customers.data;
								modelData.splice(getPath, 1);
								that.getView().getModel().updateBindings();
								that.getView().getModel().refresh();
							}
							var remainingData = that.getView().getModel().getData().attributes.m_customers.data;
							if (remainingData.length !== 0) {
								remainingData.forEach(function (itemids) {
									customerData.push(itemids.id);
								});
							} else {
								customerData = [];
							}

							that.updateCustomersData = {
								"m_customers": customerData
							};
							$.ajax({
								url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.updateCustomersData
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									console.log(getValues.error);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
									} else {
										MessageToast.show("Customer Deleted Successfully!");
										//that.updateModel();
										//	this.getView().getModel("ProgramsModel").updateBindings();
										that.projectsDetails();
										that.getView().getModel().updateBindings();
										that.getView().getModel().refresh();
										//	that.handleClose();
									}
								}
							});
						}
					}
				});
			} else {
				MessageToast.show("Please select atleast one item.");
			}
		},
		deleteVendors: function (evt) {
			var that = this;
			var selectedvendorPath = this.getView().byId("vendorTable").getSelectedItems();
			if (selectedvendorPath.length > 0) {
				//	var path = this.getView().byId("CustomersTable").getSelectedContexts()[0].sPath.split("/")[6];
				MessageBox.confirm("Are you sure you want to delete vendor?", {
					title: "Confirm Deletion",
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {

						if (oAction === "YES") {
							// var vendorData = [];
							// for (var i = 0; i < selectedvendorPath.length; i++) {
							// 	var getPath = parseInt(selectedvendorPath[i].getBindingContext().getPath().split("/")[4]);
							// 	var vendorModelData = that.getView().getModel().getData().attributes.m_vendors.data;
							// 	vendorModelData.splice(getPath, 1);

							// 	that.getView().getModel().updateBindings();
							// 	that.getView().getModel().refresh();
							// }
							var vendorData = [];
							var vendorModelData = that.getView().getModel().getData().attributes.m_vendors.data;

							for (var i = selectedvendorPath.length - 1; i >= 0; i--) {
								var getPath = parseInt(selectedvendorPath[i].getBindingContext().getPath().split("/")[4]);
								vendorModelData.splice(getPath, 1);
							}

							that.getView().getModel().updateBindings();
							that.getView().getModel().refresh();

							var remainingData = that.getView().getModel().getData().attributes.m_vendors.data;
							if (remainingData.length !== 0) {
								remainingData.forEach(function (itemids) {
									vendorData.push(itemids.id);
								});
							} else {
								vendorData = [];
							}
							that.deleteVendorData = {
								"m_vendors": vendorData
							};
							$.ajax({
								url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.deleteVendorData
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									console.log(getValues.error);
									if (getValues.error) {
										MessageBox.error(getValues.error.message);
									} else {
										MessageToast.show("Vendor Deleted Successfully!");
										//that.updateModel();
										//	this.getView().getModel("ProgramsModel").updateBindings();
										that.projectsDetails();
										that.getView().getModel().updateBindings();
										that.getView().getModel().refresh();
										//	that.handleClose();
									}
								}
							});
						}
					}
				});
			} else {
				MessageToast.show("Please select atleast one item.");
			}
			// var selectedContexts = this.getView().byId("vendorTable").getSelectedContexts();
			// if (selectedContexts.length > 0) {
			// 	var selectedItemsData = this.getView().byId("vendorTable").getSelectedItems();
			// 	// var selectedContexts = "0";
			// 	var TaskPresentForSelectedItems = false,
			// 		tasksDeletionArr = [];
			// 	var tasks = this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].csf; //this.getView().getModel().getData()[this.path].csf;
			// 	for (var k = 0; k < tasks.length; k++) {
			// 		for (var c = 0; c < selectedItemsData.length; c++) {
			// 			if (tasks[k].assignedTo == selectedItemsData[c].getCells()[0].getText()) {
			// 				TaskPresentForSelectedItems = true;
			// 				tasksDeletionArr.push(k);
			// 			}
			// 		}
			// 	}
			// 	if (!TaskPresentForSelectedItems) {
			// 		for (var t = selectedContexts.length - 1; t >= 0; t--) {
			// 			this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].assignedVendors.splice(
			// 				selectedContexts[t].sPath.split('/assignedVendors/')[1], 1);
			// 			try {
			// 				this.getView().byId("vendorTable").getItems()[selectedContexts[t].sPath.split('/assignedVendors/')[1]].setSelected(false);
			// 			} catch (e) {}
			// 		}
			// 		this.getView().getModel().updateBindings();
			// 	} else {
			// 		sap.m.MessageBox.warning(
			// 			//	"Selected Vendors are assigned to some tasks, this will delete the assigned tasks the deleted vendors. Are you sure you want to delete the vendors", {
			// 			"Selected Vendors assigned to some tasks, Unable to delete", {

			// 				onClose: function (oEvent) {
			// 					if (oEvent == "OK") {
			// 						// for (var t = selectedContexts.length - 1; t >= 0; t--) {
			// 						// 	that.getView().getModel().getData()[that.path].assignedVendors.splice(
			// 						// 		selectedContexts[t].sPath.split('/assignedVendors/')[1], 1);
			// 						// 	try {
			// 						// 		that.getView().byId("vendorTable").getItems()[selectedContexts[t].sPath.split('/assignedVendors/')[1]].setSelected(false);
			// 						// 	} catch (e) {}
			// 						// }
			// 						// for (var x = 0; x < tasksDeletionArr.length; x++) {
			// 						// 	that.getView().getModel().getData()[that.path].csf.splice(tasksDeletionArr[x], 1);
			// 						// }
			// 						// that.getView().getModel().updateBindings();
			// 					}
			// 				}
			// 			});
			// 	}
			// } else {
			// 	sap.m.MessageBox.warning("Please select atleast one item.");
			// }
		},
		ValidateEditAddProjectFragment: function () {
			var Err = 0;
			if (this.EditProject.getContent()[0].getContent()[2].getValue() == "" || this.EditProject.getContent()[0].getContent()[2].getValue() ==
				null) {
				Err++;
				//	this.EditProject.getContent()[0].getContent()[2].setValueState("Error");
			} else {
				//	this.EditProject.getContent()[0].getContent()[2].setValueState("None");
			}

			if (this.EditProject.getContent()[0].getContent()[4].getValue() == "" || this.EditProject.getContent()[0].getContent()[4].getValue() ==
				null) {
				Err++;
				//	this.EditProject.getContent()[0].getContent()[4].setValueState("Error");
			} else {
				//	this.EditProject.getContent()[0].getContent()[4].setValueState("None");
			}

			if (this.EditProject.getContent()[0].getContent()[6].getValue() == "" || this.EditProject.getContent()[0].getContent()[6].getValue() ==
				null) {
				Err++;
				//	this.EditProject.getContent()[0].getContent()[6].setValueState("Error");
			} else {
				//	this.EditProject.getContent()[0].getContent()[6].setValueState("None");
			}

			if (this.EditProject.getContent()[0].getContent()[8].getValue() == "" || this.EditProject.getContent()[0].getContent()[8].getValue() ==
				null) {
				Err++;
				//	this.EditProject.getContent()[0].getContent()[8].setValueState("Error");
			} else {
				//	this.EditProject.getContent()[0].getContent()[8].setValueState("None");
			}
			// if (this.EditProject.getContent()[0].getContent()[11].getTokens().length == 0) {
			// 	Err++;
			// 	//	(this.EditProject.getContent()[0].getContent()[11].setValueState("Error");
			// } else {
			// 	//	(this.EditProject.getContent()[0].getContent()[11].setValueState("None");
			// }
			// if (this.EditProject.getContent()[0].getContent()[14].getTokens().length == 0) {
			// 	Err++;
			// 	//	this.EditProject.getContent()[0].getContent()[14].setValueState("Error");
			// } else {
			// 	//	this.EditProject.getContent()[0].getContent()[14].setValueState("None");
			// }

			return Err;
		},
		openArchiveProgram: function (evt) {
			this.onHandleValueUpdates("Archived");
			// var that = this;
			// this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].status = "Archived";
			// this.getView().getModel("appView").getData().detailthis.getView().getModel("ProgramsModel").getData().Projects[this.projectObjectPath]
			// 	.status = "Archived";
			// this.getView().getModel().updateBindings();
			// this.getView().getModel("appView").getData().detailthis.getView().getModel("ProgramsModel").updateBindings()
			// this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// // oRouter.navTo("detailList", {
			// // 	objectId: this.programObjectPath
			// // });
			// this.onCloseDetailPress();
		},
		openCancelProgram: function (evt) {
			this.onHandleValueUpdates("Cancelled");
			// var that = this;
			// this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].status = "Cancelled";
			// this.getView().getModel().updateBindings();
			// this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.navTo("detailList", {
			// 	objectId: this.programObjectPath
			// });
		},
		openRetriveProgram: function (evt) {
			this.onHandleValueUpdates("In-Progress");
			// var that = this;
			// if (this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].status == "Archived") {
			// 	this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].status = "In Progress";
			// 	this.getView().getModel("appView").getData().detailthis.getView().getModel("ProgramsModel").getData().Projects[this.projectObjectPath]
			// 		.status = "In Progress";
			// } else {
			// 	this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].status = "In Progress";
			// 	this.getView().getModel("appView").getData().detailthis.getView().getModel("ProgramsModel").getData().Projects[this.projectObjectPath]
			// 		.status = "In Progress";

			// }
			// this.getView().getModel().updateBindings();
			// this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// // oRouter.navTo("detailList", {
			// // 	objectId: this.programObjectPath
			// // });
			// this.getView().getModel("appView").getData().detailthis.getView().getModel("ProgramsModel").updateBindings();
			// this.onCloseDetailPress();
		},
		onHandleValueUpdates: function (statusValue) {
			var that = this;
			//var modelData = this.getView().getModel().getData().attributes;
			var modelDataArchive = {
				"status": statusValue
			};
			$.ajax({
				url: "/OptimalCog/api/m-projects/" + that.projectObjectPath,
				type: "PUT",
				data: {
					"data": modelDataArchive
				},
				success: function (res) {
					var getValues = JSON.parse(res);
					console.log(getValues.error);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
					} else {
						that.getView().getModel().updateBindings();
						that.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("detailList", {
							objectId: that.programObjectPath
						});

					}
				}
			});
		},
		teamMemRoles: function () {
			var roles = this.getOwnerComponent().getModel("roles").getData();
			var reqRoles = [];
			for (var i = 0; i < roles.length; i++) {
				if (roles[i].roleType !== "Solution Role") {
					reqRoles.push(roles[i]);
				}
			}
			var updatedRoles = new JSONModel(reqRoles);
			this.getView().setModel(updatedRoles, "rolesModel");

		},
		onTeamMemberItemPress: function (oEvent) {

			if (!this.TeamMemberDetails) {
				this.TeamMemberDetails = sap.ui.xmlfragment("MDG.Program.fragment.TeamMemberDetails", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.TeamMemberDetails);
			}
			var teamMember = parseInt(oEvent.getSource().getBindingContextPath().split("/")[1]);

			var getProjectmodel = this.getView().getModel("projectTeam").getData()[teamMember];
			var usersDeta = this.getView().getModel("usersDetails").getData();
			var programeModel = this.getView().getModel().getData();
			var userInfo = [];
			usersDeta.forEach(function (getItem) {
				if (getItem.id === getProjectmodel.attributes.users_permissions_user.data.id) {
					userInfo.push(getItem);
				}
			});
			for (var prop in userInfo[0]) {
				var value = userInfo[0][prop];
				if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
					userInfo[0][prop] = "--";
				}
			}
			var teamProjectDetail = getProjectmodel.attributes.users_permissions_user.data.attributes;
			var extraInfo = {
				contact: teamProjectDetail.phone,
				email: teamProjectDetail.email,
				firstName: teamProjectDetail.firstName,
				lastname: teamProjectDetail.lastName,
				//role: userInfo[0].mrole == "--" ? userInfo[0].mrole : userInfo[0].mrole.roleName,
				role: getProjectmodel.attributes.mroles.data[0].attributes.roleName,
				orgName: userInfo[0].m_organisation.name,
				location: teamProjectDetail.country,
				customer: userInfo[0].m_customer == "--" ? userInfo[0].m_customer : userInfo[0].m_customer.customerName,
				vendor: userInfo[0].m_vendor == "--" ? userInfo[0].m_vendor : userInfo[0].m_vendor.vendorName,
				ProgramsName: programeModel.attributes.m_program.data.attributes.name,
				Description: programeModel.attributes.m_program.data.attributes.description,
				startdate: programeModel.attributes.m_program.data.attributes.startDate,
				enddate: programeModel.attributes.m_program.data.attributes.endDate,
			};
			// extraInfo.push(teamMember);
			var teamInfo = new sap.ui.model.json.JSONModel(extraInfo);
			this.TeamMemberDetails.setModel(teamInfo);
			this.TeamMemberDetails.open();
		},
		handleTeamDetailCancel: function () {
			this.TeamMemberDetails.close();
		},

		onSearchForms: function (oEvent) {
			var value = oEvent.getParameter("newValue");
			var afilter = [];
			if (value !== "") {
				var sfilter = new sap.ui.model.Filter("attributes/name", sap.ui.model.FilterOperator.Contains, value);
				afilter.push(sfilter);

				var objects = oEvent.getSource().getParent().getParent().getBinding("items");
				objects.filter(afilter);
			} else {
				// If the search value is empty, remove any existing filter
				oEvent.getSource().getParent().getParent().getBinding("items").filter([]);
			}
		},
		handleOpenFormList: function () {
			var that = this;
			if (!this.formsListFragment) {

				this.formsListFragment = sap.ui.xmlfragment("MDG.Program.fragment.FormsList", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.formsListFragment);
			}
			var SelFormType = this.createDocumentFragment.getContent()[0].getContent()[1].getSelectedKey();
			$.ajax({
				url: "/OptimalCog/api/m-doc-templates?populate=*&filters[status][$eq]=Published&filters[m_form_type][id][$contains]=" +
					SelFormType,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					debugger
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.formsListFragment.setModel(cModel);
					that.formsListFragment.open();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wrong");
				}
			});

		},
		handleCancelPress: function () {
			this.formsListFragment.close();
		},
		onFormItemChange: function (oEvent) {
			var selItemPath = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
			var selProjectandProgramDetails = this.getView().getModel().getData();
			this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({
				"formTemDetails": selItemPath,
				"ProgramDetails": selProjectandProgramDetails
			}), "formTemplateData")
			this.getView().getModel("appView").setProperty("/layout", "EndColumnFullScreen");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("FormsEntry", {
				itemPath: selItemPath.id,
				programObjectPath: this.programObjectPath,
				projectObjectPath: this.projectObjectPath
			});
		},
		onPostComment: function (oEvent) {
			var that = this;
			var sValue = oEvent.getParameter("value");
			var user = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			that.commentPayload = {
				"comment": sValue,
				"m_project": [that.projectObjectPath],
				"users_permissions_user": [user]
			};
			$.ajax({
				url: "/OptimalCog/api/m-comments",
				type: "POST",
				data: {
					"data": that.commentPayload
				},
				success: function (res) {
					var getValues = JSON.parse(res);
					console.log(getValues.error);
					if (getValues.error) {
						MessageBox.error(getValues.error.message);
					} else {
						MessageToast.show("comment Added");
						that.mComments();
						that.getView().getModel("userProjectComments").refresh();
					}
				}
			});
			// var oFormat = DateFormat.getDateTimeInstance({
			// 	style: "medium"
			// });
			// var oDate = new Date();
			// var sDate = oFormat.format(oDate);
			// // create new entry
			// var sValue = oEvent.getParameter("value");
			// var oEntry = {
			// 	userName: this.getOwnerComponent().getModel("loggedOnUserModel").getData().firstName,
			// 	date: "" + sDate,
			// 	text: sValue
			// };

			// // update model
			// this.getView().getModel().getData().programs[this.programObjectPath].Projects[this.projectObjectPath].comments.unshift(oEntry);
			// this.getView().getModel().updateBindings();
		},
		handleDateValidation: function (evt) {
			var that = this;
			var users = this.getView().getModel("loggedOnUserModel").getData();
			var startDate = this.addDeliver.getContent()[0].getContent()[10].getValue();
			var endDate = this.addDeliver.getContent()[0].getContent()[12].getValue();
			// var selectedKey = this.addDeliver.getContent()[0].getContent()[18].getSelectedKey();
			// for (var m = 0; m < users.length; m++) {
			// 	if (users[m].firstName == selectedKey) {
			// 		var selectedUserObj = users[m];
			// 		break;
			// 	}
			// }
			if (startDate && endDate) {
				// var USM = users[m].startDate.split("/")[1],
				// 	USD = users[m].startDate.split("/")[0],
				// 	USY = users[m].startDate.split("/")[2],
				// 	UEM = users[m].endDate.split("/")[1],
				// 	UED = users[m].endDate.split("/")[0],
				// 	UEY = users[m].endDate.split("/")[2];
				// if ((new Date(startDate) >= new Date(USY, USM, USD) && (users[m].endDate == '31/12/9999' ||
				// 		(new Date(endDate) <= new Date(UEY, UEM, UED))))) {
				if ((new Date(startDate) >= new Date(users.serviceStartDate)) && (new Date(endDate) <= new Date(users.serviceEndDate))) {
					this.addDeliver.getContent()[0].getContent()[10].setValueState("None");
					this.addDeliver.getContent()[0].getContent()[12].setValueState("None");
				} else {
					this.addDeliver.getContent()[0].getContent()[10].setValueState("Error");
					this.addDeliver.getContent()[0].getContent()[12].setValueState("Error");
					sap.m.MessageToast.show(
						"The start date and end date entered will not be between the service start date and end date of the user");
				}
			}
		},
		handleCSFDate: function (evt) {
			var that = this;
			var users = this.getView().getModel("loggedOnUserModel").getData();
			var startDate = this.AddTask.getContent()[0].getContent()[8].getValue();
			var endDate = this.AddTask.getContent()[0].getContent()[10].getValue();
			//	var selectedKey = this.AddTask.getContent()[0].getContent()[16].getSelectedKey();
			// for (var m = 0; m < users.length; m++) {
			// 	if (users[m].firstName == selectedKey) {
			// 		var selectedUserObj = users[m];
			// 		break;
			// 	}
			// }
			if (!users.serviceEndDate) {
				if (startDate && endDate) {
					if ((new Date(startDate) >= new Date(users.serviceStartDate)) && (new Date(endDate) <= new Date(users.serviceEndDate))) {
						this.AddTask.getContent()[0].getContent()[8].setValueState("None");
						this.AddTask.getContent()[0].getContent()[10].setValueState("None");
					} else {
						this.AddTask.getContent()[0].getContent()[8].setValueState("Error");
						this.AddTask.getContent()[0].getContent()[10].setValueState("Error");
						sap.m.MessageToast.show(
							"The start date and end date entered will not be between the service start date and end date of the user");
					}
				}
			}
		}

	});

});