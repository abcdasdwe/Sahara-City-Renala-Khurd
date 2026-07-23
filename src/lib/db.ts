import { Property, Lead, Review, Blog, MediaItem, AppSettings } from '../types';

export const DB_NAME = 'SaharaCityDB';
export const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    try {
      if (dbInstance.name) return Promise.resolve(dbInstance);
    } catch (e) {
      dbInstance = null;
    }
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB opening error:', event);
      dbPromise = null;
      reject(request.error);
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      const stores = [
        { name: 'properties', keyPath: 'id' },
        { name: 'leads', keyPath: 'id' },
        { name: 'reviews', keyPath: 'id' },
        { name: 'settings', keyPath: 'key' },
        { name: 'media', keyPath: 'id' },
        { name: 'analytics', keyPath: 'id' },
        { name: 'blogs', keyPath: 'id' }
      ];

      for (const store of stores) {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, { keyPath: store.keyPath });
        }
      }
    };
  });

  return dbPromise;
}

// Low-level database helpers
export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGet<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Helper to clear a local object store before syncing fresh server data
export async function dbClearStore(storeName: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || request.error);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`Failed clearing store "${storeName}":`, err);
  }
}

// Server sync helpers for cross-browser synchronization
export async function syncServerDatabase(): Promise<any> {
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const data = await res.json();
      if (data) {
        // Clear and sync retrieved server data into local IndexedDB
        if (Array.isArray(data.properties)) {
          await dbClearStore('properties');
          for (const item of data.properties) await dbPutLocal('properties', item);
        }
        if (Array.isArray(data.leads)) {
          await dbClearStore('leads');
          for (const item of data.leads) await dbPutLocal('leads', item);
        }
        if (Array.isArray(data.reviews)) {
          await dbClearStore('reviews');
          for (const item of data.reviews) await dbPutLocal('reviews', item);
        }
        if (Array.isArray(data.blogs)) {
          await dbClearStore('blogs');
          for (const item of data.blogs) await dbPutLocal('blogs', item);
        }
        if (Array.isArray(data.media)) {
          await dbClearStore('media');
          for (const item of data.media) await dbPutLocal('media', item);
        }
        if (data.settings) {
          await dbPutLocal('settings', { key: 'config', value: data.settings });
          try {
            localStorage.setItem('sahara_app_settings', JSON.stringify(data.settings));
          } catch (e) {
            // ignore
          }
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync fetch failed, falling back to local storage:', err);
  }
  return null;
}

// Low-level database helper for local writing without recursive API calling
export async function dbPutLocal<T>(storeName: string, item: T): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    transaction.oncomplete = () => resolve(item);
    transaction.onerror = () => reject(transaction.error || request.error);
    request.onerror = () => reject(request.error);
  });
}

export async function dbPut<T>(storeName: string, item: T): Promise<T> {
  const timestamp = new Date().toISOString();
  console.log(`[dbPut] [${timestamp}] Executing write on store: "${storeName}"`, item);
  
  // 1. Put item locally in IndexedDB
  await dbPutLocal(storeName, item);

  // 2. Put item on central Express server so all browsers receive update
  try {
    await fetch('/api/db/put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName, item })
    });
  } catch (e) {
    console.warn('Failed to sync dbPut to server:', e);
  }

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara_db_updated'));
    }
  } catch (e) {
    // ignore
  }

  return item;
}

export async function dbDelete(storeName: string, id: string): Promise<string> {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    transaction.oncomplete = () => resolve(id);
    transaction.onerror = () => reject(transaction.error || request.error);
    transaction.onabort = () => reject(transaction.error || request.error);
    request.onerror = () => reject(request.error);
  });

  try {
    await fetch('/api/db/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName, id })
    });
  } catch (e) {
    console.warn('Failed to sync dbDelete to server:', e);
  }

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahara_db_updated'));
    }
  } catch (e) {
    // ignore
  }

  return id;
}

// Specific wrappers
export async function getSettings(): Promise<AppSettings> {
  let settings: AppSettings | null = null;
  
  try {
    const item = await dbGet<{ key: string; value: AppSettings }>('settings', 'config');
    if (item && item.value) {
      settings = item.value;
    }
  } catch (err) {
    console.warn('Error fetching settings from IndexedDB store:', err);
  }

  // Check fallback in localStorage if IndexedDB settings not found or empty
  if (!settings) {
    const cached = localStorage.getItem('sahara_app_settings');
    if (cached) {
      try {
        const cachedSettings = JSON.parse(cached);
        if (cachedSettings) {
          settings = cachedSettings;
          // Only sync back to IndexedDB if it doesn't risk overwriting IndexedDB with a stripped fallback
          await dbPutLocal('settings', { key: 'config', value: settings });
        }
      } catch (err) {
        console.warn('Error reading settings from localStorage:', err);
      }
    }
  }

  if (settings) {
    try {
      // Safe cache attempt to localStorage for fast synchronous recovery
      localStorage.setItem('sahara_app_settings', JSON.stringify(settings));
    } catch (e) {
      // Quota exceeded is expected when settings contain large image/PDF Data URIs
      try {
        const lightweight = { ...settings };
        if (lightweight.masterPlanPdf && lightweight.masterPlanPdf.length > 300000) {
          delete lightweight.masterPlanPdf;
        }
        if (lightweight.masterPlanImage && lightweight.masterPlanImage.length > 300000) {
          delete lightweight.masterPlanImage;
        }
        if (lightweight.heroBackground && lightweight.heroBackground.length > 500000) {
          lightweight.heroBackground = '/sahara-bg.jpg';
        }
        localStorage.setItem('sahara_app_settings', JSON.stringify(lightweight));
      } catch (err) {
        // ignore
      }
    }
    return settings;
  }

  // Default app settings matching prompt and screenshot details
  const defaultSettings: AppSettings = {
    heroTitle: 'Sahara Business City',
    heroSubtitle: 'Luxurious Living & Secure Investments in Punjab\'s Most Modern Housing Society',
    heroBackground: '/sahara-bg.jpg',
    contactAddress: 'House # 130, Sahara city, Renala Khurd, Okara, Punjab, Pakistan',
    contactEmail: 'info@saharacityrenala.com',
    contactPhone: '0321 2099125',
    whatsappNumber: '+923212099125',
    companyAboutText: 'Sahara City Renala Khurd is a premier gated community offering a gold-standard lifestyle. Designed list items include international security standards, wide carpeted roads near N5 highway, underground electrification, continuous clean water, fully functional primary schools, dynamic central Mosque, and multiple thematic parks (Anwar Shaheed Colony area). We deliver residential and commercial plots alongside custom luxury villas with very easy monthly and quarterly installment plans.',
    facebookUrl: 'https://facebook.com/SaharaCityRenalaKhurdOfficial',
    instagramUrl: 'https://instagram.com/saharacityrenala',
    twitterUrl: 'https://twitter.com/saharacityrk',
    youtubeUrl: 'https://youtube.com/saharacityrenala',
    seoDefaultTitle: 'Sahara City Renala Khurd | Premium Real Estate Gated Community & Plots',
    seoDefaultDescription: 'Discover residential & commercial plots for sale in Sahara City Renala Khurd on easy monthly installment plans with 24/7 security & top-tier amenities.',
    footerCopyrightText: '© 2026 Sahara City Renala Khurd. All Rights Reserved. Designed for upscale lifestyle & secure investments.'
  };

  try {
    await dbPutLocal('settings', { key: 'config', value: defaultSettings });
    localStorage.setItem('sahara_app_settings', JSON.stringify(defaultSettings));
  } catch (e) {
    console.warn('Could not save default settings to IndexedDB:', e);
  }

  return defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  // 1. Always save the FULL settings object directly into IndexedDB first
  try {
    await dbPutLocal('settings', { key: 'config', value: settings });
  } catch (err) {
    console.error('Error persisting settings to IndexedDB:', err);
  }

  // 2. Post settings to central Express server so all browsers receive update
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (e) {
    console.warn('Failed to sync settings to server:', e);
  }

  // 3. Cache in localStorage for fast synchronous recovery across reloads
  try {
    localStorage.setItem('sahara_app_settings', JSON.stringify(settings));
  } catch (err) {
    // If payload is large (e.g. huge PDF/Image base64), strip large strings for localStorage backup
    console.warn('localStorage quota exceeded. Saving lightweight settings backup without large blobs:', err);
    try {
      const lightweight = { ...settings };
      if (lightweight.masterPlanPdf && lightweight.masterPlanPdf.length > 300000) {
        delete lightweight.masterPlanPdf;
      }
      if (lightweight.masterPlanImage && lightweight.masterPlanImage.length > 300000) {
        delete lightweight.masterPlanImage;
      }
      if (lightweight.heroBackground && lightweight.heroBackground.length > 500000) {
        lightweight.heroBackground = '/sahara-bg.jpg';
      }
      localStorage.setItem('sahara_app_settings', JSON.stringify(lightweight));
    } catch (e) {
      // ignore
    }
  }

  // 4. Dispatch real-time custom event to immediately notify mounted UI components (e.g. MasterPlanSection, App)
  try {
    window.dispatchEvent(new CustomEvent('sahara_settings_updated', { detail: settings }));
    window.dispatchEvent(new CustomEvent('sahara_db_updated'));
  } catch (e) {
    console.warn('Error dispatching settings update event:', e);
  }

  return settings;
}

// Seed Database Function
export async function seedDatabaseIfEmpty() {
  // Try syncing central database state from Express server first
  const serverData = await syncServerDatabase();
  if (serverData) {
    // Server responded and is single source of truth for all clients!
    localStorage.setItem('sahara_db_seeded', 'true');
    return;
  }

  // Prevent re-seeding if database has already been initialized in this environment
  if (localStorage.getItem('sahara_db_seeded') === 'true') {
    return;
  }

  const existingProps = await dbGetAll<Property>('properties');
  if (existingProps.length > 0) {
    localStorage.setItem('sahara_db_seeded', 'true');
    return; // Database already seeded
  }

  // Seed Properties
  const seedProperties: Property[] = [
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
    },
    {
      id: 'SC-P05',
      title: 'Modern 10 Marla Executive Residential Plot - Block A',
      description: 'Exclusive, premier 10 Marla residential plot located in the highly desired Block A. Key developmental details: paved wide double-roads, immediate underground power connection lines, close proximity to family parks and Jogging Tracks. Perfect layout for a spacious dream family residence.',
      price: 3600000,
      city: 'Renala Khurd',
      area: '10 Marla',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Residential Plot',
      purpose: 'Installment',
      images: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'Available',
      installmentDetails: {
        downPayment: 650000,
        monthlyInstallment: 35000,
        quarterlyInstallment: 180000,
        totalInstallments: 36,
        possessionDate: '2027-06-30'
      },
      availabilityCalendar: {
        '2026-07-01': 'Vacant'
      },
      createdDate: '2026-06-10',
      views: 94
    },
    {
      id: 'SC-P06',
      title: '1 Kanal Luxury Residential Estate Plot',
      description: 'Unmatched 1 Kanal luxury level plot in Master Phase-I development. Ultimate VIP sector with maximum green belt landscaping, immediate water filtration accessibility, standard underground high-voltage safety cables, VIP neighbor profile. Genuinely magnificent opportunity for high net-worth individuals requesting a dream manor.',
      price: 7800000,
      city: 'Renala Khurd',
      area: '1 Kanal',
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'Residential Plot',
      purpose: 'For Sale',
      images: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
      ],
      mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.2885973942007!2d73.5960011!3d30.7380998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39229be4949a2a3f%3A0xe679237077a76e0d!2sSahara%20City%20Renala%20Khurd!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk',
      status: 'Reserved',
      createdDate: '2026-05-01',
      views: 112
    }
  ];

  for (const property of seedProperties) {
    await dbPutLocal('properties', property);
  }

  // Seed Blogs
  const seedBlogs: Blog[] = [
    {
      id: 'blog-01',
      title: 'Why Sahara City Renala Khurd is the Perfect Property Investment in 2026',
      slug: 'why-sahara-city-investment-2026',
      category: 'Investment',
      summary: 'An depth financial analysis of current real estate trends in Renala Khurd (Sahiwal Division) and why gated communities offer guaranteed passive yields.',
      content: `### The Rising Demand for Secure Gated Housing in Okara District

Renala Khurd is undergoing a massive economic uplift. With its key alignment alongside the national N5 highway, connectivity between Sahiwal and Okara is flawless. Sahara City has secured the top rank for gated housing development in this sector. Here are three key investment catalysts:

1. **Unmatched Infrastructure:** Paved double roads, state of the art safety fencing, 24/7 CCTV surveillance, and high-quality underground cabling are standard here.
2. **Flexible Installment Plans:** Buyers can secure premium 5 Marla and 10 Marla plots with easily affordable monthly and quarterly plans starting with low down payment.
3. **Pristine Living Environment:** Multiple beautifully curated green parks, Anwar Shaheed Colony sports facilities, and a fully functional grand Mosque provide top-scale community living.

Investors have already witnessed a steady 15-20% annual property appreciation in master phases over the last 36 months, proving that Sahara City remains Renala Khurds primary premium land development.`,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      author: 'Imran Shah (Property Consultant)',
      createdDate: '2026-06-15'
    },
    {
      id: 'blog-02',
      title: 'Guide to Smart Residential Plot Buying: Installment Checklist',
      slug: 'smart-plot-buying-installment-checklist',
      category: 'Property Guides',
      summary: 'Before signing your next real estate installment schedule, check these 5 legal, logistic, and physical status factors.',
      content: `### How to Buy Real Estate Safely in Housing Societies

Getting into installment properties is an outstanding way to build wealth, but keeping an analytical checklist is vital for every modern buyer:

- **Check 1: Physical Survey & Location:** Ensure you inspect the exact plot layout in Phase C or B. Ground elevations, water accessibility, and proximity to green parks or main boulevards significantly influence villa values.
- **Check 2: Downpayment & Hidden Charges:** Always verify whether the development prices, electricity meters, and municipal connection taxes are fully covered under standard quarterly installment schedules.
- **Check 3: Transit Links & Proximity:** Check distance to local school zones, standard N5 Highway bypasses, and emergency clinical services. Sahara City has excellent internal connectivity.

At Sahara City, we make your journey entirely transparent by providing precise automated calculations and formal brochures for every premium plot.`,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      author: 'M. Zubair (Senior Investment Architect)',
      createdDate: '2026-06-10'
    },
    {
      id: 'blog-03',
      title: 'First-Phase Development Work Complete in Sector B & Anwar Shaheed Annex',
      slug: 'phase-b-development-update',
      category: 'Society Updates',
      summary: 'Sahara City officially finishes high-speed road paving, water sanitation system testing, and security gates testing for Sector B residential clients.',
      content: `### Sector B Development Milestones Completed Successfully

We are extraordinarily thrilled to announce to our esteemed clients that Phase-I development within Sector B of Sahara City Renala Khurd has concluded successfully! The following infrastructure works are fully live:

- **Underground Water Faucet Pipelines:** Fully pressurized pipelines are set up, ensuring clean water access for all premium luxury villas.
- **Street Lamp Poles:** Energetic modern LED lamp posts have been fully erected along primary and secondary avenues.
- **Green Belt Vegetation:** Beautiful plantation lines, palm trees, and fresh grass cover have been laid across the parks and roadsides.

Plot buyers are invited to schedule their physical site allocation checks and request building handbooks.`,
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
      author: 'Sahara City Management',
      createdDate: '2026-06-20'
    }
  ];

  for (const blog of seedBlogs) {
    await dbPutLocal('blogs', blog);
  }

  // Seed Reviews matching screenshot (4.2 rating, 222 total ratings, Anwar Shaheed area details)
  const seedReviews: Review[] = [
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
    },
    {
      id: 'rev-04',
      customerName: 'Zainab Bibi',
      email: 'zainab.b@gmail.com',
      rating: 4,
      comment: 'Lush green parks and wide, illuminated boulevards. Sahara City Renala Khurd provides an elegant urban standard right inside our city.',
      isApproved: true,
      createdDate: '2026-05-28'
    },
    {
      id: 'rev-05',
      customerName: 'Sajjad Ahmad',
      email: 'sajjad.ahmad@live.com',
      rating: 3,
      comment: 'Outstanding project, though possession in Phase C could be speeded up. The grand Mosque looks magnificent and is fully operational.',
      isApproved: true,
      createdDate: '2026-05-10'
    }
  ];

  for (const review of seedReviews) {
    await dbPutLocal('reviews', review);
  }

  // Seed Leads to show data in Dashboard immediately
  const seedLeads: Lead[] = [
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
    },
    {
      id: 'lead-02',
      propertyId: 'SC-P02',
      propertyName: 'Premium 5 Marla Residential Plot - Corner Block',
      customerName: 'Dr. Amna Shahzadi',
      customerEmail: 'amna.sh1596@gmail.com',
      customerPhone: '0312 9876543',
      message: 'Can I schedule a physical site visit to the 5 Marla corner plot on Saturday around 11:00 AM? Please confirm if any agent will be available at House #130.',
      status: 'Contacted',
      createdDate: '2026-06-20'
    },
    {
      id: 'lead-03',
      customerName: 'Yasir Khan',
      customerEmail: 'yasirkhan@yahoo.com',
      customerPhone: '0321 4455889',
      message: 'General query regarding commercial properties. What is the current developmental rate in Master Phase B and down payment details?',
      status: 'New',
      createdDate: '2026-06-21'
    }
  ];

  for (const lead of seedLeads) {
    await dbPutLocal('leads', lead);
  }

  // Seed Settings
  const settings: AppSettings = {
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
  };
  await dbPutLocal('settings', { key: 'config', value: settings });

  // Seed Media items matching screenshot landscape categories (Residential, Parks, Commercial, Mosque, General)
  const seedMedia: MediaItem[] = [
    {
      id: 'med-01',
      name: 'Sahara City Main Avenue',
      category: 'General',
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
      uploadedDate: '2026-06-01',
      size: '124 KB'
    },
    {
      id: 'med-02',
      name: ' central Theme Park',
      category: 'Parks',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      uploadedDate: '2026-06-02',
      size: '210 KB'
    },
    {
      id: 'med-03',
      name: 'Model Plot Corner View',
      category: 'Residential',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      uploadedDate: '2026-06-04',
      size: '195 KB'
    }
  ];

  for (const media of seedMedia) {
    await dbPutLocal('media', media);
  }

  localStorage.setItem('sahara_db_seeded', 'true');
}
