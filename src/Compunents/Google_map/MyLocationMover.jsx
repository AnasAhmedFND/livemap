"use client";

import { useMap } from "react-leaflet";

const MyLocationMover = ({ position }) => {

  const map = useMap();

  if (position) {
    map.flyTo(position, 16);
  }

  return null;
};

export default MyLocationMover;