sap.ui.define([], function () {
	"use strict";
	return {
		handleDateValues: function (date) {
			if (date !== null) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					//	pattern: "dd.MM.YYYY"
					pattern: "YYY-MM-dd"
				});
				//console.log(dateFormat.format(new Date(date)));
				return dateFormat.format(new Date(date));
			}
		},
		getStatus: function (status) {
			if (status == "New") return "None";
			else if (status == "In-Progress") return "Warning";
			else if (status == "Completed") return "Success";
			else if (status == "Delayed") return "Error";
			else if (status == "Archived") return "Indication05";
			else if (status == "Cancelled") return "Error";
			else return "None";
		},
		getStatusForNodes: function (status) {
			if (status == "New") return "Neutral";
			else if (status == "In-Progress") return "Critical";
			else if (status == "Completed") {
				return "Positive";
			} else if (status == "Delayed") return "Negative";
			else return "Neutral";
		},
		getIconForLanes: function (status) {
			if (status == "New") return "sap-icon://order-status";
			else if (status == "In-Progress") return "sap-icon://monitor-payments";
			else if (status == "Completed") return "sap-icon://payment-approval";
			else if (status == "Delayed") return "sap-icon://visits";
			else return "sap-icon://begin";
		},
		//Boodigowda 25/01/2022
		getTypeofQuestionForMultiChoi: function (questionType) {
			if (questionType === "Multiple Choice" || questionType == "mehrere Auswahlm\u00f6glichkeiten") return true;
			else return false;
		},
		getTypeofQuestionForTextSinglePara: function (questionType) {
			if (questionType !== "Multiple Choice" || questionType !== "mehrere Auswahlm\u00f6glichkeiten") return true;
			else return false;
		},
		getTypeofQuestionForSingChoi: function (questionType) {
			if (questionType === "SingleChoice" || questionType === "Single Choice" || questionType == "nur eine Auswahlm\u00f6glichkeit") return true;
			else return false;
		},
		getTypeofQuestionForPara: function (questionType) {
			if (questionType === "Paragraph" || questionType == "Absatz") return true;
			else return false;
		},
		getTypeofQuestionForDateSelect: function (questionType) {
			if (questionType === "DateSelection" || questionType == "Absatz") return true;
			else return false;
		},
		getSelected: function (answer, optionText) {
			console.log(answer, optionText);
			if (weight == optionText)
				return true;
			else return false;
		}
	};
});