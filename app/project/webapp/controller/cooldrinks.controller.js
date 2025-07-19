sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/VBox"
], function (Controller, JSONModel, Filter, MessageToast, Text, VBox) {
    "use strict";

    return Controller.extend("project.controller.cooldrinks", {
      onInit: function () {
    jQuery.sap.includeStyleSheet("project/css/style.css");

    const selectedLang = localStorage.getItem("selectedLanguage") || "en";
    this._loadProductData(selectedLang);

    const oModel = this.getOwnerComponent().getModel();
    this.getView().setModel(oModel);
    this.getView().setModel(new sap.ui.model.json.JSONModel({ results: [] }), "searchModel");

    const oEventBus = sap.ui.getCore().getEventBus();
    oEventBus.subscribe("cart", "updated", this.onCartUpdated, this);
},

onLanguageChange: function (oEvent) {
    const selectedLang = oEvent.getSource().getSelectedKey();
    console.log("Language changed to:", selectedLang);

    const i18nModel = new sap.ui.model.resource.ResourceModel({
        bundleName: "project.i18n.i18n",
        bundleLocale: selectedLang
    });
    this.getView().setModel(i18nModel, "i18n");

    localStorage.setItem("selectedLanguage", selectedLang);
    this._loadProductData(selectedLang);
},

_loadProductData: function (lang) {
    const oModel = this.getOwnerComponent().getModel();
    const that = this;

    const endpoint = lang === "en" ? "/Product" : "/ProductTexts";
    const softDrinksCategory = lang === "en" ? "Soft Drinks" : "Erfrischungsgetränke";
    const fruitJuicesCategory = lang === "en" ? "Fruit Juices" : "Fruchtsäfte";

    oModel.read(endpoint, {
        success: function (oData) {
            const softDrinksItems = oData.results.filter(item => item.category_name === softDrinksCategory);
            const fruitJuicesItems = oData.results.filter(item => item.category_name === fruitJuicesCategory);

            const softDrinksModel = new sap.ui.model.json.JSONModel({ results: softDrinksItems });
            const fruitJuicesModel = new sap.ui.model.json.JSONModel({ results: fruitJuicesItems });

            that.getView().setModel(softDrinksModel, "softDrinksModel");
            that.getView().setModel(fruitJuicesModel, "fruitJuicesModel");
        },
        error: function (err) {
            console.error("Failed to load product data", err);
        }
    });
}, 
      onCartUpdated: function () {
              this.updateCartDisplay(this.getView());
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
        onFruitsPress: function () {
          var oFruitList = this.byId("softDrinksList");
          if (oFruitList) {
              oFruitList.getDomRef().scrollIntoView({
                  behavior: "smooth"
        
              });
          }
          

      },       
      onVegetablesPress: function () {
          var oVegetableList = this.byId("fruitJuicesList");
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
