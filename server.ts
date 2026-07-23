import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial data for central store
const defaultDbData = {
  properties: [
    {
      id: 'SC-P01',
      title: '5 Marla Residential Plot - Prime Location Park View',
      category: 'Residential',
      offeringType: 'Plots',
      price: 'PKR 2,200,000',
      numericPrice: 2200000,
      monthlyInstallment: 'PKR 22,000 / month',
      downPayment: 'PKR 250,000',
      location: 'Block A, Executive Sector, Sahara City, Renala Khurd',
      size: '5 Marla (125 Sq. Yds)',
      beds: 'N/A',
      baths: 'N/A',
      marla: '5 Marla',
      block: 'Block A',
      status: 'Available',
      features: ['24/7 Gated Security', '3-Phase Underground Electricity', '40ft Wide Carpeted Road', 'Front Facing Community Park', 'Sewerage & Tap Water'],
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
      description: 'Golden investment opportunity in Block A of Sahara City Renala Khurd. Located directly opposite the central theme park with immediate possession on completion of down payment terms.',
      isFeatured: true,
      phase: 'Phase 1'
    },
    {
      id: 'SC-P02',
      title: 'Premium 5 Marla Residential Plot - Corner Block',
      category: 'Residential',
      offeringType: 'Plots',
      price: 'PKR 2,450,000',
      numericPrice: 2450000,
      monthlyInstallment: 'PKR 24,500 / month',
      downPayment: 'PKR 280,000',
      location: 'Block B, Boulevard Corner, Sahara City, Renala Khurd',
      size: '5 Marla Corner Plot',
      beds: 'N/A',
      baths: 'N/A',
      marla: '5 Marla',
      block: 'Block B',
      status: 'Available',
      features: ['Corner Double Facing', '60ft Main Boulevard Access', 'Gated Sector Security', 'Underground Utilities', 'Immediate Registry'],
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'],
      description: 'Exclusive 5 Marla Corner plot situated on the 60ft Main Boulevard. Highest commercial appreciation potential in Block B.',
      isFeatured: true,
      phase: 'Phase 1'
    },
    {
      id: 'SC-P03',
      title: '10 Marla Luxury Villa - Fully Furnished Smart Home',
      category: 'Residential',
      offeringType: 'Villas',
      price: 'PKR 14,500,000',
      numericPrice: 14500000,
      monthlyInstallment: 'PKR 150,000 / month',
      downPayment: 'PKR 2,500,000',
      location: 'Executive Overseas Sector, Sahara City, Renala Khurd',
      size: '10 Marla (250 Sq. Yds)',
      beds: '5 Bedrooms',
      baths: '6 Bathrooms',
      marla: '10 Marla',
      block: 'Overseas Block',
      status: 'Available',
      features: ['Spanish Design Architecture', 'Imported Marble Flooring', 'Solar Power Ready', 'Servant Quarter', 'Double Kitchen', 'Lawn & Car Porch'],
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'],
      description: 'Magnificent 10 Marla turnkey villa constructed with gold-standard structural engineering. Modern Spanish elevation featuring state-of-the-art kitchen cabinetry, designer sanitary fittings, and lush lawn.',
      isFeatured: true,
      phase: 'Phase 1'
    },
    {
      id: 'SC-P04',
      title: '4 Marla Commercial Plot - Main Boulevard Commercial Hub',
      category: 'Commercial',
      offeringType: 'Commercial',
      price: 'PKR 5,800,000',
      numericPrice: 5800000,
      monthlyInstallment: 'PKR 55,000 / month',
      downPayment: 'PKR 850,000',
      location: 'Central Civic Center, Sahara City Main Boulevard, Renala Khurd',
      size: '4 Marla Commercial',
      beds: 'N/A',
      baths: 'N/A',
      marla: '4 Marla',
      block: 'Commercial Hub',
      status: 'Available',
      features: ['Main Boulevard Frontage', 'Plaza Construction Approved (Basement + 4)', 'High Footfall Zone', 'Ample Customer Parking', 'Separate Utility Connections'],
      images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200'],
      description: 'Prime commercial plot for corporate offices, retail banks, supermarkets, or medical plazas. Unmatched ROI potential on Renala Khurd bypass corridor.',
      isFeatured: true,
      phase: 'Phase 1'
    }
  ],
  leads: [
    {
      id: 'lead-01',
      propertyId: 'SC-P01',
      propertyName: '5 Marla Residential Plot - Prime Location Park View',
      customerName: 'Farhan Sheikh',
      customerEmail: 'farhan.sh@gmail.com',
      customerPhone: '0300 1234567',
      message: 'I am highly interested in the 5 Marla residential plot. Can you please send the detailed installment schedule and payment brochure on my WhatsApp?',
      status: 'New',
      createdDate: '2026-06-21'
    }
  ],
  reviews: [
    {
      id: 'rev-01',
      authorName: 'Chaudhry Tariq Mahmood',
      designation: 'Overseas Resident & Investor',
      rating: 5,
      comment: 'Invested in 2 plots in Block A from Dubai. The development speed of Sahara City Renala Khurd exceeded all expectations. Roads, streetlights, and security gating are top tier!',
      verifiedPurchase: true,
      date: '2026-05-14'
    },
    {
      id: 'rev-02',
      authorName: 'Dr. Shahida Parveen',
      designation: 'Villa Owner',
      rating: 5,
      comment: 'Living here peacefully for 6 months. Clean water supply, underground electricity, and 24/7 security guard patrolling give complete peace of mind for our family.',
      verifiedPurchase: true,
      date: '2026-06-01'
    }
  ],
  blogs: [
    {
      id: 'blog-01',
      title: 'Why Sahara City Renala Khurd is Punjab\'s Top Real Estate Investment in 2026',
      slug: 'why-sahara-city-renala-khurd-is-top-investment-2026',
      summary: 'Explore how rapid N5 Highway connectivity, interest-free installment plans, and gold-standard infrastructure make Sahara City the safest high-yield investment.',
      content: 'Real estate in Punjab is undergoing a massive shift towards master-planned gated communities. Sahara City Renala Khurd stands at the forefront of this transformation. Situated directly adjacent to key transport arteries near Okara, Sahara City offers unmatched urban planning, underground electricity, high-speed fiber internet, and family-friendly thematic parks. Investors have witnessed up to 35% capital appreciation over the past two years.',
      category: 'Market Trends',
      author: 'Sahara Editorial Desk',
      date: '2026-06-15',
      readTime: '4 min read',
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200',
      published: true
    }
  ],
  media: [
    {
      id: 'med-01',
      name: 'Sahara City Main Avenue',
      category: 'General',
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
      uploadedDate: '2026-06-01',
      size: '124 KB'
    }
  ],
  settings: {
    heroTitle: 'Sahara Business City',
    heroSubtitle: 'Luxurious Living & Secure Investments in Punjab\'s Most Modern Housing Society',
    heroBackground: '/sahara-bg.jpg',
    contactAddress: 'House # 130, Sahara city, Renala Khurd, Okara, Punjab, Pakistan',
    contactEmail: 'info@saharacityrenala.com',
    contactPhone: '0321 2099125',
    whatsappNumber: '+923212099125',
    companyAboutText: 'Sahara City Renala Khurd is a premier gated community offering a gold-standard lifestyle. Highlights include 24/7 security with professional gating, wide carpeted double-roads, underground electricity wires, clean tap water, and beautiful green community parks with children play sections. We host top-class planning for residential and commercial plots on extremely straightforward, interest-free monthly installment modes.',
    facebookUrl: 'https://facebook.com/SaharaCityRenalaKhurdOfficial',
    instagramUrl: 'https://instagram.com/saharacityrenala',
    twitterUrl: 'https://twitter.com/saharacityrk',
    youtubeUrl: 'https://youtube.com/saharacityrenala',
    seoDefaultTitle: 'Sahara City Renala Khurd | Premium Gated Society Real Estate & Plots',
    seoDefaultDescription: 'Browse the ultimate residential and commercial plots in Sahara City Renala Khurd on attractive installment layouts. Secure gated living, schools, Mosque and pristine parks.',
    footerCopyrightText: '© 2026 Sahara City Renala Khurd. All Rights Reserved. Designed for upscale lifestyle & secure investments.'
  }
};

// Helper function to read database file
function readDbFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading DB file, re-initializing default store:', err);
  }
  // If missing or unreadable, write default
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDbData, null, 2), 'utf-8');
  return defaultDbData;
}

// Helper function to write database file safely
function writeDbFile(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing DB file:', err);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Increase payload limit for base64 uploads (Master Plan PDFs, Hero backgrounds, Plot images)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // API ROUTE: Fetch entire database store state
  app.get('/api/db', (req, res) => {
    const data = readDbFile();
    res.json(data);
  });

  // API ROUTE: Full sync database save
  app.post('/api/db', (req, res) => {
    const newData = req.body;
    if (!newData || typeof newData !== 'object') {
      return res.status(400).json({ error: 'Invalid database payload' });
    }
    const current = readDbFile();
    const updated = {
      ...current,
      ...newData
    };
    const success = writeDbFile(updated);
    if (success) {
      res.json({ status: 'ok', data: updated });
    } else {
      res.status(500).json({ error: 'Failed to write central database file' });
    }
  });

  // API ROUTE: Put item into specific store (properties, leads, reviews, blogs, media, settings)
  app.post('/api/db/put', (req, res) => {
    const { storeName, item } = req.body;
    if (!storeName || !item) {
      return res.status(400).json({ error: 'storeName and item are required' });
    }

    const current = readDbFile();

    if (storeName === 'settings') {
      const settingsVal = item.value || item;
      current.settings = settingsVal;
    } else {
      const list = Array.isArray(current[storeName]) ? current[storeName] : [];
      const itemId = item.id;
      const index = list.findIndex((x: any) => x.id === itemId);
      if (index >= 0) {
        list[index] = item;
      } else {
        list.push(item);
      }
      current[storeName] = list;
    }

    const success = writeDbFile(current);
    if (success) {
      res.json({ status: 'ok', storeName, item });
    } else {
      res.status(500).json({ error: 'Failed to write to database' });
    }
  });

  // API ROUTE: Delete item from store
  app.post('/api/db/delete', (req, res) => {
    const { storeName, id } = req.body;
    if (!storeName || !id) {
      return res.status(400).json({ error: 'storeName and id are required' });
    }

    const current = readDbFile();
    if (Array.isArray(current[storeName])) {
      current[storeName] = current[storeName].filter((x: any) => x.id !== id);
      writeDbFile(current);
    }
    res.json({ status: 'ok', storeName, id });
  });

  // API ROUTE: Save settings directly
  app.post('/api/settings', (req, res) => {
    const newSettings = req.body;
    if (!newSettings) {
      return res.status(400).json({ error: 'Settings object required' });
    }
    const current = readDbFile();
    current.settings = newSettings;
    writeDbFile(current);
    res.json({ status: 'ok', settings: current.settings });
  });

  // Vite development middleware vs production static distribution
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
