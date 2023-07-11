sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"VASPP/MDGSystem/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("VASPP.MDGSystem.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			var userData = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
			if (userData) {
				userData.autoLoggedOn = true;
				window.localStorage.setItem("loggedOnUserData", JSON.stringify(userData));
			}
			var globalData = {
				//	clientId: "242783352638-bolmpu51onq40dd2lq3560k2kc4tusnq.apps.googleusercontent.com"
				//	clientId: "242783352638-edemn1vhupnamguft4ov4bcaen7a8l8e.apps.googleusercontent.com"
				//	clientId:"242783352638-nab4ave2qiibmtkms1c4in04qpgts3n5.apps.googleusercontent.com"
				//	clientId: "242783352638-7ujdrv5490ls1128lmagdvomihl963ea.apps.googleusercontent.com"
				clientId:"242783352638-k79j084ub52rhs0pldvceuec6lftii7s.apps.googleusercontent.com"
			};
			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(globalData), "GlobalDataModel");
		}
	});
});