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

// Default initial data for central store matching src/types.ts interfaces
const defaultDbData = {
  properties: [
    {
      id: 'SC-P01',
      title: '5 Marla Residential Plot - Prime Location Park View',
      description: 'Stunning 5 Marla (approx. 1125 sq ft) residential plot. Offers direct view of the central scenic park and within easy walking distance to the Grand Jamia Mosque. Ready for immediate construction (possession ready) in Phase A. Prime environment with paved roads and continuous security surveillance.',
      price: 1850000,
      city: 'Renala Khurd',
      area: '5 Marla',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Residential Plot',
      purpose: 'Installment',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'Featured',
      installmentDetails: {
        downPayment: 350000,
        monthlyInstallment: 15000,
        quarterlyInstallment: 75000,
        totalInstallments: 36,
        possessionDate: '2027-12-31'
      },
      availabilityCalendar: {
        '2026-06-25': 'Vacant'
      },
      createdDate: '2026-05-15',
      views: 145
    },
    {
      id: 'SC-P02',
      title: 'Premium 5 Marla Residential Plot - Corner Block',
      description: 'Elegant corner-facing 5 Marla (approx. 1125 sq ft) residential plot. Key design details feature premium road connectivity, standard water connection lines, corner boundary walls, and direct frontage overlooking green gardens. Full underground grid connection and smart water filtration.',
      price: 2200000,
      city: 'Renala Khurd',
      area: '5 Marla',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Residential Plot',
      purpose: 'For Sale',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'New Listing',
      availabilityCalendar: {
        '2026-06-22': 'Vacant'
      },
      createdDate: '2026-06-18',
      views: 78
    },
    {
      id: 'SC-C03',
      title: '4 Marla Main Boulevard Commercial Junction Plot',
      description: 'High-traffic commercial land on the 100ft wide Main Boulevard. Perfect shopfront real estate for supermarkets, pharmaceutical businesses, banking offices, or luxury clothing retail. Enormous parking allocation. Outstanding annual yield projection due to massive local expansion.',
      price: 6500000,
      city: 'Renala Khurd',
      area: '4 Marla',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Commercial Plot',
      purpose: 'For Sale',
      images: [
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'Available',
      installmentDetails: {
        downPayment: 1500000,
        monthlyInstallment: 50000,
        quarterlyInstallment: 250000,
        totalInstallments: 24,
        possessionDate: '2026-12-01'
      },
      createdDate: '2026-04-10',
      views: 210
    },
    {
      id: 'SC-P04',
      title: '10 Marla VIP Master Block Residential Land',
      description: 'Exclusive 10 Marla resident land in Sector C, Sahara City. Highly demanding level plot directly near family fountain park and jogging trails. Underground security systems, active community water filtration facility, immediate electricity meter installation permissible. Ideal layout for a magnificent 4 or 5 bedroom custom family residence.',
      price: 3400000,
      city: 'Renala Khurd',
      area: '10 Marla',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Residential Plot',
      purpose: 'Installment',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'Featured',
      installmentDetails: {
        downPayment: 600000,
        monthlyInstallment: 30000,
        quarterlyInstallment: 150000,
        totalInstallments: 36,
        possessionDate: '2028-06-30'
      },
      createdDate: '2026-05-22',
      views: 189
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
      customerName: 'Muhammad Salman',
      email: 'salman@gmail.com',
      rating: 5,
      comment: 'Excellent Residence Area. Secure gated setup, outstanding road networks and lovely green lawns for kids. Best society in Renala Khurd!',
      isApproved: true,
      createdDate: '2026-06-15'
    },
    {
      id: 'rev-02',
      customerName: 'Anwar Ali',
      email: 'anwar_ali@yahoo.com',
      rating: 5,
      comment: 'Very good environment to live in safe place. Security staff is extremely professional, highly alert at main gates. Close to N5 Highway.',
      isApproved: true,
      createdDate: '2026-06-12'
    },
    {
      id: 'rev-03',
      customerName: 'Chaudhary Kashif',
      email: 'kashif.chaudhary@outlook.com',
      rating: 4,
      comment: 'Bought a 5 Marla plot on easy monthly installments. The entire documentation transfer procedure was seamless. Highly reliable property dealers!',
      isApproved: true,
      createdDate: '2026-06-05'
    }
  ],
  blogs: [
    {
      id: 'blog-01',
      title: 'Why Sahara City Renala Khurd is Punjab\'s Top Real Estate Investment in 2026',
      slug: 'why-sahara-city-investment-2026',
      category: 'Investment',
      summary: 'An depth financial analysis of current real estate trends in Renala Khurd (Sahiwal Division) and why gated communities offer guaranteed passive yields.',
      content: 'Real estate in Punjab is undergoing a massive shift towards master-planned gated communities. Sahara City Renala Khurd stands at the forefront of this transformation. Situated directly adjacent to key transport arteries near Okara, Sahara City offers unmatched urban planning, underground electricity, high-speed fiber internet, and family-friendly thematic parks.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      author: 'Imran Shah (Property Consultant)',
      createdDate: '2026-06-15'
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

// Helper function to sanitize legacy property objects to match current Property interface
function sanitizeProperty(p: any): any {
  if (!p || typeof p !== 'object') return p;

  let numericPrice = typeof p.price === 'number' ? p.price : (p.numericPrice || 0);
  if (typeof p.price === 'string') {
    const cleaned = p.price.replace(/[^0-9]/g, '');
    if (cleaned) numericPrice = Number(cleaned);
  }
  if (!numericPrice) numericPrice = 1850000;

  return {
    id: p.id || 'SC-' + Math.floor(Math.random() * 1000),
    title: p.title || 'Sahara City Property',
    description: p.description || p.summary || 'Prime property in Sahara City Renala Khurd.',
    price: numericPrice,
    city: p.city || 'Renala Khurd',
    area: p.area || p.marla || p.size || '5 Marla',
    bedrooms: typeof p.bedrooms === 'number' ? p.bedrooms : 0,
    bathrooms: typeof p.bathrooms === 'number' ? p.bathrooms : 0,
    propertyType: p.propertyType || (p.category === 'Commercial' ? 'Commercial Plot' : 'Residential Plot'),
    purpose: p.purpose || 'Installment',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'],
    mapLocation: p.mapLocation || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
    status: p.status || (p.isFeatured ? 'Featured' : 'Available'),
    installmentDetails: p.installmentDetails || (p.monthlyInstallment ? {
      downPayment: Number(String(p.downPayment || '').replace(/[^0-9]/g, '')) || 250000,
      monthlyInstallment: Number(String(p.monthlyInstallment || '').replace(/[^0-9]/g, '')) || 15000,
      quarterlyInstallment: 75000,
      totalInstallments: 36,
      possessionDate: '2028-12-31'
    } : undefined),
    availabilityCalendar: p.availabilityCalendar,
    createdDate: p.createdDate || new Date().toISOString().split('T')[0],
    views: typeof p.views === 'number' ? p.views : 0
  };
}

// Helper function to read database file
function readDbFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Ensure all store keys exist
          const properties = Array.isArray(parsed.properties) ? parsed.properties.map(sanitizeProperty) : defaultDbData.properties;
          const leads = Array.isArray(parsed.leads) ? parsed.leads : defaultDbData.leads;
          const reviews = Array.isArray(parsed.reviews) ? parsed.reviews : defaultDbData.reviews;
          const blogs = Array.isArray(parsed.blogs) ? parsed.blogs : defaultDbData.blogs;
          const media = Array.isArray(parsed.media) ? parsed.media : defaultDbData.media;
          const settings = parsed.settings && typeof parsed.settings === 'object' ? { ...defaultDbData.settings, ...parsed.settings } : defaultDbData.settings;

          return { properties, leads, reviews, blogs, media, settings };
        }
      }
    }
  } catch (err) {
    console.error('Failed reading DB file, re-initializing default store:', err);
  }
  // If missing or unreadable, write default
  writeDbFile(defaultDbData);
  return defaultDbData;
}

// Helper function to write database file safely
function writeDbFile(data: any) {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed writing DB file:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e2) {
      console.error('Fallback write also failed:', e2);
      return false;
    }
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
