sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"MDG/Program/util/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, formatter, JSONModel, MessageToast, MessageBox, Fragment, Sorter) {
	"use strict";

	return Controller.extend("MDG.Program.controller.masterList", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			var i18nModel = this.getOwnerComponent().getModel("i18n");
			// var ProjectModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().getModel("projectInfo").getData());
			// //this.getView().setModel(ProjectModel);
			// that.getOwnerComponent().setModel(ProjectModel);
			//this.getView().by
			//Boodi 19-10-2021

			// that.byId("list").removeSelections(true);
			//from anu
			var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
			for (var i = 0; i < userPagePerm.length; i++) {
				if (userPagePerm[i].applicationid === 'APP10001') {
					this.appPagePerm = userPagePerm[i];
					break;
				}
			}
			this.getView().byId("addProgramId").setVisible(this.appPagePerm.create);
			//	},
			//till anu
			this.getView().byId("list").removeSelections(true);
			this.getOwnerComponent().getRouter().getRoute("masterList").attachPatternMatched(function (oEvent) {
				that.updateModel();
				that.getView().getModel("appView").setProperty("/layout", "OneColumn");
				// this.updateModel();	
				this.getView().getModel("appView").getData().masterthis = this;
			}, this);
			try {
				if (!this.AddProgram) {
					this.AddProgram = sap.ui.xmlfragment(this.getView().getId(), "MDG.Program.fragment.AddProgram", this);
					if (this.AddProgram) this.AddProgram.setModel(i18nModel, "i18n");
				}
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = new sap.ui.xmlfragment("MDG.Program.fragment.viewSettingsDialog", this);
					this.getView().addDependent(this._oViewSettingsDialog);
				}
			} catch (error) {
				console.log(error);
			}

		},

		updateModel: function () {
			var that = this;
			// // var usersData = this.getOwnerComponent().getModel("users").getData();
			// // var logOnUserId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;

			// var userPagePerm = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission;
			// for (var i = 0; i < userPagePerm.length; i++) {
			// 	if (userPagePerm[i].applicationid === "APP10001") {
			// 		this.appPagePerm = userPagePerm[i];
			// 		break;
			// 	}
			// }
			// this.getView().byId("addProgramId").setVisible(this.appPagePerm.create);

			// var oModel = that.getOwnerComponent().getModel("projectInfo").getData().programs;
			// var logOnOrgId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id
			// var users = [];
			// //Filter programsData BasedOn Organization
			// for (var k = 0; k < oModel.length; k++) {
			// 	if (oModel[k].orgid == logOnOrgId)
			// 		users.push(oModel[k]);
			// }
			// //	var custModel = new sap.ui.model.json.JSONModel(users);

			// // //var oContext = new Context(oModel, );
			// // this.getView().setModel(custModel);
			// // //to get Not-Archived Data send ONE(1) in Parameter
			// // this.filterforarchive(1);
			that.getView().setBusy(true);
			$.ajax({
				url: "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC",
				// url: "/OptimalCog/api/m-programs?sort=id:ASC",
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					that.idLength = response.data.length - 1;
					// var modelData = new sap.ui.model.json.JSONModel({
					// 	"id": that.idLength
					// });
					// that.getOwnerComponent().setModel(modelData, "createRoleModel");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
					that.getView().setBusy(false);
				},
				error: function (res) {
					console.log(res);
				}
			});

		},
		onExit: function () {
			if (this.AddProgram) {
				this.AddProgram.destroy(true);
			}
			console.log("onExit() of controller called...");
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
		// onConfirmViewSettingsdDialog: function (oEvent) {
		// 	var filters = [];
		// 	//to get Archived Data send ZERO(0) in Parameter
		// 	this.filterforarchive(0);
		// 	this._oList = this.getView().byId("list");
		// 	this._oList.getBinding("items").filter([], "Application");
		// 	if (oEvent.getParameters().filterItems.length > 0) {
		// 		for (var a = 0; a < oEvent.getParameters().filterItems.length; a++) {
		// 			filters.push(new sap.ui.model.Filter(oEvent.getParameters().filterItems[a].getParent().getKey(), "Contains", oEvent.getParameters()
		// 				.filterItems[a].getKey()));
		// 		}
		// 		filters = filters.length == 1 ? filters : new sap.ui.model.Filter(filters, true);
		// 		this._oList.getBinding("items").filter(filters, "Application");
		// 	} else {
		// 		this._oList.getBinding("items").filter([], "Application");
		// 		//to get Not-Archived Data send ONE(1) in Parameter
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
			var oBinding = this.getView().byId("list").getBinding("items");
			if (sQuery) {
				var Status = new Filter("Status", FilterOperator.NotContains, sQuery);

				var deafultFilters = [Status];
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

		//triggers on click of the inquiries in the list
		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");
			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getModel() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getSource().getSelectedContextPaths()[0].split("/")[2] || oEvent.getParameter("listItem"));
			}

		},
		// search implementation
		onSearch: function (oEvent) {
			var that = this;
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery) {
				// var link = "/OptimalCog/api/m-programs?filters[id][$contains]=" + sQuery;
				var link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&filters[$or][0][id][$contains]=" + sQuery +
					"&filters[$or][1][name][$contains]=" + sQuery + "&filters[$or][2][status][$contains]=" + sQuery
			} else {
				link = "/OptimalCog/api/m-programs?populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
					"loggedOnUserModel").getData().m_organisation.id + "&sort=id:ASC";
				// link = "/OptimalCog/api/m-programs?sort=id:ASC"
			}
			$.ajax({
				url: link,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					that.idLength = response.data.length - 1;
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				},
				error: function (res) {
					console.log(res);
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
					if (Object.keys(filterBy)[0] !== undefined && Object.keys(filterBy)[1] !== undefined) {
						var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
								"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
							"&filters[type][$contains]=" + Object.keys(filterByValue)[1] + "&sort=" + oSortItem + ":ASC";
					} else {
						if (Object.keys(filterBy)[0] === "status") {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":ASC";
						} else {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[type][$contains]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":ASC";
						}
					}
				} else {
					if (Object.keys(filterBy)[0] !== undefined && Object.keys(filterBy)[1] !== undefined) {
						var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
								"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
							"&filters[type][$contains]=" + Object.keys(filterByValue)[1] + "&sort=" + oSortItem + ":DESC";
					} else {
						if (Object.keys(filterBy)[0] === "status") {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[status][$eq]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":DESC";
						} else {
							var filterLink = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
									"loggedOnUserModel").getData().m_organisation.id + "&filters[type][$contains]=" + Object.keys(filterByValue)[0] +
								"&sort=" + oSortItem + ":DESC";
						}
					}
				}
				$.ajax({
					url: filterLink,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.idLength = response.data.length - 1;
						that.getView().setModel(new sap.ui.model.json.JSONModel(response));
					},
					error: function (res) {
						console.log(res);
					}
				});
			}

			if (Object.keys(filterBy).length === 0 && Object.keys(filterByValue).length === 0) {
				if (oSortItem !== undefined) {
					oSortItem = oSortItem.getKey();
				} else {
					oSortItem = "id";
				}

				if (bDescending === false) {
					var link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&sort=" + oSortItem + ":ASC";
				} else {
					link = "/OptimalCog/api/m-programs?&populate=*&filters[m_organisation][id][$eq]=" + this.getOwnerComponent().getModel(
						"loggedOnUserModel").getData().m_organisation.id + "&sort=" + oSortItem + ":DESC";
				}
				$.ajax({
					url: link,
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.idLength = response.data.length - 1;
						that.getView().setModel(new sap.ui.model.json.JSONModel(response));
					},
					error: function (res) {
						console.log(res);
					}
				});
			}
		},

		// function to add program 
		_onAddProject: function (evt) {
			// if (this.i == undefined)
			// 	this.i = + 1;
			// else
			// 	this.i++;
			var that = this;
			var Obj = {
				ProgramsName: "",
				Description: "",
				startdate: "",
				enddate: "",
				Status: "New",
				orgid: "",
				Projects: [],
				"Effort": "",
				"Progress": "",
				"Priority": "",
				_id: "PRG" + parseInt(10000 + this.idLength + 2),
				proj_type: ""
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(Obj);
			Obj.orgid = this.getOwnerComponent().getModel("loggedOnUserModel").getData().orgid;
			this.AddProgram.setModel(fragmentModel);
			var progTypeData = [{
				"proj_type": "DGI Foundation"
			}, {
				"proj_type": "Trans Program"
			}, {
				"proj_type": "IC Data Initiative"
			}, {
				"proj_type": "Reg Tech Initiative"
			}, {
				"proj_type": "Data Quality"
			}, {
				"proj_type": "Generic"
			}];
			var progTypeModel = new sap.ui.model.json.JSONModel(progTypeData);
			this.AddProgram.getContent()[0].getContent()[11].setModel(progTypeModel);
			this.AddProgram.open();
		},

		handleAddProgramCancel: function () {
			var that = this;
			var Obj = {
				ProgramsName: "",
				Description: "",
				startdate: "",
				enddate: "",
				Status: "",
				orgid: "",
				Projects: [],
				proj_type: ""
			};
			var fragmentModel = new sap.ui.model.json.JSONModel(Obj);
			// this.getView().getModel("projectInfo").getData().programs.pop();
			this.AddProgram.setModel(fragmentModel);
			this.AddProgram.close();
		},
		handleAddProgram: function () {
			var that = this;
			var Err = this.ValidateAddProgramFragment();
			if (Err == 0) {
				var FragmentData = this.AddProgram.getModel().getData();
				FragmentData.proj_type = this.AddProgram.getContent()[0].getContent()[11].getSelectedKey();
				//this.getOwnerComponent().getModel().getData().programs.push(FragmentData);

				that.addProgramsPyload = {
					"programID": FragmentData._id,
					"name": FragmentData.ProgramsName,
					"description": FragmentData.Description,
					"startDate": FragmentData.startdate,
					"endDate": FragmentData.enddate,
					"status": FragmentData.Status,
					"m_organisation": [that.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
					"type": FragmentData.proj_type,
					"countryOrCity": FragmentData.countryOrCity,
					"effort": parseInt(FragmentData.Effort),
					"progress": parseInt(FragmentData.Progress),
					"priority": FragmentData.Priority
				};
				for (var prop in that.addProgramsPyload) {
					var value = that.addProgramsPyload[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						delete that.addProgramsPyload[prop];
					}
				}

				$.post("/OptimalCog/api/m-programs", {
						"data": that.addProgramsPyload
					},
					function (response) {
						var resValue = JSON.parse(response);
						if (resValue.error) {
							MessageBox.error(resValue.error.message);
						} else {
							MessageBox.success("PRG" + 10000 + resValue.data.id + " Add Successfully!");
							that.getView().getModel().refresh(true);
							that._showDetail(resValue.data);
							that.AddProgram.close();
						}
					});
			} else {
				sap.m.MessageBox.error("Please fill Mandatory fields.");
			}
		},
		_showDetail: function (oItem) {
			var that = this;
			//getting the id from Model
			if (typeof (oItem) === 'string') {
				oItem = that.getView().getModel().getData().data[oItem];
			}
			that.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			// var nextModel = new sap.ui.model.json.JSONModel(oItem);
			// this.getOwnerComponent().setModel(nextModel, "selectedProgramData");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("detailList", {
				objectId: oItem.id
			});

		},
		ValidateAddProgramFragment: function () {
			var Err = 0;
			if (this.AddProgram.getContent()[0].getContent()[1].getValue() == "" || this.AddProgram.getContent()[0].getContent()[1].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[1].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[1].setValueState("None");
			}

			if (this.AddProgram.getContent()[0].getContent()[3].getValue() == "" || this.AddProgram.getContent()[0].getContent()[3].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[3].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[3].setValueState("None");
			}

			if (this.AddProgram.getContent()[0].getContent()[5].getValue() == "" || this.AddProgram.getContent()[0].getContent()[5].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[5].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[5].setValueState("None");
			}

			if (this.AddProgram.getContent()[0].getContent()[7].getValue() == "" || this.AddProgram.getContent()[0].getContent()[7].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("None");
			}
			if (this.AddProgram.getContent()[0].getContent()[11].getValue() == "" || this.AddProgram.getContent()[0].getContent()[11].getValue() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("None");
			}
			if (this.AddProgram.getContent()[0].getContent()[19].getSelectedKey() == "" || this.AddProgram.getContent()[0].getContent()[19].getSelectedKey() ==
				null) {
				Err++;
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("Error");
			} else {
				//	this.AddProgram.getContent()[0].getContent()[7].setValueState("None");
			}

			return Err;
		},

	});
});