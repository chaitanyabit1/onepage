import React, { useState } from "react";
import Home from "../homes/Home";
import { trending } from "../../dummyData";

const Tranding = () => {
  const [items, setItems] = useState(trending);
  return (
    <>
      <section className="trending">
        <Home items={items} />
      </section>
    </>
  );
};

export default Tranding;
