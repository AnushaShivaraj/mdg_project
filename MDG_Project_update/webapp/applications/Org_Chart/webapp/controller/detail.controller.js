sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Context",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/commons/networkgraph/layout/ForceBasedLayout",
	"sap/suite/ui/commons/networkgraph/ActionButton",
	"sap/suite/ui/commons/networkgraph/Node",
	"sap/ui/core/Fragment",
	"sap/ui/export/Spreadsheet"
], function (Controller, Context, MessageToast, JSONModel, ForceBasedLayout, ActionButton, Node, Fragment, Spreadsheet) {
	"use strict";

	return Controller.extend("mdg.Org_Chart.controller.detail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mdg.Org_Chart.view.detail
		 */
		onInit: function () {
			var that = this;
			if (!this.valueHelpForConfirmation)
				this.valueHelpForConfirmation = new sap.ui.xmlfragment("mdg.Org_Chart.fragment.valueHelpForConfirmation", this);
			this.getView().addDependent(this.valueHelpForConfirmation);
			this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(function (oEvent) {
				// this.oBundle = this.getOwnerComponent().getModel("i18nModel").getResourceBundle();
				that.ObjectId = oEvent.getParameter("arguments").objectId;
				that.mProgramsDetails();
				// var PrgmData = this.getOwnerComponent().getModel("programDetails").getData();

				// 		PrgmData.forEach(function (obj, index) {
				// 			if (obj._id == sObjectId) {
				// 				that.sPath = index;
				// 			}
				// 		});

				// 		// set this with sPath
				// 		this.sPath = that.sPath;
				// 		var projModel = new JSONModel(this.getOwnerComponent().getModel("projectInfo").getData().programs[this.sPath]);

				// 		//Header Data orgName and location
				// 		var headerModelData = projModel.getData();
				// 		var headerData = {
				// 			orgName: headerModelData.org_name,
				// 			orgId: headerModelData.orgid,
				// 			orgLocation: headerModelData.countryOrCity,
				// 			programName: headerModelData.ProgramsName,
				// 			Status: headerModelData.Status
				// 		};
				// 		var headerModel = new sap.ui.model.json.JSONModel(headerData);
				// 		this.getView().setModel(headerModel, "ProgramData");

				// 		//End of Header Data orgName and location//

				// 		//To get the projects in a selected program.
				// 		var projects = [];
				// 		projModel.getData().Projects.forEach(function (project, index) {
				// 			var projNames = {
				// 				projName: project.projectname,
				// 				projPath: index
				// 			};
				// 			projects.push(projNames);
				// 		});
				// 		var projNameModel = new sap.ui.model.json.JSONModel(projects);
				// 		this.getView().setModel(projNameModel, "projectNames");
				// 		//End of code To get the projects in a selected program.//

				// 		// var selectedProjectPath = this.getView().byId("projectsId").getSelectedKey().split("-")[1];
				// 		this.onProjectChange();
				// 		var loggedInUser = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
				// 		//if (loggedInUser.firstName == "Robin"  && (headerData.Status == "New" || headerData.Status == "In Progress" )) {
				// 		if (loggedInUser.firstName != "Robin"  && headerData.Status == "Submitted") {
				// 			this.getView().byId("approveButtonId").setVisible(true);
				// 			this.getView().byId("rejectButtonId").setVisible(true);
				// 			this.getView().byId("submitButtonId").setVisible(false);
				// 		} else {
				// 			this.getView().byId("approveButtonId").setVisible(false);
				// 			this.getView().byId("rejectButtonId").setVisible(false);
				// 			this.getView().byId("submitButtonId").setVisible(true);
				// 		}
				// 	}, this);
				// 	var loggedInUser = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
				// 	var userData = this.getOwnerComponent().getModel("users").oData;
				// 	var users = [];
				// 	for (var m = 0; m < userData.length; m++) {
				// 		if (userData[m].firstName != loggedInUser.firstName) {
				// 			users.push(userData[m]);
				// 		}
				// 	}
				// 	this.getView().setModel(new sap.ui.model.json.JSONModel(users), "UserDataModel");
				// 	this.valueHelpForConfirmation.setModel(this.getView().getModel("UserDataModel"));

			});
			that.getTheusers();
		},
		getTheusers: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/users?populate=*",
				type: "GET",
				success: function (res) {
					var userInfo = JSON.parse(res);
					if (userInfo.error) {
						MessageBox.error(userInfo.error.message + "Something went wrong!");
					} else {
						var kModel = new sap.ui.model.json.JSONModel(userInfo);

						that.getView().setModel(kModel, "usersDetails");
						that.getView().getModel("usersDetails").updateBindings(true);
						that.getView().setBusy(false);
					}
				}
			});
		},
		mProgramsDetails: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-programs?populate=*&filters[id]=" + that.ObjectId,
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						that.getView().setModel(new sap.ui.model.json.JSONModel(getValues.data), "programDetails");
						that.onProjectChange(undefined, 1);
					}
				}
			});
		},
		// mProjectAreaDetail: function (projectId) {
		// 	var that = this;
		// 	return new Promise(function (resolve, reject) {
		// 		$.ajax({
		// 			url: "/OptimalCog/api/m-project-teams?populate=*&filters[m_projects][id][$eq]=" + projectId,
		// 			type: "GET",
		// 			success: function (res) {
		// 				var getValues = JSON.parse(res);
		// 				if (getValues.error) {
		// 					reject(getValues.error.message + "Something went wrong!");
		// 				} else {
		// 					that.getView().setModel(new sap.ui.model.json.JSONModel(getValues.data), "projectTeamDetail");
		// 					resolve(getValues.data);
		// 				}
		// 			},
		// 			error: function (error) {
		// 				reject(error);
		// 			}
		// 		});
		// 	});
		// },
		mProjectAreaDetail: async function (projectid) {
			var that = this;
			try {
				var res = await $.ajax({
					url: "/OptimalCog/api/m-project-teams?populate=*&filters[m_projects][id][$eq]=" + projectid,
					type: "GET"
				});
				var getValues = JSON.parse(res);
				if (getValues.error) {
					throw new Error(getValues.error.message + "Something went wrong!");
				} else {
					that.getView().setModel(new sap.ui.model.json.JSONModel(getValues.data), "projectTeamDetail");
					return getValues.data;
				}
			} catch (error) {
				throw new Error(error);
			}
		},

		onProjectChange: async function (oEvent, value) {
			var that = this;
			var selectedProject;
			if (oEvent == undefined) {
				selectedProject = value;
			} else {
				// this.projectPath = oEvent.getSource().getSelectedItem().getId().slice(-1);
				// selectedProject = this.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].Projects[this.projectPath];
				selectedProject = oEvent.getParameter("selectedItem").getProperty("key");
			}

			// Set the size limit for the model data
			this.getOwnerComponent().getModel().setSizeLimit(5000);
			$.ajax({
				url: "/OptimalCog/api/m-projects?populate=*&filters[id]=" + selectedProject,
				type: "GET",
				success: async function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						// that.getView().setModel(new sap.ui.model.json.JSONModel(getValues.data));
						var projDetail = getValues.data[0];

						//To get Nodes and Lines
						var nodes = [];
						var lines = [];
						var mainNode = {
							id: "PRG10001_0000" + projDetail.id,
							title: projDetail.attributes.name,
							// description: projDetail.attributes.description,
							team: projDetail.attributes.m_project_teams.data.length,
							status: projDetail.attributes.status,
							startDate: projDetail.startdate,
							attributes: [{
								status: projDetail.attributes.status,
								id: "PRG10001_0000" + projDetail.id
							}]
						};
						nodes.push(mainNode);
						var fixedNodes = [{
							id: "area",
							title: "Deliverables",
							team: projDetail.attributes.m_deliverables.data.length,
							supervisor: "PRG10001_0000" + projDetail.id
						}, {
							id: "assign",
							title: "Project Teams",
							team: projDetail.attributes.m_project_teams.data.length,
							supervisor: "PRG10001_0000" + projDetail.id
						}, {
							id: "org",
							title: "Organization",
							team: 4, // hard Coded Ask from Kaviya
							supervisor: "PRG10001_0000" + projDetail.id
						}, {
							id: "progSupport",
							title: "CSFS",
							team: projDetail.attributes.m_csfs.data.length,
							supervisor: "PRG10001_0000" + projDetail.id
						}];
						nodes.push(fixedNodes[0], fixedNodes[1], fixedNodes[2], fixedNodes[3]);
						var fixedNodesForCustAnVend = [{
							id: "customer",
							title: "Customers",
							team: projDetail.attributes.m_customers.data.length,
							supervisor: fixedNodes[2].id
						}, {
							id: "vendor",
							title: "Vendors",
							team: projDetail.attributes.m_vendors.data.length,
							supervisor: fixedNodes[2].id
						}];
						nodes.push(fixedNodesForCustAnVend[0], fixedNodesForCustAnVend[1]);
						var fixedLines = [{
							from: "PRG10001_0000" + projDetail.id,
							to: "area"
						}, {
							from: "PRG10001_0000" + projDetail.id,
							to: "assign"
						}, {
							from: "PRG10001_0000" + projDetail.id,
							to: "org"
						}, {
							from: "PRG10001_0000" + projDetail.id,
							to: "progSupport"
						}, {
							from: fixedNodes[2].id,
							to: "customer"
						}, {
							from: fixedNodes[2].id,
							to: "vendor"
						}];
						lines.push(fixedLines[0], fixedLines[1], fixedLines[2], fixedLines[3], fixedLines[4], fixedLines[5]);

						//To get the nodes and lines for Vendors
						projDetail.attributes.m_vendors.data.forEach(function (vendor) {
							var vendorNode = {
								id: "VDN1000" + vendor.id,
								title: vendor.attributes.vendorName,
								supervisor: fixedNodesForCustAnVend[1].id
							};
							var vendorLine = {
								from: fixedNodesForCustAnVend[1].id,
								to: "VDN1000" + vendor.id,
							};
							lines.push(vendorLine);
							nodes.push(vendorNode);
						});
						//End of get the nodes and lines for Vendors

						//To get the nodes and lines for Customers
						projDetail.attributes.m_customers.data.forEach(function (customer) {
							var customerNode = {
								id: "CUST10000" + customer.id,
								title: customer.attributes.customerName,
								supervisor: fixedNodesForCustAnVend[0].id
							};
							var customerLine = {
								from: fixedNodesForCustAnVend[0].id,
								to: "CUST10000" + customer.id,
							};
							lines.push(customerLine);
							nodes.push(customerNode);
						});
						//End of get the nodes and lines for Customers

						//To get the nodes and lines for Area's Section
						//Now we want are from projectTeams ------------------------------------mProjectAreaDetail

						// var mProjectDetails = that.mProjectAreaDetail(projDetail.id);
						that.mProjAreaDetail = await that.mProjectAreaDetail(projDetail.id);

						that.mProjAreaDetail.forEach(function (teamMember) {
							var teamMem = teamMember.attributes.users_permissions_user.data
							var teamID = teamMem.attributes.area.replace(" ", "").toLowerCase();
							var teamMemAreaLines;
							var teamMemAreaNodes;
							var teamMemAreaItemNodes;
							var teamMemAreaItemLines;
							if (teamMem.area != "") {
								//teamIdExists function will check the already created nodes in Team Member
								function teamIdExists(teamMemAreaNodesId) {
									return nodes.some(function (el) {
										return el.id === teamMemAreaNodesId;
									});
								}
								if (teamIdExists(teamID)) {
									teamMemAreaNodes = {
										id: teamID
									};
								} else {
									teamMemAreaNodes = {
										id: teamID,
										title: teamMem.attributes.area,
										team: that.mProjAreaDetail.length,
										supervisor: fixedNodes[0].id
									};
									nodes.push(teamMemAreaNodes);
								}
								teamMemAreaLines = {
									from: fixedNodes[0].id,
									to: teamMemAreaNodes.id
								};
								lines.push(teamMemAreaLines);

								teamMemAreaItemNodes = {
									id: "RNI100" + teamMem.id,
									title: teamMem.attributes.firstName + " " + teamMem.attributes.lastName,
									// title: "Mohammad" + " " + "Sohail" + " " + "khan",
									supervisor: teamMemAreaNodes.id
								};
								nodes.push(teamMemAreaItemNodes);
								teamMemAreaItemLines = {
									from: teamMemAreaNodes.id,
									to: teamMemAreaItemNodes.id
								};
								lines.push(teamMemAreaItemLines);

							}

						});
						//End of get the nodes and lines for Area's Section

						//To get the nodes and lines for Assignment(s)

						var fixedAssignmentNodes = [{
							id: "steeCom",
							title: "Steering Committees / Councils",
							team: 2,
							supervisor: fixedNodes[1].id
						}, {
							id: "progPmo",
							title: "Program/ Project PMO",
							team: 2,
							supervisor: fixedNodes[1].id
						}, {
							id: "itThird",
							title: "IT Third Party Providers",
							team: 2,
							supervisor: fixedNodes[3].id
						}, {
							id: "itAdmSup",
							title: "IT Admin & Support",
							team: 2,
							supervisor: fixedNodes[3].id
						}];
						nodes.push(fixedAssignmentNodes[0], fixedAssignmentNodes[1], fixedAssignmentNodes[2], fixedAssignmentNodes[3]);
						var fixedAssignmentLines = [{
							from: fixedNodes[1].id,
							to: fixedAssignmentNodes[0].id
						}, {
							from: fixedNodes[1].id,
							to: fixedAssignmentNodes[1].id
						}, {
							from: fixedNodes[3].id,
							to: fixedAssignmentNodes[2].id
						}, {
							from: fixedNodes[3].id,
							to: fixedAssignmentNodes[3].id
						}];
						lines.push(fixedAssignmentLines[0], fixedAssignmentLines[1], fixedAssignmentLines[2], fixedAssignmentLines[3]);
						that.mProjAreaDetail.forEach(function (teamMember) {
							var teamMem = teamMember.attributes
							var mRoleName = teamMem.mroles.data[0].attributes.roleName.toLocaleUpperCase();
							if (mRoleName == "SPONSORS" || mRoleName == "EDITORS") {
								var AssignmentNodes = {
									id: "RNI100" + teamMem.users_permissions_user.data.id,
									title: teamMem.users_permissions_user.data.attributes.firstName + " " + teamMem.users_permissions_user.data.attributes.lastName,
									supervisor: fixedAssignmentNodes[0].id
								}
								nodes.push(AssignmentNodes);

								var AssignmentLines = {
									from: fixedAssignmentNodes[0].id,
									to: AssignmentNodes.id
								};
								lines.push(AssignmentLines);
							} else if (mRoleName == "STAKEHOLDERS" || mRoleName == "PUBLISHER") {
								var AssignmentNodes = {
									id: "RNI100" + teamMem.users_permissions_user.data.id,
									title: teamMem.users_permissions_user.data.attributes.firstName + " " + teamMem.users_permissions_user.data.attributes.lastName,
									supervisor: fixedAssignmentNodes[1].id
								}
								nodes.push(AssignmentNodes);

								var AssignmentLines = {
									from: fixedAssignmentNodes[1].id,
									to: AssignmentNodes.id
								};
								lines.push(AssignmentLines);
							} else if (mRoleName == "ANALYSTS" || mRoleName ==
								"AUTHOR") {
								var AssignmentNodes = {
									id: "RNI100" + teamMem.users_permissions_user.data.id,
									title: teamMem.users_permissions_user.data.attributes.firstName + " " + teamMem.users_permissions_user.data.attributes.lastName,
									supervisor: fixedAssignmentNodes[2].id
								}
								nodes.push(AssignmentNodes);

								var AssignmentLines = {
									from: fixedAssignmentNodes[2].id,
									to: AssignmentNodes.id
								};
								lines.push(AssignmentLines);
							} else if (mRoleName == "ARCHITECTS" || mRoleName ==
								"ADMIN") {
								var AssignmentNodes = {
									id: "RNI100" + teamMem.users_permissions_user.data.id,
									title: teamMem.users_permissions_user.data.attributes.firstName + " " + teamMem.users_permissions_user.data.attributes.lastName,
									supervisor: fixedAssignmentNodes[3].id
								}
								nodes.push(AssignmentNodes);

								var AssignmentLines = {
									from: fixedAssignmentNodes[3].id,
									to: AssignmentNodes.id
								};
								lines.push(AssignmentLines);
							}
						});

						//End of get the nodes and lines for Assignment(s)
						var nodesAndLinesData = {
							nodes: nodes,
							lines: lines
						};
						that._oModel = new sap.ui.model.json.JSONModel(nodesAndLinesData);
						that._oModel.setDefaultBindingMode(sap.ui.model.BindingMode
							.OneWay);

						that._sTopSupervisor = "PRG10001_0000" + projDetail.id;
						that._mExplored = [that._sTopSupervisor];

						that._graph = that.byId("graph");
						if (that.getView().getModel() !== undefined) {
							that.getView().setModel(null);
						}
						that.getView().setModel(that._oModel);

						that._setFilter();
						that._graph.attachEvent("beforeLayouting", function (oEvent) {
							// nodes are not rendered yet (bOutput === false) so their invalidation triggers parent (graph) invalidation
							// which results in multiple unnecessary loading
							that._graph.preventInvalidation(true);
							that._graph.getNodes().forEach(function (oNode) {
								var oExpandButton, oDetailButton, oUpOneLevelButton,
									sTeamSize = that._getCustomDataValue(oNode, "team"),
									sSupervisor;

								oNode.removeAllActionButtons();

								if (!sTeamSize) {
									// employees without team - hide expand buttons
									oNode.setShowExpandButton(false);
								} else {
									if (that._mExplored.indexOf(oNode.getKey()) === -1) {
										// managers with team but not yet expanded
										// we create custom expand button with dynamic loading
										oNode.setShowExpandButton(false);

										// this renders icon marking collapse status
										oNode.setCollapsed(true);
										oExpandButton = new ActionButton({
											title: "Expand",
											icon: "sap-icon://sys-add",
											press: function () {
													oNode.setCollapsed(false);
													that._loadMore(oNode.getKey());
												}
												// }.bind(this)
										});
										oNode.addActionButton(oExpandButton);
										oDetailButton = new ActionButton({
											title: "Detail",
											icon: "sap-icon://person-placeholder",
											press: function (oEvent) {
													that._openDetail(oNode, oEvent.getParameter("buttonElement"));
												}
												// }.bind(this)
										});
										oNode.addActionButton(oDetailButton);
									} else {
										// manager with already loaded data - default expand button

										oNode.setShowExpandButton(true);
									}
								}

								// if current user is root we can add 'up one level'
								if (oNode.getKey() === that._sTopSupervisor) {
									sSupervisor = that._getCustomDataValue(oNode, "supervisor");
									if (sSupervisor) {
										oUpOneLevelButton = new ActionButton({
											title: "Up one level",
											icon: "sap-icon://arrow-top",
											press: function () {
													var aSuperVisors = oNode.getCustomData().filter(function (oData) {
															return oData.getKey() === "supervisor";
														}),
														sSupervisor = aSuperVisors.length > 0 && aSuperVisors[0].getValue();

													that._loadMore(sSupervisor);
													that._sTopSupervisor = sSupervisor;
												}
												// }.bind(this)
										});
										oNode.addActionButton(oUpOneLevelButton);
									}
								}
							});
							that._graph.preventInvalidation(false);
						});
					}
				}
			});
		},

		search: function (oEvent) {
			var sKey = oEvent.getParameter("key");

			if (sKey) {
				this._mExplored = [sKey];
				this._sTopSupervisor = sKey;
				this._graph.destroyAllElements();
				this._setFilter();

				oEvent.bPreventDefault = true;
			}
		},

		suggest: function (oEvent) {
			var aSuggestionItems = [],
				aItems = this._oModel.getData().nodes,
				aFilteredItems = [],
				sTerm = oEvent.getParameter("term");

			sTerm = sTerm ? sTerm : "";

			aFilteredItems = aItems.filter(function (oItem) {
				var sTitle = oItem.title ? oItem.title : "";
				return sTitle.toLowerCase().indexOf(sTerm.toLowerCase()) !== -1;
			});

			aFilteredItems.sort(function (oItem1, oItem2) {
				var sTitle = oItem1.title ? oItem1.title : "";
				return sTitle.localeCompare(oItem2.title);
			}).forEach(function (oItem) {
				aSuggestionItems.push(new sap.m.SuggestionItem({
					key: oItem.id,
					text: oItem.title
				}));
			});

			this._graph.setSearchSuggestionItems(aSuggestionItems);
			oEvent.bPreventDefault = true;
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		},

		_setFilter: function () {
			var that = this;
			var aNodesCond = [],
				aLinesCond = [];
			var fnAddBossCondition = function (sBoss) {
				aNodesCond.push(new sap.ui.model.Filter({
					path: 'id',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sBoss
				}));

				aNodesCond.push(new sap.ui.model.Filter({
					path: 'supervisor',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sBoss
				}));
			};

			var fnAddLineCondition = function (sLine) {
				aLinesCond.push(new sap.ui.model.Filter({
					path: "from",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sLine
				}));
			};

			// that._mExplored.forEach(function (oItem) {
			// 	fnAddBossCondition(oItem);
			// 	fnAddLineCondition(oItem);
			// });

			// that._graph.getBinding("nodes").filter(new sap.ui.model.Filter({
			// 	filters: aNodesCond,
			// 	and: false
			// }));

			// that._graph.getBinding("lines").filter(new sap.ui.model.Filter({
			// 	filters: aLinesCond,
			// 	and: false
			// }));
		},

		_loadMore: function (sName) {
			var that = this;
			that._graph.deselect();
			that._mExplored.push(sName);
			that._graph.destroyAllElements();
			that._setFilter();
		},

		_getCustomDataValue: function (oNode, sName) {
			var aItems = oNode.getCustomData().filter(function (oData) {
				return oData.getKey() === sName;
			});

			return aItems.length > 0 && aItems[0].getValue();
		},

		_openDetail: function (oNode, oButton) {
			var sTeamSize = this._getCustomDataValue(oNode, "team");

			// if (!this._oQuickView) {
			// 	Fragment.load({
			// 		name: "mdg.Org_Chart.fragment.TooltipFragment",
			// 		type: "XML"
			// 	}).then(function (oFragment) {
			// 		this._oQuickView = oFragment;
			// 		var nodes = this._oModel.getData().nodes;
			// 		var childElements = [];
			// 		nodes.forEach(function(item){
			// 			if(item.supervisor == oNode.getKey()){
			// 				var ele = {
			// 					title : item.title
			// 				};
			// 				childElements.push(ele)
			// 			}
			// 		});

			// 		this._oQuickView.setModel(new JSONModel(childElements));
			// 		// this._oQuickView.setModel(new JSONModel({
			// 		// 	icon: oNode.getImage() && oNode.getImage().getProperty("src"),
			// 		// 	title: oNode.getDescription(),
			// 		// 	description: this._getCustomDataValue(oNode, "position"),
			// 		// 	location: this._getCustomDataValue(oNode, "location"),
			// 		// 	showTeam: !!sTeamSize,
			// 		// 	teamSize: sTeamSize,
			// 		// 	email: this._getCustomDataValue(oNode, "email"),
			// 		// 	phone: this._getCustomDataValue(oNode, "phone")
			// 		// }));

			// 		setTimeout(function () {
			// 			this._oQuickView.openBy(oButton);
			// 		}.bind(this), 0);
			// 	}.bind(this));
			// } else {
			// 	var nodes = this._oModel.getData().nodes;
			// 		var childElements = [];
			// 		nodes.forEach(function(item){
			// 			if(item.supervisor == oNode.getKey()){
			// 				var ele = {
			// 					title : item.title
			// 				};
			// 				childElements.push(ele)
			// 			}
			// 		});

			// 		this._oQuickView.setModel(new JSONModel(childElements),"childModel");
			// 	// this._oQuickView.setModel(new JSONModel({
			// 	// 	icon: oNode.getImage() && oNode.getImage().getProperty("src"),
			// 	// 	title: oNode.getDescription(),
			// 	// 	description: this._getCustomDataValue(oNode, "position"),
			// 	// 	location: this._getCustomDataValue(oNode, "location"),
			// 	// 	showTeam: !!sTeamSize,
			// 	// 	teamSize: sTeamSize,
			// 	// 	email: this._getCustomDataValue(oNode, "email"),
			// 	// 	phone: this._getCustomDataValue(oNode, "phone")
			// 	// }));

			// 	setTimeout(function () {
			// 		this._oQuickView.openBy(oButton);
			// 	}.bind(this), 0);
			// }

			if (!this.detailNode) {
				this.detailNode = sap.ui.xmlfragment("mdg.Org_Chart.fragment.TooltipFragment", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.detailNode);
			}
			var nodes = this._oModel.getData().nodes;
			var childElements = [];
			nodes.forEach(function (item) {
				if (item.supervisor == oNode.getKey()) {
					var ele = {
						title: item.title,
						header: item.supervisor
					};
					childElements.push(ele);
				}
			});

			var childElements = new JSONModel(childElements);
			this.detailNode.setModel(childElements)

			this.detailNode.open();
		},
		onDetailNodeClose: function () {
			this.detailNode.close();
		},

		linePress: function (oEvent) {
			oEvent.bPreventDefault = true;
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
			this.getOwnerComponent().getRouter().navTo("master", {
				AddCust: "AddCust"
			});
		},
		// onExport: function (oEvent) {
		// 	var oTarget = this.getView().byId("graph"),
		// 		$domTarget = oTarget.$()[0],
		// 		sTargetContent = $domTarget.innerHTML;
		// 	var printWindow = window.open("", "", "height=800,width=800");
		// 	// Constructing the report window for printing
		// 	printWindow.document.write("<html><head><title></title>");
		// 	printWindow.document.write("<link rel='stylesheet' href='applications/Manage_Programs/webapp/css/style.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/layout/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/unified/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/ui/table/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/suite/ui/commons/themes/sap_belize_plus/library.css'>"
		// 	);
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/m/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/tnt/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/f/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write(
		// 		"<link rel='stylesheet' href='https://sapui5.hana.ondemand.com/resources/sap/viz/themes/sap_belize_plus/library.css'>");
		// 	printWindow.document.write('</head><body >');
		// 	printWindow.document.write(sTargetContent);
		// 	printWindow.document.write('</body></html>');
		// 	// Giving time for rendering the page
		// 	setTimeout(function () {
		// 		printWindow.print();
		// 	}, 2000);
		// 	// Automatically closing the preview window once the user has pressed the "Print" or, "Cancel" button.
		// 	printWindow.onafterprint = function () {
		// 		setTimeout(function () {
		// 			printWindow.close();
		// 		}, 4000);
		// 	};
		// },

		onExport: function (oEvent) {

			var oData, oSheet;

			oData = this.getOwnerComponent().getModel("projectInfo").getData().programs[this.sPath].RACI[0].RaciItems;
			oSheet = new sap.ui.export.Spreadsheet({
				workbook: {
					columns: this.createColumnsOrg()
				},
				dataSource: oData,
				fileName: "Org_Chart.xlsx"
			});
			oSheet.build();

		},
		createColumnsOrg: function () {

		},
		handleSubmitOrgChart: function (oEvent) {
			//	var initialStatus = this.getOwnerComponent().getModel("projectInfo").getData().programs[this.sPath].Status;
			var initialStatus = this.getView().getModel("programDetails").getData()[0].attributes.m_org_chart.data.attributes.status
			if (initialStatus !== "Submitted") {
				var that = this;

				this.valueHelpForConfirmation.open();
			} else {
				sap.m.MessageToast.show("Org Chart  is already submitted.");
			}
		},
		handleSubmitwithApproverConfirm: function () {
			var that = this;
			var selectedKey = this.valueHelpForConfirmation.getContent()[0].getContent()[3].getSelectedKey();
			if (selectedKey.length == 0) {
				sap.m.MessageToast.show("Please select the approver");
				this.valueHelpForConfirmation.getContent()[0].getContent()[3].setValueState("Error");
			} else {
				// that.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].Status = "Submitted";
				// that.getOwnerComponent().getModel("projectInfo").updateBindings(true);
				var status = that.getView().getModel("programDetails").getData()[0].attributes.m_org_chart.data.attributes.status;
				that.programStatusSubmit("Submitted");
				that.getView().byId("submitButtonId").setVisible(false);
				sap.m.MessageToast.show(that.oBundle.getText("OrgSubmittedSucessfully"), {
					closeOnBrowserNavigation: false
				});
				this.valueHelpForConfirmation.close();
			}

		},
		handleApproveCancel: function () {
			this.valueHelpForConfirmation.close();
		},
		handleSelectChange: function () {
			this.valueHelpForConfirmation.getContent()[0].getContent()[3].setValueState("None");
		},
		handleApproveButtonPress: function () {
			var that = this;
			sap.m.MessageBox.confirm("Do you want to approve the request?", function (oEvent) {
				if (oEvent = "OK") {
					// that.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].Status = "Approved";
					// that.getOwnerComponent().getModel("projectInfo").updateBindings(true);
					//	programDetails
					var status = that.getView().getModel("programDetails").getData()[0].attributes.m_org_chart.data.attributes.status;
					//	that.programStatus("Approved");
					that.programStatusApprove("Approved");

					that.getView().byId("approveButtonId").setVisible(false);
					that.getView().byId("rejectButtonId").setVisible(false);
					// sap.m.MessageToast.show(that.oBundle.getText("OrgChartApprove"), {
					// 	closeOnBrowserNavigation: false
					// });

					this.valueHelpForConfirmation.close();
				}
			});
		},
		programStatusApprove: function (result) {
			var that = this;
			that.status = result;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var that = this;
			var raciUrl = "/OptimalCog/api/m-programs/" + that.ObjectId + "?populate[0]=m_org_chart";
			$.ajax({
				url: raciUrl,
				method: "GET",
				success: function (response) {
					// Step 3: Loop through the retrieved RACI models and update their status to "Draft"
					var response = JSON.parse(response);

					var raciModels = response.data.attributes.m_org_chart.data;
					//	for (var i = 0; i < raciModels.length; i++) {
					//	var raciModel = raciModels[i];
					raciModels.attributes.status = result;
					var statusPayload = {
						"status": result
					}

					// Step 4: Update the RACI model
					var updateUrl = "OptimalCog/api/m-org-charts/" + raciModels.id;
					$.ajax({
						url: updateUrl,
						method: "PUT",
						headers: {
							"Content-Type": "application/json"
						},

						data: JSON.stringify({
							"data": statusPayload
						}),

						success: function (response) {

							//	that.selectedObjectRaci;
							sap.m.MessageToast.show("Organization Chart Approved.")
							that.valueHelpForConfirmation.close();
						},

					});
					//	}
				},

			});

		},
		programStatusSubmit: function (result) {
			var that = this;
			that.status = result;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var that = this;
			var raciUrl = "/OptimalCog/api/m-programs/" + that.ObjectId + "?populate[0]=m_org_chart";
			$.ajax({
				url: raciUrl,
				method: "GET",
				success: function (response) {
					// Step 3: Loop through the retrieved RACI models and update their status to "Draft"
					var response = JSON.parse(response);

					var raciModels = response.data.attributes.m_org_chart.data;
					//	for (var i = 0; i < raciModels.length; i++) {
					//	var raciModel = raciModels[i];
					raciModels.attributes.status = result;
					var statusPayload = {
						"status": result
					}

					// Step 4: Update the RACI model
					var updateUrl = "OptimalCog/api/m-org-charts/" + raciModels.id;
					$.ajax({
						url: updateUrl,
						method: "PUT",
						headers: {
							"Content-Type": "application/json"
						},

						data: JSON.stringify({
							"data": statusPayload
						}),

						success: function (response) {

							//	that.selectedObjectRaci;
							sap.m.MessageToast.show("Organization Chart Submitted.")
							that.valueHelpForConfirmation.close();
						},

					});
					//	}
				},

			});

		},
		programStatusReject: function (result) {
			var that = this;
			that.status = result;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var that = this;
			var raciUrl = "/OptimalCog/api/m-programs/" + that.ObjectId + "?populate[0]=m_org_chart";
			$.ajax({
				url: raciUrl,
				method: "GET",
				success: function (response) {
					// Step 3: Loop through the retrieved RACI models and update their status to "Draft"
					var response = JSON.parse(response);

					var raciModels = response.data.attributes.m_org_chart.data;
					//	for (var i = 0; i < raciModels.length; i++) {
					//	var raciModel = raciModels[i];
					raciModels.attributes.status = result;
					var statusPayload = {
						"status": result
					}

					// Step 4: Update the RACI model
					var updateUrl = "OptimalCog/api/m-org-charts/" + raciModels.id;
					$.ajax({
						url: updateUrl,
						method: "PUT",
						headers: {
							"Content-Type": "application/json"
						},

						data: JSON.stringify({
							"data": statusPayload
						}),

						success: function (response) {

							//	that.selectedObjectRaci;
							sap.m.MessageToast.show("Organization Chart Rejected.")
							that.valueHelpForConfirmation.close();
						},

					});
					//	}
				},

			});
		},
		handleRejectButtonPress: function () {
			var that = this;
			sap.m.MessageBox.confirm("Do you want to reject the request?", function (oEvent) {
				if (oEvent = "OK") {
					// that.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].Status = "Rejected";
					// that.getView().getModel("").updateBindings(true);
					var status = that.getView().getModel("programDetails").getData()[0].attributes.m_org_chart.data.attributes.status;
					that.programStatusReject("Rejected");
					that.getView().byId("approveButtonId").setVisible(false);
					that.getView().byId("rejectButtonId").setVisible(false);
					sap.m.MessageToast.show(that.oBundle.getText("OrgChartReject"), {
						closeOnBrowserNavigation: false
					});
					this.valueHelpForConfirmation.close();
				}
			});
		},

		programStatus: function (status) {
			var that = this;
			// var modelData = this.getView().getModel().getData().attributes;
			var modelDataArchive = {
				"m_program": [Number(that.ObjectId)],
				"users_permissions_users": [that.getOwnerComponent().getModel("loggedOnUserModel").getData().id],
				"status": status
			};
			$.ajax({
				url: "/OptimalCog/api/m-org-charts",
				type: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				data: JSON.stringify({
					"data": modelDataArchive
				}),
				success: function (res) {
					var getValues = JSON.parse(res);
					console.log(getValues.error);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
					} else {
						that.getView().getModel().updateBindings(true);
						that.onCloseDetailPress();
					}
				}
			});
		}

	});

});