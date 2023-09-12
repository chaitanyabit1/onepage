import React, { useState } from "react";
import Homes from "../components/homes/Homes";
import Upcoming from "../components/upcoming/Upcoming";
import { latest, recommended, upcome } from "../dummyData";
import Tranding from "../components/tranding/Tranding";

const HomePage = () => {
  const [items, setItems] = useState(upcome);
  const [item, setItem] = useState(latest);
  const [recom, setrecom] = useState(recommended);
  return (
    <div>
      <Homes />
      <Upcoming items={items} title="Upcoming Movies" />
      <Upcoming items={item} title="Latest Movies" />
      <Tranding />
      <Upcoming items={item} title="Recommended Movies" />
    </div>
  );
};

export default HomePage;
