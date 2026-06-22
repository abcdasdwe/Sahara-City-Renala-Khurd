import { jsPDF } from 'jspdf';
import { Property } from '../types';

/**
 * Generates a beautiful, branded, client-side downloadable PDF property brochure
 */
export function generatePropertyPDF(property: Property) {
  // Initialize standard A4 PDF document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // BRANDING PALETTE (Sahara Corporate Gold and Deep Dark Navy)
  const primaryColor = { r: 9, g: 14, b: 22 };      // #090E16 (Dark)
  const accentColor = { r: 197, g: 168, b: 128 };    // #C5A880 (Corporate Gold)
  const lightBgColor = { r: 248, g: 249, b: 250 };   // Light Grey
  const darkTextColor = { r: 33, g: 37, b: 41 };     // Rich charcoal text
  const mutedTextColor = { r: 108, g: 117, b: 125 }; // Grey secondary text

  // 1. HEADER HERO BACKGROUND (0-45mm)
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 42, 'F');
  
  // Corporate Gold Header Detail Accents
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 42, 210, 3, 'F'); // Bottom gold block accent line

  // Corporate Text Logo & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('OFFICIAL PROPERTY BROCHURE', 15, 14);

  doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setFont('serif', 'bold');
  doc.setFontSize(24);
  doc.text('SAHARA CITY', 15, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('PREMIER GATED COMMUNITY • MAIN GT N5 HIGHWAY, RENALA KHURD', 15, 31);
  doc.text('CUSTOMER ADVISORY BLOCK • HOUSE # 130 FACILITATION DESK', 15, 36);

  // 2. DOCUMENT BODY TITLE & META INFO (45-75mm)
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(property.title || 'Luxury Estate Specification', 15, 54);

  // ID Badge Shape
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(15, 59, 44, 7, 'F');
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`PROPERTY ID: ${property.id}`, 18, 64);

  // Date and status metadata
  doc.setTextColor(mutedTextColor.r, mutedTextColor.g, mutedTextColor.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const printDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Issued: ${printDate}`, 145, 64);

  // Horizontal divider
  doc.setDrawColor(220, 224, 230);
  doc.line(15, 72, 195, 72);

  // 3. TABLE OF KEY SPECIFICATIONS (72-155mm)
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TECHNICAL & FISCAL SPECIFICATIONS', 15, 79);

  // Simple clean table parameters
  const specRows = [
    { label: 'Market Valuation Price', value: `PKR ${Number(property.price).toLocaleString()}` },
    { label: 'Physical Land Area', value: property.area || 'N/A' },
    { label: 'Property Classification', value: property.propertyType || 'N/A' },
    { label: 'Allotment Purpose', value: property.purpose || 'For Sale' },
    { label: 'Development Phase Status', value: property.status || 'Active' },
    { label: 'Accommodations Suite', value: property.bedrooms > 0 ? `${property.bedrooms} Bed(s) Room` : 'Plot Matrix / Raw Land' },
    { label: 'Sanitary Suite', value: property.bathrooms > 0 ? `${property.bathrooms} Bath(s) Room` : 'Plot Matrix / Raw Land' }
  ];

  let currentY = 85;
  specRows.forEach((row, idx) => {
    // Alternating grey row backgrounds
    if (idx % 2 === 0) {
      doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
      doc.rect(15, currentY, 180, 8, 'F');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkTextColor.r, darkTextColor.g, darkTextColor.b);
    doc.text(row.label, 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(idx === 0 ? accentColor.r : darkTextColor.r, idx === 0 ? accentColor.g : darkTextColor.g, idx === 0 ? accentColor.b : darkTextColor.b);
    if (idx === 0) doc.setFont('helvetica', 'bold'); // Bold for price
    doc.text(row.value, 100, currentY + 5.5);

    // Grid outline lines
    doc.setDrawColor(235, 238, 242);
    doc.line(15, currentY + 8, 195, currentY + 8);
    currentY += 8;
  });

  // 4. PROPERTY DESCRIPTION BLOCKS (155-200mm)
  currentY += 8;
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICIAL RECONNAISSANCE DESCRIPTION', 15, currentY);

  currentY += 6;
  doc.setTextColor(darkTextColor.r, darkTextColor.g, darkTextColor.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  const rawDesc = property.description || 'Premium estate plot layout inside Sahara City premium gated community, Renala Khurd. Complete boundary wall protection, carpeted roads, high reliability security block, water supply grid lines ready and immediate transfer.';
  const wrappedDescLines = doc.splitTextToSize(rawDesc, 180);
  doc.text(wrappedDescLines, 15, currentY);
  
  currentY += (wrappedDescLines.length * 4) + 6;

  // 5. INTEREST-FREE INSTALLMENT CARD (200-250mm)
  if (property.installmentDetails) {
    doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
    doc.rect(15, currentY, 180, 36, 'F');
    
    // Left side border highlight
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(15, currentY, 2, 36, 'F');

    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FLEXIBLE INTEREST-FREE INSTALLMENT SCHEMES', 21, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor.r, darkTextColor.g, darkTextColor.b);
    doc.setFontSize(8.5);
    doc.text('Required Down Payment:', 21, currentY + 14);
    doc.setFont('helvetica', 'bold');
    doc.text(`PKR ${Number(property.installmentDetails.downPayment).toLocaleString()}`, 110, currentY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text('Payment Tenure Option:', 21, currentY + 21);
    doc.setFont('helvetica', 'bold');
    doc.text(`${property.installmentDetails.totalInstallments} Months (Interest-Free Plan)`, 110, currentY + 21);

    doc.setFont('helvetica', 'normal');
    doc.text('Estimated Monthly Instalment Rate:', 21, currentY + 28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
    const estimatedMonthly = property.installmentDetails.monthlyInstallment || Math.round((property.price - property.installmentDetails.downPayment) / property.installmentDetails.totalInstallments);
    doc.text(`PKR ${estimatedMonthly.toLocaleString()} / Month`, 110, currentY + 28);
  } else {
    // Show Standard Cash Purchase Warning
    doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
    doc.rect(15, currentY, 180, 24, 'F');
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(15, currentY, 2, 24, 'F');

    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('STANDARD LUMP SUM CASH ACQUISITION', 21, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor.r, darkTextColor.g, darkTextColor.b);
    doc.setFontSize(8.5);
    doc.text('This VIP unit is currently offered for single-tranche cash settlement only.', 21, currentY + 14);
    doc.text('For alternative custom quarterly arrangements, consult the Executive Board at House # 130.', 21, currentY + 19);
  }

  // 6. BOTTOM LEGAL COMPLIANCE FOOTER (265-297mm)
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 268, 210, 29, 'F');

  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 268, 210, 1, 'F');

  doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SAHARA CITY OFFICIAL VERIFIED BROCHURE DOCUMENT', 15, 276);

  doc.setTextColor(230, 230, 230);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Disclaimer: Subject to land authority board regulations. Actual physical site validations may be performed at House # 130, Renala Khurd.', 15, 282);
  doc.text('For sales support / reservations, call: +92-321-2099125 or write to: billing@saharacity.pk', 15, 287);

  // Save/Download the PDF File
  doc.save(`SaharaCity_Estate_Manual_${property.id}.pdf`);
}
