export type PropertyStatus = 'Available' | 'Sold' | 'Reserved' | 'Rented' | 'Featured' | 'New Listing';
export type PropertyType = 'Residential Plot' | 'Commercial Plot' | 'House' | 'Villa' | 'Apartment';
export type PurposeType = 'For Sale' | 'For Rent' | 'Installment';

export interface InstallmentDetails {
  downPayment: number;
  monthlyInstallment: number;
  quarterlyInstallment: number;
  totalInstallments: number; // in months
  possessionDate: string;
}

export interface Property {
  id: string; // e.g., "SC-101"
  title: string;
  description: string;
  price: number;
  city: string; // e.g. "Renala Khurd"
  area: string; // e.g. "5 Marla", "10 Marla", "1 Kanal"
  bedrooms: number; // 0 for plots
  bathrooms: number; // 0 for plots
  propertyType: PropertyType;
  purpose: PurposeType;
  images: string[]; // Base64 or local URL
  mapLocation: string; // Google Maps iframe or coords
  status: PropertyStatus;
  installmentDetails?: InstallmentDetails;
  availabilityCalendar?: {
    [date: string]: 'Vacant' | 'Booked' | 'Reserved';
  };
  createdDate: string;
  views: number;
}

export interface Lead {
  id: string;
  propertyId?: string; // Optional property reference
  propertyName?: string; // Cache title
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  status: 'New' | 'Contacted' | 'Sold' | 'Archived';
  createdDate: string;
}

export interface Review {
  id: string;
  customerName: string;
  email: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean; // Needs approval by admin
  createdDate: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: 'Investment' | 'Property Guides' | 'Society Updates' | 'Real Estate News';
  summary: string;
  content: string; // Markdown supported
  image: string; // Base64 or URL
  author: string;
  createdDate: string;
}

export interface MediaItem {
  id: string;
  name: string;
  category: 'Residential' | 'Commercial' | 'Parks' | 'Mosque' | 'Development' | 'General';
  url: string; // Base64 data URI
  uploadedDate: string;
  size: string;
}

export interface AppSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBackground: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  companyAboutText: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  footerCopyrightText: string;
  masterPlanImage?: string;
  masterPlanPdf?: string;
  masterPlanPdfName?: string;
}

export interface AnalyticsSummary {
  popularSearches: { term: string; count: number }[];
  visitorCount: number;
}
