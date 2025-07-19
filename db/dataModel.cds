namespace ecommerce;
using {} from '@sap/cds/common';

entity Customer {
    key id         : UUID;
    name           : String(100);
    email          : String(100);
    phone          : String(20);
    password       : String;
    address        : String(255);
    createdAt      : DateTime;
}

entity Category {
  id         : UUID;
  key name            : String;
  description     : String;
}

entity CategoryText {
  ID          : UUID;
  key locale      : String;
  key name            : String;
}

entity Product {
  key ID          : UUID;
  name            : String;
  quantity        : String;
  image           : String;
  price           : Integer;
  stock           : Integer;
  category        : Association to Category;
}

entity ProductText {
  key ID          : UUID;
  key locale      : String;
  name            : String;
  quantity        : String;
  price           : Integer;
  stock           : Integer;
  image           : String;
  category        : Association to CategoryText
}


entity Order {
    key id         : UUID;
    customer       : Association to Customer;
    orderDate      : DateTime;
    status         : String(50);
    totalAmount    : Integer;
    items          : Composition of many OrderItem on items.order = $self;
}

entity OrderItem {
    key id         : UUID;
    order          : Association to Order;
    product        : Association to Product;
    unit           : Integer;
    price          : Integer;
}


