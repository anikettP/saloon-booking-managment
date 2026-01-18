import userModel from "../models/userModel.js";

// Fetch all users stats for Admin Dashboard
const getDashboardStats = async (req, res) => {
    try {
        // Fetch all users but EXCLUDE the password field for security
        // sort({ createdAt: -1 }) puts the newest users first
        const users = await userModel.find({}, '-password').sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            totalUsers: users.length, 
            users 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { getDashboardStats };