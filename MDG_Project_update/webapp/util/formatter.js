sap.ui.define([], function () {
	"use strict";

	return {
		 /*test: function(data){
		 	console.log("Data received to the formatter function test:");
		 	console.log(data);
			return data;	
		},*/
		
		get_i18n_value: function(title){
			//return this.getView().getModel("i18n").getProperty(title); 
			return this.getView().getModel("i18n").getProperty(title);
		},
		
		getFirstWord: function (sSentence) {
			if (sSentence) {
				return sSentence.split(" ")[0];
			}
		},
		// All apps permitted from the Users Management application will be allowed for use.
		// All the premitted apps should come in the pagepermission array while the user logs on.
		// You can find the pagepermission array in the data received after each successful log on.
		isAppVisible: function (oMenuItem) {
			if (oMenuItem) {
				var userRole = this.getOwnerComponent().getModel("loggedOnUserModel").getData().mrole.roleName;
				if (oMenuItem.key === "Home") {
					return true;
				} else if (oMenuItem.key === "UsersManagement" && userRole === "Super Admin") {
					return true;
				}

				// Proceeds below only if both of the above condintions are false

				var appId = oMenuItem.id,
					appName = oMenuItem.title,
					returnValue = false;
				var permissionData = this.getOwnerComponent().getModel("loggedOnUserModel").getData().appPermission,
					permittedAppName,
					subMenuItems = oMenuItem.items;
				for (var appIndex = 0; appIndex < permissionData.length; appIndex++) {
					permittedAppName = permissionData[appIndex].name;
					if (subMenuItems && subMenuItems.length) {
						for (var itemIndex = 0; itemIndex < subMenuItems.length; itemIndex++) {
							if (subMenuItems[itemIndex].id === permissionData[appIndex].applicationid || subMenuItems[itemIndex].title === permittedAppName) { //If an app inside the submenu is assigned to the user
								returnValue = true;
								break;
							}
						}
					} else {
						if (appId === permissionData[appIndex].applicationid || appName === permittedAppName) { //If the app is assigned to the user
							returnValue = true;
							break;
						}
					}
				}
				return returnValue;
			}
		}
	};
});