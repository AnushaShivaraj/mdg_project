sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * @public
		 * @param {boolean} bIsPhone the value to be checked
		 * @returns {string} path to image
		 */
		test: function (data) {
			return data;
		},
		getTypeofTemplateForDraft: function (status) {
			if (status === "Draft")
				return true;
			else
				return false;
		},

		getTypeofTemplateForPublished: function (status) {
			if (status === "Published")
				return true;
			else
				return false;
		},

		getTypeofTemplateForArchived: function (status) {
			if (status === "Archived")
				return true;
			else
				return false;
		},

		getTypeofQuestionForMultiChoi: function (questionType) {
			if (questionType === "Multiple Choice" || questionType == "mehrere Auswahlm\u00f6glichkeiten") return true;
			else return false;
		},
		getTypeofQuestionForSingChoi: function (questionType) {
			if (questionType === "Single Choice" || questionType == "nur eine Auswahlm\u00f6glichkeit") return true;
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
		// ex: function(ans){
		// 	console.log(ans);
		// },
		getPublishFormCount: function (dept_name) {
			// var factorsModel = new sap.ui.model.json.JSONModel();
			// factorsModel.loadData(jQuery.sap.getModulePath("EHS.Manage_Sections.model", "/Factors.json"));
			// var count = 0;
			// factorsModel.attachRequestCompleted(function () {
			// factorsModel.oData.Factors.forEach(function (item) {
			// 	if (item.industry === dept_name)
			// 		count++;
			// });
			// return count;
			// });
			var count = 0;
			var factors = sap.ui.getCore().getModel("Factors").oData;
			factors.forEach(function (item) {
				if ((item.industry == dept_name || item.industry == "All") && item.Status != "template")
					count++;
			});
			return count;
			// var factorsModel = this.getView().getModel();
			// if(typeof(factorsModel) != undefined)
			// var count = 0;
			// factorsModel.oData.forEach(function (item) {
			// 	if (item.industry === dept_name)
			// 		count++;
			// });
			// return count;
		},
		getNoOfDraftForms: function (factors) {
			if (factors.length != undefined) {
				var count = 0;
				factors.forEach(function (item) {
					if (item.Status == "Draft")
						count++;
				});
				return count;
			}
		},
		getNoOfPublishedForms: function (factors) {
			if (factors.length != undefined) {
				var count = 0;
				factors.forEach(function (item) {
					if (item.Status == "Published")
						count++;
				});
				return count;
			}
		},
		getNoOfArchivedForms: function (factors) {
			if (factors.length != undefined) {
				var count = 0;
				factors.forEach(function (item) {
					if (item.Status == "Archived")
						count++;
				});
				return count;
			}
		},
		getDate: function (sdate) {
			if (sdate != "") {
				var date = new Date(sdate);
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var dt = date.getDate();

				if (dt < 10) {
					dt = '0' + dt;
				}
				if (month < 10) {
					month = '0' + month;
				}
				//	return (dt + '.' + month + '.' + year);
				return (dt + '.' + month + '.' + year);
			} else
				return "";
		},

		translateStatus: function (sStatus) {
			debugger
			return this.oBundle.getText(sStatus); //This i18n resource bundle is defined in the controller
		},
		ValidateDurationField: function (status) {
			var value = true;
			if (status == "Veröffentlicht" || status == "Published") {
				value = false;
			}
			return value;
		},
		getTemplateStatus: function (status) {
			if (status == "template")
				return true;
			else
				return false;
		},

		getAllIndustries: function (indus) {
			if (indus == "All")
				return false;
			else
				return true;
		},
		getOptionDeleteButtonVisible: function (inputText, obj) {
			var x = 1;
			return true;
		},
		isEditable: function (fdate) {
			if (fdate != '' && fdate != undefined)
				return true;
			else
				return false;
		},
		getStatus: function (status) {
			return sap.ui.getCore().getModel("i18n").getProperty(status);
		},
		isVisible: function (title) {
			if (title == "Add Sub-Category")
				return false;
			else
				return true;
		},
		isLink: function (title) {
			if (title == "Add Sub-Category")
				return true;
			else
				return false;
		},
		// getDeleteOption: function(option){
		// 	console.log(option);
		// },
		getResponseCount: function (responses) {
			if (responses != null && responses != undefined)
				return responses.length;
			else
				return 0;
		},
		getTitle: function (title) {
			return this.getView().getModel("i18n").getProperty(title);
		}

	};
});