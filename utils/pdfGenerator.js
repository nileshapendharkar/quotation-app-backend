const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const columns = [
  { id: 'productCode', label: 'ProductCode', x: 40, width: 75, align: 'left', fontColor: '#0369a1' },
  { id: 'productName', label: 'Product Name', x: 115, width: 150, align: 'left', fontColor: '#0f172a', isBold: true },
  { id: 'size', label: 'Size', x: 265, width: 55, align: 'center', fontColor: '#334155' },
  { id: 'packing', label: 'Packing', x: 320, width: 50, align: 'center', fontColor: '#334155' },
  { id: 'quantity', label: 'Quantity', x: 370, width: 50, align: 'center', fontColor: '#0284c7', isBold: true },
  { id: 'uom', label: 'UOM', x: 420, width: 40, align: 'center', fontColor: '#334155' },
  { id: 'total', label: 'Total', x: 460, width: 95, align: 'right', fontColor: '#0f172a', isBold: true }
];

function renderTableHeader(doc, y) {
  doc
    .fillColor('#0f3885')
    .rect(40, y, 515.28, 26)
    .fill();

  columns.forEach(col => {
    doc
      .fillColor('#ffffff')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text(col.label, col.x + 4, y + 8, {
        width: col.width - 8,
        align: col.align
      });
  });

  return y + 26;
}

function generateQuotationPDF(order, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Quotation_${order.orderNo}.pdf`);
  doc.pipe(res);

  const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

  // --- HEADER SECTION ---
  const headerX = 40;
  const headerY = 30;
  const headerWidth = 515.28;
  const headerHeight = 115;

  // Outer Header Box with Rounded Corners
  doc
    .lineWidth(1)
    .strokeColor('#333333')
    .roundedRect(headerX, headerY, headerWidth, headerHeight, 8)
    .stroke();

  // Left Side: PNG Logo & Subtitle
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, headerX + 12, headerY + 12, { width: 175 });
  } else {
    doc
      .fillColor('#0d3880')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('GOURI AQUA PLAST®', headerX + 15, headerY + 15);
  }

  doc
    .fillColor('#0f3885')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TANKS, PIPE & FITTING', headerX + 12, headerY + 84, {
      characterSpacing: 0.3
    });

  // Right Side: Company Details
  const rightX = 325;
  let textY = headerY + 10;

  doc
    .fillColor('#000000')
    .fontSize(10.5)
    .font('Helvetica-Bold')
    .text('Ganesh Gouri Industries Pvt. Ltd.', rightX, textY);

  textY += 14;

  doc
    .fillColor('#111111')
    .fontSize(7.5)
    .font('Helvetica')
    .text('KH NO. 55/3', rightX, textY)
    .text('Lihigoan, kamptee, Nagpur-441001', rightX, textY + 10)
    .text('INDIA', rightX, textY + 20)
    .text('Mob :', rightX, textY + 30)
    .text('Email : care@ganeshgouriindustries.com', rightX, textY + 40)
    .text('Web : www.ganeshgouriindustries.com', rightX, textY + 50);

  doc
    .font('Helvetica-Bold')
    .text('GST No. : 27AALCG9542P1ZP', rightX, textY + 60);

  // --- QUOTATION & CUSTOMER DETAILS CARD ---
  let y = headerY + headerHeight + 15;

  doc
    .fillColor('#f8fafc')
    .rect(40, y, 515.28, 80)
    .fill();

  doc
    .strokeColor('#cbd5e1')
    .lineWidth(0.8)
    .rect(40, y, 515.28, 80)
    .stroke();

  doc
    .fillColor('#0f172a')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('QUOTATION DETAILS', 52, y + 10);

  doc
    .fillColor('#334155')
    .fontSize(9)
    .font('Helvetica')
    .text(`Quotation No: ${order.orderNo}`, 52, y + 26)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 52, y + 40)
    .text(`Status: ${order.status ? order.status.toUpperCase() : 'PENDING'}`, 52, y + 54);

  doc
    .fillColor('#0f172a')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('CUSTOMER DETAILS', 310, y + 10);

  doc
    .fillColor('#334155')
    .fontSize(9)
    .font('Helvetica')
    .text(`Name: ${order.userName || 'N/A'}`, 310, y + 26)
    .text(`Mobile: ${order.userMobile || 'N/A'}`, 310, y + 40)
    .text(`Company: ${order.companyName || 'N/A'}`, 310, y + 54);

  y += 95;

  // Render Table Header
  y = renderTableHeader(doc, y);

  const rowHeight = 32;

  // Render Items List
  order.items.forEach((item, index) => {
    // Check page break before rendering row
    if (y + rowHeight > 740) {
      doc.addPage();
      y = 40;
      y = renderTableHeader(doc, y);
    }

    const bgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
    const cellY = y + 9;

    doc
      .fillColor(bgColor)
      .rect(40, y, 515, rowHeight)
      .fill();

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .rect(40, y, 515, rowHeight)
      .stroke();

    columns.forEach(col => {
      let val = item[col.id];
      if (val === undefined || val === null || val === '') {
        val = '—';
      } else {
        val = String(val);
      }

      const fontName = col.isBold ? 'Helvetica-Bold' : 'Helvetica';

      doc
        .font(fontName)
        .fillColor(col.fontColor || '#1e293b')
        .fontSize(8)
        .text(val, col.x + 4, cellY, {
          width: col.width - 8,
          align: col.align,
          ellipsis: true
        });
    });

    y += rowHeight;
  });

  y += 20;

  // Notes & Instructions
  if (order.notes) {
    if (y + 60 > 760) {
      doc.addPage();
      y = 40;
    }

    doc
      .fillColor('#fffbe1')
      .rect(40, y, 515, 50)
      .fill();

    doc
      .strokeColor('#fde047')
      .rect(40, y, 515, 50)
      .stroke();

    doc
      .fillColor('#854d0e')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Special Notes / Instructions:', 50, y + 10)
      .font('Helvetica')
      .text(order.notes, 50, y + 25);

    y += 65;
  }

  // Footer Disclaimer
  if (y + 50 > 780) {
    doc.addPage();
    y = 40;
  }

  doc
    .fillColor('#64748b')
    .fontSize(9)
    .font('Helvetica-Oblique')
    .text('This is a formal product quantity quotation from Ganesh Gouri Industries Pvt. Ltd. (Gouri Aqua Plast).', 40, y + 10, { align: 'center' })
    .text('KH. NO. 55/3, Lihigaon, Kamptee, Nagpur, Maharashtra, 441001 | +91-9699910491', 40, y + 24, { align: 'center' })
    .text('www.ganeshgouriindustries.com', 40, y + 38, { align: 'center' });

  doc.end();
}

module.exports = {
  generateQuotationPDF
};

