sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox',
	'sap/m/Token',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"MDG/Planning_Calendar/util/formatter"
],
	function (Controller, JSONModel, MessageBox, Token, Filter, FilterOperator, formatter) {
		"use strict";

		return Controller.extend("MDG.Planning_Calendar.controller.Calendar", {
			formatter: formatter,
			onInit: function () {
				//Honalli
				//o
				this.Select = true;
				//o
				// create model
				//	debugger
				var legendItems;
				var calendarArr = [];

				var that = this;

				$.ajax({
					url: "/OptimalCog/api/m-programs?populate[0]=m_projects",
					type: "GET",
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Something went wrong!");
						} else {
							that.getView().setModel(new JSONModel(getValues));
							var j = that.getView().getModel().getData();

						}
					}
				});

				$.ajax({
					url: "/OptimalCog/api/users?populate[0]=[m_organisation]",
					type: "GET",
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "Something went wrong!");
						} else {

							that.getView().setModel(new JSONModel(getValues), "usersDetails");
						}
					}
				});
				$.ajax({
					url: "/OptimalCog/api/m-appointments?populate=*",
					type: "GET",
					success: function (res) {

						var response = JSON.parse(res);

						var oModel = new sap.ui.model.json.JSONModel(response.data);
						that.getView().setModel(oModel, "appointments");
						that.getView().getModel("appointments").updateBindings(true);

					}
				});
				that.projectDetails();
				that.programDetails();
				//that.appointmentModel();

			},
			programDetails: function () {
				var that = this;
				var people =
					$.ajax({
						//	url: "/OptimalCog/api/m-programs?populate[0]=m_appointments&populate[1]=m_projects",
						//	url: "/OptimalCog/api/m-programs?populate[0]=m_appointments.users_permissions_users&populate[1]=m_projects",
						url: "/OptimalCog/api/m-programs?populate[0]=m_appointments.users_permissions_users&populate[1]=m_appointments.m_project",
						type: "GET",
						success: function (res) {
							var getValues = JSON.parse(res);
							if (getValues.error) {
								MessageBox.error(getValues.error.message + "Something went wrong!");
							} else {
								var oModel = new sap.ui.model.json.JSONModel(getValues.data);

								that.getView().setModel(oModel, "programsfilter");
								var programLength = that.getView().getModel("programsfilter").getData();

								var Set = [];

								for (var i = 0; i < programLength.length; i++) {
									var Setapp = programLength[i].attributes.m_appointments.data;
									Set.push(Setapp)
								}

								// Start Of Manipulating Structure
								let FinalPrgramSet = [];
								//
								//	var ch =[]
								//
								FinalPrgramSet.push(...programLength);
								//anu
								// for (var i = 0; i < FinalPrgramSet.length; i++) {
								// 	FinalPrgramSet[i] = FinalPrgramSet[i].attributes;
								// 	if (FinalPrgramSet[i].m_appointments) {
								// 		for (var j = 0; j < FinalPrgramSet[i].m_appointments.data.length; j++) {
								// 			FinalPrgramSet[i].m_appointments[j] = FinalPrgramSet[i].m_appointments.data[j];
								// 			FinalPrgramSet[i].m_appointments[j] = FinalPrgramSet[i].m_appointments[j].attributes;
								// 			//check

								// 			// FinalPrgramSet[i].m_appointments[j].data = 
								// 			//check.push();
								// 		}
								// 	}
								// }
								//anu check
								for (var i = 0; i < FinalPrgramSet.length; i++) {
									FinalPrgramSet[i] = FinalPrgramSet[i].attributes;

									if (FinalPrgramSet[i].m_appointments) {
										for (var j = 0; j < FinalPrgramSet[i].m_appointments.data.length; j++) {
											FinalPrgramSet[i].m_appointments[j] = FinalPrgramSet[i].m_appointments.data[j];
											FinalPrgramSet[i].m_appointments[j].attributes.data = FinalPrgramSet[i].m_appointments[j].id;
											// push the value of m_appointments[j].data inside FinalPrgramSet[i].m_appointments[j].attributes
											// using the push method for an array
											FinalPrgramSet[i].m_appointments[j] = FinalPrgramSet[i].m_appointments[j].attributes;

										}
									}
								}
								// End Of Manipulating Structure

								let FinalSet = [];
								FinalSet.push(...Set);

								for (var i = 0; i < FinalSet.length; i++) {
									for (var j = 0; j < FinalSet[i].length; j++) {
										FinalSet[i][j] = FinalSet[i][j].attributes;

									}
								}

								var appointmentsdata = new sap.ui.model.json.JSONModel(FinalPrgramSet);

								that.getView().setModel(appointmentsdata, "appointmentsdata");
								that.getView().getModel("programsfilter").updateBindings(true);

								//	console.log(that.getView().getModel("appointmentsdata").getData())

							}
						}
					});
			},

			projectDetails: function () {
				var that = this;
				$.ajax({
					url: "/OptimalCog/api/m-projects?*",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);

						var oModel = new sap.ui.model.json.JSONModel(response.data);
						that.getView().setModel(oModel, "projects");

					}
				});
			},
			appointmentModel: function () {
				var that = this;
				$.ajax({
					url: "/OptimalCog/api/m-appointments?populate=*",
					type: "GET",
					success: function (res) {

						var response = JSON.parse(res);

						var oModel = new sap.ui.model.json.JSONModel(response.data);
						that.getView().setModel(oModel, "appointments");
						that.getView().getModel("appointments").updateBindings(true);

					}
				});
			},
			handleAppointmentSelect: function (oEvent) {
				var that = this;
				if (!this._oAppointmentInfo) {
					this._oAppointmentInfo = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.AppointmentInfo", this);
					this.getView().addDependent(this._oAppointmentInfo);
				}
				//nn
				if (this.Select == true) {
					if (!this._oAppointmentInfo) {
						this._oAppointmentInfo = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.AppointmentInfo", this);
						this.getView().addDependent(this._oAppointmentInfo);
					}
					//nn
					var set = oEvent.getParameter("appointment").getBindingContext("appointmentsdata").getObject().title;

					var Set = [];
					var oevt = oEvent.getParameters().appointment.getParent().getBindingContext("appointmentsdata").getObject();
					// var userappointment = oEvent.getParameters().appointment.getParent().getBindingContext("appointmentsdata").getObject().m_appointments.data[0].users_permissions_users.data;
					var parentSet = oEvent.getParameters().appointment.getParent().getBindingContext("appointmentsdata").getObject().m_appointments.data;
					//	var parentSetProjects = oEvent.getParameters().appointment.getParent().getBindingContext("appointmentsdata").getObject().m_projects
					//		.data;

					var appointmentSet = oEvent.getParameters().appointment.mProperties.title
					var projectSets = this.getView().getModel("projects").getData();
					for (var i = 0; i < parentSet.length; i++) {
						if (parentSet[i].title === appointmentSet) {
							//la
							//	for (var j = 0; j < parentSetProjects.length; j++) {
							//la
							//	for(){parentSet[i].m_project.data.attributes.name
							for (var z = 0; z < projectSets.length; z++) {
								//	for (var j = 0; j < parentSet[i].m_project.data.length; j++) {
								if (parentSet[i].m_project.data.id === projectSets[z].id) {
									var user = this.getView().getModel("usersDetails").getData();
									for (var u = 0; u < user.length; u++) {
										//	for (var i = 0; i < parentSet.length; i++) {
										for (var k = 0; k < parentSet[i].users_permissions_users.data.length; k++) {

											if (parentSet[i].users_permissions_users.data[k].id === user[u].id) {
												//	if (parentSet[i].users_permissions_users.data.length === Set.length) {
												that.userData = parentSet[i];
												var change = {
													"title": parentSet[i].title,
													"id": parentSet[i].data,
													"m_programs": oevt.name,
													//	"m_projects": parentSetProjects[j].attributes.name,
													"m_projects": parentSet[i].m_project.data.attributes.name,
													"startDate": parentSet[i].startDate,
													"endDate": parentSet[i].endDate,
													"meetingLink": parentSet[i].meetingLink,
													"firstName": parentSet[i].users_permissions_users.data[k].attributes.firstName,
													"lastName": parentSet[i].users_permissions_users.data[k].attributes.lastName
												};

												Set.push(change);
												//	}
												if (parentSet[i].users_permissions_users.data.length === Set.length) {
													//	Set.push(change);
													//	break;
													//al

													//al
												}
												//else {
												//al
												//	this.Select = false;
												//al
												//	}
												// return ;
											}
											//	break; only 1st user
											//	}
										}
										if (parentSet[i].users_permissions_users.data.length === Set.length) {
											//	Set.push(change);
											//	break;
											//al
											//	Set.push(change);
											break;
											//al
										}
										//	break;
									}
									//	break;
									//	}
									//	break;
								}
								//	break;
							}
							//	break;
						}
					}
					var appointmentsdatal = new sap.ui.model.json.JSONModel(Set);
					that.getView().setModel(appointmentsdatal, "appointmentsdatal");
					var setty = that.getView().getModel("appointmentsdatal").getData();

					that._oAppointmentInfo.setModel(new sap.ui.model.json.JSONModel(setty));
					that.getView().getModel("appointmentsdatal").updateBindings(true);
					that.getView().getModel("appointmentsdata").updateBindings(true);

					that._oAppointmentInfo.open();
				} else {
					if (!this.AppointmentInfoFilter) {
						this.AppointmentInfoFilter = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.AppointmentInfoFilter",
							this);
						this.getView().addDependent(this.AppointmentInfoFilter);
					}
					var ProgramId = oEvent.getSource().mEventRegistry.appointmentSelect[0].oListener.programname;
					var checkApp = that.getView().getModel("appointmentsdata").getData();
					var appProperty = oEvent.getParameters().appointment.mProperties.title;
					var Set = [];
					for (var i = 0; i < checkApp.length; i++) {
						//	for()

						if (ProgramId == checkApp[i].name) {
							var checkAppoint = checkApp[i].m_appointments.data;

							for (var j = 0; j < checkAppoint.length; j++) {
								//	for(var z=0; z<checkAppoint[j].m_project.data[0] )
								// var project = checkAppoint[j].m_project.data.attributes.name;
								// var title =checkAppoint[j].title;
								// var Program = ProgramId;
								if (appProperty == checkAppoint[j].title) {
									//	for (var u = 0; u < checkAppoint.length; u++) {
									var user = this.getView().getModel("usersDetails").getData();
									for (var u = 0; u < checkAppoint[j].users_permissions_users.data.length; u++) {
										var userdeat = checkAppoint[j].users_permissions_users.data[u];
										that.userData = userdeat;
										var change = {
											m_projects: checkAppoint[j].m_project.data.attributes.name,
											title: checkAppoint[j].title,
											Program: ProgramId,
											id: checkAppoint[j].data,
											meetingLink: checkAppoint[j].meetingLink,
											firstName: userdeat.attributes.firstName,
											lastName: userdeat.attributes.lastName,
										}
										Set.push(change);

									}

									var appointmentsdatal = new sap.ui.model.json.JSONModel(Set);
									that.getView().setModel(appointmentsdatal, "appointmentsdatal");
									//	var setty = that.getView().getModel("appointmentsdatal").getData()[0];
									var setty = that.getView().getModel("appointmentsdatal").getData();

									that.AppointmentInfoFilter.setModel(new sap.ui.model.json.JSONModel(setty));

									that.AppointmentInfoFilter.open();

								}
							}
							//	}
						}
					}
				}

			},

			handleAppointmentCancel: function (oEvent) {
				this._oAppointmentInfo.close();
			},
			handleAppointmentFilterCancel: function (oEvent) {
				this.AppointmentInfoFilter.close();
			},
			handleAppointmentCreate: function (oEvent) {
				if (!this._AddAppointment) {
					this._AddAppointment = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.CreateAppointment", this);
					this._AddAppointment.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
					this.getView().addDependent(this._AddAppointment);
				}

				var oModel = this.getView().getModel().getData();
				var obj = {
					"programs": this.getView().getModel().getData().data,
					"projects": this.getView().getModel("projects").getData()
				}
				// var obj = {

				// }
				var mModel = new sap.ui.model.json.JSONModel(obj);
				this._AddAppointment.setModel(mModel);
				this._AddAppointment.open();
			},
			handleDialogCancelButton: function (oEvent) {

				this._AddAppointment.getContent()[0].getContent()[1].setValue("");
				this._AddAppointment.getContent()[0].getContent()[3].clearSelection();
				this._AddAppointment.getContent()[0].getContent()[5].clearSelection();
				this._AddAppointment.getContent()[0].getContent()[7].removeAllTokens();
				this._AddAppointment.getContent()[0].getContent()[9].setValue("");
				this._AddAppointment.getContent()[0].getContent()[11].setValue("");
				this._AddAppointment.getContent()[0].getContent()[13].setValue("");



				// this._AddAppointment.getModel().setData(null);
				// this._AddAppointment.getContent()[0].getContent()[3].setSelectedKey(null);
				this._AddAppointment.getContent()[0].getContent()[5].setEditable(false);
				this._AddAppointment.getModel().updateBindings(true);
				this._AddAppointment.close();
			},
			handleDialogSaveButton: function () {
				var that = this;
				let Err = this.validationChecker();
				if (Err === 0) {
					var oStartDate = this.byId("startDate"),
						oEndDate = this.byId("endDate"),
						sInfoValue = Number(this.byId("projectInfo").getSelectedItem().getKey()),
						sInputTitle = this.byId("inputTitle").getValue(),
						sLink = this.byId("meetingLink").getValue(),
						iProgramName = Number(this.byId("selectProgram").getSelectedItem().getKey()),

						oNewAppointmentDialog = this.byId("createDialog")

					if (this.participants) {
						var usersDetails = []
						that.participants.forEach(function (oitems) {
							usersDetails.push(oitems.id);
						});

						that.oNewAppointment = {
							"title": sInputTitle,
							"m_program": iProgramName,
							"m_project": sInfoValue,
							"startDate": oStartDate.getDateValue(),
							"endDate": oEndDate.getDateValue(),
							"meetingLink": sLink,
							"users_permissions_users": usersDetails,
							"m_organisation": [this.getOwnerComponent().getModel("loggedOnUserModel").getData().m_organisation.id]
						};
						this.getView().setBusy(true)
						$.ajax({
							url: "/OptimalCog/api/m-appointments",
							type: "POST",
							headers: {
								"Content-Type": 'application/json'
							},
							data: JSON.stringify({
								"data": that.oNewAppointment
							}),
							success: function (res) {
								var getValues = JSON.parse(res);
								if (getValues.error) {
									MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
								} else {
									that.getView().getModel("appointmentsdata").updateBindings(true);
									that.handleDialogCancelButton();
									that.onInit();
									that.getView().setBusy(false);
								}
							}
						});

					}
					//else MessageBox.error(this.oResourceBundle.getText("errorsCount1"));

					// this._addNewAppointment(oNewAppointment);
					// oModel.updateBindings();
					oNewAppointmentDialog.close();
				} else {
					MessageBox.error("Please fill all required fields");
				}

			},
			validationChecker: function () {
				let Err = 0;
				if (!this._AddAppointment.getContent()[0].getContent()[1].getValue()) {
					Err++
				}
				if (!this._AddAppointment.getContent()[0].getContent()[3].getSelectedKey()) {
					Err++
				}
				if (!this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey()) {
					Err++
				}
				if (this._AddAppointment.getContent()[0].getContent()[7].getTokens().length === 0) {
					Err++
				}
				if (!this._AddAppointment.getContent()[0].getContent()[9].getValue()) {
					Err++
				}
				if (!this._AddAppointment.getContent()[0].getContent()[11].getValue()) {
					Err++
				}
				if (!this._AddAppointment.getContent()[0].getContent()[13].getValue()) {
					Err++
				}
				return Err
			},
			_addNewAppointment: function (oAppointment) {
				var oModel = this.getView().getModel(),
					sPath = "/" + this.byId("selectProgram").getSelectedIndex().toString(),
					oPersonAppointments;
				sPath += "/appointments";
				oPersonAppointments = oModel.getProperty(sPath);
				oPersonAppointments.push(oAppointment);
				oModel.setProperty(sPath, oPersonAppointments);
			},
			handleChangeSelect: function (oEvent) {

				var programKey = this.getView().byId("selectProgram").getSelectedItem().getKey();
				this._AddAppointment.getContent()[0].getContent()[5].setEditable(true);
				var programData = this._AddAppointment.getModel().getData().programs;
				var projectDetails = [];
				for (var i = 0; i < programData.length; i++) {
					if (programKey == programData[i].id) {
						// projectDetails.push(programData[i].attributes.m_projects.data);
						const mainData = programData[i].attributes.m_projects.data
						this._AddAppointment.getContent()[0].getContent()[5].setModel(new sap.ui.model.json.JSONModel(mainData));
						this._AddAppointment.getContent()[0].getContent()[5].getModel().updateBindings();
						break;
					}
				}

			},

			handleViewChange: function (oEvent) {
				//this.changeStandardItemsPerView();
				//   var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				var aSelectedKeys = this.byId('PC1').getViewKey();
				this.byId("PC1").setBuiltInViews(aSelectedKeys);
			},

			changeStandardItemsPerView: function () {
				var sViewKey = this.byId('PC1').getViewKey(),
					oLegend = this.byId("PlanningCalendarLegend");

				if (sViewKey !== PlanningCalendarBuiltInView.OneMonth && sViewKey !== "OneMonth") {
					oLegend.setStandardItems([
						StandardCalendarLegendItem.Today,
						StandardCalendarLegendItem.WorkingDay,
						StandardCalendarLegendItem.NonWorkingDay
					]);
				} else {
					oLegend.setStandardItems(); //return defaults
				}
			},

			openParticipantsDialog: function () {
				if (!this.selectParticipants) {
					this.selectParticipants = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.SelectParticipants", this);
					this.selectParticipants.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
					this.getView().addDependent(this.selectParticipants);
				}
				var userModel = this.getView().getModel("usersDetails").getData();
				// this._AddAppointment.getModel().getData().usersData = userModel;
				// this._AddAppointment.getModel().updateBindings();
				this.selectParticipants.setModel(new sap.ui.model.json.JSONModel(userModel));
				this.selectParticipants.open();
			},
			//Add appointment
			onSelectParticipant: function (evt) {
				var that = this;
				var aContexts = evt.getParameter("selectedContexts");
				that.participants = [];
				var aSelectedItems = evt.getParameter("selectedItems");
				//
				evt.getParameters().selectedContexts.forEach(function (obj, index) {
					that.participants.push(obj.getObject());
				});
				var oMultiInput = this.byId("selectPerson");
				if (aSelectedItems && aSelectedItems.length > 0) {
					aSelectedItems.forEach(function (oItem) {
						var oCustomData = oItem.getCustomData()[0]
						oMultiInput.addToken(new Token({
							text: oItem.getTitle(),
							key: oCustomData.getValue()
						}));
					});
				}
				//	}
				// this.selectParticipants.close();
			},
			//AppointInfo external participants
			onSelectUser: function (evt) {
				var that = this;
				var aContexts = evt.getParameter("selectedContexts");
				that.participants = [];
				that.userManagment = [];
				var aSelectedItems = evt.getParameter("selectedItems");
				evt.getParameters().selectedContexts.forEach(function (obj, index) {
					that.participants.push(obj.getObject());
					that.userManagment.push(obj.getObject().id);
				});
				if(!that._oAppointmentInfo){
					var Id = that._oAppointmentInfo.getModel().getData()[0].id;
					var getData = that._oAppointmentInfo.getContent()[1].getModel().getData();
				} else{
					var Id = this.AppointmentInfoFilter.getModel().getData()[0].id;
					var getData = this.AppointmentInfoFilter.getContent()[1].getModel().getData();
				}
		
				let mainObj = [];
				for (let k = 0; k < that.participants.length; k++) {
					let objec = {
						endDate: getData[0].endDate ,
						firstName: that.participants[k].firstName,
						id: that.participants[k].id,
						lastName: that.participants[k].lastName,
						m_programs: getData[0].m_programs,
						m_projects: getData[0].m_projects,
						meetingLink: getData[0].meetingLink,
						startDate: getData[0].startDate,
						title: getData[0].title
					}
					mainObj.push(objec);
				}
				that._oAppointmentInfo.getContent()[1].getModel().setData(mainObj);
				that._oAppointmentInfo.getContent()[1].getModel().updateBindings();

				let removeUser = this.userData.users_permissions_users == undefined ? [this.userData] : this.userData.users_permissions_users.data;

				for (let g = 0; g < mainObj.length; g++) {
					for (let h = 0; h < removeUser.length; h++) {
						if (mainObj[g].id == removeUser[h].id) {
							removeUser.splice(removeUser[h], 1);
						}
					}
				}
				this.selectUser.getModel().updateBindings();
				//	that._oAppointmentInfo.getModel().getData().push(that.participants);

				that.oNewAppointment = {
					"users_permissions_users": that.userManagment,
				};
				$.ajax({
					url: "/OptimalCog/api/m-appointments/" + Id,
					type: "PUT",
					headers: {
						"Content-Type": 'application/json'
					},
					data: JSON.stringify({
						"data": that.oNewAppointment
					}),
					success: function (res) {
						var getValues = JSON.parse(res);
						if (getValues.error) {
							MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
						} else {
							that.getView().getModel("appointmentsdata").updateBindings();
							that.getView().getModel("appointmentsdata").refresh();
							MessageBox.success("Participant Successfully Added");
							// that.onCloseDetailPress();
							that.onInit();
						}
					}
				});
				// this.selectUser.close();
				// this._oAppointmentInfo.close();
			},

			handleAppointmentDeleteFilter: function () {
				var that = this;
				MessageBox.warning("Are you sure you want to delete it?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						if (sAction === "OK") {
							var Id = that.AppointmentInfoFilter.getModel().getData()[0].id;

							that.oNewAppointment = {
								//	"users_permissions_users": that.participants,
							};
							$.ajax({
								url: "/OptimalCog/api/m-appointments/" + Id,
								type: "Delete",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.oNewAppointment
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									if (getValues.error) {
										MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
									} else {
										that.onInit();
										that.getView().getModel("appointmentsdata").updateBindings(true);
										// that.onCloseDetailPress();
										that.AppointmentInfoFilter.close();
										MessageBox.success("Deleted Successfully");
										// that.onInit();
									}
									that.AppointmentInfoFilter.close();
								}.bind(that)
							});
						}
					}
				});
			},
			handleAppointmentDelete: function () {
				var that = this;
				MessageBox.warning("Are you sure you want to delete it?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						if (sAction === "OK") {
							var Id = that._oAppointmentInfo.getModel().getData()[0].id

							that.oNewAppointment = {
								//	"users_permissions_users": that.participants,
							};
							$.ajax({
								url: "/OptimalCog/api/m-appointments/" + Id,
								type: "Delete",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({
									"data": that.oNewAppointment
								}),
								success: function (res) {
									var getValues = JSON.parse(res);
									if (getValues.error) {
										MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
									} else {
										that.getView().getModel("appointmentsdata").updateBindings(true);
										// that.onCloseDetailPress();
										that._oAppointmentInfo.close();
										that.onInit();
										MessageBox.success("Deleted Successfully");
									}
									that._oAppointmentInfo.close();
								}
							});
						}
					}
				});

			},
			onSearchParticipantValueHelp: function (evt) {
				this.selectUser.getBinding("items").filter([new sap.ui.model.Filter("firstName", sap.ui.model.FilterOperator.Contains,
					evt.getParameters().value)]);
			},
			handleAddExternalParticipants: function (evt) {
				if (!this.selectUser) {
					this.selectUser = sap.ui.xmlfragment(this.getView().getId(), "MDG.Planning_Calendar.fragment.selectUser", this);
					this.selectUser.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
					this.getView().addDependent(this.selectUser);
				}
				let getData = this.userData.users_permissions_users == undefined ? [this.userData] : this.userData.users_permissions_users.data;
				let userModel = this.getView().getModel("usersDetails").getData();
				this.selectUser.setModel(new sap.ui.model.json.JSONModel(userModel));
				let aList = this.selectUser._oList.getItems();

				let defaultSelectedItems = [];
				for (let m = 0; m < aList.length; m++) {
					let selListItem = aList[m];
					let defaultSelectedItem = selListItem.getCustomData()[0].getValue();

					for (let j = 0; j < getData.length; j++) {
						if (getData[j].id === defaultSelectedItem) {
							selListItem.setSelected(true);
							break;
						}
					}
				}
				//this.selectUser.setSelectedItems(defaultSelectedItems);
				this.selectUser.open();
			},
			handleFilterButtonPressed: function (oEvent) {
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = sap.ui.xmlfragment("MDG.Planning_Calendar.fragment.ViewSettingsDialog", this);
					this.getView().addDependent(this._oViewSettingsDialog);
					// this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				var navConTainer = this._oViewSettingsDialog.getContent()[0];
				var initialPage = this._oViewSettingsDialog.getContent()[0].getPages()[0];
				navConTainer.to(initialPage);
				//var prgData = this.getOwnerComponent().getModel("projectInfo").getData().programs;
				var prgData = this.getView().getModel().getData();
				this._oViewSettingsDialog.setModel(new JSONModel(prgData));
				this._oViewSettingsDialog.open();
			},

			handleProgramListPress: function (evt) {
				var that = this;
				// debugger
				this.programnameid = evt.getSource().getBindingContext("programsfilter").getObject().id;
				this.programname = evt.getSource().getBindingContext("programsfilter").getObject().attributes.name;
				this.programPath = evt.getSource().getBindingContext("programsfilter").getPath();
				var navConTainer = that._oViewSettingsDialog.getContent()[0];
				var LocToProjectPage = that._oViewSettingsDialog.getContent()[0].getPages()[1];
				navConTainer.to(LocToProjectPage);
				var projectdetails = evt.getSource().getBindingContext("programsfilter").getObject().attributes.m_projects;
				var projectModel = new sap.ui.model.json.JSONModel(projectdetails.data);
				that.getView().setModel(projectModel, "projectModel");

				var pj = that.getView().getModel("projectModel").getData();
				//	console.log(pj);
			},
			handleProjectListPress: function (evt) {
				var that = this;
				this.projectPath = evt.getSource().getBindingContext("programsfilter").getPath();
				var navConTainer = that._oViewSettingsDialog.getContent()[0];
				var LocToCSFPage = that._oViewSettingsDialog.getContent()[0].getPages()[2];
				navConTainer.to(LocToCSFPage);
				var csfModel = new sap.ui.model.json.JSONModel(evt.getSource().getBindingContext("programsfilter").getObject().m_csfs);
				LocToCSFPage.getContent()[0].setModel(csfModel);
			},
			handleCsfListPress: function (evt) {
				var that = this;
				this.csfPath = evt.getSource().getBindingContext().getPath();
				var navConTainer = that._oViewSettingsDialog.getContent()[0];
				var LocToDelPage = that._oViewSettingsDialog.getContent()[0].getPages()[3];
				navConTainer.to(LocToDelPage);
				var delModel = new sap.ui.model.json.JSONModel(evt.getSource().getBindingContext().getObject().deliverables);
				LocToDelPage.setModel(delModel);
			},
			onNavBack: function (evt) {
				var navConTainer = this._oViewSettingsDialog.getContent()[0];
				var listPage = this._oViewSettingsDialog.getContent()[0].getPages()[0];
				navConTainer.to(listPage);
			},

			onSelect: function (evt) {

				this.selectedIndex = evt.getSource().getBindingContext("projectModel").getPath().split("/")[1];
				this.filterTypeId = evt.getSource().getParent().getParent().getParent().getId();
				if (this.filterTypeId === "projectPage") {
					this.sId = evt.getSource().getBindingContext("projectModel").getObject().id;
					this.FilterParam = "id";
				}

			},
			onFilterConfirm: function (oEvent) {
				//h
				this.Select = false;
				//h
				var that = this;
				var programIdToFilter = this.programname;
				var appointmentsData = that.getView().getModel("appointmentsdata").getData();
				var oPlanningCalendar = that.getView().byId("PC1");
				var filteredData = appointmentsData.filter(function (appointment) {
					return appointment.name === programIdToFilter;
				});
				oPlanningCalendar.removeAllRows();
				for (var i = 0; i < filteredData.length; i++) {
					var appointment = filteredData[i];
					var newRow;
					var appointments = [];
					var appointmentdetails = appointment.m_appointments;
					for (var j = 0; j < appointmentdetails.data.length; j++) {
						appointments.push(new sap.ui.unified.CalendarAppointment({
							startDate: new Date(appointmentdetails[j].startDate),
							endDate: new Date(appointmentdetails[j].endDate),
							title: appointmentdetails[j].title,
							text: appointmentdetails[j].meetingLink
						}));
					}
					newRow = new sap.m.PlanningCalendarRow({
						title: appointment.name,
						text: appointment.description,
						appointments: appointments
					});
					oPlanningCalendar.addRow(newRow);

					that._oViewSettingsDialog.close();
					//	that.getView().byId("PC1").setEnabled(false)
				}
				that.getView().getModel("appointmentsdata").updateBindings(true);
				//	that.getView().byId("PC1").setEnabled(false)
			},

			handleAppointmentClear: function () {

				var that = this;
				if (this.Select = true) {
					var appointmentsData = that.getView().getModel("appointmentsdata").getData();
					var oPlanningCalendar = that.getView().byId("PC1");
					var filteredData = appointmentsData.filter(function (appointment) {
						return appointment.name;
					});
					oPlanningCalendar.removeAllRows()

					for (var i = 0; i < filteredData.length; i++) {

						var appointment = filteredData[i];
						var newRow;
						var appointments = [];
						var appointmentdetails = appointment.m_appointments;
						for (var j = 0; j < appointmentdetails.data.length; j++) {
							appointments.push(new sap.ui.unified.CalendarAppointment({
								startDate: new Date(appointmentdetails[j].startDate),
								endDate: new Date(appointmentdetails[j].endDate),
								title: appointmentdetails[j].title,
								text: appointmentdetails[j].meetingLink
							}));
						}
						newRow = new sap.m.PlanningCalendarRow({
							title: appointment.name,
							text: appointment.description,
							appointments: appointments
						});
						oPlanningCalendar.addRow(newRow);
						//  that._oViewSettingsDialog.close();
					}
					that.getView().getModel("appointmentsdata").updateBindings(true);
				}
			},

			onCancelFilterDialog: function () {
				this._oViewSettingsDialog.close();
			}

		});

	});