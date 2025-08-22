import { ProductItemService } from '../services/product-item.service';
import { Category, ProductFormData } from '../models/product.model';

export class SampleDataGenerator {
  constructor(private productService: ProductItemService) {}

  async generateSampleData(): Promise<void> {
    try {
      console.log('Creating sample categories...');
      
      // Create sample categories
      const categories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true },
        { name: 'Clothing', description: 'Fashion and apparel', isActive: true },
        { name: 'Books', description: 'Books and educational materials', isActive: true },
        { name: 'Home & Garden', description: 'Home improvement and garden supplies', isActive: true },
        { name: 'Sports', description: 'Sports equipment and accessories', isActive: true }
      ];

      const categoryIds: string[] = [];
      
      for (const category of categories) {
        const categoryId = await this.productService.addCategory(category).toPromise();
        if (categoryId) {
          categoryIds.push(categoryId);
          console.log(`Created category: ${category.name}`);
        }
      }

      console.log('Creating sample products...');

      // Create sample products
      const products: ProductFormData[] = [
        {
          name: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced camera system and A17 Pro chip',
          price: 999.99,
          categoryId: categoryIds[0], // Electronics
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
          stock: 25,
          sku: 'IPH15PRO001',
          isActive: true
        },
        {
          name: 'MacBook Air M2',
          description: 'Powerful laptop with M2 chip and all-day battery life',
          price: 1199.99,
          categoryId: categoryIds[0], // Electronics
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
          stock: 15,
          sku: 'MBA13M2001',
          isActive: true
        },
        {
          name: 'Nike Air Max 270',
          description: 'Comfortable running shoes with Max Air cushioning',
          price: 149.99,
          categoryId: categoryIds[1], // Clothing
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          stock: 50,
          sku: 'NAM270001',
          isActive: true
        },
        {
          name: 'Levi\'s 501 Jeans',
          description: 'Classic straight-fit jeans made from premium denim',
          price: 89.99,
          categoryId: categoryIds[1], // Clothing
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          stock: 75,
          sku: 'LEV501001',
          isActive: true
        },
        {
          name: 'The Psychology of Programming',
          description: 'Essential book for understanding software development mindset',
          price: 29.99,
          categoryId: categoryIds[2], // Books
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          stock: 100,
          sku: 'PSY001',
          isActive: true
        },
        {
          name: 'Smart Garden Kit',
          description: 'Automated indoor garden system with LED grow lights',
          price: 199.99,
          categoryId: categoryIds[3], // Home & Garden
          imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
          stock: 20,
          sku: 'SGK001',
          isActive: true
        },
        {
          name: 'Yoga Mat Premium',
          description: 'Non-slip yoga mat with alignment lines and carrying strap',
          price: 49.99,
          categoryId: categoryIds[4], // Sports
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
          stock: 40,
          sku: 'YMP001',
          isActive: true
        },
        {
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          price: 299.99,
          categoryId: categoryIds[0], // Electronics
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          stock: 30,
          sku: 'WH001',
          isActive: true
        }
      ];

      for (const product of products) {
        const productId = await this.productService.addProduct(product).toPromise();
        if (productId) {
          console.log(`Created product: ${product.name}`);
        }
      }

      console.log('Sample data generation completed successfully!');
    } catch (error) {
      console.error('Error generating sample data:', error);
    }
  }
}
