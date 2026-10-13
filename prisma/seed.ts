import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated sneaker collection with real SKUs and prices
const sneakers = [
  // Jordan 1s
  { sku: '555088-134', name: 'Air Jordan 1 Retro High OG', brand: 'Jordan', colorway: 'Chicago Lost and Found', releaseDate: new Date('2022-11-19'), retailPrice: 180, images: ['https://placehold.co/600x600/ef4444/white?text=Jordan+1+Chicago'], description: 'Iconic Chicago colorway with vintage-inspired detailing.' },
  { sku: '555088-105', name: 'Air Jordan 1 Retro High OG', brand: 'Jordan', colorway: 'University Blue', releaseDate: new Date('2021-03-06'), retailPrice: 170, images: ['https://placehold.co/600x600/3b82f6/white?text=Jordan+1+UNC'], description: 'Carolina blue leather with classic AJ1 construction.' },
  { sku: '555088-063', name: 'Air Jordan 1 Retro High OG', brand: 'Jordan', colorway: 'Shadow 2.0', releaseDate: new Date('2021-05-15'), retailPrice: 170, images: ['https://placehold.co/600x600/6b7280/white?text=Jordan+1+Shadow'], description: 'Updated Shadow colorway with light grey accents.' },
  { sku: '555088-108', name: 'Air Jordan 1 Retro High OG', brand: 'Jordan', colorway: 'Bred Patent', releaseDate: new Date('2021-12-30'), retailPrice: 170, images: ['https://placehold.co/600x600/dc2626/white?text=Jordan+1+Bred'], description: 'Classic Bred with premium patent leather.' },
  { sku: 'CT8532-126', name: 'Air Jordan 1 Mid', brand: 'Jordan', colorway: 'White Shadow', releaseDate: new Date('2021-04-15'), retailPrice: 125, images: ['https://placehold.co/600x600/f3f4f6/1f2937?text=Jordan+1+Mid'], description: 'Mid-top with Shadow-inspired blocking.' },
  
  // Jordan 4s
  { sku: 'DZ2628-100', name: 'Air Jordan 4 Retro', brand: 'Jordan', colorway: 'Craft Olive', releaseDate: new Date('2023-02-11'), retailPrice: 210, images: ['https://placehold.co/600x600/84cc16/white?text=Jordan+4+Olive'], description: 'Premium olive canvas with sail leather.' },
  { sku: 'DC7770-160', name: 'Air Jordan 4 Retro', brand: 'Jordan', colorway: 'Military Black', releaseDate: new Date('2022-05-21'), retailPrice: 210, images: ['https://placehold.co/600x600/f8fafc/1e293b?text=Jordan+4+Military'], description: 'White leather base with black and grey accents.' },
  { sku: 'FQ8213-001', name: 'Air Jordan 4 Retro', brand: 'Jordan', colorway: 'Bred Reimagined', releaseDate: new Date('2024-02-17'), retailPrice: 220, images: ['https://placehold.co/600x600/b91c1c/white?text=Jordan+4+Bred'], description: 'Reimagined Bred colorway with premium materials.' },
  
  // Nike Dunks
  { sku: 'DD1391-100', name: 'Nike Dunk Low', brand: 'Nike', colorway: 'Panda', releaseDate: new Date('2021-03-10'), retailPrice: 110, images: ['https://placehold.co/600x600/000000/ffffff?text=Dunk+Panda'], description: 'Most popular Dunk colorway ever.' },
  { sku: 'DV0833-002', name: 'Nike Dunk Low', brand: 'Nike', colorway: 'Black White', releaseDate: new Date('2022-06-15'), retailPrice: 110, images: ['https://placehold.co/600x600/1f2937/f9fafb?text=Dunk+Low'], description: 'Timeless black and white leather.' },
  { sku: 'FD2196-400', name: 'Nike Dunk Low Retro', brand: 'Nike', colorway: 'Blue Suede', releaseDate: new Date('2023-03-01'), retailPrice: 120, images: ['https://placehold.co/600x600/2563eb/white?text=Dunk+Blue'], description: 'Classic Dunk in rich blue suede.' },
  { sku: 'DZ5485-612', name: 'Nike Dunk Low', brand: 'Nike', colorway: 'Team Red', releaseDate: new Date('2022-09-01'), retailPrice: 110, images: ['https://placehold.co/600x600/dc2626/white?text=Dunk+Red'], description: 'Bold team red leather.' },
  { sku: 'DJ6188-001', name: 'Nike Dunk Low', brand: 'Nike', colorway: 'Harvest Moon', releaseDate: new Date('2021-10-01'), retailPrice: 110, images: ['https://placehold.co/600x600/d97706/white?text=Dunk+Harvest'], description: 'Wheat and brown autumn colorway.' },
  { sku: 'FD0882-200', name: 'Nike Dunk Low', brand: 'Nike', colorway: 'Velvet Brown', releaseDate: new Date('2023-10-10'), retailPrice: 115, images: ['https://placehold.co/600x600/78350f/white?text=Dunk+Velvet'], description: 'Luxurious brown velvet construction.' },
  
  // Nike SB Dunks
  { sku: 'FB9922-101', name: 'Nike SB Dunk Low Pro', brand: 'Nike SB', colorway: 'Wheat Mocha', releaseDate: new Date('2023-01-12'), retailPrice: 115, images: ['https://placehold.co/600x600/c2410c/white?text=SB+Dunk+Wheat'], description: 'Earthy wheat and mocha tones.' },
  { sku: 'CZ0790-001', name: 'Travis Scott x Nike SB Dunk Low', brand: 'Nike', colorway: 'Cactus Jack', releaseDate: new Date('2020-02-29'), retailPrice: 150, images: ['https://placehold.co/600x600/854d0e/white?text=Travis+Scott'], description: 'Limited collaboration with paisley print.' },
  
  // Air Force 1s
  { sku: 'DC8839-100', name: 'Nike Air Force 1 Low', brand: 'Nike', colorway: 'White', releaseDate: new Date('1982-01-01'), retailPrice: 110, images: ['https://placehold.co/600x600/ffffff/000000?text=AF1+White'], description: 'The iconic all-white Air Force 1.' },
  { sku: 'CW2288-111', name: 'Nike Air Force 1 Low', brand: 'Nike', colorway: 'Shadow', releaseDate: new Date('2020-07-30'), retailPrice: 110, images: ['https://placehold.co/600x600/e5e7eb/374151?text=AF1+Shadow'], description: 'Layered white and grey with double Swoosh.' },
  { sku: 'CQ0493-001', name: 'Nike Air Force 1 Low', brand: 'Nike', colorway: 'Black', releaseDate: new Date('1982-01-01'), retailPrice: 110, images: ['https://placehold.co/600x600/000000/ffffff?text=AF1+Black'], description: 'Classic all-black Air Force 1.' },
  
  // Yeezy
  { sku: 'GW3773', name: 'adidas Yeezy Boost 350 V2', brand: 'Yeezy', colorway: 'Onyx', releaseDate: new Date('2022-04-02'), retailPrice: 230, images: ['https://placehold.co/600x600/18181b/ffffff?text=Yeezy+Onyx'], description: 'All-black Primeknit with Boost sole.' },
  { sku: 'FZ5000', name: 'adidas Yeezy Boost 350 V2', brand: 'Yeezy', colorway: 'Slate', releaseDate: new Date('2023-03-10'), retailPrice: 230, images: ['https://placehold.co/600x600/64748b/white?text=Yeezy+Slate'], description: 'Dark grey Primeknit mono colorway.' },
  { sku: 'HQ6316', name: 'adidas Yeezy Slide', brand: 'Yeezy', colorway: 'Bone', releaseDate: new Date('2022-03-07'), retailPrice: 70, images: ['https://placehold.co/600x600/e7e5e4/1c1917?text=Yeezy+Slide'], description: 'Minimalist slide in neutral bone.' },
  { sku: 'GZ5541', name: 'adidas Yeezy Boost 700', brand: 'Yeezy', colorway: 'Wave Runner', releaseDate: new Date('2017-08-12'), retailPrice: 300, images: ['https://placehold.co/600x600/0ea5e9/white?text=Yeezy+700'], description: 'Iconic dad shoe with Boost cushioning.' },
  
  // New Balance
  { sku: 'M990GL3', name: 'New Balance 990v3', brand: 'New Balance', colorway: 'Grey', releaseDate: new Date('2012-01-01'), retailPrice: 185, images: ['https://placehold.co/600x600/9ca3af/white?text=NB+990v3'], description: 'Made in USA with premium suede.' },
  { sku: 'M2002RDA', name: 'New Balance 2002R', brand: 'New Balance', colorway: 'Protection Pack Phantom', releaseDate: new Date('2022-08-19'), retailPrice: 150, images: ['https://placehold.co/600x600/6b7280/white?text=NB+2002R'], description: 'Retro runner with ABZORB cushioning.' },
  { sku: 'ML574EVG', name: 'New Balance 574', brand: 'New Balance', colorway: 'Grey', releaseDate: new Date('1988-01-01'), retailPrice: 90, images: ['https://placehold.co/600x600/94a3b8/white?text=NB+574'], description: 'Classic 574 in grey suede and mesh.' },
  { sku: 'M1906REI', name: 'New Balance 1906R', brand: 'New Balance', colorway: 'Navy', releaseDate: new Date('2023-01-01'), retailPrice: 150, images: ['https://placehold.co/600x600/1e3a8a/white?text=NB+1906R'], description: 'Y2K-inspired runner with N-ergy.' },
  
  // Asics
  { sku: '1201A019-020', name: 'Asics Gel-Kayano 14', brand: 'Asics', colorway: 'Cream', releaseDate: new Date('2022-09-01'), retailPrice: 150, images: ['https://placehold.co/600x600/fef3c7/92400e?text=Asics+Kayano'], description: 'Y2K-era runner with cream suede.' },
  { sku: '1201A789-250', name: 'Asics Gel-1130', brand: 'Asics', colorway: 'White Pure Silver', releaseDate: new Date('2023-01-01'), retailPrice: 120, images: ['https://placehold.co/600x600/f1f5f9/475569?text=Asics+1130'], description: 'Retro runner with GEL technology.' },
  { sku: '1203A413-020', name: 'Asics Gel-Quantum 360', brand: 'Asics', colorway: 'Black', releaseDate: new Date('2022-01-01'), retailPrice: 170, images: ['https://placehold.co/600x600/0f172a/ffffff?text=Asics+Quantum'], description: '360-degree GEL cushioning system.' },
  
  // Converse
  { sku: 'M9160C', name: 'Converse Chuck Taylor All Star High', brand: 'Converse', colorway: 'Black', releaseDate: new Date('1917-01-01'), retailPrice: 65, images: ['https://placehold.co/600x600/000000/ffffff?text=Chuck+High'], description: 'Iconic canvas high-top.' },
  { sku: 'M7650C', name: 'Converse Chuck Taylor All Star Low', brand: 'Converse', colorway: 'White', releaseDate: new Date('1917-01-01'), retailPrice: 60, images: ['https://placehold.co/600x600/ffffff/000000?text=Chuck+Low'], description: 'Classic low-top in white.' },
  { sku: '170554C', name: 'Converse Chuck 70 High', brand: 'Converse', colorway: 'Parchment', releaseDate: new Date('2013-01-01'), retailPrice: 90, images: ['https://placehold.co/600x600/fef2f2/991b1b?text=Chuck+70'], description: 'Premium Chuck 70 with vintage details.' },
  
  // Vans
  { sku: 'VN000D3HY28', name: 'Vans Old Skool', brand: 'Vans', colorway: 'Black White', releaseDate: new Date('1977-01-01'), retailPrice: 70, images: ['https://placehold.co/600x600/000000/ffffff?text=Old+Skool'], description: 'Iconic skate shoe with side stripe.' },
  { sku: 'VN0A5FCBA0S', name: 'Vans Sk8-Hi', brand: 'Vans', colorway: 'True White', releaseDate: new Date('1978-01-01'), retailPrice: 75, images: ['https://placehold.co/600x600/fefefe/1e293b?text=Sk8+Hi'], description: 'High-top skate shoe with padded collar.' },
  { sku: 'VN0A3WKT6BT', name: 'Vans Authentic', brand: 'Vans', colorway: 'Black', releaseDate: new Date('1966-01-01'), retailPrice: 60, images: ['https://placehold.co/600x600/09090b/ffffff?text=Authentic'], description: 'The original Vans silhouette.' },
  
  // Puma
  { sku: '396463-01', name: 'Puma Suede Classic', brand: 'Puma', colorway: 'Peacoat White', releaseDate: new Date('1968-01-01'), retailPrice: 75, images: ['https://placehold.co/600x600/1e3a8a/white?text=Puma+Suede'], description: 'Retro suede sneaker with gold branding.' },
  { sku: '306889-02', name: 'Puma Palermo', brand: 'Puma', colorway: 'Navy', releaseDate: new Date('2024-01-01'), retailPrice: 90, images: ['https://placehold.co/600x600/1e40af/white?text=Puma+Palermo'], description: 'Terrace culture-inspired silhouette.' },
  
  // Reebok
  { sku: 'FX1303', name: 'Reebok Club C 85', brand: 'Reebok', colorway: 'White Green', releaseDate: new Date('1985-01-01'), retailPrice: 80, images: ['https://placehold.co/600x600/ffffff/16a34a?text=Club+C'], description: 'Classic tennis shoe with soft leather.' },
  { sku: 'GY3438', name: 'Reebok Club C Revenge', brand: 'Reebok', colorway: 'White Black', releaseDate: new Date('2020-01-01'), retailPrice: 90, images: ['https://placehold.co/600x600/f8fafc/0f172a?text=Club+C+Revenge'], description: 'Modern take on the Club C silhouette.' },
  
  // Salomon
  { sku: 'L41381000', name: 'Salomon XT-6', brand: 'Salomon', colorway: 'Black', releaseDate: new Date('2021-01-01'), retailPrice: 190, images: ['https://placehold.co/600x600/171717/ffffff?text=Salomon+XT6'], description: 'Technical trail runner with Quicklace.' },
  { sku: 'L47452800', name: 'Salomon ACS Pro', brand: 'Salomon', colorway: 'Vanilla Ice', releaseDate: new Date('2023-06-01'), retailPrice: 180, images: ['https://placehold.co/600x600/fef9c3/78350f?text=Salomon+ACS'], description: 'Advanced Chassis System trail shoe.' },
  
  // On Running
  { sku: '3MD10251479', name: 'On Cloudmonster', brand: 'On', colorway: 'All White', releaseDate: new Date('2022-09-01'), retailPrice: 170, images: ['https://placehold.co/600x600/fafafa/525252?text=Cloudmonster'], description: 'Max-cushioned runner with CloudTec.' },
  
  // Hoka
  { sku: '1123202-BBLC', name: 'Hoka Clifton 9', brand: 'Hoka', colorway: 'Black', releaseDate: new Date('2022-08-01'), retailPrice: 145, images: ['https://placehold.co/600x600/1c1917/ffffff?text=Hoka+Clifton'], description: 'Lightweight daily trainer.' },
  
  // Saucony
  { sku: 'S70404-52', name: 'Saucony Shadow 6000', brand: 'Saucony', colorway: 'Grey', releaseDate: new Date('1991-01-01'), retailPrice: 110, images: ['https://placehold.co/600x600/71717a/white?text=Saucony+Shadow'], description: 'Classic runner from 1991.' },
  
  // Crocs
  { sku: '10001-001', name: 'Crocs Classic Clog', brand: 'Crocs', colorway: 'Black', releaseDate: new Date('2002-01-01'), retailPrice: 50, images: ['https://placehold.co/600x600/000000/ffffff?text=Crocs'], description: 'Iconic foam clog with ventilation.' },
];

async function main() {
  console.log(`🌱 Seeding ${sneakers.length} sneakers...\n`);

  const sizes = ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

  for (const sneaker of sneakers) {
    try {
      await prisma.product.upsert({
        where: { sku: sneaker.sku },
        update: {
          name: sneaker.name,
          brand: sneaker.brand,
          colorway: sneaker.colorway,
          retailPrice: sneaker.retailPrice,
          description: sneaker.description,
          images: sneaker.images,
        },
        create: {
          ...sneaker,
          variants: {
            create: sizes.map((size) => ({
              size,
              stock: Math.floor(Math.random() * 15) + 5,
              price: sneaker.retailPrice,
            })),
          },
        },
      });
      console.log(`✓ ${sneaker.name} - ${sneaker.colorway}`);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code !== 'P2002') {
        const message = 'message' in e && typeof e.message === 'string' ? e.message : 'Unknown error';
        console.log(`✗ ${sneaker.sku}: ${message}`);
      }
    }
  }

  console.log(`\n✅ Seeded ${sneakers.length} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
