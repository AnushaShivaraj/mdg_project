sap.ui.define([

	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	'sap/m/MessageToast'

], function (Controller, JSONModel, exportLibrary, Spreadsheet, MessageToast) {

	"use strict";
	var EdmType = exportLibrary.EdmType;

	return Controller.extend("MDG.Report.controller.drildown", {

		onInit: function () {

			var that = this;
			// var sampleDatajson = new sap.ui.model.json.JSONModel("model/report.json");
			// this.getView().setModel(sampleDatajson);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("drildown").attachPatternMatched(this._objMatched, this);
		},

		onBackButtonPress: function () {

			this.getOwnerComponent().getRouter().navTo("dashboard");
		},

		ModelProjectReport: function () {
			var that = this;
			$.get("/OptimalCog/api/m-projects?populate=*", function (response) {
				response = JSON.parse(response);
				//	debugger
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mProjectReport");
			})
		},
		ModelTaskReport: function () {
			var that = this;
			$.get("/OptimalCog/api/m-csfs?populate=*", function (response) {
				response = JSON.parse(response);
				//	debugger
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mTaskReport");
			})
		},
		ModelProjectNumberReport: function () {
			var that = this;
			$.get("/OptimalCog/api/m-projects?populate=*", function (response) {
				response = JSON.parse(response);
				//	debugger
				var details = that.getView().getModel().getData();
				for (var i = 0; i <= details.lenght; i++) {
					var detal = details[i].attributes.startDate;
				}
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mNoOfProject");
			})
		},
		_objMatched: function (oEvent) {
			var that = this;
			//oEvent.getParameter("arguments").Fdata;
			//oEvent.getParameter("arguments").selectedKPI;
			// $.get('OptimalCog/api/m-projects?populate=*', function (response) {
			// 	console.log(response);
			// 	response = JSON.parse(response);
			// 	var oModel = new sap.ui.model.json.JSONModel(response.data);
			// 	that.getView().setModel(oModel, "mprojectsreceivedcount");
			// 	//that.projectReceived();
			// });

			$.get("/OptimalCog/api/m-programs?populate=*", function (response) {
				response = JSON.parse(response);
				//that.getView().getModel().getData();
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mProgramReport");
			})

			// that.ModelProjectReport();
			// that.ModelTaskReport();
			//var oData = oEvent.getParameter("arguments").Fdata;
			var oData = JSON.parse(oEvent.getParameter("arguments").data);
			var oModel = new sap.ui.model.json.JSONModel(oData);
			this.getView().setModel(oModel, "mProjectReport");
			this.Title = oEvent.getParameter("arguments").selectedKPI;
			if (this.Title == "Total Programs") {
				this.getView().byId("drilldownTitleId").setText(this.Title);
				this.getView().byId("drillDownTableIdprograms").setVisible(true);
				this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);

			}
			if (this.Title == "Total Projects") {
				this.getView().byId("drilldownTitleId").setText(this.Title);
				this.getView().byId("drillDownTableIdproject").setVisible(true);
				this.getView().byId("drillDownTableIdprograms").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
			}
			if (this.Title == "Total Tasks") {
				this.getView().byId("drilldownTitleId").setText(this.Title);
				this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(true);
				this.getView().byId("drillDownTableIdprograms").setVisible(false);
			}

		},
		projectReceived: function () {
			var that = this;

			$.ajax({
				url: "/OptimalCog/api/m-projects",
				type: "GET",
				success: function (res) {
					//debugger
					console.log(response);
					var month_counts = that.getView().getModel("modelProjectReceived").getData();
					var response = JSON.parse(res);
					console.log(response);

					var reslen = that.getView().getModel("mprojectsreceivedcount").getData();
					for (var i = 0; i < reslen.length; i++) {
						var startDate = reslen[i].attributes.startDate;
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

						var chartData = [];
						for (var sMonthName in month_counts) {
							chartData.push({
								status: sMonthName,
								count: month_counts[sMonthName]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartmonth");
						that.getView().getModel("mreportchartmonth").updateBindings(true);

					}

				},
				error: function (err) {
					console.error(err);
				}
			});
		},
		onExportProgram: function () {
			//	debugger
			var oData = this.getView().getModel("mProgramReport").getData();
			var aColumns = this.createColumnsProgram();
			var oSettings = {
				workbook: {
					columns: aColumns
				},
				dataSource: oData,
				fileName: "Programs.xlsx"
			};
			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
			oSpreadsheet.build();
		},
		createColumnsProgram: function () {
			return [{
				label: "Program Name",
				property: "attributes/name"
			}, {
				label: "Description",
				property: "attributes/description"
			}, {
				label: "StartDate",
				property: "attributes/startDate"
			}, {
				label: "EndDate",
				property: "attributes/endDate"
			}, {
				label: "Status",
				property: "attributes/status"
			}];
		},
		onExportproject: function () {
			//debugger
			var oData = this.getView().getModel("mProjectReport").getData();
			var aColumns = this.createColumnsProjects();
			var oSettings = {
				workbook: {
					columns: aColumns
				},
				dataSource: oData,
				fileName: "Projects.xlsx"
			};
			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
			oSpreadsheet.build();
		},
		createColumnsProjects: function () {
			return [{
				label: "Project Name",
				property: "name"
			}, {
				label: "Description",
				property: "description"
			}, {
				label: "StartDate",
				property: "startDate"
			}, {
				label: "EndDate",
				property: "endDate"
			}, {
				label: "Status",
				property: "status"
			}];
		},

		onExportprojecttask: function () {

			var oData = this.getView().getModel("mProjectReport").getData()[0].tasks;

			var aColumns = this.createColumnsTasks();

			var oSettings = {
				workbook: {
					columns: aColumns
				},
				dataSource: oData,
				fileName: "Tasks.xlsx"
			};
			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
			oSpreadsheet.build();
		},
		createColumnsTasks: function () {
			return [{
				label: "Task Name",
				property: "name"
			}, {
				label: "Description",
				property: "description"
			}, {
				label: "StartDate",
				property: "startDate"
			}, {
				label: "EndDate",
				property: "endDate"
			}, {
				label: "Progress",
				property: "progress"
			}];
		},

	});
});
// sap.ui.define([

// 	"sap/ui/core/mvc/Controller",
// 	'sap/ui/model/json/JSONModel',
// 	'sap/ui/export/library',
// 	'sap/ui/export/Spreadsheet',
// 	'sap/m/MessageToast'

// ], function (Controller, JSONModel, exportLibrary, Spreadsheet, MessageToast) {

// 	"use strict";
// 	var EdmType = exportLibrary.EdmType;

// 	return Controller.extend("MDG.Report.controller.drildown", {

// 		onInit: function () {

// 			var that = this;
// 			var sampleDatajson = new sap.ui.model.json.JSONModel("model/report.json");
// 			this.getView().setModel(sampleDatajson);
// 			sap.ui.core.UIComponent.getRouterFor(this).getRoute("drildown").attachPatternMatched(this._objMatched, this);
// 		},

// 		onBackButtonPress: function () {

// 			this.getOwnerComponent().getRouter().navTo("dashboard");
// 		},

// 		ModelProjectReport: function () {
// 			var that = this;
// 			$.get("/OptimalCog/api/m-projects?populate=*", function (response) {
// 				response = JSON.parse(response);

// 				var oModel = new sap.ui.model.json.JSONModel(response.data);
// 				that.getView().setModel(oModel, "mProjectReport");
// 			})
// 		},
// 		ModelTaskReport: function () {
// 			var that = this;
// 			$.get("/OptimalCog/api/m-csfs?populate=*", function (response) {
// 				response = JSON.parse(response);

// 				var oModel = new sap.ui.model.json.JSONModel(response.data);
// 				that.getView().setModel(oModel, "mTaskReport");
// 			})
// 		},
// 		ModelProjectNumberReport: function () {
// 			var that = this;
// 			$.get("/OptimalCog/api/m-projects?populate=*", function (response) {
// 				response = JSON.parse(response);

// 				var details = that.getView().getModel().getData();
// 				for (var i = 0; i <= details.lenght; i++) {
// 					var detal = details[i].attributes.startDate;
// 				}
// 				var oModel = new sap.ui.model.json.JSONModel(response.data);
// 				that.getView().setModel(oModel, "mNoOfProject");
// 			})
// 		},
// 		_objMatched: function (oEvent) {
// 			var that = this;
// 			$.get('OptimalCog/api/m-projects?populate=*', function (response) {
// 				console.log(response);
// 				response = JSON.parse(response);
// 				var oModel = new sap.ui.model.json.JSONModel(response.data);
// 				that.getView().setModel(oModel, "mprojectsreceivedcount");

// 			});

// 			$.get("/OptimalCog/api/m-programs?populate=*", function (response) {
// 				response = JSON.parse(response);
// 				that.getView().getModel().getData();
// 				var oModel = new sap.ui.model.json.JSONModel(response.data);
// 				that.getView().setModel(oModel, "mProgramReport");
// 			})

// 			that.ModelProjectReport();
// 			that.ModelTaskReport();
// 			this.Title = oEvent.getParameter("arguments").selectedKPI;
// 			if (this.Title == "Total Programs") {
// 				this.getView().byId("drilldownTitleId").setText(this.Title);
// 				this.getView().byId("drillDownTableIdprograms").setVisible(true);
// 				this.getView().byId("drillDownTableIdproject").setVisible(false);
// 				this.getView().byId("drillDownTableIdtask").setVisible(false);

// 			}
// 			if (this.Title == "Total Projects") {
// 				this.getView().byId("drilldownTitleId").setText(this.Title);
// 				this.getView().byId("drillDownTableIdproject").setVisible(true);
// 				this.getView().byId("drillDownTableIdprograms").setVisible(false);
// 				this.getView().byId("drillDownTableIdtask").setVisible(false);
// 			}
// 			if (this.Title == "Total Tasks") {
// 				this.getView().byId("drilldownTitleId").setText(this.Title);
// 				this.getView().byId("drillDownTableIdproject").setVisible(false);
// 				this.getView().byId("drillDownTableIdtask").setVisible(true);
// 				this.getView().byId("drillDownTableIdprograms").setVisible(false);
// 			}

// 		},
// 		projectReceived: function () {
// 			var that = this;

// 			$.ajax({
// 				url: "/OptimalCog/api/m-projects",
// 				type: "GET",
// 				success: function (res) {

// 					console.log(response);
// 					var month_counts = that.getView().getModel("modelProjectReceived").getData();
// 					var response = JSON.parse(res);
// 					console.log(response);

// 					var reslen = that.getView().getModel("mprojectsreceivedcount").getData();
// 					for (var i = 0; i < reslen.length; i++) {
// 						var startDate = reslen[i].attributes.startDate;
// 						var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
// 							pattern: "MMM"
// 						});
// 						var oDate = new Date(startDate);
// 						var sMonthName = oDateFormat.format(oDate);
// 						if (!month_counts[sMonthName]) {
// 							month_counts[sMonthName] = 1;
// 						} else {
// 							month_counts[sMonthName]++;
// 						}

// 						var chartData = [];
// 						for (var sMonthName in month_counts) {
// 							chartData.push({
// 								status: sMonthName,
// 								count: month_counts[sMonthName]
// 							});
// 						}
// 						var oModel = new sap.ui.model.json.JSONModel({
// 							chartData: chartData
// 						});
// 						that.getView().setModel(oModel, "mreportchartmonth");
// 						that.getView().getModel("mreportchartmonth").updateBindings(true);

// 					}

// 				},
// 				error: function (err) {
// 					console.error(err);
// 				}
// 			});
// 		},
// 		onExportProgram: function () {
// 			//	debugger
// 			var oData = this.getView().getModel("mProgramReport").getData();
// 			var aColumns = this.createColumnsProgram();
// 			var oSettings = {
// 				workbook: {
// 					columns: aColumns
// 				},
// 				dataSource: oData,
// 				fileName: "Programs.xlsx"
// 			};
// 			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
// 			oSpreadsheet.build();
// 		},
// 		createColumnsProgram: function () {
// 			return [{
// 				label: "Program Name",
// 				property: "attributes/name"
// 			}, {
// 				label: "Description",
// 				property: "attributes/description"
// 			}, {
// 				label: "StartDate",
// 				property: "attributes/startDate"
// 			}, {
// 				label: "EndDate",
// 				property: "attributes/endDate"
// 			}, {
// 				label: "Status",
// 				property: "attributes/status"
// 			}];
// 		},
// 		onExportproject: function () {
// 			//debugger
// 			var oData = this.getView().getModel("mProjectReport").getData();
// 			var aColumns = this.createColumnsProjects();
// 			var oSettings = {
// 				workbook: {
// 					columns: aColumns
// 				},
// 				dataSource: oData,
// 				fileName: "Projects.xlsx"
// 			};
// 			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
// 			oSpreadsheet.build();
// 		},
// 		createColumnsProjects: function () {
// 			return [{
// 				label: "Project Name",
// 				property: "attributes/name"
// 			}, {
// 				label: "Description",
// 				property: "attributes/description"
// 			}, {
// 				label: "StartDate",
// 				property: "attributes/startDate"
// 			}, {
// 				label: "EndDate",
// 				property: "attributes/endDate"
// 			}, {
// 				label: "Status",
// 				property: "attributes/status"
// 			}];
// 		},

// 		onExportprojecttask: function () {
// 			//	debugger
// 			var oData = this.getView().getModel("mTaskReport").getData();
// 			var aColumns = this.createColumnsTasks();
// 			var oSettings = {
// 				workbook: {
// 					columns: aColumns
// 				},
// 				dataSource: oData,
// 				fileName: "Tasks.xlsx"
// 			};
// 			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
// 			oSpreadsheet.build();
// 		},
// 		createColumnsTasks: function () {
// 			return [{
// 				label: "Task Name",
// 				property: "attributes/name"
// 			}, {
// 				label: "Description",
// 				property: "attributes/description"
// 			}, {
// 				label: "StartDate",
// 				property: "attributes/startDate"
// 			}, {
// 				label: "EndDate",
// 				property: "attributes/endDate"
// 			}, {
// 				label: "Progress",
// 				property: "attributes/progress"
// 			}];
// 		},

// 	});
// });