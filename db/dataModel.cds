namespace ecommerce;

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
    key name       : String(100);
    description    : String(255);
}

entity Product {
    key id         : UUID;
    name           : String;
    price          : Integer;
    quantity        : String;
    stock          : Integer;
    category       : Association to Category;
    image          : String;
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


