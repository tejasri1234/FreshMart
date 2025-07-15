sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
], function (Controller, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("project.controller.AdminDashboard", {
        onInit: function () {
        },
        onProductManagement: function () {
            this._navigateTo("AdminProduct");
        },

        onAnalytics: function () {
            this._navigateTo("Charts");
        },

        _navigateTo: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo(sRouteName);
        }
    });
});
