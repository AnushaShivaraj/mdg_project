sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, MessageToast, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("MDG.ApplicationManagement.controller.userMaster", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf MDG.ApplicationManagement.view.userMaster
		 */
		onInit: function () {
			var that = this;
			that.maxId = 10040 + that.getOwnerComponent().getModel("users").getData().length;
			this.getOwnerComponent().getRouter().getRoute("userMaster").attachPatternMatched(function (oEvent) {
				that.updateModel();
				that.customerModel();
				that.vendorModel();
				that.mRolesData();
				that.getView().getModel("appView").setProperty("/layout", "OneColumn");
				that.byId("itemlistId").removeSelections(true);
				// that.orgId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id;
				// var filter1 = new sap.ui.model.Filter("orgid", "Contains", logOnOrgId);

				// this.getView().byId("itemlistId").getBinding("items").filter(new sap.ui.model.Filter([filter1], false));
			}, this);

		},
		updateModel: function () {
			var that = this;
			$.get("/OptimalCog/api/Users?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
				.getData()
				.m_organisation.id + "&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.idLength = response.length;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "createUserModel");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				});
		},
		customerModel: function () {
			var that = this;
			$.get("/OptimalCog/api/m-customers?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
				.getData()
				.m_organisation.id + "&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data), "customerData");
				});
		},
		vendorModel: function () {
			var that = this;
			$.get("/OptimalCog/api/m-vendors?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData()
				.m_organisation.id + "&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data), "vendorData");
				});
		},
		mRolesData: function () {
			var that = this;
			$.get("/OptimalCog/api/mroles?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel").getData()
				.m_organisation.id + "&sort=id:ASC",
				function (res, respState) {
					var response = JSON.parse(res);
					that.getView().setModel(new sap.ui.model.json.JSONModel(response.data), "userRoles");
				});
		},
		handleConfirm: function (oEvent) {
			var that = this;
			// selected key
			var oSortItem = oEvent.getParameter("sortItem");
			if (oSortItem !== undefined) {
				oSortItem = oSortItem.getKey();
			} else {
				oSortItem = "id";
			}
			var bDescending = oEvent.getParameter("sortDescending"); // if the descending button is selected or not

			if (bDescending === false) {
				var link = "/OptimalCog/api/Users?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
					.getData()
					.m_organisation.id + "&sort=" + oSortItem + ":ASC"
			} else {
				link = "/OptimalCog/api/Users?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
					.getData()
					.m_organisation.id + "&sort=" + oSortItem + ":DESC"
			}
			$.get(link,
				function (res, respState) {
					var response = JSON.parse(res);
					that.idLength = response.length;
					var modelData = new sap.ui.model.json.JSONModel({
						"id": that.idLength
					});
					that.getOwnerComponent().setModel(modelData, "createUserModel");
					that.getView().setModel(new sap.ui.model.json.JSONModel(response));
				});

		},
		onSearch: function (evt) {
			var that = this;
			that.searchVal = evt.getParameter("newValue");
			if (that.searchVal !== "") {
				$.get("/OptimalCog/api/Users?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
					.getData()
					.m_organisation.id + "&filters[$or][0][firstName][$contains]=" + that.searchVal +
					"&filters[$or][1][lastName][$contains]=" + that.searchVal + "&filters[$or][2][id][$contains]=" + that.searchVal,
					function (res, respState) {
						var response = JSON.parse(res);
						that.idLength = response.length;
						var modelData = new sap.ui.model.json.JSONModel({
							"id": that.idLength
						});
						that.getOwnerComponent().setModel(modelData, "createUserModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(response));
					})
			} else {
				$.get("/OptimalCog/api/Users?populate=*&filters[m_organisation][id]=" + this.getOwnerComponent().getModel("loggedOnUserModel")
					.getData()
					.m_organisation.id + "&sort=id:ASC",
					function (res, respState) {
						var response = JSON.parse(res);
						that.idLength = response.length;
						var modelData = new sap.ui.model.json.JSONModel({
							"id": that.idLength
						});
						that.getOwnerComponent().setModel(modelData, "createUserModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(response));
					})
			}

		},
		handleSelectionChange: function (oEvent) {
			var gettingText = oEvent.getParameter("item").getProperty("text");

			if (gettingText === 'Bulk Upload') {
				this.AdduserFragment.getContent()[2].setVisible(true); //fileUploaderSimpleform
				this.AdduserFragment.getContent()[1].setVisible(false); //createRecord
				this.AdduserFragment.getButtons()[0].setVisible(false);

			} else {
				this.AdduserFragment.getContent()[2].setVisible(false);
				this.AdduserFragment.getContent()[1].setVisible(true);
				this.AdduserFragment.getButtons()[0].setVisible(true);
			}
		},
		onNavBack: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			this.getRouter().navTo("Home");
		},
		openAddNewUser: function () {
			if (!this.AdduserFragment) {
				this.AdduserFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.addNewUser", this);
				this.getView().addDependent(this.AdduserFragment);
			}
			this.AdduserFragment.getContent()[1].getContent()[21].setSelectedKey(null);
			this.AdduserFragment.getContent()[1].getContent()[23].setSelectedKey(null);
			this.AdduserFragment.getContent()[1].getContent()[25].setSelectedKey(null);
			var modelData = {
				"customerInfo": this.getView().getModel("customerData").getData(),
				"vendorInfo": this.getView().getModel("vendorData").getData(),
				"mroles": this.getView().getModel("userRoles").getData()
			};
			this.AdduserFragment.setModel(new sap.ui.model.json.JSONModel(modelData));
			this.AdduserFragment.open();
		},

		handleUsersListPress: function (oEvent) {
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getView().getModel("appView").setProperty("/previousPage", "userMaster");

			var modelData = {
				"customerInfo": this.getView().getModel("customerData").getData(),
				"vendorInfo": this.getView().getModel("vendorData").getData(),
				"mroles": this.getView().getModel("userRoles").getData()
			};
			var oModel = new sap.ui.model.json.JSONModel(modelData);
			this.getOwnerComponent().setModel(oModel, "modelData");
			var selData = oEvent.getParameter("listItem").getBindingContext().getObject();
			var jsonModel = new sap.ui.model.json.JSONModel(selData);
			this.getOwnerComponent().setModel(jsonModel, "selectedUserData");
			this.getOwnerComponent().getRouter().navTo("userDetail", {
				id: selData.id
			});
		},
		// openNewFragment: function () {
		// 	if (!this.dialog) {
		// 		this.dialog = sap.ui.xmlfragment(this.getView().getId(), "MDG.ApplicationManagement.fragments.bulkUpload", this);
		// 		this.getView().addDependent(this.dialog);
		// 	}
		// 	this.dialog.open();
		// },
		// handleAddCancel: function () {
		// 	this.dialog.close();
		// 	// this.getView().byId("notifyStrip").setVisible(false);
		// },
		onUpload: function (evt) {
			var that = this;
			var file = evt.getParameter("files")[0]; // get the file from the FileUploader control
			var reader = new FileReader();
			reader.onload = function (e) {
				var data = e.target.result;
				var excelsheet = XLSX.read(data, {
					type: "binary"
				});
				excelsheet.SheetNames.forEach(function (sheetName) {
					var oExcelRow = XLSX.utils.sheet_to_row_object_array(excelsheet.Sheets[sheetName]); // this is the required data in Object format
					var jsonModel = new sap.ui.model.json.JSONModel(oExcelRow);
					that.getView().setModel(jsonModel, "localModel");
				});
			};
			reader.readAsBinaryString(file);
		},
		handleRoleData: function (role) {
			var getRoleModel = this.getView().getModel("userRoles").getData();
			var theRoleId = [];
			for (var k = 0; k < getRoleModel.length; k++) {
				if (getRoleModel[k].attributes.roleName === role) {
					theRoleId.push(getRoleModel[k].id);
					break
				}
			}
			return theRoleId
		},
		handleCusotmerData: function (customerD) {
			var getCustomerModel = this.getView().getModel("customerData").getData();
			var theCustomerId = [];
			for (var k = 0; k < getCustomerModel.length; k++) {
				if (getCustomerModel[k].attributes.customerName === customerD) {
					theCustomerId.push(getCustomerModel[k].id);
					break
				}
			}
			return theCustomerId
		},
		handleVendorData: function (detail) {

			var getVendorModel = this.getView().getModel("vendorData").getData();
			var theVendorId = [];
			for (var k = 0; k < getVendorModel.length; k++) {
				if (getVendorModel[k].attributes.roleName === detail.data) {
					theVendorId.push(getVendorModel[k].id);
					break
				}
			}
			return theVendorId
		},
		uploadUsers: function () {
			var that = this;
			if (this.getView().getModel("localModel")) {
				var oModel = this.getView().getModel("localModel").getData();

				let localArray = [];
				this.AdduserFragment.setBusy(true);
				for (let i = 0; i < oModel.length; i++) {
					var row = oModel[i];
					var oUserDetails = {
						"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
						"firstName": row["First Name"],
						"lastName": row["Last Name"],
						"status": row.Status,
						"username": row.UserName,
						"email": row["Email-ID"],
						"phone": row["Contact No"],
						"role": 1,
						"mrole": that.handleRoleData(row.Role),
						"city": row.City,
						"streerAddress": row["Street Address"],
						"country": row.Country,
						"type": row.Type,
						"area": row.Area,
						"password": "Vaspp@123",
						"serviceStartDate": row["Service Start Date"],
						"serviceEndDate": row["Service End Date"],
						"blocked": false,
						"confirmed": true
					};
					var serviceDateANdEnd = true;
					if (oUserDetails.type === 'Customer') {
						oUserDetails.m_customer = that.handleCusotmerData(row["Customer/Vendor"]);
						if (oUserDetails.serviceStartDate == undefined && oUserDetails.serviceEndDate == undefined) {
							serviceDateANdEnd = false;
						}
					} else if (oUserDetails.type === 'Vendor') {
						oUserDetails.m_vendor = that.handleVendorData(row["Customer/Vendor"]);
						if (oUserDetails.serviceStartDate == undefined && oUserDetails.serviceEndDate == undefined) {
							serviceDateANdEnd = false;
						}
					} else {
						delete oUserDetails.serviceEndDate;
						delete oUserDetails.serviceStartDate;
					}

					var validateObj = true
					Object.keys(oUserDetails).forEach(function (key) {
						if (!oUserDetails[key] && key !== "blocked" && !oUserDetails[key] && key !== "area" && serviceDateANdEnd === true) {
							validateObj = false
						}
					});
					if (validateObj === true) {
						$.ajax({
							url: "/OptimalCog/api/users",
							type: "POST",
							headers: {
								"Content-Type": 'application/json',
								'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
							},
							data: JSON.stringify(oUserDetails),
							success: function (res) {
								var getValues = JSON.parse(res);
								if (getValues.error) {
									MessageBox.error(getValues.error.message);
									that.AdduserFragment.setBusy(false);
								} else {
									const length = oModel.length;
									if (length - 1 === i) {
										that.AdduserFragment.setBusy(false);
										that.onfileClear();
										that.AdduserFragment.close();
										MessageBox.success("users Added successfully.");
										that.updateModel();
									}
								}
							}
						});
					} else {
						that.AdduserFragment.setBusy(false);
						MessageBox.error("Creation Failed. Please complete the required details in \"" + oUserDetails.firstName + "\" record.");
					}
				}
			} else {
				MessageBox.error("Please Browse the file!");
			}
		},
		onfileClear: function () {
			var oFileUploader = this.AdduserFragment.getContent()[2].getContent()[2].getItems()[0]; // Get a reference to the FileUploader control
			oFileUploader.clear(); // Clear the FileUploader control
		},
		handleAddUserOkPress: function () {
			var that = this;
			var content = this.AdduserFragment.getContent()[1].getContent();
			var oUserDetails = {
				"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id],
				"firstName": content[1].getValue(),
				"lastName": content[5].getValue(),
				"status": content[7].getSelectedKey(),
				"username": content[9].getValue(),
				"email": content[9].getValue(),
				"phone": content[11].getValue(),
				"role": 1,
				"mrole": [Number(content[19].getSelectedKey())],
				"city": content[13].getValue(),
				"streerAddress": content[15].getValue(),
				"country": content[17].getValue(),
				"type": content[23].getSelectedKey(),
				"area": content[21].getSelectedKey(),
				"password": "Vaspp@123",
				"serviceStartDate": content[29].getValue(),
				"serviceEndDate": content[31].getValue(),
				"appPermission": [],
				"blocked": false,
				"confirmed": true
			};
			var serviceDateANdEnd = true;
			if (oUserDetails.type === 'Customer') {
				oUserDetails.m_customer = [Number(content[25].getSelectedKey())];
				if (oUserDetails.serviceStartDate == "" && oUserDetails.serviceEndDate == "") {
					serviceDateANdEnd = false;
				}
			} else if (oUserDetails.type === 'Vendor') {
				oUserDetails.m_vendor = [Number(content[27].getSelectedKey())];
				if (oUserDetails.serviceStartDate == "" && oUserDetails.serviceEndDate == "") {
					serviceDateANdEnd = false;
				}
			} else {
				delete oUserDetails.serviceEndDate;
				delete oUserDetails.serviceStartDate;
			}
			if (oUserDetails.firstName != '' && oUserDetails.lastName != '' && oUserDetails.email != '' && oUserDetails.phone !=
				'' && oUserDetails.mrole.length != 0 && oUserDetails.city != '' && oUserDetails.address != '' && serviceDateANdEnd === true) {

				/*----------------------------------------Integreation of Create User detail START--------------------------------------------*/

				for (var prop in oUserDetails) {
					var value = oUserDetails[prop];
					if (value == "" || value == undefined || typeof value === "number" && isNaN(value)) {
						if (Array.isArray(value) && value.length === 0) {
							oUserDetails[prop] = [];
						} else {
							delete oUserDetails[prop];
						}
					}
				}
				$.ajax({
					url: "/OptimalCog/api/users",
					type: "POST",
					headers: {
						"Content-Type": 'application/json',
						'Authorization': "Bearer " + that.getOwnerComponent().getModel("loggedOnUserModel").getData().jwt
					},
					data: JSON.stringify(oUserDetails),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message);
						} else {
							MessageToast.show(getValues.username + " New User added succesfuly."); // Debug statement
							that.closeAdduserFragment();
							that.updateModel();
						}
					}
				});
				/*----------------------------------------Integreation of Create User detail END--------------------------------------------*/
			} else {
				MessageBox.error("Please Fill The Mandatory Fields", {});

			}
		},
		formatDate: function (date) {
			var format = date.split("/");
			return format[2] + "-" + format[1] + "-" + format[0]
		},
		closeAdduserFragment: function () {
			this.AdduserFragment.close();
			this.clearData();
		},
		clearData: function () {

			var content = this.AdduserFragment.getContent()[1].getContent();
			content[1].setValue("");
			content[3].setValue("");
			content[5].setValue("");
			content[7].setValue("");
			content[9].setValue("");
			content[11].setValue("");
			content[13].setValue("");
			content[15].setValue("");
		},

		handleAddUserCancelPress: function () {
			this.onfileClear();
			this.AdduserFragment.close();
		},
		onNavBack1: function () {
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Home");
		},
		handleSortfragment: function () {
			if (!this.sortuserFragment) {
				this.sortuserFragment = sap.ui.xmlfragment("MDG.ApplicationManagement.fragments.sortUser", this);

			}

			this.sortuserFragment.open();
		},
		handleConfirm: function (oEvent) {
			var oSortItem = oEvent.getParameter("sortItem");
			var sColumnPath = "id";
			var bDescending = oEvent.getParameter("sortDescending");
			var aSorter = [];
			if (oSortItem) {
				sColumnPath = oSortItem.getKey();
			}
			aSorter.push(new Sorter(sColumnPath, bDescending));
			var oList = this.getView().byId("itemlistId");
			var oBinding = oList.getBinding("items");
			oBinding.sort(aSorter);
		}

	});

});