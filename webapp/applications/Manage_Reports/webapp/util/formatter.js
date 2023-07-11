sap.ui.define([], function () {
	"use strict";
	return {
		dateFormatter: function (value) {
			if (value) {
				value = new Date(parseInt(value.replace('/Date(', '')));
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "MM/dd/yyyy",
					UTC: true
				});
				return oDateFormat.format(new Date(value));
			} else return value;
		},
		translateStatus: function(status){
			if(status == "New")
				return sap.ui.getCore().getModel('i18n').getProperty("New");
			else if(status == "Submitted")
				return sap.ui.getCore().getModel('i18n').getProperty("Submitted");
			else if(status == "In Progress")
				return sap.ui.getCore().getModel('i18n').getProperty("InProgress");
			else if(status == "Delayed")
				return sap.ui.getCore().getModel('i18n').getProperty("Delayed");
			else if(status == "Completed")
				return sap.ui.getCore().getModel('i18n').getProperty("Completed");
			else if(status == "Approved")
				return sap.ui.getCore().getModel('i18n').getProperty("Approved");
			else if(status == "Open")
				return sap.ui.getCore().getModel('i18n').getProperty("Open");
			else if(status == "Closed")
				return sap.ui.getCore().getModel('i18n').getProperty("Closed");
			else if(status == "Rejected")
				return sap.ui.getCore().getModel('i18n').getProperty("Rejected");
			else if(status == "GNR")
				return sap.ui.getCore().getModel('i18n').getProperty("GNR");
			else
				return sap.ui.getCore().getModel('i18n').getProperty("INU");
					
		}
	};
});