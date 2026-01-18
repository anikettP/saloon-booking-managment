// backend/models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  
  image: { type: Array, required: true },
  
  category: { type: String, required: true },
  subCategory: { type: String },
  
  giftFor: { type: Array, default: [] },
  festive: { type: Array, default: [] },

  type: { type: String, default: 'String Art' },
  baseMaterial: { type: String },
  threadColor: { type: String },
  theme: { type: String },
  
  // Sizes
  sizes: [
    {
      name: { type: String, required: true }, 
      dimension: { type: String },           
      price: { type: Number, required: true } 
    }
  ],

  // Status Tags
  bestseller: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }, 
  inStock: { type: Boolean, default: true },
  
  estimatedShipping: { type: String, default: '10-12 Days' },
  
  // Photo Upload Feature
  allowsPhotoUpload: { type: Boolean, default: false },

  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  date: { type: Number, required: true },

  // Custom Inputs Configuration
  customizationInputs: [
    {
      inputType: { type: String, enum: ['text', 'date', 'select', 'textarea'], default: 'text' },
      label: { type: String, required: true }, 
      required: { type: Boolean, default: true },
      
      // ✅ FIXED: Added 'options' back so old products don't crash
      options: { type: Array, default: [] }, 

      // New structure for price add-ons
      selectOptions: [
        {
          name: { type: String }, 
          priceModifier: { type: Number, default: 0 } 
        }
      ]
    }
  ]
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);
export default productModel;