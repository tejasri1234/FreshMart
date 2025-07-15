sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/Text",
  "sap/m/VBox",
  "sap/m/MessageBox"

], (Controller, Fragment) => {
  "use strict";

  return Controller.extend("project.controller.View1", {
    onInit() {
      this.oModel = this.getOwnerComponent().getModel();
      this.getView().setModel(new sap.ui.model.json.JSONModel({ results: [] }), "searchModel");
    
      // Disable right-click
  
    },
    onMenuPress: function (oEvent) {
      if (!this._oMenuSheet) {
        this._oMenuSheet = new sap.m.ActionSheet({
          buttons: [
            new sap.m.Button({
              text: "My Orders",
              icon: "sap-icon://order-status",
              press: () => {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Orders"); // Ensure route name matches manifest.json
              }
            }),
            new sap.m.Button({
              text: "Account",
              icon: "sap-icon://account",
              press: () => {               
                  var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                  oRouter.navTo("account");
              }
            })
          ],
          placement: sap.m.PlacementType.Bottom,
          class: "customActionSheet"
        });
        this.getView().addDependent(this._oMenuSheet);
      }
      this._oMenuSheet.openBy(oEvent.getSource());
    },

    onProfilePress: function () {
      this.getOwnerComponent().onProfilePress(this.getView());
    },
    onLoginPress: function () {
      var oView = this.getView();
      var oDialog = oView.byId("loginRegisterDialog");
  
      if (!oDialog) {
          sap.m.MessageBox.error("Dialog not open.");
          return;
      }
  
      var email = oView.byId("emailInput").getValue();
      var password = oView.byId("passwordInput").getValue();
  
      if (!email || !password) {
          sap.m.MessageBox.warning("Please enter both email and password.");
          return;
      }
      console.log(email,password);
  
      // 🔐 Admin credentials check
      if (email === "admin@gmail.com" && password === "admin") {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("AdminDahsboard");
          console.log("routing");
          return;
      }
  
      // 🔍 Regular user login via HANA
      oView.getModel().read("/Customer", {
          filters: [
              new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.EQ, email),
              new sap.ui.model.Filter("password", sap.ui.model.FilterOperator.EQ, password)
          ],
          success: function (oData) {
              if (oData.results && oData.results.length > 0) {
                  var user = oData.results[0];
                  var oUserModel = new sap.ui.model.json.JSONModel(user);
                  console.log(oUserModel);
  
                  this.getOwnerComponent().setModel(oUserModel, "userModel");
                  oDialog.close();
                  this.loadOrdersForUser();
              } else {
                  sap.m.MessageBox.error("Invalid email or password.");
              }
          }.bind(this),
          error: function () {
              sap.m.MessageBox.error("Login failed. Please try again.");
          }
      });
  },
  

    onRegister: function () {
      this.getOwnerComponent().onRegister(this.getView());
    },

    onToggleForm: function () {
      this.getOwnerComponent().onToggleForm(this.getView());
    },

    onForgotPasswordPress: function () {
      this.getOwnerComponent().onForgotPasswordPress();
    },

    onToggleLoginPasswordVisibility: function () {
      this.getOwnerComponent().onToggleLoginPasswordVisibility(this.getView());
    },

    onToggleRegisterPasswordVisibility: function () {
      this.getOwnerComponent().onToggleRegisterPasswordVisibility(this.getView());
    },


    onCloseLoginDialog: function () {
      this.getOwnerComponent().onCloseLoginDialog(this.getView());
    },
    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
      var oModel = this.getView().getModel(); // ODataModel
      var oSearchModel = this.getView().getModel("searchModel");
      var oList = this.byId("productList"); // ID of your list control
      var that = this;
  
      if (sQuery && sQuery.trim().length > 0) {
          oModel.read("/Product", {
              success: function (oData) {
                  var filteredResults = oData.results.filter(function (item) {
                      return item.name.toLowerCase().includes(sQuery.toLowerCase());
                  });
  
                  oSearchModel.setProperty("/results", filteredResults);
                  oList.setVisible(true);
              }
          });
      } else {
          // Clear results and hide list
          oSearchModel.setProperty("/results", []);
          oList.setVisible(false);
  
      }
  }
  ,
  
  
  
    onCartPress: function () {
      this.getOwnerComponent().onCartPress(this.getView());
    },

    onCloseCart: function () {
      this.getOwnerComponent().onCloseCart(this.getView());
    },

    updateCartDisplay: function () {
      this.getOwnerComponent().updateCartDisplay(this.getView());
    },

    onAddToCart: function (oEvent) {
      var itemContext = oEvent.getSource().getBindingContext();
      var itemData = itemContext.getObject();
      this.getOwnerComponent().onAddToCart(itemData);
    },

    onPlaceOrder: function () {
      this.getOwnerComponent().onPlaceOrder(this.getView());
    },


    onImagePress1: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("fruitVegetable"); // 'fruitVegetable' is the route name
    },
    onImagePress2: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("attarice"); // 'fruitVegetable' is the route name
    },
    onImagePress3: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("sweet"); // 'fruitVegetable' is the route name
    },
    onImagePress4: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("dairy"); // 'fruitVegetable' is the route name
    },
    onImagePress5: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("packed"); // 'fruitVegetable' is the route name
    },
    onImagePress6: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("cooldrinks"); // 'fruitVegetable' is the route name
    },
    onImagePress7: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("teacoffe"); // 'fruitVegetable' is the route name
    }

  });
});