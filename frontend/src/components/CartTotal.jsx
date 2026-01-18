import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <section className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <p>Subtotal</p>
          <p>
            {currency} {subtotal}.00
          </p>
        </div>

        <div className="flex justify-between border-b border-gray-100 py-2">
          <p>Standard Delivery</p>
          <p>
            {currency} {delivery_fee}.00
          </p>
        </div>

        <div className="flex justify-between font-bold text-lg py-2">
          <b>Total</b>
          <b>
            {currency} {total}.00
          </b>
        </div>

        <p className="mt-1 text-[11px] text-gray-500">
          Fast delivery option (extra {currency}
          250) is available on the next step.
        </p>
      </div>
    </section>
  );
};

export default CartTotal;