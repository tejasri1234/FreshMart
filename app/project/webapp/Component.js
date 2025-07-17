jQuery.sap.includeStyleSheet("css/style.css");
sap.ui.define([
    "sap/ui/core/UIComponent",
    "project/model/models",
    "sap/ui/model/odata/v2/ODataModel"
], (UIComponent, models,ODataModel) => {
    "use strict";

    return UIComponent.extend("project.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
        
            // Set the device model
            this.setModel(models.createDeviceModel(), "device");
        
            // Create and set global cart model
            var cartModel = new sap.ui.model.json.JSONModel({ items: [] });
            this.setModel(cartModel, "cartModel");
            
            var url = "/odata/v2/catalog/"; // Your OData service root
            var oModel = new ODataModel(url, { json: true });
            this.setModel(oModel);
            var cartStatusModel = new sap.ui.model.json.JSONModel({
                cartCount: 0
            });
            this.setModel(cartStatusModel, "cartStatusModel");
            


        
            // Enable routing
            this.getRouter().initialize();
        },
        onProfilePress: function (oView) {
            var oUserModel = this.getModel("userModel");
            var userId = oUserModel && oUserModel.getProperty("/id");
        
            if (userId) {
                sap.m.MessageBox.confirm(
                    "You are logged in as " + oUserModel.getProperty("/name") +
                    " (" + oUserModel.getProperty("/email") + ").\n\nDo you want to log out?",
                    {
                        title: "Logout",
                        icon: sap.m.MessageBox.Icon.QUESTION,
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        emphasizedAction: sap.m.MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.YES) {
                                this.setModel(null, "userModel");
                                sap.m.MessageToast.show("Logged out successfully.");
                            }
                        }.bind(this)
                    }
                );
            } else {
                var oDialog = oView.byId("loginRegisterDialog");
                if (oDialog) {
                    oDialog.open();
                } else {
                    sap.m.MessageBox.error("Login/Register dialog not found.");
                }
            }
        },
        onToggleForm: function (oView) {
            var oLoginForm = oView.byId("loginForm");
            var oRegisterForm = oView.byId("registerForm");
        
            if (!oLoginForm || !oRegisterForm) {
                sap.m.MessageBox.error("Form controls not found.");
                return;
            }
        
            var bLoginVisible = oLoginForm.getVisible();
            oLoginForm.setVisible(!bLoginVisible);
            oRegisterForm.setVisible(bLoginVisible);
        },
        loadOrdersForUser: function () {
            var oUserModel = this.getModel("userModel");
            var userId = oUserModel && oUserModel.getProperty("/id");
        
            if (!userId) {
                console.warn("User not logged in. Cannot load orders.");
                return;
            }
        
            var oModel = this.getModel(); // ODataModel
            oModel.read("/Order", {
                filters: [
                    new sap.ui.model.Filter("customer_id", sap.ui.model.FilterOperator.EQ, userId)
                ],              
                urlParameters: {
                    "$expand": "items($expand=product)"
                },
   
                success: function (oData) {
                    console.log(oData);
                    const ordersModel = new sap.ui.model.json.JSONModel({ orders: oData.results });
                    this.setModel(ordersModel, "ordersModel");
                    this.getView().setModel(ordersModel, "ordersModel"); 
                    
                    
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show("Failed to load orders.");
                }
            });
        },
        
        
        
        onRegister: function (oView) {
            var fullName = oView.byId("fullName").getValue();
            var email = oView.byId("registerEmail").getValue();
            var mobile = oView.byId("mobileNumber").getValue();
            var password = oView.byId("registerPassword").getValue();
            var termsAccepted = oView.byId("terms").getSelected();
            var address = oView.byId("address").getValue();
        
            if (!fullName || !email || !mobile || !password || !address) {
                sap.m.MessageBox.warning("Please fill in all required fields.");
                return;
            }
            if (!termsAccepted) {
                sap.m.MessageBox.warning("You must agree to the Terms & Conditions.");
                return;
            }
        
            this.getModel().read("/Customer", {
                filters: [new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.EQ, email)],
                success: function (oData) {
                    if (oData.results && oData.results.length > 0) {
                        sap.m.MessageBox.error("User already exists with this email.");
                        return;
                    }
        
                    var oDataToCreate = {
                        name: fullName,
                        email: email,
                        phone: mobile,
                        password: password,
                        address: address,
                        createdAt: new Date().toISOString()
                    };
        
                    this.getModel().create("/Customer", oDataToCreate, {
                        success: function () {
                            sap.m.MessageBox.success("Registration successful!");
                            this.onToggleForm(oView);
                            var oDialog = oView.byId("loginRegisterDialog");
                            if (oDialog) {
                                oDialog.close();
                            }
        
                            oView.byId("fullName").setValue("");
                            oView.byId("registerEmail").setValue("");
                            oView.byId("mobileNumber").setValue("");
                            oView.byId("registerPassword").setValue("");
                            oView.byId("terms").setSelected(false);
                            oView.byId("address").setValue("");
        
                            var oUserModel = new sap.ui.model.json.JSONModel({ userId: email });
                            this.setModel(oUserModel, "userModel");
                        }.bind(this),
                        error: function () {
                            sap.m.MessageBox.error("Registration failed. Please try again.");
                        }
                    });
                }.bind(this),
                error: function () {
                    sap.m.MessageBox.error("Could not check for existing user. Please try again.");
                }
            });
        },
        
        onForgotPasswordPress: function () {
            sap.m.MessageBox.information("Password reset functionality is not implemented in this demo.");
        },
        
        onToggleLoginPasswordVisibility: function (oView) {
            var oInput = oView.byId("passwordInput");
            if (oInput) {
                oInput.setType(oInput.getType() === "Password" ? "Text" : "Password");
            }
        },
        
        onToggleRegisterPasswordVisibility: function (oView) {
            var oInput = oView.byId("registerPassword");
            if (oInput) {
                oInput.setType(oInput.getType() === "Password" ? "Text" : "Password");
            }
        },
        
        onCloseLoginDialog: function (oView) {
            var oDialog = oView.byId("loginRegisterDialog");
            if (oDialog) {
                oDialog.close();
            }
        },
        updateCartDisplay: function (oView) {
            var cartItemsContainer = oView.byId("cartItemsContainer");
            var totalPriceText = oView.byId("totalPriceText");
            var placeOrderButton = oView.byId("placeOrderButton");
        
            cartItemsContainer.removeAllItems();
        
            var cartModel = this.getModel("cartModel");
            var cartData = cartModel.getData();
        
            let total = 0;
        
            if (!cartData.items || cartData.items.length === 0) {
                cartItemsContainer.addItem(
                    new sap.m.Text({
                        text: "Your cart is empty. Browse products to add items!",
                        textAlign: "Center"
                    }).addStyleClass("cartEmptyText")
                );
                totalPriceText.setText("");
                if (placeOrderButton) {
                    placeOrderButton.setVisible(false);
                }
                return;
            }
        
            cartData.items.forEach((item, index) => {
                total += item.price * item.quantity;
        
                var quantityBox = new sap.m.HBox({
                    items: [
                        new sap.m.Button({
                            icon: "sap-icon://less",
                            type: "Transparent",
                            press: () => {
                                if (item.quantity > 1) {
                                    item.quantity -= 1;
                            

                                } else {
                                    cartData.items.splice(index, 1);
                                }
                                cartModel.setProperty("/items", cartData.items);
                                this.updateCartCount();
                                this.updateCartDisplay(oView);
                            }
                        }),
                        new sap.m.Text({ text: item.quantity.toString() }).addStyleClass("cartItemQuantity"),
                        new sap.m.Button({
                            icon: "sap-icon://add",
                            type: "Transparent",
                            press: () => {
                                if (item.quantity < item.stock) {
                                    item.quantity += 1;
                                    this.updateCartCount();
                                    cartModel.setProperty("/items", cartData.items);
                                    this.updateCartDisplay(oView);
                                } else {
                                    sap.m.MessageToast.show("Maximum stock reached for " + item.name + "!");
                                }
                            }
                        })
                    ],
                }).addStyleClass("quantityControlBox");
        
                var itemBox = new sap.m.HBox({
                    items: [
                        new sap.m.Text({ text: item.name }).addStyleClass("cartItemName"),
                        quantityBox
                    ],
                }).addStyleClass("cartItemBox");
        
                cartItemsContainer.addItem(itemBox);
            });
        
            totalPriceText.setText("Total: ₹" + total.toFixed(2));
            if (placeOrderButton) {
                placeOrderButton.setVisible(true);
            }
        },
        updateCartCount: function () {
            var cartItems = this.getModel("cartModel").getProperty("/items") || [];
            var cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            this.getModel("cartStatusModel").setProperty("/cartCount", cartCount);
        
            // Optional: notify other views/components
            sap.ui.getCore().getEventBus().publish("cart", "updated");
        },
        
        
        onCartPress: function (oView) {
            var cartPanel = oView.byId("cartPanel");
            cartPanel.setVisible(!cartPanel.getVisible());
            this.updateCartDisplay(oView);
        },
        
        onCloseCart: function (oView) {
            var cartPanel = oView.byId("cartPanel");
            if (cartPanel) {
                cartPanel.setVisible(false);
            }
        },
        
        onAddToCart: function (itemData) {
            var cartModel = this.getModel("cartModel");
            var cartItems = cartModel.getProperty("/items") || [];
        
            if (typeof itemData.stock !== "number") {
                sap.m.MessageToast.show("Stock information not available for " + itemData.name + "!");
                return;
            }
        
            var existingItem = cartItems.find(item => item.id === itemData.id);
            if (existingItem) {
                if (existingItem.quantity >= itemData.stock) {
                    sap.m.MessageToast.show("Maximum stock reached for " + itemData.name + "!");
                    return;
                }
                existingItem.quantity += 1;
            } else {
                if (itemData.stock < 1) {
                    sap.m.MessageToast.show("Out of stock for " + itemData.name + "!");
                    return;
                }
                cartItems.push({ ...itemData, quantity: 1 });
            }
        
            cartModel.setProperty("/items", cartItems);
            sap.m.MessageToast.show(itemData.name + " added to cart");
        
            // Update cart count on button
            
            this.updateCartCount();


            sap.ui.getCore().getEventBus().publish("cart", "updated")

        },
        
        
        onPlaceOrder: function (oView) {
           var cartModel = this.getModel("cartModel");
            var cartData = cartModel.getData();
            var oUserModel = this.getModel("userModel");
            var oModel = oView.getModel(); // ODataModel
        
            var customerId = oUserModel && oUserModel.getProperty("/id");
            if (!customerId) {
                sap.m.MessageBox.error("You must be logged in to place an order.");
                return;
            }
        
            if (!cartData.items || cartData.items.length === 0) {
                sap.m.MessageBox.warning("Your cart is empty.");
                return;
            }
        
            var totalAmount = cartData.totalAmount;
            if (typeof totalAmount !== "number") {
                totalAmount = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
        
            var orderItems = cartData.items.map(item => ({

                product_id: item.id,
                unit: item.quantity,
                price: item.price
            }));
        
            var oOrderData = {
                customer_id: customerId,
                orderDate: new Date().toISOString(),
                status: "Placed",
                totalAmount: totalAmount,
                items: orderItems
            };
        
            oModel.create("/Order", oOrderData, {
                success: function () {
                    cartData.items.forEach(item => {
                        var newStock = item.stock - item.quantity;
                        if (newStock < 0) newStock = 0;
                        oModel.update("/Product('" + item.id + "')", { stock: newStock }, {
                            success: function () {},
                            error: function () {
                                sap.m.MessageToast.show("Failed to update stock for " + item.name);
                            }
                        });
                    });
        
                    sap.m.MessageBox.success("Order placed successfully! Your order will be delivered in 10 minutes.", {
                        title: "Order Successful"
                    });
                    this.loadOrdersForUser();
        
                    cartModel.setProperty("/items", []);
                    cartModel.setProperty("/totalAmount", 0);
                    this.onCloseCart(oView);
                    this.updateCartCount();
                    this.updateCartDisplay(oView);
                     // Refresh orders model

                }.bind(this),
                error: function () {
                    sap.m.MessageBox.error("Order placement failed. Please try again.");
                }
            });
        }
        
                
        
        
        
    });
});
