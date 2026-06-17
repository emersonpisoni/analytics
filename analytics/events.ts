/**
 * Catálogo de eventos (taxonomy).
 *
 * Um dos maiores problemas de analytics na vida real é nomenclatura
 * inconsistente: "btn_click", "Button Clicked", "click_button"... viram
 * eventos diferentes e os dados ficam impossíveis de analisar.
 *
 * A solução é centralizar os nomes num único lugar e usar uma convenção.
 * Aqui usamos o padrão "Object Action" (Substantivo + Verbo no passado),
 * que é o mais comum no mercado (Segment, Amplitude).
 */
export const Events = {
  ButtonClicked: 'Button Clicked',
  ProductViewed: 'Product Viewed',
  ProductAddedToCart: 'Product Added to Cart',
  CheckoutStarted: 'Checkout Started',
  OrderCompleted: 'Order Completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
