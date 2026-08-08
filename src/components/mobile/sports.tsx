import React from "react";
import Category from "./category";
import { SportsWrapper } from "../category/matches";

const Sports = () => {
  return (
    <div className="p-2">
      <Category />
      <SportsWrapper.TopLive />
      <SportsWrapper.PreMatch />
      <SportsWrapper.LiveTournaments />
      <SportsWrapper.EsportsLive />
    </div>
  );
};

export default Sports;
