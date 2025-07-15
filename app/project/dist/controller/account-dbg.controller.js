sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
  ], function (Controller, Filter, FilterOperator, MessageToast,MessageBox) {
    "use strict";
  
    return Controller.extend("project.controller.account", {
  
      onInit: function () {
        var oUserModel = this.getOwnerComponent().getModel("userModel");
    
        if (!oUserModel) {
            sap.m.MessageBox.warning("User model not found.");
            return;
        }
       
  
    },
    
      onChangePassword: function () {
        var oModel = this.getOwnerComponent().getModel(); // OData model
        var oUserModel = this.getOwnerComponent().getModel("userModel");
        var userId = oUserModel.getProperty("/id");
      
        // Prompt user for new password (simple example)
        var that = this;
        sap.m.InputDialog = new sap.m.Dialog({
          title: "Change Password",
          icon: "sap-icon://key",
          content: [
            new sap.m.Input("newPasswordInput", {
              type: "Password",
              placeholder: "Enter new password",

            })
          ],
          beginButton: new sap.m.Button({
            text: "Submit",
            press: function () {
              var newPassword = sap.ui.getCore().byId("newPasswordInput").getValue();
              if (!newPassword) {
                sap.m.MessageToast.show("Please enter a valid address.");
                return;
            }
      
             
      
              oModel.update("/Customer('" + userId + "')", {password : newPassword}, {
                success: function () {
                  sap.m.MessageToast.show("Password updated successfully.");
                  sap.m.InputDialog.close();
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to update password.");
                  console.error("Update error:", oError);
                  sap.m.InputDialog.close();
                }
              });
            }
          }),
          endButton: new sap.m.Button({
            text: "Cancel",
            press: function () {
              sap.m.InputDialog.close();
            }
          }),
          afterClose: function () {
            sap.m.InputDialog.destroy();
          }
        });
      
        sap.m.InputDialog.open();
      },
      onChangeAddress: function () {
        var oModel = this.getOwnerComponent().getModel(); // OData model
        var oUserModel = this.getOwnerComponent().getModel("userModel");
        var userId = oUserModel.getProperty("/id");
      
        var that = this;
      
        // Create dialog to enter new address
        var oDialog = new sap.m.Dialog({
          title: "Change Address",
          icon : "sap-icon://addresses",
          content: [
            new sap.m.Input("newAddressInput", {
              placeholder: "Enter new address",

            })
          ],
          beginButton: new sap.m.Button({
            text: "Submit",
            press: function () {
              var newAddress = sap.ui.getCore().byId("newAddressInput").getValue();
              
                if (!newAddress) {
                    sap.m.MessageToast.show("Please enter a valid address.");
                    return;
                }
    
      
              // Send update request
              oModel.update("/Customer('" + userId + "')", {address : newAddress}, {
                success: function () {
                  sap.m.MessageToast.show("Address updated successfully.");
                  oDialog.close();
                },
                error: function (oError) {
                  sap.m.MessageToast.show("Failed to update address.");
                  console.error("Address update error:", oError);
                  oDialog.close();
                }
              });
            }
          }),
          endButton: new sap.m.Button({
            text: "Cancel",
            press: function () {
              oDialog.close();
            }
          }),
          afterClose: function () {
            oDialog.destroy();
          }
        });
      
        oDialog.open();
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
      onLoginPress: function () {
        this.getOwnerComponent().onLoginPress(this.getView());
      },
      onProfilePress: function () {
          this.getOwnerComponent().onProfilePress(this.getView());
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
        }
      
      
  
      
    });
  });
  
  
  
  