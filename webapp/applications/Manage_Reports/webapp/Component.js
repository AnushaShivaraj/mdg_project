sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"MDG/Report/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("MDG.Report.Component", {

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
             var mConfig = this.getMetadata().getConfig();
			var oRootPath = jQuery.sap.getModulePath("");
			// set i18n model
			var Language = navigator.language;
			var resourceBundle = "i18n/i18n.properties";
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: [oRootPath, resourceBundle].join("/"),
				locale: Language
			});
			// this.setModel(i18nModel, "i18n");
			sap.ui.getCore().setModel(i18nModel, "i18n");
			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});