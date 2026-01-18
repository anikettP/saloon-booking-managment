import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  return (
    <div className="border-t pt-14 mt-[170px]">
      <div className="text-2xl mb-3 text-center">
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className="my-10 flex flex-col md:flex-row items-center justify-center gap-10 text-gray-700">
        <div>
          <img className="w-full md:max-w-[450px] rounded-xl shadow-lg" src={assets.about_img} alt="About" />
        </div>
        <div className="max-w-[600px] flex flex-col gap-6 leading-relaxed">
          <p>
            WowWoolies is a Jaipur-based handcrafted brand specializing in premium string and thread art. Each piece is lovingly handmade by skilled artisans using high-quality materials.
          </p>
          <p>
            We take pride in delivering superior quality that stands out. Every design goes through strict quality checks so you receive a product that’s better made and built to last.
          </p>
          <b className="text-gray-800 text-lg">Our Mission</b>
          <p>
            Our mission is to celebrate traditional Indian handiwork while making high-quality, artisan-crafted decor accessible to everyone.
          </p>
        </div>
      </div>

      <div className="text-2xl mb-6 text-center">
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-20 px-4 text-gray-700">
        <div className="border px-8 md:px-12 py-10 flex-1 text-center flex flex-col gap-4 rounded-md shadow-sm">
          <b>Handmade Quality</b>
          <p>Every product is handcrafted in Jaipur by trained artisans and inspected for fine detail.</p>
        </div>
        <div className="border px-8 md:px-12 py-10 flex-1 text-center flex flex-col gap-4 rounded-md shadow-sm">
          <b>Better Value</b>
          <p>We work direct with local makers to deliver higher quality at competitive prices.</p>
        </div>
        <div className="border px-8 md:px-12 py-10 flex-1 text-center flex flex-col gap-4 rounded-md shadow-sm">
          <b>Trusted Support</b>
          <p>We stand by our work — easy returns and responsive customer care.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto">
        <NewsletterBox />
      </div>

      <div className="mt-24 mb-20 text-gray-700">
        <div className="text-2xl mb-8 text-center">
          <Title text1={'MEET THE'} text2={'FOUNDER'} />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-20">
          <div>
            <img src={assets.founder_img} alt="Siddhartha Sharma" className="w-full md:max-w-[350px] rounded-xl shadow-lg" />
          </div>
          <div className="max-w-[600px] flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-gray-900">Siddhartha Sharma</h2>
            <p className="text-pink-600 font-medium">Founder, WowWoolies.co.in — Jaipur</p>
            <p>
              Siddharth Sharma, the creative mind behind WowWoolies, brings passion and innovation into every handcrafted artwork.
            </p>
            <p>
              Through his leadership, WowWoolies continues to inspire creativity, sustainability, and pride in Indian craftsmanship.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;