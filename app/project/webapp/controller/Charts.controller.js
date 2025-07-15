sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/model/json/JSONModel"
], function (Controller, FlattenedDataset, FeedItem, JSONModel) {
    "use strict";

    return Controller.extend("project.controller.Charts", {
        onInit: function () {
            const oVizFrame = this.getView().byId("idPieChart");
            const oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            oVizFrame.setVizProperties({
                title: {
                    text: "Sales by Category",
                    visible: true
                }
            });
            
        
            oModel.read("/MostSoldCategories", {
                success: (oData) => {
                    const aData = oData.results.map(item => ({
                        Category: item.category,
                        Units: item.totalUnits
                    }));
        
                    const oJsonModel = new JSONModel(aData);
                    oVizFrame.setModel(oJsonModel);
        
                    const oDataset = new FlattenedDataset({
                        dimensions: [{ name: "Category", value: "{Category}" }],
                        measures: [{ name: "Units", value: "{Units}" }],
                        data: { path: "/" }
                    });
        
                    oVizFrame.setDataset(oDataset);
        
                    oVizFrame.addFeed(new FeedItem({ uid: "size", type: "Measure", values: ["Units"] }));
                    oVizFrame.addFeed(new FeedItem({ uid: "color", type: "Dimension", values: ["Category"] }));
        
                    // Add event listener
                    oVizFrame.attachSelectData(this.onCategorySelected.bind(this));
                },
                error: (oError) => {
                    console.error("OData read failed:", oError);
                    sap.m.MessageToast.show("Failed to load chart data.");
                }
            });
        },
        
        onCategorySelected: function (oEvent) {
            const selectedCategory = oEvent.getParameter("data")[0].data.Category;
            const oModel = this.getOwnerComponent().getModel();
        
            // Step 1: Read all products in the selected category
            oModel.read("/Product", {
                filters: [new sap.ui.model.Filter("category/name", "EQ", selectedCategory)],
                success: (productData) => {
                    const allProducts = productData.results;
        
                    // Step 2: Read all OrderItems and expand product and category
                    oModel.read("/OrderItem", {
                        urlParameters: {
                            "$expand": "product($expand=category)"
                        },
                        success: (orderData) => {
                            const filteredItems = orderData.results.filter(item =>
                                item.product?.category?.name === selectedCategory
                            );
        
                            // Step 3: Aggregate units sold per product
                            const productSalesMap = {};
                            filteredItems.forEach(item => {
                                const productName = item.product.name;
                                productSalesMap[productName] = (productSalesMap[productName] || 0) + item.unit;
                            });
        
                            // Step 4: Merge with all products to include zero sales
                            const aProductData = allProducts.map(product => ({
                                Product: product.name,
                                Units: productSalesMap[product.name] || 0
                            }));
        
                            const oBarModel = new sap.ui.model.json.JSONModel(aProductData);
                            const oBarChart = this.getView().byId("idBarChart");
                            oBarChart.setModel(oBarModel);
        
                            const oDataset = new sap.viz.ui5.data.FlattenedDataset({
                                dimensions: [{ name: "Product", value: "{Product}" }],
                                measures: [{ name: "Units", value: "{Units}" }],
                                data: { path: "/" }
                            });
        
                            oBarChart.setDataset(oDataset);
                            oBarChart.removeAllFeeds();
                            oBarChart.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
                                uid: "valueAxis",
                                type: "Measure",
                                values: ["Units"]
                            }));
                            oBarChart.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
                                uid: "categoryAxis",
                                type: "Dimension",
                                values: ["Product"]
                            }));
        
                            oBarChart.setVizType("column");
                            oBarChart.setVizProperties({
                                title: {
                                    text: `Top Selling Products in ${selectedCategory}`,
                                    visible: true
                                }
                            });
                        },
                        error: (oError) => {
                            console.error("Failed to load OrderItems:", oError);
                            sap.m.MessageToast.show("Failed to load product sales data.");
                        }
                    });
                },
                error: (oError) => {
                    console.error("Failed to load products:", oError);
                    sap.m.MessageToast.show("Failed to load product list.");
                }
            });
        }
        
        
        
    });
});
