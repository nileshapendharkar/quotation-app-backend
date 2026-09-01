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
    .fillColor('#0284c7')
    .rect(40, y, 515, 28)
    .fill();

  columns.forEach(col => {
    doc
      .fillColor('#ffffff')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text(col.label, col.x + 4, y + 9, {
        width: col.width - 8,
        align: col.align
      });
  });

  return y + 28;
}

function generateQuotationPDF(order, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Quotation_${order.orderNo}.pdf`);
  doc.pipe(res);

  // Header Banner / Brand Title
  doc
    .fillColor('#0f172a')
    .rect(0, 0, 595.28, 90)
    .fill();

  doc
    .fillColor('#38bdf8')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('GOURI AQUA PLAST', 40, 20);

  doc
    .fillColor('#f59e0b')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Ganesh Gouri Industries Pvt. Ltd.', 40, 45);

  doc
    .fillColor('#94a3b8')
    .fontSize(9)
    .font('Helvetica')
    .text('Product Quantity Quotation Document | Water Tanks, Pipes & Fittings', 40, 60);

  // Order Details Box
  doc
    .fillColor('#1e293b')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`Quotation No: ${order.orderNo}`, 380, 25, { align: 'right' });

  doc
    .fillColor('#cbd5e1')
    .fontSize(10)
    .font('Helvetica')
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 380, 42, { align: 'right' })
    .text(`Status: ${order.status.toUpperCase()}`, 380, 57, { align: 'right' });

  let y = 110;

  // Customer Information Card
  doc
    .fillColor('#f8fafc')
    .rect(40, y, 515, 95)
    .fill();

  doc
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .rect(40, y, 515, 95)
    .stroke();

  doc
    .fillColor('#0f172a')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('CUSTOMER / COMPANY DETAILS', 55, y + 12);

  doc
    .fillColor('#334155')
    .fontSize(10)
    .font('Helvetica')
    .text(`Customer Name: ${order.userName}`, 55, y + 32)
    .text(`Email Address: ${order.userEmail}`, 55, y + 48)
    .text(`Mobile Number: ${order.userMobile}`, 55, y + 64);

  doc
    .text(`Company: ${order.companyName || 'N/A'}`, 300, y + 32)
    .text(`Address: ${order.companyAddress || 'N/A'}`, 300, y + 48);

  y += 115;

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

