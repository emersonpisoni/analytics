export const Events = {
  ButtonClicked: 'Button Clicked',
  ProductViewed: 'Product Viewed',
  ProductAddedToCart: 'Product Added to Cart',
  CheckoutStarted: 'Checkout Started',
  OrderCompleted: 'Order Completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
