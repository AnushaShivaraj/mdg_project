sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox"
	],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox) {
		"use strict";

		return Controller.extend("MDG.Report.controller.dashboard", {
			onInit: function () {

				var that = this;
				this.select = false;
				var chartIds = ["chartContainer0", "chartContainer1", "chartContainer2"];
				for (var i = 0; i < chartIds.length; i++) {
					this.getView().byId(chartIds[i])._oChartTitle.attachBrowserEvent("click", function (evt) {
						that.getView().setBusy(true);
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("drildown", {
							selectedKPI: evt.target.textContent
						});
						that.getView().setBusy(false);
					});
				}
				that.StaticProgramModel();
				that.programMainModel();

				var oModel = new sap.ui.model.json.JSONModel({
					"programLength": 0,
					"projectLength": 0,
					"taskLength": 0,
				});
				this.getView().setModel(oModel, "modelLength");

				var oModelStatus = new sap.ui.model.json.JSONModel({
					"New": 0,
					"In-Progress": 0,
					"Completed": 0,
					"Cancelled": 0,
					"Archived": 0
				});
				this.getView().setModel(oModelStatus, "modelProjectStatus");

			},

			programMainModel: function () {
				var that = this;
				$.get('OptimalCog/api/m-programs?populate=*', function (response) {
					console.log(response);
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprogramsmmodel");
					that.statusPiePrograms();
					that.programLength();

				});
			},
			StaticProgramModel: function () {
				var that = this;
				$.get('OptimalCog/api/m-programs', function (response) {
					console.log(response);
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "StaticProgramModel");

				});
			},
			onKpiLinkPressProject: function (evt) {
				var that = this;
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();
				// oRouter.navTo("drilldown", {
				//     selectedKPI: pressedLinkText
				// }
				// );
				//f
				//var oComponent = this.getOwnerComponent();

				// Get the model data from the component
				var oModel = that.getView().getModel("mprogramsmmodel");
				var oData = oModel.getData();
				var ChecUrl = JSON.stringify(oData);
				// Navigate to the drilldown view and pass the model data as a parameter
				//var oRouter = oComponent.getRouter();
				oRouter.navTo("drildown", {
					data: ChecUrl,
					selectedKPI: pressedLinkText
				});

			},
			OnResetPress: function () {

				this.onInit();

				this.getView().getModel("mprogramsmmodel").updateBindings(true);

			},

			onKpiLinkPress: function (evt) {
				var that = this;
				var oData = JSON.stringify(this.getView().getModel("StaticProgramModel").getData());
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();

				oRouter.navTo("drildown", {
					data: oData,
					selectedKPI: pressedLinkText
				});

				this.getView().getModel("StaticProgramModel").updateBindings(true);
			},
			onKpiLinkPressTasks: function (evt) {
				var that = this;
				var oData = this.getView().getModel("mprogramsmmodel").getData();
				var ChecUrl = JSON.stringify(oData);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();
				oRouter.navTo("drildown", {
					data: ChecUrl,
					selectedKPI: pressedLinkText
				});
				//  );
				//this.getView().getModel("mprogramsmmodel").updateBindings(true);
			},
			programLength: function (oEvent) {
				var that = this;

				var n = this.getView().getModel("mprogramsmmodel").getData();
				that.mPrograms = n.length;
				that.getView().getModel("modelLength").getData().programLength = that.mPrograms;
				that.getView().getModel("modelLength").updateBindings(true);
				that.getView().setModel(new sap.ui.model.json.JSONModel("mPrograms"));

			},
			onAllStatus: function (evt) {

				var that = this;
				//  debugger
				var Program = this.getView().byId("programId").getSelectedKey();
				// var Program = this.getView().byId("programId").getSelectedKey();
				// var Status = this.getView().byId("prgStatusId").getSelectedKey("New");
				$.ajax({

					url: "/OptimalCog/api/m-programs?populate[0]=m_projects.m_csfs&filters[id]=" + JSON.parse(Program),
					type: "GET",
					success: function (res) {
						this.select = true;
						var response = JSON.parse(res);

						var data = response.data[0].attributes.m_projects.data;

						var arr = [];
						var taskDetails = [];
						var totalTaskLength = 0;
						for (var i = 0; i < data.length; i++) {
							var csfs = data[i].attributes.m_csfs.data;
							totalTaskLength += csfs.length;
							var task = [];

							for (var j = 0; j < csfs.length; j++) {
								var task = {
									"projectName": data[i].attributes.name,
									"name": csfs[j].attributes.name,
									"description": csfs[j].attributes.description,
									"progress": csfs[j].attributes.progress,
									"startDate": csfs[j].attributes.startDate,
									"endDate": csfs[j].attributes.endDate
								};
								taskDetails.push(task);
							}

							arr.push({
								"projectID": data[i].attributes.projectID,
								"name": data[i].attributes.name,
								"startDate": data[i].attributes.startDate,
								"endDate": data[i].attributes.endDate,
								"status": data[i].attributes.status,
								"description": data[i].attributes.description,
								"projectLength": data.length,
								"taskLength": totalTaskLength,
								"tasks": taskDetails
							});
						}
						that.statusPieProjectsAll(arr[0].status);
						that.projectReceivedAll(arr[0].startDate);
						that.projectLengthAll(arr[0].projectLength);
						that.taskLengthAll(totalTaskLength);
						that.getView().getModel("mprogramsmmodel").oData = arr;
						that.getView().getModel("mprogramsmmodel").updateBindings(true);

					},

					error: function (res) {
						console.log(res);
					}
				});
			},

			onGoPress: function (oEvent) {
				var that = this;
				//  debugger
				var Program = this.getView().byId("programId").getSelectedKey();
				var Status = this.getView().byId("prgStatusId").getSelectedKey();
				$.ajax({

					// url:  "/OptimalCog/api/m-projects?populate=*&filters[status][$eq]=New&filters[m_program][id][$eq]=" + JSON.parse(this.Program) ,//KAVYA

					//  url: "/OptimalCog/api/m-programs?populate=*&filters[id]=" + JSON.parse(Program) + "&filters[m_projects][status]=" + Status,
					url: "/OptimalCog/api/m-programs?filters[id]=" + JSON.parse(Program) + "&populate[0]=m_projects&filters[m_projects][status]=" +
						Status + "&populate[1]=m_projects.m_csfs",
					type: "GET",
					success: function (res) {

						// this.select = true;
						// var response = JSON.parse(res);
						// console.log(response);
						// var data = response.data[0].attributes.m_projects.data;
						// var arr = [];
						// for (var i = 0; i < data.length; i++) {
						//     arr.push({
						//         "projectID": data[i].attributes.projectID,
						//         "name": data[i].attributes.name,
						//         "startDate": data[i].attributes.startDate,
						//         "endDate": data[i].attributes.endDate,
						//         "description":data[i].attributes.description,
						//         "status": data[i].attributes.status,
						//         "projectLength": data.length,
						//         "taskLength": data.length,

						//     })
						// }
						// that.statusPieProjects(arr[0].status);
						// that.projectReceived(arr[0].startDate);
						// that.projectLength(arr[0].projectLength);
						// that.taskLength(arr[0].taskLength);
						// that.getView().getModel("mprogramsmmodel").oData = arr;
						// that.getView().getModel("mprogramsmmodel").updateBindings(true);
						this.select = true;
						var response = JSON.parse(res);
						if (response.data.length === 0) {
							MessageBox.error("Program with this Status is not Available");
						} else {

							var data = response.data[0].attributes.m_projects.data;
							var arr = [];
							var taskDetails = [];
							var totalTaskLength = 0;
							for (var i = 0; i < data.length; i++) {
								var csfs = data[i].attributes.m_csfs.data;
								totalTaskLength += csfs.length;
								var task = [];

								for (var j = 0; j < csfs.length; j++) {
									var task = {
										"projectName": data[i].attributes.name,
										"name": csfs[j].attributes.name,
										"description": csfs[j].attributes.description,
										"progress": csfs[j].attributes.progress,
										"startDate": csfs[j].attributes.startDate,
										"endDate": csfs[j].attributes.endDate
									};
									taskDetails.push(task);
								}

								arr.push({
									"projectID": data[i].attributes.projectID,
									"name": data[i].attributes.name,
									"startDate": data[i].attributes.startDate,
									"endDate": data[i].attributes.endDate,
									"status": data[i].attributes.status,
									"description": data[i].attributes.description,
									"projectLength": data.length,
									"taskLength": totalTaskLength,
									"tasks": taskDetails
								});
							}
							that.statusPieProjects(arr[0].status);
							that.projectReceived(arr[0].startDate);
							that.projectLength(arr[0].projectLength);
							that.taskLength(totalTaskLength);
							that.getView().getModel("mprogramsmmodel").oData = arr;
							that.getView().getModel("mprogramsmmodel").updateBindings(true);
						}
					},
					//  },
					error: function (res) {
						console.log(res);
					}
				});
			},
			onChangeSelect: function (oEvent) {
				debugger
				var Program = oEvent.getSource().getSelectedItem().getKey();

			},
			onChangeSelStatus: function (oEvent) {
				this.Status = oEvent.getParameter("selectedItem").getProperty("key");
			},
			projectLength: function (response) {
				var that = this;
				this.mProjects = response;
				that.getView().getModel("modelLength").getData().projectLength = that.mProjects;
				that.getView().getModel("modelLength").updateBindings(true);

			},
			taskLength: function (response) {
				var that = this;
				this.mProjects = response;
				that.getView().getModel("modelLength").getData().taskLength = that.mProjects;
				that.getView().getModel("modelLength").updateBindings(true);

			},
			statusPiePrograms: function () {
				var that = this;
				$.ajax({
					url: "/OptimalCog/api/m-programs",
					type: "GET",
					success: function (res) {
						console.log(response);
						var status_counts = that.getView().getModel("modelProjectStatus").getData();
						var response = JSON.parse(res);
						console.log(response);
						var reslen = that.getView().getModel("mprogramsmmodel").getData();
						for (var i = 0; i < reslen.length; i++) {
							var status = reslen[i].attributes.status;
							if (!status_counts[status]) {
								status_counts[status] = 1;
							} else {
								status_counts[status]++;
							}
						}

						var chartData = [];
						for (var status in status_counts) {
							chartData.push({
								status: status,
								count: status_counts[status]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartstatuspie");
						that.getView().getModel("mreportchartstatuspie").updateBindings(true);
						//that.projectReceived();
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			statusPieProjects: function (status) {
				var that = this;
				var Program = this.getView().byId("programId").getSelectedKey();
				var Status = this.getView().byId("prgStatusId").getSelectedKey();
				if (!this.select) {
					var urlLink = "/OptimalCog/api/m-programs?populate=*";
				} else {
					urlLink = "/OptimalCog/api/m-programs?populate=*&filters[id]=" + JSON.parse(Program) + "&filters[m_projects][status]=" + Status +
						projectData;
					//  /OptimalCog/api/m-programs?populate=*&filters[status]=
				}
				$.ajax({
					// url: "/OptimalCog/api/m-programs?populate=*"  ,
					url: urlLink,
					type: "GET",
					success: function (res) {
						console.log(response);
						//  debugger
						var status_counts = {
							New: 0,
							InProgress: 0,
							Completed: 0,
							Cancelled: 0,
							Archived: 0
						};
						//var status_counts = that.getView().getModel("modelProjectStatus").getData();
						var response = JSON.parse(res);
						console.log(response);

						// var reslen = that.getView().getModel("mprogramsmmodel").getData();
						var reslen = that.getView().getModel("mprogramsmmodel").getData();

						//   create array and store all status
						//     for loop 
						//  esle - take array of sttus and bind
						var projectData = [];
						//  var stat = reslen[i].status;
						// if( === Status ){
						for (var i = 0; i < reslen.length; i++) {
							if (reslen[i].status === Status) {
								projectData.push(reslen[i].status);
							}
						}
						//  console.log("m")
						// }
						// for (var i = 0; i < reslen.length; i++) {
						//     projectData.push(reslen[i].status);
						// }
						// debugger
						for (var i = 0; i < reslen.length; i++) {
							var status = reslen[i].status;
							if (reslen[i].status === Status) {
								if (!status_counts[status]) {
									status_counts[status] = 1;
								} else {
									status_counts[status]++;
								}
							}
						}

						var chartData = [];
						for (var status in status_counts) {
							chartData.push({
								status: status,
								count: status_counts[status]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mprogramsmcmodel");
						that.getView().getModel("mprogramsmcmodel").updateBindings(true);
						//that.projectReceived();
					},
					error: function (err) {
						console.error(err);
					}
				});

			},
			projectReceived: function (status) {

				var that = this;
				if (!this.select) {
					var urlLink = "/OptimalCog/api/m-programs?populate=*";
				} else {
					urlLink = "/OptimalCog/api/m-programs?populate=*&filters[startDate]=" + projectData;

				}
				$.ajax({
					// url: "/OptimalCog/api/m-programs?populate=*"  ,
					url: urlLink,
					type: "GET",
					success: function (res) {
						console.log(response);
						//   debugger

						var month_counts = {
							Jan: 0,
							Feb: 0,
							Mar: 0,
							Apr: 0,
							May: 0,
							Jun: 0,
							Jul: 0,
							Aug: 0,
							Sep: 0,
							Oct: 0,
							Nov: 0,
							Dec: 0

						};
						var response = JSON.parse(res);
						console.log(response);

						// var reslen = that.getView().getModel("mprogramsmmodel").getData();
						var reslen = that.getView().getModel("mprogramsmmodel").getData();

						//   create array and store all status
						//     for loop 
						//  esle - take array of sttus and bind
						var projectData = [];
						for (var i = 0; i < reslen.length; i++) {
							projectData.push(reslen[i].startDate);
						}
						// debugger
						for (var i = 0; i < reslen.length; i++) {
							var startDate = reslen[i].startDate;
							var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "MMM"
							});
							var oDate = new Date(startDate);
							var sMonthName = oDateFormat.format(oDate);
							if (!month_counts[sMonthName]) {
								month_counts[sMonthName] = 1;
							} else {
								month_counts[sMonthName]++;
							}
						}

						var chartData = [];
						for (var sMonthName in month_counts) {
							chartData.push({
								sMonthName: sMonthName,
								count: month_counts[sMonthName]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartmonth");
						that.getView().getModel("mreportchartmonth").updateBindings(true);
						//that.projectReceived();
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			//ALL
			projectLengthAll: function (response) {
				var that = this;
				this.mProjects = response;
				that.getView().getModel("modelLength").getData().projectLength = that.mProjects;
				that.getView().getModel("modelLength").updateBindings(true);

			},
			taskLengthAll: function (response) {
				var that = this;
				this.mProjects = response;
				that.getView().getModel("modelLength").getData().taskLength = that.mProjects;
				that.getView().getModel("modelLength").updateBindings(true);

			},
			statusPieProjectsAll: function (status) {
				var that = this;
				if (!this.select) {
					var urlLink = "/OptimalCog/api/m-programs?populate=*";
				} else {
					urlLink = "/OptimalCog/api/m-programs?populate=*&filters[status]=" + projectData;

				}
				$.ajax({
					// url: "/OptimalCog/api/m-programs?populate=*"  ,
					url: urlLink,
					type: "GET",
					success: function (res) {
						console.log(response);
						//  debugger
						var status_counts = {
							New: 0,
							InProgress: 0,
							Completed: 0,
							Cancelled: 0,
							Archived: 0
						};
						//var status_counts = that.getView().getModel("modelProjectStatus").getData();
						var response = JSON.parse(res);
						console.log(response);

						// var reslen = that.getView().getModel("mprogramsmmodel").getData();
						var reslen = that.getView().getModel("mprogramsmmodel").getData();

						//   create array and store all status
						//     for loop 
						//  esle - take array of sttus and bind
						var projectData = [];
						for (var i = 0; i < reslen.length; i++) {
							projectData.push(reslen[i].status);
						}
						// debugger
						for (var i = 0; i < reslen.length; i++) {
							var status = reslen[i].status;
							if (!status_counts[status]) {
								status_counts[status] = 1;
							} else {
								status_counts[status]++;
							}
						}

						var chartData = [];
						for (var status in status_counts) {
							chartData.push({
								status: status,
								count: status_counts[status]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mprogramsmcmodel");
						that.getView().getModel("mprogramsmcmodel").updateBindings(true);
						//that.projectReceived();
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			projectReceivedAll: function (status) {
				var that = this;
				if (!this.select) {
					var urlLink = "/OptimalCog/api/m-programs?populate=*";
				} else {
					urlLink = "/OptimalCog/api/m-programs?populate=*&filters[startDate]=" + projectData;

				}
				$.ajax({
					// url: "/OptimalCog/api/m-programs?populate=*"  ,
					url: urlLink,
					type: "GET",
					success: function (res) {
						console.log(response);
						//   debugger

						var month_counts = {
							Jan: 0,
							Feb: 0,
							Mar: 0,
							Apr: 0,
							May: 0,
							Jun: 0,
							Jul: 0,
							Aug: 0,
							Sep: 0,
							Oct: 0,
							Nov: 0,
							Dec: 0

						};
						var response = JSON.parse(res);
						console.log(response);

						// var reslen = that.getView().getModel("mprogramsmmodel").getData();
						var reslen = that.getView().getModel("mprogramsmmodel").getData();

						//   create array and store all status
						//     for loop 
						//  esle - take array of sttus and bind
						var projectData = [];
						for (var i = 0; i < reslen.length; i++) {
							projectData.push(reslen[i].startDate);
						}
						// debugger
						for (var i = 0; i < reslen.length; i++) {
							var startDate = reslen[i].startDate;
							var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "MMM"
							});
							var oDate = new Date(startDate);
							var sMonthName = oDateFormat.format(oDate);
							if (!month_counts[sMonthName]) {
								month_counts[sMonthName] = 1;
							} else {
								month_counts[sMonthName]++;
							}
						}

						var chartData = [];
						for (var sMonthName in month_counts) {
							chartData.push({
								sMonthName: sMonthName,
								count: month_counts[sMonthName]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartmonth");
						that.getView().getModel("mreportchartmonth").updateBindings(true);
						//that.projectReceived();
					},
					error: function (err) {
						console.error(err);
					}
				});
			}
		});
	});