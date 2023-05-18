sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"MDG/Program/util/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/ui/unified/DateTypeRange",
	'sap/ui/model/Sorter',
	"sap/ui/core/format/DateFormat"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, formatter, JSONModel, CoreLibrary, UnifiedLibrary,
	DateTypeRange, Sorter, DateFormat) {
	"use strict";
	//var CalendarDayType = UnifiedLibrary.CalendarDayType,
	//ValueState = CoreLibrary.ValueState;
	return Controller.extend("MDG.Program.controller.detailList", {
		formatter: formatter,
		onInit: function () {
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			// var ViewModel = {
			// 	isProjectArchived: false,
			// 	isProjectCancelled: false,
			// 	isProjectEditable: false,
			// 	isRetriveVisible: false,
			// 	isEditBtnVisible: false,
			// 	isDeleteBtnVisible: false

			// };
			// this.getOwnerComponent().getModel("appView").setProperty("/DetailListThis", this);
			// var model = new JSONModel(ViewModel);
			// this.getView().setModel(model, "DetailView");
			// this.getView().getModel("appView").getData().detailthis=this;
			//from anu
			var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
			for (var i = 0; i < userPagePerm.length; i++) {
				if (userPagePerm[i].applicationid === 'APP10001') {
					this.appPagePerm = userPagePerm[i];
					break;
				}
			}
			this.getView().byId("deleteid").setVisible(this.appPagePerm.delete);
			this.getView().byId("editid").setVisible(this.appPagePerm.update);
			//till anu
			try {
				if (!this.EditProgram) {
					this.EditProgram = sap.ui.xmlfragment(this.getView().getId(), "MDG.Program.fragment.EditProgram", this);
					if (this.EditProgram) this.EditProgram.setModel(i18nModel, "i18n");
				}
				if (!this.AddProject) {
					this.AddProject = sap.ui.xmlfragment(this.getView().getId(), "MDG.Program.fragment.AddProject", this);
					if (this.AddProject) this.AddProject.setModel(i18nModel, "i18n");

					//var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerdata").getData());
					// var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerInfo").getData());
					// this.AddProject.getContent()[0].getContent()[14].setModel(customerModel);
					//this.AddProject.setModel(customerModel);
					var vendorsModel = new JSONModel(this.getOwnerComponent().getModel("vendordata").getData());
					this.AddProject.getContent()[0].getContent()[11].setModel(vendorsModel);
					//this.AddProject.setModel(vendorsModel);
					this.getView().addDependent(this.AddProject);
				}
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = new sap.ui.xmlfragment("MDG.Program.fragment.viewSettingsDialogForProjects", this);
					this.getView().addDependent(this._oViewSettingsDialog);
				}
				sap.ui.core.UIComponent.getRouterFor(this).getRoute("detailList").attachPatternMatched(this._objPatternMatched, this);
				var model = new sap.ui.model.json.JSONModel({
					"buttonVisibility": true
				});
				this.getView().setModel(model, "detailView");
			} catch (error) {
				MessageBox.error(error + "Something went wroung");
			}
		},

		_objPatternMatched: function (oEvent) {
			var that = this;
			this.getView().getModel("appView").getData().detailthis = this;
			that.sObjectId = parseInt(oEvent.getParameter("arguments").objectId);
			that.programDetails();
		},
		programDetails: function () {
			var that = this;
			that.getView().setBusy(true);
			$.ajax({
				url: "/OptimalCog/api/m-programs?populate=*&filters[id][$eq]=" + that.sObjectId,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					// for (var i = 0; i < response.data.length; i++) {
					// 	if (that.sObjectId === response.data[i].id) {
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data[0]));
					that.dataId = response.data[0].id;
					that.vendorList();
					// break;
					// 	}
					// }

				}
			});
		},
		vendorList: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-vendors",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "vendorInfo");
					that.customerList();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		customerList: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-customers",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var aModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(aModel, "customerInfo");
					that.mProject();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mProject: function () {
			var that = this;
			$.ajax({
				// url: "/OptimalCog/api/m-projects",
				url: "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId + "&sort=id:ASC",
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var aModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(aModel, "projectsInfo");
					that.mComments();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		mComments: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-comments?populate=*",
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					var matchingComments = [];

					response.data.forEach(function (comment) {
						var mProgramId = comment.attributes.m_program.data === null ? "" : comment.attributes.m_program.data.id;
						if (mProgramId === that.dataId) {
							matchingComments.push(comment);
						}
					});
					var cModel = new sap.ui.model.json.JSONModel(matchingComments);
					that.getView().setModel(cModel, "userComments");
					that.getView().setBusy(false);
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		OnItemPress: function (oEvent) {
			var that = this;
			//var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			var oItem = oEvent.getParameter("listItem").getBindingContext("projectsInfo").getObject();
			var projectData_Id = oItem.id;
			this.getView().getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detailDetail", {
				ProgramPath: that.dataId,
				ProjectId: projectData_Id
			});
		},
		openEditProgram: function (evt) {
			var that = this;
			var EditModel = new sap.ui.model.json.JSONModel(this.getView().getModel().getData().attributes);
			this.EditProgram.setModel(EditModel);
			this.EditProgram.open();

		},
		handleEditProgramCancel: function () {
			this.EditProgram.close();
		},
		handleEditProgram: function () {
			var that = this;
			var Err = this.ValidateEditProgramFragment();
			if (Err == 0) {
				// this.getView().getModel().updateBindings(true);
				var editProgramData = this.EditProgram.getModel().getData();

				that.updateProgramData = {
					"name": editProgramData.name,
					"description": editProgramData.description,
					"startDate": editProgramData.startDate,
					"endDate": editProgramData.endDate,
					"status": editProgramData.status,
					"type": editProgramData.type,
					"countryOrCity": editProgramData.countryOrCity,
					"effort": Number(editProgramData.effort),
					"progress": Number(editProgramData.progress),
					"priority": editProgramData.priority
				};
				for (var prop in that.updateProgramData) {
					var value = that.updateProgramData[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						delete that.updateProgramData[prop];
					}
				}
				$.ajax({
					url: "/OptimalCog/api/m-programs/" + that.dataId,
					type: "PUT",
					data: {
						"data": that.updateProgramData
					},
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Program is not Updated Something went wrong!");
						} else {
							MessageToast.show('PRG100000' + getValues.data.id + " Program updated successfully.", {
								closeOnBrowserNavigation: false
							});
							that.getView().getModel().updateBindings();
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("masterList");
							that.EditProgram.close();
						}
					}
				});
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}
		},

		ValidateEditProgramFragment: function () {
			var Err = 0;
			if (this.EditProgram.getContent()[0].getContent()[1].getValue() == "" || this.EditProgram.getContent()[0].getContent()[1].getValue() ==
				null) {
				Err++;
				//	this.EditProgram.getContent()[0].getContent()[1].setValueState("Error");
			} else {
				//	this.EditProgram.getContent()[0].getContent()[1].setValueState("None");
			}

			if (this.EditProgram.getContent()[0].getContent()[3].getValue() == "" || this.EditProgram.getContent()[0].getContent()[3].getValue() ==
				null) {
				Err++;
				//	this.EditProgram.getContent()[0].getContent()[3].setValueState("Error");
			} else {
				//	this.EditProgram.getContent()[0].getContent()[3].setValueState("None");
			}

			if (this.EditProgram.getContent()[0].getContent()[5].getValue() == "" || this.EditProgram.getContent()[0].getContent()[5].getValue() ==
				null) {
				Err++;
				//	this.EditProgram.getContent()[0].getContent()[5].setValueState("Error");
			} else {
				//	this.EditProgram.getContent()[0].getContent()[5].setValueState("None");
			}

			if (this.EditProgram.getContent()[0].getContent()[7].getValue() == "" || this.EditProgram.getContent()[0].getContent()[7].getValue() ==
				null) {
				Err++;
				//	this.EditProgram.getContent()[0].getContent()[7].setValueState("Error");
			} else {
				//	this.EditProgram.getContent()[0].getContent()[7].setValueState("None");
			}

			return Err;
		},
		openAddNewProject: function (evt) {
			var that = this;
			var programId = this.getView().getModel().getData().attributes.m_projects.data.length;
			// if (this.i == undefined)
			//	this.i = (this.getOwnerComponent().getModel().getData().programs[this.sPath].Projects.length + 1);
			// else
			// 	this.i++;
			var projectObj = {
				projectname: "",
				description: "",
				startdate: "",
				enddate: "",
				assignedVendors: [],
				team_member: [],
				assigned_teammember: [],
				csf: [],
				customerName: "",
				Vendors: [],
				customers: [],
				milestones: [],
				status: "New",
				documents: [],
				"Effort": "",
				"Progress": "",
				"Priority": "",
				id: parseInt(programId) + 1
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(projectObj);
			this.AddProject.setModel(fragmentModel);
			this.AddProject.getContent()[0].getContent()[14].setModel(new JSONModel([]));
			this.AddProject.getContent()[0].getContent()[11].setModel(new JSONModel([]));
			this.AddProject.open();
		},
		onValueHelpRequestVendor: function () {
			var that = this;
			if (!this.SelectVendorsDialog) {
				this.SelectVendorsDialog = sap.ui.xmlfragment("MDG.Program.fragment.SelectVendorsDialog", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.SelectVendorsDialog);
			}
			this.AddProject.getContent()[0].getContent()[14].setModel(new JSONModel([]));
			var fragmentModel = new sap.ui.model.json.JSONModel(this.getView().getModel("vendorInfo").getData());
			this.SelectVendorsDialog.setModel(fragmentModel);
			this.SelectVendorsDialog.open();
		},
		onValueHelpRequestCustomer: function () {
			var that = this;
			if (!this.SelectCustomerDialog) {
				this.SelectCustomerDialog = sap.ui.xmlfragment("MDG.Program.fragment.SelectCustomerDialog", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.SelectCustomerDialog);
			}
			this.AddProject.getContent()[0].getContent()[11].setModel(new JSONModel([]));
			var fragmentModel = new sap.ui.model.json.JSONModel(this.getView().getModel("customerInfo").getData());
			this.SelectCustomerDialog.setModel(fragmentModel);
			this.SelectCustomerDialog.open();
		},

		onSelectVendors: function (evt) {
			var that = this;
			var aContexts = evt.getParameter("selectedContexts");
			that.VendorsObject = [];
			evt.getParameters().selectedContexts.forEach(function (obj, index) {
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
			//	this.AddProject.getModel().getData()["SelVendors"]= this.VendorsObject;
			this.AddProject.getContent()[0].getContent()[14].setModel(new JSONModel(this.VendorsObject));
			this.AddProject.getModel().updateBindings(true);

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
			this.AddProject.getContent()[0].getContent()[11].setModel(new JSONModel(this.CustomerObject));
			this.AddProject.getModel().updateBindings(true);

		},
		//onSearch Vendors ValueHelp press
		onSearchVendorsValueHelp: function (evt) {
			this.SelectVendorsDialog.getBinding("items").filter([new sap.ui.model.Filter("attributes/vendorName", sap.ui.model.FilterOperator.Contains,
				evt.getParameters().value)]);
		},
		// serach functn for customer
		onSearchCustomerValueHelp: function (evt) {
			this.SelectVendorsDialog.getBinding("items").filter([new sap.ui.model.Filter("attributes/customerName", sap.ui.model.FilterOperator
				.Contains,
				evt.getParameters().value)]);
		},
		// search implementation projects
		onSearchProjects: function (oEvent) {
			var that = this;
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery) {
				var link = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId +
					"& filters[$or][0][id][$contains]=" + sQuery +
					"&filters[$or][1][name][$contains]=" + sQuery + "&filters[$or][2][status][$contains]=" + sQuery
			} else {
				// link = "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
				// 	"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC";
				link = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId + "&sort=id:ASC"
			}
			$.ajax({
				url: link,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var aModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(aModel, "projectsInfo");
					that.mComments();
				},
				error: function (res) {
					MessageBox.error(res + "Something went wroung");
				}
			});
		},
		onConfirmViewSettingsDialog: function (oEvent) {
			var that = this;
			// selected keydebugger

			var filterBy = oEvent.getParameter("filterCompoundKeys");
			var filterByValue = oEvent.getParameter("filterKeys");

			var oSortItem = oEvent.getParameter("sortItem");
			var bDescending = oEvent.getParameter("sortDescending"); // if the descending button is selected or not

			if (Object.keys(filterBy).length !== 0 && Object.keys(filterByValue).length !== 0) {
				if (oSortItem !== undefined) {
					oSortItem = oSortItem.getKey();
				} else {
					oSortItem = "id";
				}

				if (bDescending === false) {
					var filterLink = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId +
						"&filters[status][$eq]=" + Object.keys(filterByValue)[0] + "&sort=" + oSortItem + ":ASC";
				} else {
					var filterLink = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId +
						"&filters[status][$eq]=" + Object.keys(filterByValue)[0] + "&sort=" + oSortItem + ":DESC";
				}
				$.ajax({
					url: filterLink,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						var aModel = new sap.ui.model.json.JSONModel(response.data);
						that.getView().setModel(aModel, "projectsInfo");
						that.mComments();
					},
					error: function (res) {
						MessageBox.error(res + "Something went wroung");
					}
				});
			}

			if (Object.keys(filterBy).length === 0 && Object.keys(filterByValue).length === 0) {
				if (oSortItem !== "undefined") {
					oSortItem = oSortItem.getKey();
				} else {
					oSortItem = "id";
				}

				if (bDescending === false) {
					var link = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId + "&sort=" +
						oSortItem + ":ASC";
				} else {
					link = "/OptimalCog/api/m-projects?&populate=*&filters[m_program][id][$eq]=" + that.sObjectId + "&sort=" + oSortItem +
						":DESC ";
				}
				$.ajax({
					url: link,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						var aModel = new sap.ui.model.json.JSONModel(response.data);
						that.getView().setModel(aModel, "projectsInfo");
						that.mComments();
					},
					error: function (res) {
						MessageBox.error(res + "Something went wroung");
					}
				});
			}
		},
		handleProjectCancel: function (evt) {
			var that = this;
			var projectObj = {
				"projectname": "",
				"description": "",
				"startdate": "",
				"enddate": "",
				"assignedVendors": [],
				"team_member": [],
				"assigned_teammember": [],
				"csf": [],
				"customerName": "",
				"Vendors": [],
				"customers": [],
				"milestones": [],
				"document": [],
				"Effort": "",
				"Progress": "",
				"Priority": "",
				"status": "New"
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(projectObj);
			this.AddProject.setModel(fragmentModel);
			this.AddProject.close();
		},

		handleValueHelp: function () {

			if (!this.assignedVendors) {
				this.assignedVendors = sap.ui.xmlfragment("MDG.Program.fragment.addVendortoProject", this);
				this.getView().addDependent(this.assignedVendors);
			}
			this.assignedVendors.open();

		},
		addCustomerhere: function () {
			if (!this.assignedCustomers) {
				this.assignedCustomers = new sap.ui.xmlfragment("MDG.Program.fragment.addCustomerToProject", this);
				this.getView().addDependent(this.assignedCustomers);
			}

			//var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerdata").getData());
			var customerModel = new JSONModel(this.getOwnerComponent().getModel("customerInfo").getData());
			this.assignedCustomers.setModel(customerModel);
			this.assignedCustomers.open();
		},

		onConfirmCustomer: function (oEvent) {
			var that = this;
			var selKey = oEvent.getParameters().removedTokens[0].mProperties.key;

			//this.getOwnerComponent().getModel("customerdata").getData().forEach(function (item, index) {
			that.CustomerObject.forEach(function (item, index) {
				if (item.attributes.customerName == selKey) {
					that.CustomerObject.splice(index, 1);

				}
			});
			//	this.AddProject.getContent()[0].getContent()[11].setValue(oCustomer);
			this.getView().getModel().updateBindings(true);
		},
		onConfirm: function (oEvent) {
			var that = this;
			var selKey = oEvent.getParameters().removedTokens[0].getBindingContext().getProperty().id;
			that.VendorsObject.forEach(function (item, index) {
				if (item.id == selKey) {
					that.VendorsObject.splice(index, 1); // fix here
				}
			});

			//		this.AddProject.getContent()[0].getContent()[14].setValue(selKey);
			this.getView().getModel().updateBindings(true);
		},
		handleAddProject: function (evt) {
			var that = this;
			var Err = this.ValidateEditAddProjectFragment();
			if (Err == 0) {
				var FragmentData = this.AddProject.getModel().getData();
				var programData = this.getView().getModel().getData().attributes;
				// var CustomerData = that.CustomerObject.map(function (item) {
				// 	return item.id;
				// });
				// var VendorsObject = that.VendorsObject.map(function (item) {
				// 	return item.id;
				// });
				var modelLength = this.getView().getModel().getData();
				that.createAddProejct = {
					"projectID": "PRG10001_0000" + parseInt(modelLength.attributes.m_projects.data.length + 2),
					"name": FragmentData.projectname,
					"description": FragmentData.description,
					"startDate": FragmentData.startdate,
					"endDate": FragmentData.enddate,
					"effort": Number(this.AddProject.getContent()[0].getContent()[11].getValue()),
					"progress": Number(FragmentData.Progress),
					"priority": FragmentData.Priority,
					"status": FragmentData.status,
					"m_program": [that.dataId]
				};
				for (var prop in that.createAddProejct) {
					var value = that.createAddProejct[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						delete that.createAddProejct[prop];
					}
				}
				if (new Date(programData.startDate) > new Date(FragmentData.startdate)) {
					sap.m.MessageBox.error("Start date is less than program start date");
				} else if (new Date(programData.endDate) < new Date(FragmentData.enddate)) {
					sap.m.MessageBox.error("End date is greater than program end date");
				} else {
					$.ajax({
						url: "/OptimalCog/api/m-projects",
						type: "POST",
						data: {
							"data": that.createAddProejct
						},
						success: function (res) {
							var getValues = JSON.parse(res);
							if (getValues.error) {
								MessageBox.error(getValues.error.message);
							} else {
								MessageBox.success("PRG10001_0000" + getValues.data.id + " Add Successfully!");
								that.programDetails();
								that.getView().getModel().refresh(true);

								//that.updateModel();
								//	this.getView().getModel("ProgramsModel").updateBindings(true);
								that.AddProject.close();
							}
						}
					});
				}
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}
		},
		ValidateEditAddProjectFragment: function () {
			var Err = 0;
			if (this.AddProject.getContent()[0].getContent()[2].getValue() == "" || this.AddProject.getContent()[0].getContent()[2].getValue() ==
				null) {
				Err++;
				//	this.AddProject.getContent()[0].getContent()[2].setValueState("Error");
			} else {
				//	this.AddProject.getContent()[0].getContent()[2].setValueState("None");
			}

			if (this.AddProject.getContent()[0].getContent()[4].getValue() == "" || this.AddProject.getContent()[0].getContent()[4].getValue() ==
				null) {
				Err++;
				//	this.AddProject.getContent()[0].getContent()[4].setValueState("Error");
			} else {
				//	this.AddProject.getContent()[0].getContent()[4].setValueState("None");
			}

			if (this.AddProject.getContent()[0].getContent()[6].getValue() == "" || this.AddProject.getContent()[0].getContent()[6].getValue() ==
				null) {
				Err++;
				//	this.AddProject.getContent()[0].getContent()[6].setValueState("Error");
			} else {
				//	this.AddProject.getContent()[0].getContent()[6].setValueState("None");
			}

			if (this.AddProject.getContent()[0].getContent()[8].getValue() == "" || this.AddProject.getContent()[0].getContent()[8].getValue() ==
				null) {
				Err++;
				//	this.AddProject.getContent()[0].getContent()[8].setValueState("Error");
			} else {
				//	this.AddProject.getContent()[0].getContent()[8].setValueState("None");
			}
			// if (this.AddProject.getContent()[0].getContent()[11].getTokens().length == 0) {
			// 	Err++;
			// 	//	(this.AddProject.getContent()[0].getContent()[11].setValueState("Error");
			// } else {
			// 	//	(this.AddProject.getContent()[0].getContent()[11].setValueState("None");
			// }
			// if (this.AddProject.getContent()[0].getContent()[14].getTokens().length == 0) {
			// 	Err++;
			// 	//	this.AddProject.getContent()[0].getContent()[14].setValueState("Error");
			// } else {
			// 	//	this.AddProject.getContent()[0].getContent()[14].setValueState("None");
			// }
			if (this.AddProject.getContent()[0].getContent()[15].getSelectedKey() == "" || this.AddProject.getContent()[0].getContent()[15].getSelectedKey() ==
				null) {
				Err++;
				//	this.AddProject.getContent()[0].getContent()[2].setValueState("Error");
			} else {
				//	this.AddProject.getContent()[0].getContent()[2].setValueState("None");
			}

			return Err;
		},

		//triggers on close of the detail button 
		onCloseDetailPress: function () {
			var bFullScreen = this.getView().getModel("appView").getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/closeColumn", !bFullScreen);
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("masterList");
			this.getView().getModel("appView").getData().masterthis.getView().byId("list").removeSelections(true);
		},
		// todelete program from list 
		openDeleteProgram: function (evt) {
			var that = this;
			MessageBox.confirm("Are you sure you want to delete program?", {
				title: "Confirm Deletion",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {
					if (oAction === "YES") {
						$.ajax({
							type: "DELETE",
							url: "/OptimalCog/api/m-programs/" + that.dataId,
							success: function (response) {
								var resValue = JSON.parse(response);
								if (resValue.error) {
									MessageBox.error(resValue.error.message);
								} else {
									MessageToast.show("Program Deleted sucessfully", {
										closeOnBrowserNavigation: false
									});
									var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									oRouter.navTo("masterList");
									that.onCloseDetailPress();
								}
							}
						});
					}
				}
			});
		},
		toggleFullScreen: function () {
			var bFullScreen = this.getView().getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				this.getView().getModel("appView").setProperty("/previousLayout", this.getView().getModel("appView").getProperty("/layout"));
				this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				this.getView().getModel("appView").setProperty("/layout", this.getView().getModel("appView").getProperty("/previousLayout"));
			}

		},
		onHandleValueUpdates: function (statusValue) {
			var that = this;
			//	var modelData = this.getView().getModel().getData().attributes;
			var modelDataArchive = {
				// "name": modelData.name,
				// "description": modelData.description,
				// "startDate": modelData.startDate,
				// "endDate": modelData.endDate,
				"status": statusValue
			};
			$.ajax({
				url: "/OptimalCog/api/m-programs/" + that.dataId,
				type: "PUT",
				data: {
					"data": modelDataArchive
				},
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
					} else {
						that.getView().getModel().updateBindings(true);
						that.onCloseDetailPress();

					}
				}
			});
		},
		openArchiveProgram: function (evt) {
			this.onHandleValueUpdates("Archived");
			// that.getView().getModel("ProgramsModel").updateBindings(true);
			// this.getUserAccess();
			// that.getView().getModel("appView").getData().masterthis.getView().getModel().getData().Status = "Archived";
			// that.getView().getModel("appView").getData().masterthis.getView().getModel().updateBindings(true);

		},
		openCompleteProgram: function (evt) {
			this.onHandleValueUpdates("Completed");
		},
		openCancelProgram: function (evt) {
			// var that = this;
			// this.getView().getModel("ProgramsModel").getData().Status = "Cancelled";
			this.onHandleValueUpdates("Cancelled");
			// this.getView().getModel().updateBindings(true);
			// this.getUserAccess();
			// that.getView().getModel("ProgramsModel").updateBindings(true);
			// that.getView().getModel("appView").getData().masterthis.getView().getModel().getData().Status = "Cancelled";
			// that.getView().getModel("appView").getData().masterthis.getView().getModel().updateBindings(true);
			// this.onCloseDetailPress();
		},
		openRetriveProgram: function (evt) {
			this.onHandleValueUpdates("In-Progress");
			// if (this.getView().getModel("ProgramsModel").getData().Status == "Archived") {
			// 	this.getView().getModel("ProgramsModel").getData().Status = "In Progress";
			// 	that.getView().getModel("appView").getData().masterthis.getView().getModel().getData().Status = "In Progress";
			// } else {
			// 	this.getView().getModel("ProgramsModel").getData().Status = "In Progress";
			// 	that.getView().getModel("appView").getData().masterthis.getView().getModel().getData().Status = "In Progress";
			// }
			// this.getView().getModel().updateBindings(true);
			// this.getUserAccess();
			// that.getView().getModel("appView").getData().masterthis.getView().getModel().updateBindings(true);
			// this.onCloseDetailPress();
		},
		onOpenViewSettings: function (oEvent) {
			//	this.getAggregatedValuesForAuditType();
			var sDialogTab = "sort";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().sId;
				if (sButtonId.match("filter")) {
					sDialogTab = "filter";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			this._oViewSettingsDialog.open(sDialogTab);
		},
		_applyFilterSearch: function () {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getView().setModel(this.getView().getModel("auditModel"));
			this._oList.getBinding("items").filter(aFilters, "Application");
		},
		// for coniform close of fragment
		// onConfirmViewSettingsDialog: function (oEvent) {
		// 	var filters = [];
		// 	this.filterforarchive(0);
		// 	this._oList = this.getView().byId("list2");
		// 	if (oEvent.getParameters().filterItems.length > 0) {
		// 		for (var a = 0; a < oEvent.getParameters().filterItems.length; a++) {
		// 			filters.push(new sap.ui.model.Filter(oEvent.getParameters().filterItems[a].getParent().getKey(), "Contains", oEvent.getParameters()
		// 				.filterItems[a].getKey()));
		// 		}
		// 		filters = filters.length == 1 ? filters : new sap.ui.model.Filter(filters, true);
		// 		this._oList.getBinding("items").filter(filters, "Application");
		// 	} else {
		// 		this._oList.getBinding("items").filter([], "Application");
		// 		this.filterforarchive(1);
		// 	}
		// 	this._applySortGroup(oEvent);
		// },

		filterforarchive: function (i) {
			var sQuery = "";
			if (i == 1) {
				sQuery = "Archived";
			}
			var aFilter = [];
			var oBinding = this.getView().byId("list2").getBinding("items");
			if (sQuery) {
				var status = new Filter("status", FilterOperator.NotContains, sQuery);

				var deafultFilters = [status];
				aFilter = new Filter(deafultFilters, false);
				oBinding.filter(aFilter);
			} else {
				//Set empty filter array if no query found, in order to show the complete list of assessments
				oBinding.filter(new Filter(aFilter, true));
			}
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
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},
		onPostComment: function (oEvent) {
			var that = this;
			// var oFormat = DateFormat.getDateTimeInstance({
			// 	style: "medium"
			// });
			// debugger
			// var oDate = new Date();
			// var sDate = oFormat.format(oDate);
			// // create new entry
			var sValue = oEvent.getParameter("value");
			// var oEntry = {
			// 	userName: this.getOwnerComponent().getModel("loggedOnUserModel").getData().firstName,
			// 	date: "" + sDate,
			// 	text: sValue
			// };
			var user = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			that.commentPayload = {
				"comment": sValue,
				"m_program": [that.dataId],
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
					if (getValues.error) {
						MessageBox.error(getValues.error.message);
					} else {
						MessageToast.show("comment Added");
						that.mComments();
						that.getView().getModel("userComments").refresh();
					}
				}
			});

			// update model
			// var oModel = this.getView().getModel("ProgramsModel");
			// var aEntries = oModel.getData().comments;
			// aEntries.unshift(oEntry);
			// oModel.setData({
			// 	comments: aEntries
			// });
		}
	});
});