// Metadata about the site
interface MetaDataType { // Sok Thean
  logoImg: string; // URL to the site's logo image
  title: string; // Title of the site
}

// Menu item data from the API
interface Menu {
  id: string; // Unique identifier for the menu item
  name: string; // Name of the menu item
  second_name?: string; //ST Khmer name of the menu item
  imagePath: string; // Path to the image of the menu item
  price: number; // Regular price of the menu item
  promo_price: number; // Promotional price of the menu item
  code: number; // Code associated with the menu item
  type: string; // Type/category of the menu item
  // Sok Thean Subcategory name from the API
  subcategory?: string;
  brand?: string | null;
}

// Category containing a list of menu items
interface Category {
  category: string; // Name of the category
  items: Menu[]; // Array of menu items in this category
}

// Array of categories, each containing a list of menu items
type MenuType = Category[];

// Data for items in the cart, to be sent in POST requests
interface CartItem {
  id: string; // Unique identifier for the cart item
  cartItemId?: string; // ST Unique identifier for the customized cart item row
  name: string; // Name of the cart item
  second_name?: string; //ST Khmer name of the cart item
  imagePath: string; // Path to the image of the cart item
  quantity: number; // Quantity of the cart item
  price: number; // Regular price of the cart item
  promo_price: number; // Promotional price of the cart item
  code: number; // Code associated with the cart item
  type: string; // Type/category of the cart item
  // Sok Thean Subcategory name from the API
  subcategory?: string;
  brand?: string | null;
  subtotalPrice?: number; // Subtotal price for the item (optional)
  comment?: string | null; // Additional comments for the item (optional)
}

// State of the cart
interface CartState {
  items: CartItem[]; // Array of items in the cart
  totalItems: number; // Total number of items in the cart
  totalPrice: number; // Total price of all items in the cart
}

// Details of a single order item in the order history
interface orderHistory {
  code: string; // Code associated with the order item
  comment: string; // Comment associated with the order item
  id: string; // Unique identifier for the order item
  imagePath: string; // Path to the image of the order item
  name: string; // Name of the order item
  second_name?: string; //ST Khmer name of the order item
  price: number; // Regular price of the order item
  promo_price: number; // Promotional price of the order item
  quantity: number; // Quantity of the order item
  suspend_id: string; // ID for the suspended order
}

// Complete order history, including metadata and items
interface orderHistoryType {
  data: {
    id: string; // Unique identifier for the order
    date: Date; // Date of the order
    totalItems: string; // Total number of items in the order
    total_price: string; // Total price of the order
    suspend_note: string; // Note for the suspended order
    table_id: string; // ID of the table associated with the order
    table_name?: string; // Table name from the API
    table_num?: string; // Table number from the API
  };
  items: orderHistory[]; // Array of items in the order
}

export type { MetaDataType, Menu, MenuType, Category, CartItem, CartState, orderHistory, orderHistoryType };
