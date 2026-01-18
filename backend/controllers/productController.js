import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

// --- ADD PRODUCT ---
const addProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice, category, subCategory, type,
      baseMaterial, threadColor, theme, bestseller, trending, inStock,
      estimatedShipping, allowsPhotoUpload, sizes, sizeDimensions,
      giftFor, festive, customizationInputs,
      averageRating, reviewCount // ✅ NEW
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    const imagesUrl = await Promise.all(
      images.map(async (img) => {
        const uploaded = await cloudinary.uploader.upload(img.path, { resource_type: 'image' });
        return uploaded.secure_url;
      })
    );

    const product = new productModel({
      name, description,
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category, subCategory, type, baseMaterial, threadColor, theme,
      bestseller: bestseller === 'true',
      trending: trending === 'true',
      inStock: inStock === 'true',
      allowsPhotoUpload: allowsPhotoUpload === 'true',
      estimatedShipping: estimatedShipping || '10-12 Days',
      sizes: JSON.parse(sizes || '[]'),
      sizeDimensions: JSON.parse(sizeDimensions || '{}'),
      giftFor: JSON.parse(giftFor || '[]'),
      festive: JSON.parse(festive || '[]'),
      customizationInputs: JSON.parse(customizationInputs || '[]'),
      averageRating: Number(averageRating) || 0, // ✅ NEW
      reviewCount: Number(reviewCount) || 0,     // ✅ NEW
      image: imagesUrl,
      date: Date.now()
    });

    await product.save();
    res.json({ success: true, message: 'Product Added Successfully' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// --- UPDATE PRODUCT ---
const updateProduct = async (req, res) => {
  try {
    const { 
      id, name, description, price, originalPrice, category, subCategory, 
      type, baseMaterial, threadColor, theme, bestseller, trending, inStock,
      estimatedShipping, allowsPhotoUpload, sizes, sizeDimensions, 
      giftFor, festive, customizationInputs,
      averageRating, reviewCount // ✅ NEW
    } = req.body;

    const product = await productModel.findById(id);
    if (!product) return res.json({ success: false, message: "Product not found" });

    let updatedImages = [...product.image];

    const uploadIfPresent = async (fileField, index) => {
      if (req.files[fileField] && req.files[fileField][0]) {
        const uploaded = await cloudinary.uploader.upload(req.files[fileField][0].path, { resource_type: 'image' });
        updatedImages[index] = uploaded.secure_url;
      }
    };

    await Promise.all([
      uploadIfPresent('image1', 0),
      uploadIfPresent('image2', 1),
      uploadIfPresent('image3', 2),
      uploadIfPresent('image4', 3)
    ]);

    updatedImages = updatedImages.filter(Boolean);

    await productModel.findByIdAndUpdate(id, {
      name, description, 
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category, subCategory, type, baseMaterial, threadColor, theme,
      bestseller: bestseller === 'true',
      trending: trending === 'true',
      inStock: inStock === 'true',
      allowsPhotoUpload: allowsPhotoUpload === 'true',
      estimatedShipping,
      sizes: JSON.parse(sizes || '[]'),
      sizeDimensions: JSON.parse(sizeDimensions || '{}'),
      giftFor: JSON.parse(giftFor || '[]'),
      festive: JSON.parse(festive || '[]'),
      customizationInputs: JSON.parse(customizationInputs || '[]'),
      averageRating: Number(averageRating) || 0, // ✅ NEW
      reviewCount: Number(reviewCount) || 0,     // ✅ NEW
      image: updatedImages
    });

    res.json({ success: true, message: 'Product Updated Successfully' });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

const listProducts = async (_, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: 'Product Removed' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: 'No file uploaded' });
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image', folder: 'user_uploads' });
    res.json({ success: true, imageUrl: result.secure_url });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export { addProduct, updateProduct, listProducts, removeProduct, singleProduct, uploadUserImage };