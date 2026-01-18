import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  return (
    <div className="contact-page mt-[170px]">
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img className="w-full md:max-w-[480px] rounded-2xl shadow-lg" src={assets.contact_img} alt="Contact" />

        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            For Bulk Orders: <br />
            <a href="mailto:wowwoolies25@gmail.com" className="hover:underline">wowwoolies.co.in</a><br />
            Jaipur, Rajasthan
          </p>
          <p className="text-gray-500">
            Tel: +91-9352424085 <br />
            Email: <a href="mailto:wowwoolies25@gmail.com" className="hover:underline">wowwoolies25@gmail.com</a>
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;