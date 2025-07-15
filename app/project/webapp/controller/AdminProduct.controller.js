sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ActionSheet",
    "sap/m/Button"
], function (Controller, Fragment, JSONModel, MessageToast, MessageBox, ActionSheet, Button) {
    "use strict";

    return Controller.extend("project.controller.AdminProduct", {
        onInit: function () {
            this.oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(new sap.ui.model.json.JSONModel({ results: [] }), "searchModel");
        },

        onOpenDialog: function () {
            const oView = this.getView();

            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project.view.ProductDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this._oDialog.open();
            }

            this._editingProductId = null; // Reset editing state
        },

        onOpenActionSheet: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const oProductData = oContext.getObject();

            const oActionSheet = new ActionSheet({
                buttons: [
                    new Button({
                        text: "Edit",
                        icon: "sap-icon://edit",
                        press: () => this.onEditProduct(oContext)
                    }),
                    new Button({
                        text: "Delete",
                        icon: "sap-icon://delete",
                        press: () => this.onDeleteProduct(oProductData.id)
                    })
                ]
            });

            oActionSheet.openBy(oEvent.getSource());
        },

        onEditProduct: function (oContext) {
            if (!oContext) {
                MessageToast.show("No product data found.");
                return;
            }

            const oData = Object.assign({}, oContext.getObject());
            
            this._editingProductId = oData.id;


            const oView = this.getView();

            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project.view.ProductDialog",
                    controller: this
                }).then((oDialog) => {
                    this._oDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._populateDialogFields(oData);
                    oDialog.open();
                });
            } else {
                this._populateDialogFields(oData);
                this._oDialog.open();
            }
        },

        _populateDialogFields: function (oData) {
            const sFragmentId = this.getView().getId();
            sap.ui.core.Fragment.byId(sFragmentId, "inputName").setValue(oData.name);
            sap.ui.core.Fragment.byId(sFragmentId, "inputPrice").setValue(oData.price);
            sap.ui.core.Fragment.byId(sFragmentId, "inputQuantity").setValue(oData.quantity);
            sap.ui.core.Fragment.byId(sFragmentId, "inputStock").setValue(oData.stock);
            sap.ui.core.Fragment.byId(sFragmentId, "inputCategory").setSelectedKey(oData.category_name);
            sap.ui.core.Fragment.byId(sFragmentId, "inputImage").setValue(oData.image);
        },

        onDeleteProduct: function (productId) {
            const sPath = `/Product(${productId})`;

            this.getView().getModel().remove(sPath, {
                success: () => MessageToast.show("Product deleted successfully."),
                error: () => MessageToast.show("Failed to delete product.")
            });
        },

        onDialogCancel: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
            this._editingProductId = null;
        },

        onDialogSave: function () {
            const sFragmentId = this.getView().getId();

            const oName = sap.ui.core.Fragment.byId(sFragmentId, "inputName");
            const oPrice = sap.ui.core.Fragment.byId(sFragmentId, "inputPrice");
            const oQuantity = sap.ui.core.Fragment.byId(sFragmentId, "inputQuantity");
            const oStock = sap.ui.core.Fragment.byId(sFragmentId, "inputStock");
            const oCategory = sap.ui.core.Fragment.byId(sFragmentId, "inputCategory");
            const oImage = sap.ui.core.Fragment.byId(sFragmentId, "inputImage");

            if (!oName || !oPrice || !oQuantity || !oStock || !oCategory || !oImage) {
                MessageToast.show("Some input fields are missing.");
                return;
            }

            const oData = {
                name: oName.getValue(),
                price: oPrice.getValue(),
                quantity: oQuantity.getValue(),
                stock: oStock.getValue(),
                category_name: oCategory.getSelectedKey(),
                image: oImage.getValue()
            };

            const oModel = this.getView().getModel();

            if (this._editingProductId !== undefined && this._editingProductId !== null) {
                const sPath = `/Product(${this._editingProductId})`;
                oModel.update(sPath, oData, {
                    success: () => MessageToast.show("Product updated successfully."),
                    error: () => MessageToast.show("Failed to update product.")
                });
            } else {
                oModel.create("/Product", oData, {
                    success: () => MessageToast.show("Product added successfully."),
                    error: () => MessageToast.show("Failed to add product.")
                });
            }

            if (this._oDialog) {
                this._oDialog.close();
            }

            this._editingProductId = null;
        },
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oModel = this.getView().getModel(); // ODataModel
            var oSearchModel = this.getView().getModel("searchModel");
        
            if (sQuery && sQuery.length > 0) {
                oModel.read("/Product", {
                    success: (oData) => {
                        var filteredResults = oData.results.filter(item =>
                            item.name.toLowerCase().includes(sQuery.toLowerCase())
                        );
        
                        console.log("Search results:", filteredResults);
                        oSearchModel.setProperty("/results", filteredResults);
                    },
                    error: () => {
                        console.error("Failed to fetch product data.");
                    }
                });
            } else {
                oSearchModel.setProperty("/results", []);
            }
        }
        
    });
});
