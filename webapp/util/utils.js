sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * This function runs any requested backend service.
		 */
		runService: function (destinationPath, serviceName, inputData, method, oResourceBundle, fnCallback) {
			var that = this,
				msg = "";

			if (!destinationPath) {
				console.error("Destination path is missing");
				return;
			} else if (!serviceName) {
				console.error("Service name is missing");
				return;
			} else if (!inputData) {
				inputData = {};
			}

			// Now, trying to run the service
			var serviceUrl = destinationPath + "/" + serviceName;
			if (method.toLowerCase() === "get") {
				$.get(serviceUrl, inputData, function (respns) {
					var response = {};
					try {
						respns = JSON.parse(respns);
						if (respns.status) {
							response = respns;
						} else {
							response.status = "success";
							response.data = respns;
						}

						if (response.status.toLowerCase() === "success") {
							response.status = "success"; //make it lowercase.
							fnCallback(response);
						} else {
							msg = oResourceBundle.getText("errorMsgFromBackend", [serviceName]) + "\n\n" + response.message;
							if (response.message.toLowerCase() === "invalid session") {
								fnCallback({
									"status": "error",
									"message": "invalid session"
								});
							} else if (!response.data) {
								fnCallback({
									"status": "error",
									"message": msg
								});
							} else {
								fnCallback({
									"status": "error",
									"message": msg,
									"data": response.data
								});
							}
						}
					} catch (exception) { // If the response from backend is not in correct format
						msg = oResourceBundle.getText("errorMsgFromBackend", [serviceName]) + "\n\n" + respns;
						fnCallback({
							"status": "error",
							"message": msg
						});
					}
				}).error(function (jqXHR, exception) {
					if (jqXHR.status === 503 && !jqXHR.responseText.includes("SAP Cloud Connector")) {
						msg = oResourceBundle.getText("errorMsgRefreshAppPrompt");
					} else if (jqXHR.status === 503) {
						msg = oResourceBundle.getText("errorMsgBackendServerIrresponsive");
					}
					if (msg) {
						msg = oResourceBundle.getText("errorWhileRunningSvc", [serviceName]) +
							"\n\n" + jqXHR.responseText +
							"\n\n" + msg +
							"\n\n" + jqXHR.statusText + " [" + jqXHR.status + "]";
					} else {
						msg = oResourceBundle.getText("errorWhileRunningSvc", [serviceName]) +
							"\n\n" + jqXHR.responseText +
							"\n\n" + jqXHR.statusText + " [" + jqXHR.status + "]";
					}
					fnCallback({
						"status": "error",
						"message": msg
					});
				});
			} else if (method.toLowerCase() === "post") {

				jQuery.ajax({
					url: serviceUrl,
					method: "POST",
					data: JSON.stringify(inputData),
					dataType: "jsons",
					contentType: "application/json; charset=utf-8",
					success: function (respns, textStatus, jqXHR) {
						// "{"ajaxProperty":"success","data":{"status":"success"},"textStatus":"success","jqXHR":{"readyState":4,"responseText":"{\"status\":\"success\"}","responseJSON":{"status":"success"},"status":200,"statusText":"success"}}"
						var response = {};
						if (respns.status) {
							response = respns;
						} else {
							response.status = "success";
							response.data = respns;
						}

						if (response.status.toLowerCase() === "success") {
							response.status = "success"; //make it lowercase.
							fnCallback(response);
						} else {
							msg = oResourceBundle.getText("errorMsgFromBackend", [serviceName]) + "\n\n" + response.message;
							if (response.message.toLowerCase() === "invalid session") {
								fnCallback({
									"status": "error",
									"message": "invalid session"
								});
							} else if (!response.data) {
								fnCallback({
									"status": "error",
									"message": msg
								});
							} else {
								fnCallback({
									"status": "error",
									"message": msg,
									"data": response.data
								});
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						if (jqXHR.status != 200) {
							// "{"ajaxProperty":"error","jqXHR":{"readyState":4,"responseText":"<html><head><title>Error report</title></head><body><h1>HTTP Status 504 - Socket connection timed out for host http://192.168.0.106:3030. Reason: Read timed out (local port 36836 to address 127.0.0.1 (localhost), remote port 20001 to address 127.0.0.1 (localhost))</h1></body></html>","status":504,"statusText":"error"},"textStatus":"error","errorThrown":""}"

							if (jqXHR.status === 503 && !jqXHR.responseText.includes("SAP Cloud Connector")) {
								msg = oResourceBundle.getText("errorMsgRefreshAppPrompt");
							} else if (jqXHR.status === 503) {
								msg = oResourceBundle.getText("errorMsgBackendServerIrresponsive");
							}

							if (msg) {
								msg = oResourceBundle.getText("errorWhileRunningSvc", [serviceName]) +
									"\n\n" + jqXHR.responseText +
									"\n\n" + msg +
									"\n\n" + jqXHR.statusText + " [" + jqXHR.status + "]";
							} else {
								msg = oResourceBundle.getText("errorWhileRunningSvc", [serviceName]) +
									"\n\n" + jqXHR.responseText +
									"\n\n" + jqXHR.statusText + " [" + jqXHR.status + "]";
							}
							fnCallback({
								"status": "error",
								"message": msg
							});

						} else {
							var response = {};
							var resp;
							try {
								resp = JSON.parse(jqXHR.responseText);
							} catch (excep) {
								fnCallback({
									"status": "error",
									"message": jqXHR.responseText
								});
								return;
							}
							
							if (resp.status) {
								response = resp;
							} else {
								response.status = "success";
								response.data = resp;
							}

							if (response.status.toLowerCase() === "success") {
								response.status = "success"; //make it lowercase.
								fnCallback(response);
							} else {
								msg = oResourceBundle.getText("errorMsgFromBackend", [serviceName]) + "\n\n" + response.message;
								if (response.message.toLowerCase() === "invalid session") {
									fnCallback({
										"status": "error",
										"message": "invalid session"
									});
								} else if (!response.data) {
									fnCallback({
										"status": "error",
										"message": msg
									});
								} else {
									fnCallback({
										"status": "error",
										"message": msg,
										"data": response.data
									});
								}
							}
						}
					}
				});

				// $.post(serviceUrl, inputData, function (response) {
				// 	response = JSON.parse(response);
				// 	if (response.status === "success") {
				// 		fnCallback (response);
				// 	} else {
				// 		msg = oResourceBundle.getText("errorMsgFromBackend", [serviceName])
				// 			+ "\n\n" + response.message;
				// 		fnCallback ({"status": "error", "message": msg});
				// 	}
				// }).error(function (jqXHR, exception) {
				// 	msg = oResourceBundle.getText("reportErrorToAdmin");
				// 	if (jqXHR.status === 503 && !jqXHR.responseText.includes("SAP Cloud Connector")) {
				// 		msg = oResourceBundle.getText("errorMsgRefreshAppPrompt");
				// 	} else if (jqXHR.status === 503) {
				// 		msg = oResourceBundle.getText("errorMsgBackendServerIrresponsive")
				// 			+ "\n" + msg;
				// 	}
				// 	msg = oResourceBundle.getText("errorWhileRunningSvc", [serviceName]) +
				// 		"\n\n" + jqXHR.responseText +
				// 		"\n\n" + msg +
				// 		"\n\n" + jqXHR.statusText + " [" + jqXHR.status + "]";
				// 	fnCallback ({"status": "error", "message": msg});
				// });
			} else { // If a wrong method was passed to this function
				msg = oResourceBundle.getText("unknownMethod") + ": " + method;
				fnCallback({
					"status": "error",
					"message": msg
				});
				console.error(msg);
			}
		}

		//... Please define the following properties in your application's i18n file(s) in order to make th function log properly ...//
		// reportErrorToAdmin=If this error persists, please report this error to your backend system administrator.
		// errorMsgRefreshAppPrompt=Perhaps the application was open and not used for a long time. Refreshing your application may help, please refresh!
		// errorMsgBackendServerIrresponsive=Possibly, the backend server has been turned off or restarting. Please try again after a few minutes.
		// errorWhileRunningSvc=The following error occurred while running the {0} service:
		// errorMsgFromBackend=We have received the following error message from backend while running the {0} service:
		// unknownMethod=Unknown method
	};
});