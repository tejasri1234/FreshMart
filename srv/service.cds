
using { ecommerce as e } from '../db/dataModel';

service CatalogService {
  entity Customer as projection on e.Customer;
  entity Category as projection on e.Category;
  entity CategoryTexts as projection on e.CategoryText;
  entity Product as projection on e.Product;
  entity ProductTexts as projection on e.ProductText;
  entity Order as projection on e.Order;
  @cds.redirection.target
  entity OrderItem as projection on e.OrderItem;
  // View to aggregate most sold categories
  entity MostSoldCategories as select from e.OrderItem {
    key product.category.name as category:String,
    sum(unit) as totalUnits:Integer
  } group by product.category.name;
}
