import { stripe } from '@/lib/stripe';
import { CartLine, PaymentGateway } from '../types';

export class StripePaymentAdapter implements PaymentGateway {
  async createCheckoutSession(
    order: { id: string },
    user: { id: string; email: string },
    cartItems: CartLine[]
  ) {
    const session = await stripe.checkout.sessions.create({
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.variant.product.brand} ${item.variant.product.name}`,
            description: `${item.variant.product.colorway} - Size ${item.variant.size}`,
            images: item.variant.product.images[0] ? [item.variant.product.images[0]] : undefined,
          },
          unit_amount: Math.round(item.variant.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart?canceled=true`,
      metadata: { orderId: order.id, userId: user.id },
      customer_email: user.email,
    });
    return { sessionId: session.id, url: session.url! };
  }
}
