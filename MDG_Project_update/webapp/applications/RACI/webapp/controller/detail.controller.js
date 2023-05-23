sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Spreadsheet, MessageBox) {
	"use strict";

	return Controller.extend("mdg_raci.RACI.controller.detail", {

		onInit: function () {
			var that = this;
			if (!this.valueHelpForConfirmation)
				this.valueHelpForConfirmation = new sap.ui.xmlfragment("mdg_raci.RACI.fragment.valueHelpForConfirmation", this);
			this.getView().addDependent(this.valueHelpForConfirmation);
			//this.oBundle = this.getOwnerComponent().getModel("i18nModel").getResourceBundle();
			this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(function (oEvent) {

				that.sObjectId = oEvent.getParameter("arguments").objectId;
				this.selectedObjectRaci(that.sObjectId);
				this.getView().setBusy(false);
			}, this);

			that.getTheusers();
		},
		selectedObjectRaci: function (sObjectId) {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-programs?filters[id][$eq]=" + sObjectId + "&populate=*",

				type: "GET",
				success: function (res) {
					var programDetail = JSON.parse(res);
					if (programDetail.error) {
						MessageBox.error(programDetail.error.message + "Something went wrong!");
					} else {
						var mModel = new sap.ui.model.json.JSONModel(programDetail.data);
						that.getView().setModel(mModel, "programDetails");
						that.getView().getModel("programDetails").updateBindings(true);
					}
				}
			});

			$.ajax({

				url: "/OptimalCog/api/m-racis?filters[type][$eq]=PPR&filters[m_program][id][$eq]=" + sObjectId +
					"&populate[0]=m_accountable.users_permissions_users&populate[1]=m_responsible.users_permissions_users&populate[2]=m_consulted.users_permissions_users&populate[3]=m_informed.users_permissions_users&populate[4]=m_accountable.users_permissions_users&populate[5]=m_project&populate[6]=m_assignment",
				type: "GET",
				success: function (res) {
					var getValues = JSON.parse(res);
					if (getValues.error) {
						MessageBox.error(getValues.error.message + "Something went wrong!");
					} else {
						var mModel = new sap.ui.model.json.JSONModel(getValues.data);
						that.getView().setModel(mModel, "PPRmodel");

					}
				}
			});
			//CHECK - M_ACCOUNTABLE,
			$.ajax({

				url: "/OptimalCog/api/m-racis?filters[type][$eq]=CSFR&filters[m_program][id][$eq]=" + sObjectId +
					"&populate[0]=m_accountable.users_permissions_users&populate[1]=m_responsible.users_permissions_users&populate[2]=m_consulted.users_permissions_users&populate[3]=m_informed.users_permissions_users&populate[4]=m_accountable.users_permissions_users&populate[5]=m_project&populate[6]=m_csf",
				type: "GET",
				success: function (resss) {
					var CSFRdata = JSON.parse(resss);
					if (CSFRdata.error) {
						MessageBox.error(CSFRdata.error.message + "Something went wrong!");
					} else {
						var cModel = new sap.ui.model.json.JSONModel(CSFRdata.data);
						that.getView().setModel(cModel, "CSFRmodel");
						//	debugger
						that.getView().getModel("CSFRmodel").getData();
						that.getView().getModel("CSFRmodel").updateBindings(true);
					}
				}
			});

			// $.get("/OptimalCog/api/m-racis?filters[type][$eq]=CSFR&filters[m_program][id][$eq]=" + sObjectId +
			// 	"&populate[0]=m_accountable.users_permissions_users&populate[1]=m_responsible.users_permissions_users&populate[2]=m_consulted.users_permissions_users&populate[3]=m_informed.users_permissions_users&populate[4]=m_accountable.users_permissions_users&populate[5]=m_project&populate[6]=m_csf",
			// 	function (response) {
			// 	//	debugger
			// 		var resValue = JSON.parse(response);

			// 		if (resValue.error) {
			// 			MessageBox.error(resValue.error.message);
			// 		} else {

			// 	});
		},

		RaciModelMain: function () {
			var that = this;
			$.ajax({
				url: "/OptimalCog/api/m-racis?filters[id][$eq]=" + that.sObjectId +
					"populate[0]=m_accountable.users_permissions_users&populate[1]=m_responsible.users_permissions_users&populate[2]=m_consulted.users_permissions_users&populate[3]=m_informed.users_permissions_users&populate[4]=m_project&populate[5]=m_assigment&populate[6]=m_csf",
				type: "GET",
				success: function (res) {
					var racimodel = JSON.parse(res);
					if (racimodel.error) {
						MessageBox.error(racimodel.error.message + "Something went wrong!");
					} else {
						var kModel = new sap.ui.model.json.JSONModel(racimodel.data);
						that.getView().setModel(kModel, "programDetails");
						that.getView().setBusy(false);

					}
				}
			});
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
		onAddRaci: function () {

			var that = this;
			if (!this.AddRaci) {
				this.AddRaci = sap.ui.xmlfragment("mdg_raci.RACI.fragment.AddRaci", this);
				this.getView().addDependent(this.AddRacci);
			}
			this.AddRaci.setProperty("title", "Add RACI");
			this.AddRaci.getButtons()[0].setProperty("text", "Add");
			var mmModel = new sap.ui.model.json.JSONModel(this.getView().getModel("programDetails").getData()[0].attributes.m_projects.data)
			this.AddRaci.setModel(mmModel, "projectData");

			this.AddRaci.open();
		},
		onAddRaciPPR: function () {
			var that = this;
			if (!this.addRaciPPR) {
				this.addRaciPPR = sap.ui.xmlfragment("mdg_raci.RACI.fragment.addRaciPPR", this);
				this.getView().addDependent(this.AddRacci);
			}
			this.addRaciPPR.setProperty("title", "Add PPR");
			this.addRaciPPR.getButtons()[0].setProperty("text", "Add");
			var mmModel = new sap.ui.model.json.JSONModel(this.getView().getModel("programDetails").getData()[0].attributes.m_projects.data)
				//this.addRaciPPR.setModel(this.getView().getModel("projModel"), "projModel");
			this.addRaciPPR.setModel(mmModel, "projModel");
			// this.addRaciPPR.setModel(this.getOwnerComponent().getModel("assignmentModel"), "assignmentModel");
			this.addRaciPPR.open();
		},
		handleAddUserCancelPress: function () {
			this.AddRaci.close();
			this.clearRaci();
		},
		handleCancelPPRPress: function () {
			this.addRaciPPR.close();
			this.clearRaciPPR();
		},

		handleAddRaciPress: function (oEvent) {

			var that = this;
			var AddOrUpdate = this.AddRaci.getButtons()[0].getProperty("text");
			var selectedData = this.AddRaci.getContent()[0];
			if (selectedData.getContent()[1].getSelectedKey() !== "" && selectedData.getContent()[3].getSelectedKey() !== "") {
				that.raciData = {
					m_project: [Number(selectedData.getContent()[1].getSelectedKey())],
					m_csf: [Number(selectedData.getContent()[3].getSelectedKey())],

					type: "CSFR",
					status: "New",
					m_program: [this.getView().getModel("programDetails").getData()[0].id]
				};

				if (AddOrUpdate == "Add") {
					//id to m_acc
					that.tdata = {
						m_project: [Number(selectedData.getContent()[1].getSelectedKey())],
						m_csf: [Number(selectedData.getContent()[3].getSelectedKey())],
						//	m_responsible: [Number(selectedData.getContent()[5].getSelectedKey())],

						type: "CSFR",
						status: "New",
						m_program: [this.getView().getModel("programDetails").getData()[0].id]
					};

					$.ajax({
						url: "/OptimalCog/api/m-racis?populate=*",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.tdata
						}),
						success: function (res) {
							var getValues = JSON.parse(res);

							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Added Something went wrong!");
							} else {
								that.getView().getModel("programDetails").updateBindings(true);

								var kModel = new sap.ui.model.json.JSONModel(getValues.data);
								that.getView().setModel(kModel, "CSFRmodel");
								that.getView().getModel("CSFRmodel").getData();
								that.getView().getModel("CSFRmodel").updateBindings(true);
								$.ajax({
									url: "/OptimalCog/api/m-consulteds?populate=*",
									type: "POST",
									headers: {
										"Content-Type": 'application/json'
									},
									data: JSON.stringify({

										"data": {
											"mraci": [that.getView().getModel("CSFRmodel").getData().id],
											"users_permissions_users": [Number(that.consultedidforcheck)]
										}

									}),
									success: function (res) {
										var getValues = JSON.parse(res);

										if (getValues.error) {
											MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
										} else {
											that.getView().getModel("programDetails").updateBindings(true);
											that.getView().getModel("CSFRmodel").updateBindings(true);
											$.ajax({
												url: "/OptimalCog/api/m-accountables?populate=*",
												type: "POST",
												headers: {
													"Content-Type": 'application/json'
												},
												data: JSON.stringify({

													"data": {
														"mraci": [that.getView().getModel("CSFRmodel").getData().id],
														"users_permissions_users": [Number(that.accountidforcheck)]

													}

												}),
												success: function (res) {
													var getValues = JSON.parse(res);

													if (getValues.error) {
														MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
													} else {
														that.getView().getModel("programDetails").updateBindings(true);
														that.getView().getModel("CSFRmodel").updateBindings(true);
														//
														$.ajax({
															url: "/OptimalCog/api/m-informeds?populate=*",
															type: "POST",
															headers: {
																"Content-Type": 'application/json'
															},
															data: JSON.stringify({

																"data": {
																	"mraci": [that.getView().getModel("CSFRmodel").getData().id],
																	"users_permissions_users": [Number(that.informedidforcheck)]

																}

															}),
															success: function (res) {
																var getValues = JSON.parse(res);

																if (getValues.error) {
																	MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
																} else {
																	$.ajax({
																		url: "/OptimalCog/api/m-responsibles?populate=*",
																		type: "POST",
																		headers: {
																			"Content-Type": 'application/json'
																		},
																		data: JSON.stringify({

																			"data": {
																				"mraci": [that.getView().getModel("CSFRmodel").getData().id],
																				"users_permissions_users": [Number(that.responsibleidforcheck)]

																			}

																		}),
																		success: function (res) {
																			var getValues = JSON.parse(res);

																			if (getValues.error) {
																				MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
																			} else {

																				MessageToast.show("CSFR Added Successfully!");

																				that.getView().getModel("programDetails").updateBindings(true);
																				that.getView().getModel("CSFRmodel").updateBindings(true);

																				that.getView().getModel("CSFRmodel").refresh();
																				that.getView().getModel("programDetails").refresh();
																				that.selectedObjectRaci(that.sObjectId);

																				that.AddRaci.close();


																			}
																		}
																	})
																	// 	MessageToast.show("CSFR Added Successfully!");

																	// 	that.getView().getModel("programDetails").updateBindings(true);
																	// 	that.getView().getModel("CSFRmodel").updateBindings(true);

																	//  that.getView().getModel("CSFRmodel").refresh();
																	//  that.getView().getModel("programDetails").refresh();
																	//  that.selectedObjectRaci(that.sObjectId);

																	// 	that.AddRaci.close();


																}
															}
														})
														//
													}
												}
											})

										}
									}
								})

							}
						}
					});
				}
				else {

					var mResponsibleId = that.mRaciModel.attributes.m_responsible.data.id;
					var mAccountableId = that.mRaciModel.attributes.m_accountable.data.id;

					var mConsultedId = that.mRaciModel.attributes.m_consulted.data.id;
					var mInformedId = that.mRaciModel.attributes.m_informed.data.id;
					$.ajax({
						url: "/OptimalCog/api/m-responsibles/" + mResponsibleId + "?populate=*",
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							//"data": that.raciData
							"data": {
								"users_permissions_users": [Number(selectedData.getContent()[5].getSelectedKey())]
							}
						}),
						success: function (res) {
							var acc = Number(selectedData.getContent()[7].getSelectedKey());
							var user = that.mRaciModel.attributes.m_accountable.data.attributes.users_permissions_users.data[0].attributes.firstName;
							$.ajax({
								url: "/OptimalCog/api/m-accountables/" + mAccountableId + "?populate=*",
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({

									"data": {
										"users_permissions_users": [Number(that.accountidforcheck)]

									}

								}),
								success: function (res) {
									var user = that.mRaciModel.attributes.m_consulted.data.attributes.users_permissions_users.data[0].attributes.firstName;
									$.ajax({
										url: "/OptimalCog/api/m-consulteds/" + mConsultedId + "?populate=*",
										type: "PUT",
										headers: {
											"Content-Type": 'application/json'
										},
										data: JSON.stringify({

											"data": {
												"users_permissions_users": [Number(that.consultedidforcheck)]
											}

										}),
										success: function (res) {
											var user = that.mRaciModel.attributes.m_informed.data.attributes.users_permissions_users.data[0].attributes.firstName;
											$.ajax({
												url: "/OptimalCog/api/m-informeds/" + mInformedId + "?populate=*",
												type: "PUT",
												headers: {
													"Content-Type": 'application/json'
												},
												data: JSON.stringify({

													"data": {
														"users_permissions_users": [Number(that.informedidforcheck)]
													}

												}),
												success: function (res) {
													$.ajax({
														url: "/OptimalCog/api/m-racis/" + that.mRaciModel.id + "?populate[0]=m_responsible.users_permissions_users&populate[1]=m_accountable.users_permissions_users&populate[2]=m_project&populate[3]=m_assignment",
														type: "PUT",
														headers: {
															"Content-Type": 'application/json'
														},
														data: JSON.stringify({
															"data": that.raciData
														}),
														success: function (res) {
															var getValues = JSON.parse(res);

															if (getValues.error) {
																MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
															} else {

																that.getView().getModel("CSFRmodel").updateBindings(true);
																MessageToast.show("CSFR Edited Successfully!");

																that.getView().getModel("CSFRmodel").refresh();
																that.getView().getModel("programDetails").refresh();
																that.selectedObjectRaci(that.sObjectId);
																that.AddRaci.close();
																//that.addRaciPPR.close();
															}
														}
													});


												}
											});
										}
									});
								}
							});
						}
					});
				}
				this.clearRaci(selectedData);
			} else {
				MessageBox.error("First Select the item");
			}
		},
		handleAddRaciPPRPress: function (oEvent) {

			var that = this;
			var AddOrUpdate = this.addRaciPPR.getButtons()[0].getProperty("text");
			this.accountidforcheck;
			var selectedData = this.addRaciPPR.getContent()[0];
			if (selectedData.getContent()[1].getSelectedKey() !== "" && selectedData.getContent()[3].getSelectedKey() !== "") {
				that.raciData = {
					"m_project": [Number(selectedData.getContent()[1].getSelectedKey())],
					"m_assignment": [Number(selectedData.getContent()[3].getSelectedKey())],
					"m_program": [this.getView().getModel("programDetails").getData()[0].id],
					type: "PPR",
					status: "New",


				};

				if (AddOrUpdate == "Add") {
					that.tdata = {
						m_project: [Number(selectedData.getContent()[1].getSelectedKey())],
						m_assignment: [Number(selectedData.getContent()[3].getSelectedKey())],
						//	m_responsible: [Number(selectedData.getContent()[5].getSelectedKey())],

						type: "PPR",
						status: "New",
						m_program: [this.getView().getModel("programDetails").getData()[0].id]
					};

					$.ajax({
						url: "/OptimalCog/api/m-racis?populate=*",
						type: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": that.tdata
						}),
						success: function (res) {
							var getValues = JSON.parse(res);

							if (getValues.error) {
								MessageBox.error(getValues.error.message + "data is not Added Something went wrong!");
							} else {
								that.getView().getModel("programDetails").updateBindings(true);

								var kModel = new sap.ui.model.json.JSONModel(getValues.data);
								that.getView().setModel(kModel, "PPRmodel");
								that.getView().getModel("PPRmodel").getData();
								that.getView().getModel("PPRmodel").updateBindings(true);
								$.ajax({
									url: "/OptimalCog/api/m-consulteds?populate=*",
									type: "POST",
									headers: {
										"Content-Type": 'application/json'
									},
									data: JSON.stringify({

										"data": {
											"mraci": [that.getView().getModel("PPRmodel").getData().id],
											"users_permissions_users": [Number(that.consultedidforcheck)]
										}

									}),
									success: function (res) {
										var getValues = JSON.parse(res);

										if (getValues.error) {
											MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
										} else {
											that.getView().getModel("programDetails").updateBindings(true);
											that.getView().getModel("PPRmodel").updateBindings(true);
											$.ajax({
												url: "/OptimalCog/api/m-accountables?populate=*",
												type: "POST",
												headers: {
													"Content-Type": 'application/json'
												},
												data: JSON.stringify({

													"data": {
														"mraci": [that.getView().getModel("PPRmodel").getData().id],
														"users_permissions_users": [Number(that.accountidforcheck)]

													}

												}),
												success: function (res) {
													var getValues = JSON.parse(res);

													if (getValues.error) {
														MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
													} else {
														that.getView().getModel("programDetails").updateBindings(true);
														that.getView().getModel("PPRmodel").updateBindings(true);
														$.ajax({
															url: "/OptimalCog/api/m-informeds?populate=*",
															type: "POST",
															headers: {
																"Content-Type": 'application/json'
															},
															data: JSON.stringify({

																"data": {
																	"mraci": [that.getView().getModel("PPRmodel").getData().id],
																	"users_permissions_users": [Number(that.informedidforcheck)]

																}

															}),
															success: function (res) {
																var getValues = JSON.parse(res);

																if (getValues.error) {
																	MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
																} else {
																	$.ajax({
																		url: "/OptimalCog/api/m-responsibles?populate=*",
																		type: "POST",
																		headers: {
																			"Content-Type": 'application/json'
																		},
																		data: JSON.stringify({

																			"data": {
																				"mraci": [that.getView().getModel("PPRmodel").getData().id],
																				"users_permissions_users": [Number(that.responsibleidforcheck)]

																			}

																		}),
																		success: function (res) {
																			var getValues = JSON.parse(res);

																			if (getValues.error) {
																				MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
																			} else {

																				that.getView().getModel("PPRmodel").updateBindings(true);
																				MessageToast.show("PPR Added Successfully!");

																				that.getView().getModel("PPRmodel").refresh();
																				that.getView().getModel("programDetails").refresh();
																				that.selectedObjectRaci(that.sObjectId);
																				that.addRaciPPR.close();


																			}
																		}
																	})
																	// 	that.getView().getModel("PPRmodel").updateBindings(true);
																	// 	MessageToast.show("PPR Added Successfully!");

																	// 	that.getView().getModel("PPRmodel").refresh();
																	//  that.getView().getModel("programDetails").refresh();
																	//  that.selectedObjectRaci(that.sObjectId);
																	// 	that.addRaciPPR.close();

																}
															}
														})

													}
												}
											})

										}
									}
								})

							}
						}
					});


				} else {

					var mResponsibleId = that.mRaciModel.attributes.m_responsible.data.id;
					var mAccountableId = that.mRaciModel.attributes.m_accountable.data.id;
					var mConsultedId = that.mRaciModel.attributes.m_consulted.data.id;
					var mInformedId = that.mRaciModel.attributes.m_informed.data.id;
					$.ajax({
						url: "/OptimalCog/api/m-responsibles/" + mResponsibleId + "?populate=*",
						type: "PUT",
						headers: {
							"Content-Type": 'application/json'
						},
						data: JSON.stringify({
							"data": {
								"users_permissions_users": [Number(selectedData.getContent()[5].getSelectedKey())]
							}
						}),
						success: function (res) {
							var acc = Number(selectedData.getContent()[7].getSelectedKey());
							var user = that.mRaciModel.attributes.m_accountable.data.attributes.users_permissions_users.data[0].attributes.firstName;
							$.ajax({
								url: "/OptimalCog/api/m-accountables/" + mAccountableId + "?populate=*",
								type: "PUT",
								headers: {
									"Content-Type": 'application/json'
								},
								data: JSON.stringify({

									"data": {
										"users_permissions_users": [that.accountidforcheck]
									}

								}),
								success: function (res) {
									var user = that.mRaciModel.attributes.m_consulted.data.attributes.users_permissions_users.data[0].attributes.firstName;
									$.ajax({
										url: "/OptimalCog/api/m-consulteds/" + mConsultedId + "?populate=*",
										type: "PUT",
										headers: {
											"Content-Type": 'application/json'
										},
										data: JSON.stringify({

											"data": {
												"users_permissions_users": [that.consultedidforcheck]
											}

										}),
										success: function (res) {
											var user = that.mRaciModel.attributes.m_informed.data.attributes.users_permissions_users.data[0].attributes.firstName;
											$.ajax({
												url: "/OptimalCog/api/m-informeds/" + mInformedId + "?populate=*",
												type: "PUT",
												headers: {
													"Content-Type": 'application/json'
												},
												data: JSON.stringify({

													"data": {
														"users_permissions_users": [that.informedidforcheck]
													}

												}),
												success: function (res) {

													$.ajax({
														url: "/OptimalCog/api/m-racis/" + that.mRaciModel.id + "?populate[0]=m_responsible.users_permissions_users&populate[1]=m_accountable.users_permissions_users&populate[2]=m_project&populate[3]=m_assignment",
														type: "PUT",
														headers: {
															"Content-Type": 'application/json'
														},
														data: JSON.stringify({
															"data": that.raciData

														}),
														success: function (res) {
															var getValues = JSON.parse(res);

															if (getValues.error) {
																MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
															} else {
																// MessageToast.show("PPR Edited Successfully!");
																// that.selectedObjectRaci();
																// that.getView().getModel("programDetails").updateBindings(true);
																// that.getView().getModel("programDetails").refresh();
																// that.addRaciPPR.close();
																that.getView().getModel("PPRmodel").updateBindings(true);
																MessageToast.show("PPR Added Successfully!");
																// that.selectedObjectRaci();
																// that.getView().getModel("programDetails").updateBindings(true);
																that.getView().getModel("PPRmodel").refresh();
																that.getView().getModel("programDetails").refresh();
																that.selectedObjectRaci(that.sObjectId);
																that.addRaciPPR.close();
															}
														}
													});


												}
											});
										}
									});
								}
							});
						}
					});



				}
				this.clearRaciPPR(selectedData);
			} else {
				MessageBox.error("First Select the item");
			}
		},
		clearRaciPPR: function () {
			var selectedData = this.addRaciPPR.getContent()[0];
			selectedData.getContent()[1].setSelectedKey(null);
			selectedData.getContent()[3].setSelectedKey(null);
			selectedData.getContent()[5].setSelectedKey(null);
			selectedData.getContent()[7].setSelectedKey(null);
			selectedData.getContent()[9].setSelectedKey(null);
			selectedData.getContent()[11].setSelectedKey(null);
		},
		clearRaci: function () {
			var selectedData = this.AddRaci.getContent()[0];
			selectedData.getContent()[1].setSelectedKey(null);
			selectedData.getContent()[3].setSelectedKey(null);
			selectedData.getContent()[5].setSelectedKey(null);
			selectedData.getContent()[7].setSelectedKey(null);
			selectedData.getContent()[9].setSelectedKey(null);
			selectedData.getContent()[11].setSelectedKey(null);
		},
		handleDraftPress: function () {
			//	var status = this.getOwnerComponent().getModel("projectInfo").getData().programs[this.sPath].RACI.status;;
			var that = this;
			var status = this.getView().getModel("programDetails").getData()[0].attributes.mracis.data[0].attributes.status;
			if (status == "Submitted") {
				MessageToast.show("RACI Already Submitted.");
			} else {
				that.programStatusDraft("Draft");
				// this.getView().getModel("programDetails").getData()[0].attributes.mracis.data[0].attributes.status = "Draft"
				// this.getView().getModel("programDetails").updateBindings(true);
				// MessageToast.show("RACI Saved as Draft.");

			}
		},
		programStatusDraft: function (result) {
			var that = this;
			that.status = result;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var that = this;
			var raciUrl = "/OptimalCog/api/m-programs/" + that.sObjectId + "?populate[0]=mracis";
			$.ajax({
				url: raciUrl,
				method: "GET",
				success: function (response) {
					// Step 3: Loop through the retrieved RACI models and update their status to "Draft"
					var response = JSON.parse(response);

					var raciModels = response.data.attributes.mracis.data;
					for (var i = 0; i < raciModels.length; i++) {
						var raciModel = raciModels[i];
						raciModel.attributes.status = result;
						var statusPayload = {
							"status": result
						}

						// Step 4: Update the RACI model
						var updateUrl = "OptimalCog/api/m-racis/" + raciModel.id;
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

								that.selectedObjectRaci;
								sap.m.MessageToast.show("RACI Saved as Draft.")
								that.valueHelpForConfirmation.close();
							},

						});
					}
				},

			});

		},
		handleSubmitPress: function () {
			//var initialStatus = this.getOwnerComponent().getModel("projectInfo").getData().programs[this.sPath].RACI.status;
			var initialStatus = this.getView().getModel("programDetails").getData()[0].attributes.mracis.data[0].attributes.status
			if (initialStatus !== "Submitted") {

				this.valueHelpForConfirmation.open();
			} else {
				MessageToast.show("RACI  is already submitted.");
			}

		},
		handleEditItemPPRPress: function (evt) {
			var that = this;
			this.isEditTask = true;
			that.mRaciModel = evt.getSource().getBindingContext("PPRmodel").getObject();
			that.onProjectChangePPR(that.mRaciModel.attributes.m_project.data.id);
			if (!this.addRaciPPR) {
				this.addRaciPPR = sap.ui.xmlfragment("mdg_raci.RACI.fragment.addRaciPPR ", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddTask);
			}
			this.addRaciPPR.setProperty("title", "Edit RACI");
			this.addRaciPPR.getButtons()[0].setProperty("text", "Update");

			var mmModel = new sap.ui.model.json.JSONModel(this.getView().getModel("programDetails").getData()[0].attributes.m_projects.data)
			this.addRaciPPR.setModel(mmModel, "projModel");
			this.addRaciPPR.getContent()[0].getContent()[1].setSelectedKey(that.mRaciModel.attributes.m_project.data.id);
			var selProjIndex = that.mRaciModel.attributes.m_project.data.id;
			that.addRaciPPR.getContent()[0].getContent()[3].setSelectedKey(that.mRaciModel.attributes.m_assignment.data === null ? [] : that.mRaciModel
				.attributes
				.m_assignment.data.id);

			that.addRaciPPR.getContent()[0].getContent()[5].setSelectedKey(that.mRaciModel.attributes.m_responsible.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel.attributes
				.m_responsible.data.attributes.users_permissions_users.data[0].id);
			that.addRaciPPR.getContent()[0].getContent()[7].setSelectedKey(that.mRaciModel.attributes.m_accountable.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel.attributes
				.m_accountable.data.attributes.users_permissions_users.data[0].id);

			that.addRaciPPR.getContent()[0].getContent()[9].setSelectedKey(that.mRaciModel.attributes.m_consulted.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel
				.attributes
				.m_consulted.data.attributes.users_permissions_users.data[0].id);
			that.addRaciPPR.getContent()[0].getContent()[11].setSelectedKey(that.mRaciModel.attributes.m_informed.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel
				.attributes
				.m_informed.data.attributes.users_permissions_users.data[0].id);

			this.addRaciPPR.open();

		},
		onProjectChange: function (oEvent) {
			var that = this;

			var selProjIndex;
			if (typeof oEvent !== 'number') {
				selProjIndex = oEvent.getParameter("selectedItem").getProperty("key");
			} else {
				selProjIndex = oEvent;
			}
			$.ajax({
				url: "/OptimalCog/api/m-csfs?populate=*&filters[m_project][id][$eq]=" + selProjIndex,
				type: "GET",
				success: function (res) {
					var csrfDetails = JSON.parse(res);
					if (csrfDetails.error) {
						MessageBox.error(csrfDetails.error.message + "Something went wrong!");
					} else {
						var mmModel = new sap.ui.model.json.JSONModel(csrfDetails.data)
						that.AddRaci.setModel(mmModel, "csfmodel");
					}
				}
			});
			$.ajax({
				url: "/OptimalCog/api/users",
				type: "GET",
				success: function (res) {
					var teamModel = JSON.parse(res);
					if (teamModel.error) {
						MessageBox.error(teamModel.error.message + "Something went wrong!");
					} else {
						var tModel = new sap.ui.model.json.JSONModel(teamModel)
						that.AddRaci.setModel(tModel, "teamMemModel");
					}
				}
			});

		},
		onDependencySelect: function (oEvent) {

			this.responsibleidforcheck = oEvent.getParameter("selectedItem").getProperty("key");
		},
		onDependencySelectAccount: function (oEvent) {

			this.accountidforcheck = oEvent.getParameter("selectedItem").getProperty("key");
		},
		onDependencySelectConsult: function (oEvent) {

			this.consultedidforcheck = oEvent.getParameter("selectedItem").getProperty("key");
		},
		onDependencySelectInform: function (oEvent) {

			this.informedidforcheck = oEvent.getParameter("selectedItem").getProperty("key");
		},

		onProjectChangePPR: function (oEvent) {
			var that = this;

			var selProjIndex;
			if (typeof oEvent !== 'number') {
				selProjIndex = oEvent.getParameter("selectedItem").getProperty("key");
			} else {
				selProjIndex = oEvent;
			}

			$.ajax({
				url: "/OptimalCog/api/m-assignments?populate=*",
				type: "GET",
				success: function (res) {
					var pprDetails = JSON.parse(res);
					if (pprDetails.error) {
						MessageBox.error(pprDetails.error.message + "Something went wrong!");
					} else {
						var assignmentModel = new sap.ui.model.json.JSONModel(pprDetails.data)
						that.addRaciPPR.setModel(assignmentModel, "assignmentModel");

						that.addRaciPPR.getModel("assignmentModel").getData();
					}
				}
			});

			$.ajax({
				url: "/OptimalCog/api/users",
				type: "GET",
				success: function (res) {
					var teamModel = JSON.parse(res);
					if (teamModel.error) {
						MessageBox.error(teamModel.error.message + "Something went wrong!");
					} else {
						var tModel = new sap.ui.model.json.JSONModel(teamModel)
						that.addRaciPPR.setModel(tModel, "teamMemModel");
					}
				}
			});

		},
		handleEditItemPress: function (evt) {
			var that = this;
			this.isEditTask = true;
			that.mRaciModel = evt.getSource().getBindingContext("CSFRmodel").getObject();
			that.onProjectChange(that.mRaciModel.attributes.m_project.data.id);
			if (!this.AddRaci) {
				this.AddRaci = sap.ui.xmlfragment("mdg_raci.RACI.fragment.AddRaci", this);
				// this.CreateUpdateMobDialog.setModel(this.getView().getModel("i18n"), "i18n");
				this.getView().addDependent(this.AddTask);
			}
			this.AddRaci.setProperty("title", "Edit RACI");
			this.AddRaci.getButtons()[0].setProperty("text", "Update");

			var mmModel = new sap.ui.model.json.JSONModel(this.getView().getModel("programDetails").getData()[0].attributes.m_projects.data)
			this.AddRaci.setModel(mmModel, "projectData");
			this.AddRaci.getContent()[0].getContent()[1].setSelectedKey(that.mRaciModel.attributes.m_project.data.id);
			var selProjIndex = that.mRaciModel.attributes.m_project.data.id;
			that.AddRaci.getContent()[0].getContent()[3].setSelectedKey(that.mRaciModel.attributes.m_csf.data === null ? [] : that.mRaciModel.attributes
				.m_csf.data.id);

			that.AddRaci.getContent()[0].getContent()[5].setSelectedKey(that.mRaciModel.attributes.m_responsible.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel.attributes
				.m_responsible.data.attributes.users_permissions_users.data[0].id);
			that.AddRaci.getContent()[0].getContent()[7].setSelectedKey(that.mRaciModel.attributes.m_accountable.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel.attributes
				.m_accountable.data.attributes.users_permissions_users.data[0].id);

			that.AddRaci.getContent()[0].getContent()[9].setSelectedKey(that.mRaciModel.attributes.m_consulted.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel
				.attributes
				.m_consulted.data.attributes.users_permissions_users.data[0].id);
			that.AddRaci.getContent()[0].getContent()[11].setSelectedKey(that.mRaciModel.attributes.m_informed.data.attributes.users_permissions_users
				.data.length === 0 ? [] :
				that.mRaciModel
				.attributes
				.m_informed.data.attributes.users_permissions_users.data[0].id);
			//that.getView().getModel("programDetails").updateBindings(true);
			this.AddRaci.open();

		},
		handleDeleteRaci: function (oEvent) {
			var that = this;
				var table = this.getView().byId("raciTableId");
				var selectedItems = table.getSelectedItems();
	
				if (selectedItems.length > 0) {
					MessageBox.confirm("Are you sure you want to delete the selected CSFRs?", {
						title: "Confirm Deletion",
						icon: MessageBox.Icon.WARNING,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						emphasizedAction: MessageBox.Action.YES,
						onClose: function (oAction) {
							if (oAction === "YES") {
								var deletePromises = [];
	
								selectedItems.forEach(function (item) {
									var path = item.getBindingContextPath();
									var itemId = table.getModel("CSFRmodel").getProperty(path).id;
	
									deletePromises.push(
										new Promise(function (resolve, reject) {
											$.ajax({
												url: "/OptimalCog/api/m-racis/" + itemId,
												type: "DELETE",
												success: function (res) {
													resolve(res);
												},
												error: function (err) {
													reject(err.responseText);
												}
											});
										})
									);
								});
	
								Promise.all(deletePromises)
									.then(function () {
										// Handle success
										MessageToast.show("CSFRs Deleted Successfully!");
										
										that.selectedObjectRaci(that.sObjectId);
										that.getView().getModel("CSFRmodel").updateBindings(true);
										that.getView().getModel("CSFRmodel").refresh();
										that.getView().getModel("programDetails").refresh();
	
										that.getView().getModel("programDetails").updateBindings(true);
	
										
									})
									.catch(function (error) {
										// Handle error
										MessageBox.error(error);
									});
							}
						}
					});
				} else {
					sap.m.MessageToast.show("Please select at least one item.");
				}	
			},
	
			handleDeleteRaciPPR: function (oEvent) {
				var that = this;
				var table = this.getView().byId("raciTablePPRId");
				var selectedItems = table.getSelectedItems();
	
				if (selectedItems.length > 0) {
					MessageBox.confirm("Are you sure you want to delete the selected PPRs?", {
						title: "Confirm Deletion",
						icon: MessageBox.Icon.WARNING,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						emphasizedAction: MessageBox.Action.YES,
						onClose: function (oAction) {
							if (oAction === "YES") {
								var deletePromises = [];
	
								selectedItems.forEach(function (item) {
									var path = item.getBindingContextPath();
									var itemId = table.getModel("PPRmodel").getProperty(path).id;
	
									deletePromises.push(
										new Promise(function (resolve, reject) {
											$.ajax({
												url: "/OptimalCog/api/m-racis/" + itemId,
												type: "DELETE",
												success: function (res) {
													resolve(res);
												},
												error: function (err) {
													reject(err.responseText);
												}
											});
										})
									);
								});
	
								Promise.all(deletePromises)
									.then(function () {
										// Handle success
										MessageToast.show("PPRs Deleted Successfully!");
										
										that.selectedObjectRaci(that.sObjectId);
										that.getView().getModel("PPRmodel").updateBindings(true);
										that.getView().getModel("PPRmodel").refresh();
										that.getView().getModel("programDetails").refresh();
	
										that.getView().getModel("programDetails").updateBindings(true);
	
										
									})
									.catch(function (error) {
										// Handle error
										MessageBox.error(error);
									});
							}
						}
					});
				} else {
					sap.m.MessageToast.show("Please select at least one item.");
				}
	
	
			},
		
		
		onCloseDetailPress: function () {
			// this.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/FullScreen",false);
			// this.getOwnerComponent().getRouter().navTo("master");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			this.getOwnerComponent().getRouter().navTo("master", {
				//	layout: sNextLayout
			});
		},
		//	},
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

		onExport: function (oEvent) {

			var oData, oSheet;

			oData = this.getView().getModel("CSFRmodel").getData();
			oData.forEach(function (items) {

				if (items.attributes.m_project.data == null) {
					items.attributes.m_project.data = "####";
				}

				if (items.attributes.m_csf.data == null) {
					items.attributes.m_csf.data = "####";
				}
				if (items.attributes.m_responsible.data == "") {
					items.attributes.m_responsible.data = "####";
				}
				if (items.attributes.m_accountable.data == "") {
					items.attributes.m_accountable.data = "####";
				}
				if (items.attributes.m_consulted.data == "") {
					items.attributes.m_consulted.data = "####";
				}
				if (items.attributes.m_informed.data == "") {
					items.attributes.m_informed.data = "####";
				}
			});

			oSheet = new sap.ui.export.Spreadsheet({
				workbook: {
					columns: this.createColumns()
				},
				dataSource: oData,
				fileName: "RACI.xlsx"
			});
			oSheet.build();

		},
		createColumns: function () {

			return [{
					label: "Project",
					property: "attributes/m_project/data/attributes/name"
				}, {
					label: "CSF",
					property: "attributes/m_csf/data/attributes/name"
				}, {
					label: "Responsible",
					property: "{attributes/m_responsible/data/attributes/users_permissions_users/data/0/attributes/firstName}{attributes/m_responsible/data/attributes/users_permissions_users/data/0/attributes/lastName}"
				}, {
					label: "Accountable",
					property: "attributes/m_accountable/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}, {
					label: "Consulted",
					property: "attributes/m_consulted/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}, {
					label: "Informed",
					property: "attributes/m_informed/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}

			];

		},
		onExportPPR: function (oEvent) {

			var oData, oSheet;

			oData = this.getView().getModel("PPRmodel").getData();

			oData.forEach(function (items) {

				if (items.attributes.m_project.data == "") {
					items.attributes.m_project.data = "####";
				}

				if (items.attributes.m_assignment.data == "") {
					items.attributes.m_assignment.data = "####";
				}
				if (items.attributes.m_responsible.data == "") {
					items.attributes.m_responsible.data = "####";
				}
				if (items.attributes.m_accountable.data == "") {
					items.attributes.m_accountable.data = "####";
				}
				if (items.attributes.m_consulted.data == "") {
					items.attributes.m_consulted.data = "####";
				}
				if (items.attributes.m_informed.data == "") {
					items.attributes.m_informed.data = "####";
				}
			});

			oSheet = new sap.ui.export.Spreadsheet({
				workbook: {
					columns: this.createColumnsPPR()
				},
				dataSource: oData,
				fileName: "PPR.xlsx"
			});
			oSheet.build();

		},
		createColumnsPPR: function () {

			return [{
					label: "Project",
					property: "attributes/m_project/data/attributes/name"
				}, {
					label: "Assignment",
					property: "attributes/m_assignment/data/attributes/name"
				}, {
					label: "Responsible",
					property: "attributes/m_responsible/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}, {
					label: "Accountable",
					property: "attributes/m_accountable/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}, {
					label: "Consulted",
					property: "attributes/m_consulted/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}, {
					label: "Informed",
					property: "attributes/m_informed/data/attributes/users_permissions_users/data/0/attributes/firstName"
				}

			];

		},
		hanldeTable1Search: function (evt) {
			var that = this;
			var filter1 = new sap.ui.model.Filter(
				"attributes/m_responsible/data/attributes/users_permissions_users/data/0/attributes/firstName", "Contains", evt.getParameter(
					"newValue"));
			var filter2 = new sap.ui.model.Filter(
				"attributes/m_accountable/data/attributes/users_permissions_users/data/0/attributes/firstName", "Contains", evt.getParameter(
					"newValue"));
			var filter3 = new sap.ui.model.Filter("attributes/m_consulted/data/attributes/users_permissions_users/data/0/attributes/firstName",
				"Contains", evt.getParameter("newValue"));
			var filter4 = new sap.ui.model.Filter("attributes/m_informed/data/attributes/users_permissions_users/data/0/attributes/firstName",
				"Contains", evt.getParameter("newValue"));
			var filters = [filter1, filter2, filter3, filter4];
			this.getView().byId("raciTableId").getBinding("items").filter(new sap.ui.model.Filter(filters, false));
		},
		hanldeTable2Search: function (evt) {
			var that = this;

			var filter1 = new sap.ui.model.Filter(
				"attributes/m_responsible/data/attributes/users_permissions_users/data/0/attributes/firstName", "Contains", evt.getParameter(
					"newValue"));
			var filter2 = new sap.ui.model.Filter(
				"attributes/m_accountable/data/attributes/users_permissions_users/data/0/attributes/firstName", "Contains", evt.getParameter(
					"newValue"));
			var filter3 = new sap.ui.model.Filter("attributes/m_consulted/data/attributes/users_permissions_users/data/0/attributes/firstName",
				"Contains", evt.getParameter("newValue"));
			var filter4 = new sap.ui.model.Filter("attributes/m_informed/data/attributes/users_permissions_users/data/0/attributes/firstName",
				"Contains", evt.getParameter("newValue"));
			var filters = [filter1, filter2, filter3, filter4];
			this.getView().byId("raciTablePPRId").getBinding("items").filter(new sap.ui.model.Filter(filters, false));
		},
		handleApproveConfirm: function () {
			var that = this;
			var selectedKey = this.valueHelpForConfirmation.getContent()[0].getContent()[3].getSelectedKey();

			if (selectedKey.length == 0) {
				sap.m.MessageToast.show("Please select the approver");
				this.valueHelpForConfirmation.getContent()[0].getContent()[3].setValueState("Error");
			} else {

				that.programStatus("Submitted");
				// that.getView().byId("submitButtonId").setVisible(false);
				// sap.m.MessageToast.show("RACI Submitted Succesfully")
				// that.valueHelpForConfirmation.close();

			}

		},
		programStatus: function (result) {
			var that = this;
			that.status = result;
			// var statusPayload = {
			// 	"status": result
			// }
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			var that = this;
			var raciUrl = "/OptimalCog/api/m-programs/" + that.sObjectId + "?populate[0]=mracis";
			$.ajax({
				url: raciUrl,
				method: "GET",
				success: function (response) {
					// Step 3: Loop through the retrieved RACI models and update their status to "Submitted"
					var response = JSON.parse(response);

					//	var raciModels = response.data;
					var raciModels = response.data.attributes.mracis.data;
					for (var i = 0; i < raciModels.length; i++) {
						var raciModel = raciModels[i];
						raciModel.attributes.status = result;
						var statusPayload = {
								"status": result
							}
							//	raciModel.attributes.approver = selectedKey;
							//	that.getView().getModel("programDetails").updateBindings(true);
							//	that.selectedObjectRaci;
							// Step 4: Update the RACI model
						var updateUrl = "OptimalCog/api/m-racis/" + raciModel.id;
						$.ajax({
							url: updateUrl,
							method: "PUT",
							headers: {
								"Content-Type": "application/json"
							},
							// "data" :{
							// 	"status" : raciModel.attributes.status,
							// },
							data: JSON.stringify({
								"data": statusPayload
							}),
							// data: {
							// 	"data": {raciModel.status
							// },
							success: function (response) {

								that.selectedObjectRaci;
								//that.getView().byId("submitButtonId").setVisible(false);
								sap.m.MessageToast.show("RACI Submitted Succesfully")
								that.valueHelpForConfirmation.close();
							},
							error: function (error) {

							}
						});
					}
				},
				error: function (error) {

				}
			});

		},

		handleApproveCancel: function () {
			this.valueHelpForConfirmation.close();
		},
		handleSelectChange: function () {
			this.valueHelpForConfirmation.getContent()[0].getContent()[3].setValueState("None");
		},
		handleApproveButtonPress: function () {
			var that = this;
			sap.m.MessageBox.confirm("Do you want to approve the RACI?", function (oEvent) {
				if (oEvent = "OK") {
					that.handleStatus("Approved");
					// that.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].RACI.status = "Approved";
					// that.getOwnerComponent().getModel("projectInfo").updateBindings(true);
					// that.getView().getModel("projModel").getData().RACI.status = "Approved";
					// that.getView().getModel("projModel").updateBindings(true);
					// that.getView().byId("approveButtonId").setVisible(false);
					// that.getView().byId("rejectButtonId").setVisible(false);
					// sap.m.MessageToast.show(that.oBundle.getText("RACI Successfully Approved"), {
					// 	closeOnBrowserNavigation: false
					// });
					// this.valueHelpForConfirmation.close();
				}
			});
		},
		handleRejectButtonPress: function () {
			var that = this;
			sap.m.MessageBox.confirm("Do you want to reject the RACI?", function (oEvent) {
				if (oEvent = "OK") {
					that.handleStatus("Rejected");
					// that.getOwnerComponent().getModel("projectInfo").getData().programs[that.sPath].RACI.status = "Rejected";
					// that.getOwnerComponent().getModel("projectInfo").updateBindings(true);
					// that.getView().getModel("projModel").getData().RACI.status = "Rejected";
					// that.getView().getModel("projModel").updateBindings(true);
					// that.getView().byId("approveButtonId").setVisible(false);
					// that.getView().byId("rejectButtonId").setVisible(false);
					// sap.m.MessageToast.show(that.oBundle.getText("RACI successfully Rejected"), {
					// 	closeOnBrowserNavigation: false
					// });
					// this.valueHelpForConfirmation.close();
				}
			});
		},
		handleStatus: function (result) {

			var StatusPr = this.getView().getModel("programDetails").getData()[0].attributes.mracis.data[0].attributes.status;
			//	this.getView().getModel("programDetails").getData()[0].attributes.mracis.data[0].attributes.status
			var that = this;
			that.status = result;
			var statusPayload = {
				"status": result
			}
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");
			this.getView().getModel("appView").setProperty("/layout", "OneColumn");
			$.ajax({
				//OptimalCog/api/m-programs/1?filters[mracis][status][$eq]=New
				url: "/OptimalCog/api/m-programs/" + that.sObjectId + "?filters[mracis][status][$eq]=" + StatusPr,
				//	url: "/OptimalCog/api/m-racis/" + that.sObjectId + "?filters[mracis][status][$eq]=" + StatusPr ,
				type: "PUT",
				headers: {
					"Content-Type": 'application/json'
				},
				data: JSON.stringify({
					"data": statusPayload
				}),
				success: function (res) {
					var getValues = JSON.parse(res);

					if (getValues.error) {
						MessageBox.error(getValues.error.message + "data is not Updated Something went wrong!");
					} else {
						that.selectedObjectRaci(that.sObjectId);
					}
				}
			});
		}

	});

});