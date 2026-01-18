import mongoose from "mongoose";

const banner2Schema = new mongoose.Schema({
    imageDesktop: { type: String, required: true },
    imageMobile: { type: String, required: true },
    active: { type: Boolean, default: true }
});

const banner2Model = mongoose.models.banner2 || mongoose.model("banner2", banner2Schema);

export default banner2Model;