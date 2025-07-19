sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, MessageToast, Text, VBox) {
    "use strict";

    return Controller.extend("project.controller.teacoffe", {
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

    // Set new i18n model
    const i18nModel = new sap.ui.model.resource.ResourceModel({
        bundleName: "project.i18n.i18n",
        bundleLocale: selectedLang
    });
    this.getView().setModel(i18nModel, "i18n");

    // Store selected language
    localStorage.setItem("selectedLanguage", selectedLang);

    // Reload product data based on selected language
    this._loadProductData(selectedLang);
},

_loadProductData: function (lang) {
    const oModel = this.getOwnerComponent().getModel();
    const that = this;

    const endpoint = lang === "en" ? "/Product" : "/ProductTexts";
    const teaCategory = lang === "en" ? "Tea" : "Tee";
    const coffeeCategory = lang === "en" ? "Coffee" : "Kaffee";

    oModel.read(endpoint, {
        success: function (oData) {
            const teaItems = oData.results.filter(item => item.category_name === teaCategory);
            const coffeeItems = oData.results.filter(item => item.category_name === coffeeCategory);

            const teaModel = new sap.ui.model.json.JSONModel({ results: teaItems });
            const coffeeModel = new sap.ui.model.json.JSONModel({ results: coffeeItems });

            that.getView().setModel(teaModel, "teaModel");
            that.getView().setModel(coffeeModel, "coffeeModel");
        },
        error: function (err) {
            console.error("Failed to load product data", err);
        }
    });
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
        onFruitsPress: function () {
            var oFruitList = this.byId("teaList");
            if (oFruitList) {
                oFruitList.getDomRef().scrollIntoView({
                    behavior: "smooth"
          
                });
            }
            
  
        },       
        onVegetablesPress: function () {
            var oVegetableList = this.byId("coffeeList");
            if (oVegetableList) {
                oVegetableList.getDomRef().scrollIntoView({ behavior: "smooth" });
            }
        },
        
        onAddToCart: function (oEvent) {
            var itemContext = oEvent.getSource().getBindingContext();
            var itemData = itemContext.getObject();
            this.getOwnerComponent().onAddToCart(itemData);
        },
        
        onPlaceOrder: function () {
            this.getOwnerComponent().onPlaceOrder(this.getView());
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
        onCartPress: function () {
            this.getOwnerComponent().onCartPress(this.getView());
        },
        
        onCloseCart: function () {
            this.getOwnerComponent().onCloseCart(this.getView());
        },
        
        updateCartDisplay: function () {
            this.getOwnerComponent().updateCartDisplay(this.getView());
        }
        
    });
});
