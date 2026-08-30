const { readData, writeData } = require('../database/store');

exports.saveDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Draft must contain at least one item' });
    }

    const data = await readData();
    if (!data.drafts) {
      data.drafts = [];
    }

    let draft;
    const now = new Date().toISOString();

    if (id) {
      // Update existing draft
      draft = data.drafts.find(d => d.id === id && d.userId === userId);
      if (!draft) {
        return res.status(404).json({ success: false, message: 'Draft not found or unauthorized' });
      }
      draft.items = items.map(i => ({
        productId: i.productId,
        quantity: parseInt(i.quantity) || 1,
        size: i.size || ''
      }));
      draft.notes = notes || '';
      draft.updatedAt = now;
    } else {
      // Create new draft
      const draftSeq = Math.floor(1000 + Math.random() * 9000);
      draft = {
        id: 'drf_' + Date.now(),
        draftNo: `DRF-2026-${draftSeq}`,
        userId,
        items: items.map(i => ({
          productId: i.productId,
          quantity: parseInt(i.quantity) || 1,
          size: i.size || ''
        })),
        notes: notes || '',
        createdAt: now,
        updatedAt: now
      };
      data.drafts.unshift(draft);
    }

    await writeData(data);

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      draft
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyDrafts = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await readData();
    
    if (!data.drafts) {
      data.drafts = [];
    }

    const userDrafts = data.drafts.filter(d => d.userId === userId);

    // Populate product details for each draft item
    const populatedDrafts = userDrafts.map(draft => {
      const populatedItems = draft.items.map(item => {
        const product = data.products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || '',
          productName: product ? product.name : 'Unknown Product',
          image: product ? product.image : '',
          categoryName: product ? product.categoryName : '',
          uom: product ? (product.uom || 'Nos') : 'Nos',
          packing: product ? (product.packing || product.packSize || '') : ''
        };
      }).filter(item => item.productName !== 'Unknown Product');

      return {
        ...draft,
        items: populatedItems
      };
    });

    res.json({ success: true, drafts: populatedDrafts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await readData();

    if (!data.drafts) {
      data.drafts = [];
    }

    const draft = data.drafts.find(d => d.id === id && d.userId === userId);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    // Populate product details
    const populatedItems = draft.items.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || '',
        productName: product ? product.name : 'Unknown Product',
        image: product ? product.image : '',
        categoryName: product ? product.categoryName : '',
        uom: product ? (product.uom || 'Nos') : 'Nos',
        packing: product ? (product.packing || product.packSize || '') : ''
      };
    }).filter(item => item.productName !== 'Unknown Product');

    res.json({
      success: true,
      draft: {
        ...draft,
        items: populatedItems
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await readData();

    if (!data.drafts) {
      data.drafts = [];
    }

    const index = data.drafts.findIndex(d => d.id === id && d.userId === userId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    data.drafts.splice(index, 1);
    await writeData(data);

    res.json({ success: true, message: 'Draft deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
