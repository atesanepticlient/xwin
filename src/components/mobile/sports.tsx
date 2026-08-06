import React from "react";
import Category from "./category";
import { SportsWrapper } from "../category/matches";

const Sports = () => {
  return (
    <div>
      <Category />
      <SportsWrapper.TopLive />
      <SportsWrapper.PreMatch />
      <SportsWrapper.LiveTournaments />
      <SportsWrapper.EsportsLive />
    </div>
  );
};

export default Sports;
