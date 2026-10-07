import { Product, Variant, CartItem, Order, OrderItem, User } from '@prisma/client'

export type ProductWithVariants = Product & {
  variants: Variant[]
}

export type CartItemWithVariant = CartItem & {
  variant: Variant & {
    product: Product
  }
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    variant: Variant & {
      product: Product
    }
  })[]
  user: User
}
