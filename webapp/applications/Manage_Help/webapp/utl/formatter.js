sap.ui.define([], function () {
	"use strict";
	return {
		handleIcon: function (appName) {
			if (appName === "Project Management") {
				return "sap-icon://project-definition-triangle"
			} else if (appName === "Manage Programs") {
				return "sap-icon://manager"
			} else if (appName === "Manage Customers") {
				return "sap-icon://customer"
			} else if (appName === "Manage Vendors") {
				return "sap-icon://supplier"
			} else if (appName === "User Management") {
				return "sap-icon://collaborate"
			} else if (appName === "Report") {
				return "sap-icon://expense-report"
			} else if (appName === "Glossary") {
				return "sap-icon://form"
			} else if (appName === "Organization Chart") {
				return "sap-icon://business-objects-experience"
			} else if (appName === "RACI") {
				return "sap-icon://activities"
			} else if (appName === "Forms") {
				return "sap-icon://manager-insight"
			} else{
				return ""
			}
		}

	};
});