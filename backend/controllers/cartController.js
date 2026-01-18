// backend/controllers/cartController.js
import userModel from "../models/userModel.js";

/* -----------------------------------------
   GUEST CART
   ----------------------------------------- */
export const getGuestCart = async (req, res) => {
  try {
    // Guest cart is stored on frontend only
    return res.json({
      success: true,
      cartData: null,
      guest: true
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/* -----------------------------------------
   ADD TO CART (LOGGED-IN USERS ONLY)
   ----------------------------------------- */
export const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/* -----------------------------------------
   UPDATE CART (LOGGED-IN USERS ONLY)
   ----------------------------------------- */
export const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    if (!cartData[itemId]) cartData[itemId] = {};

    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart Updated" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/* -----------------------------------------
   GET USER CART (LOGGED-IN USERS ONLY)
   ----------------------------------------- */
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


/* -----------------------------------------
   CLEAR CART (LOGGED-IN USERS ONLY)
   ----------------------------------------- */
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    // Empty the cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.json({ success: true, message: "Cart cleared" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
