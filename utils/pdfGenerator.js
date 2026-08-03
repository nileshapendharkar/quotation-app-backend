const PDFDocument = require('pdfkit');

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

  // Quotation Items Header
  doc
    .fillColor('#0284c7')
    .rect(40, y, 515, 28)
    .fill();

  doc
    .fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('#', 50, y + 9)
    .text('Product Name', 90, y + 9)
    .text('Quantity Requested', 420, y + 9, { width: 120, align: 'right' });

  y += 28;

  // Items List (strictly NO PRICE!)
  order.items.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f1f5f9';
    doc
      .fillColor(bgColor)
      .rect(40, y, 515, 32)
      .fill();

    doc
      .strokeColor('#cbd5e1')
      .rect(40, y, 515, 32)
      .stroke();

    doc
      .fillColor('#1e293b')
      .fontSize(10)
      .font('Helvetica')
      .text(`${index + 1}`, 50, y + 10)
      .font('Helvetica-Bold')
      .text(item.productName, 90, y + 10, { width: 310, ellipsis: true })
      .font('Helvetica-Bold')
      .fillColor('#0284c7')
      .text(`${item.quantity} Units`, 420, y + 10, { width: 120, align: 'right' });

    y += 32;

    if (y > 720) {
      doc.addPage();
      y = 40;
    }
  });

  y += 20;

  // Notes & Instructions
  if (order.notes) {
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
