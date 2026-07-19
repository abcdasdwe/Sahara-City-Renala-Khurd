import { useEffect } from 'react';
import { Property, Blog } from '../types';

interface SEOHeadProps {
  view: string;
  property?: Property | null;
  blog?: Blog | null;
}

export default function SEOHead({ view, property, blog }: SEOHeadProps) {
  useEffect(() => {
    let title = 'Sahara City Renala Khurd | Premium Real Estate Gated Community';
    let description = 'Discover residential and commercial plots for sale in Sahara City Renala Khurd on easy monthly installment plans with 24/7 high-level gating.';
    let schemaMarkup: object | null = null;

    const baseSchemaUrl = window.location.href;

    // Organization & Local Business schema
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      'name': 'Sahara City Renala Khurd',
      'alternateName': 'Sahara City Property Dealers',
      'description': 'A premium, modern housing society on the main N5 highway in Renala Khurd offering world-class amenities, premium parks, schools, and secure gated residential and commercial plots.',
      'url': baseSchemaUrl,
      'logo': window.location.origin + '/logo.png',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+92-321-2099125',
        'contactType': 'sales',
        'areaServed': 'PK',
        'availableLanguage': ['English', 'Urdu']
      },
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'House # 130, Sahara city',
        'addressLocality': 'Renala Khurd',
        'addressRegion': 'Punjab',
        'postalCode': '56130',
        'addressCountry': 'PK'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '30.7380998',
        'longitude': '73.5960011'
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Saturday',
          'Sunday'
        ],
        'opens': '08:00',
        'closes': '20:00'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.2',
        'reviewCount': '222'
      }
    };

    switch (view) {
      case 'home':
        title = 'Sahara City Renala Khurd | Gated Community & Plots For Sale';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@graph': [
            orgSchema,
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'url': baseSchemaUrl,
              'name': 'Sahara City Renala Khurd',
              'potentialAction': {
                '@type': 'SearchAction',
                'target': `${baseSchemaUrl}?search={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            }
          ]
        };
        break;

      case 'about':
        title = 'About Us | Sahara City Renala Khurd Gated Community';
        description = 'Learn about Sahara City Renala Khurd development timeline, prime location near N5 highway, executive features, and expert property consultant listings.';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'mainEntity': orgSchema
        };
        break;

      case 'properties':
        title = 'Plots for Sale in Renala Khurd | Sahara City';
        description = 'Explore commercial & residential plots in Renala Khurd. Complete specifications, down payment budgets, and flexible installments.';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          'mainEntity': {
            '@type': 'ItemList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': '5 Marla Residential Plot' },
              { '@type': 'ListItem', 'position': 2, 'name': '10 Marla Residential Plot' },
              { '@type': 'ListItem', 'position': 3, 'name': '4 Marla Commercial Plot' }
            ]
          }
        };
        break;

      case 'property-details':
        if (property) {
          title = `${property.title} | Sahara City Renala Khurd`;
          description = `${property.description.substring(0, 150)}... Location: House 130, Sahara City, price: PKR ${property.price.toLocaleString()}.`;
          schemaMarkup = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': property.title,
            'image': property.images[0],
            'description': property.description,
            'sku': property.id,
            'offers': {
              '@type': 'Offer',
              'priceCurrency': 'PKR',
              'price': property.price,
              'priceValidUntil': '2028-12-31',
              'itemCondition': 'https://schema.org/NewCondition',
              'availability': 'https://schema.org/InStock',
              'seller': orgSchema
            }
          };
        }
        break;

      case 'blog':
        title = 'Real Estate News, Guides & Updates | Sahara City Blog';
        description = 'Read local real estate updates, buy-vs-lease tips, pricing analysis, development news, and installment guidelines in Sahara City Renala Khurd.';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          'name': 'Sahara City Real Estate Guides',
          'publisher': orgSchema
        };
        break;

      case 'blog-details':
        if (blog) {
          title = `${blog.title} | Sahara City News`;
          description = blog.summary;
          schemaMarkup = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            'headline': blog.title,
            'image': blog.image,
            'author': {
              '@type': 'Person',
              'name': blog.author
            },
            'publisher': orgSchema,
            'datePublished': blog.createdDate,
            'description': blog.summary
          };
        }
        break;

      case 'calculator':
        title = 'Easy Installment Calculator | Sahara City Renala Khurd';
        description = 'Calculate your down payment, remaining monthly budgets, quarterly payment schedule, and total cost balance for plots in Sahara City online.';
        break;

      case 'faq':
        title = 'Frequently Asked Questions (FAQ) | Sahara City Renala Khurd';
        description = 'Answers to all your questions about Sahara City Renala Khurd, plot documentation, payment schedules, security, utilities, and location details.';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'Where is Sahara City Renala Khurd located?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Sahara City is located on the main N5 GT Road, Renala Khurd near Anwar Shaheed Colony, Okara district, Punjab, Pakistan.'
              }
            },
            {
              '@type': 'Question',
              'name': 'What plot sizes are available in Sahara City Renala Khurd?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We offer residential plots of 5 Marla, 10 Marla and 1 Kanal, as well as prime commercial plots of 4 Marla and 8 Marla on easy interest-free installment schemes.'
              }
            }
          ]
        };
        break;

      case 'reviews':
        title = 'Customer Reviews (4.2/5) | Sahara City Renala Khurd';
        description = 'Real testimonials and feedback from property buyers. Check Google review archives for Sahara City housing society (over 222 Google reviews).';
        schemaMarkup = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage', // Include placeholder FAQ or general Reviews page aggregation
          'mainEntity': []
        };
        break;

      case 'contact':
        title = 'Contact Sahara City | Phone & Address | House # 130';
        description = 'Get in touch with top property dealers in Renala Khurd. Contact +92 321 2099125 or physically visit us at House # 130, Sahara City Renala Khurd.';
        break;

      default:
        break;
    }

    // Update global Meta
    document.title = title;
    
    // Manage dynamic tags in head
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Inject/Replace script tag for Schema JSON-LD
    const oldScript = document.getElementById('seo-jsonld-schema');
    if (oldScript) {
      oldScript.remove();
    }

    if (schemaMarkup) {
      const newScript = document.createElement('script');
      newScript.setAttribute('type', 'application/ld+json');
      newScript.setAttribute('id', 'seo-jsonld-schema');
      newScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(newScript);
    }
  }, [view, property, blog]);

  return null;
}
