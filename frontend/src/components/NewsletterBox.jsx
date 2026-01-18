import React from "react";
import WA_QR from "../assets/WA_QR.png";
import Insta_QR from "../assets/Insta_QR.png";

const NewsletterBox = () => {
  // --- 👇 UPDATED DETAILS 👇 ---
  const myWhatsAppNumber = "919352424085"; 
  
  // Updated Instagram Username to "wow_woolies"
  const myInstaUsername = "wow_woolies";
  // -----------------------------

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* WhatsApp Card */}
      <div className="flex flex-1 items-center gap-6 rounded-2xl bg-white shadow-md p-6 min-h-[220px] transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
        <img src={WA_QR} alt="WhatsApp QR" className="w-32 h-32 object-contain" />
        <div>
          <h3 className="text-lg font-bold text-[#6a1b4d]">For customization</h3>
          <p className="text-gray-700 mb-2">Connect with us via WhatsApp.</p>
          <a
            // DIRECT LINK: Opens WhatsApp immediately
            href={`https://wa.me/${myWhatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:underline cursor-pointer"
          >
            Link — Click here
          </a>
        </div>
      </div>

      {/* Instagram Card */}
      <div className="flex flex-1 items-center gap-6 rounded-2xl bg-white shadow-md p-6 min-h-[220px] transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
        <img src={Insta_QR} alt="Instagram QR" className="w-32 h-32 object-contain" />
        <div>
          <h3 className="text-lg font-bold text-[#6a1b4d]">Follow us on Instagram</h3>
          <p className="text-gray-700 mb-2">
            Stay updated with our latest collections & offers.
          </p>
          <a
            // DIRECT LINK: Opens Instagram immediately
            href={`https://www.instagram.com/${myInstaUsername}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:underline cursor-pointer"
          >
            Link — Click here
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBox;