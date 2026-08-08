import React from "react";
import Category from "./category";
import { SportsWrapper } from "../category/matches";
import Feartures from "./features";
import FishGames from "@/app/(game)/casino/fish";
import Slots from "@/app/(game)/casino/slots";

const Home = () => {
  return (
    <div className="p-2">
      <Category />
      <Feartures />
      <SportsWrapper.TopLive />
      <SportsWrapper.PreMatch />
    
      <SportsWrapper.LiveTournaments />
      <FishGames theme="light" />
      <Slots theme="light" maxRow={1} />
      <SportsWrapper.EsportsLive />
    </div>
  );
};

export default Home;
