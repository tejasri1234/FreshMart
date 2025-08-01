sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/VBox"
], function (Controller, JSONModel, Filter, MessageToast, Text, VBox) {
    "use strict";

    return Controller.extend("project.controller.sweet", {
        onInit: function () {


            jQuery.sap.includeStyleSheet("project/css/style.css");

            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            this.getView().setModel(new sap.ui.model.json.JSONModel({ results: [] }), "searchModel");
            var oEventBus = sap.ui.getCore().getEventBus();
      oEventBus.subscribe("cart", "updated", this.onCartUpdated, this);

            var chocolatesFilter = new Filter("category/name", "EQ", "Chocolates & Sweets");
            var iceCreamFilter = new Filter("category/name", "EQ", "Ice Creams");

            var chocolatesList = this.getView().byId("chocolatesList");
            var iceCreamList = this.getView().byId("iceCreamList");

            if (chocolatesList?.getBinding("items")) {
                chocolatesList.getBinding("items").filter([chocolatesFilter]);
            }

            if (iceCreamList?.getBinding("items")) {
                iceCreamList.getBinding("items").filter([iceCreamFilter]);
            }
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
                    sap.m.MessageToast.show("Account pressed");
                  }
                })
              ],
              placement: sap.m.PlacementType.Bottom
            });
            this.getView().addDependent(this._oMenuSheet);
          }
          this._oMenuSheet.openBy(oEvent.getSource());
        },
        onCartUpdated: function () {
              this.updateCartDisplay(this.getView());
          },
        onFruitsPress: function () {
          var oFruitList = this.byId("chocolatesList");
          if (oFruitList) {
              oFruitList.getDomRef().scrollIntoView({
                  behavior: "smooth"
        
              });
          }
          

      },       
      onVegetablesPress: function () {
          var oVegetableList = this.byId("iceCreamList");
          if (oVegetableList) {
              oVegetableList.getDomRef().scrollIntoView({ behavior: "smooth" });
          }
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
            var that = this;
            var oList = this.byId("productList"); // ID of your list control
        
            if (sQuery && sQuery.length > 0) {
                oModel.read("/Product", {
                    success: function (oData) {
                        var filteredResults = oData.results.filter(function (item) {
                            return item.name.toLowerCase().includes(sQuery.toLowerCase());
                        });
        
                        console.log("Search results:", filteredResults);
                        that.getView().getModel("searchModel").setProperty("/results", filteredResults);
                        oList.setVisible(true); // Show list
                    }
                });
            } else {
                that.getView().getModel("searchModel").setProperty("/results", []);
                oList.setVisible(false); // Hide list
            }
        },
          onCartPress: function () {
            this.getOwnerComponent().onCartPress(this.getView());
          },
      
          onCloseCart: function () {
            this.getOwnerComponent().onCloseCart(this.getView());
          },
      
          updateCartDisplay: function () {
            this.getOwnerComponent().updateCartDisplay(this.getView());
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
                      sap.m.MessageToast.show("Account pressed");
                    }
                  })
                ],
                placement: sap.m.PlacementType.Bottom
              });
              this.getView().addDependent(this._oMenuSheet);
            }
            this._oMenuSheet.openBy(oEvent.getSource());
          },
      
          onAddToCart: function (oEvent) {
            var itemContext = oEvent.getSource().getBindingContext();
            var itemData = itemContext.getObject();
            this.getOwnerComponent().onAddToCart(itemData);
          },
      
          onPlaceOrder: function () {
            this.getOwnerComponent().onPlaceOrder(this.getView());
          },
    });
});
