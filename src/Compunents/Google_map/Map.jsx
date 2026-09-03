"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MyLocationMover from "./MyLocationMover";


// =================================================
// 🔵 CUSTOM MY LOCATION ICON
// =================================================

const createMyLocationIcon = (photo) =>
  L.divIcon({

    className: "",

    html: `
      <div style="
        position: relative;
        width: 55px;
        height: 55px;
      ">

        <div style="
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #22c55e;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        ">

          <img
            src="${photo || ""}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
          />

        </div>

        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        "></div>

      </div>
    `,

    iconSize: [55, 55],
    iconAnchor: [27, 27],
    popupAnchor: [0, -25],

  });

// =================================================
// 🟣 CUSTOM FRIEND LOCATION ICON
// =================================================

const createFriendIcon = (photo) =>
  L.divIcon({

    className: "",

    html: `
      <div style="
        position: relative;
        width: 55px;
        height: 55px;
      ">

        <div style="
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #3b82f6;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        ">

          <img
            src="${photo || ""}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
          />

        </div>

        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        "></div>

      </div>
    `,

    iconSize: [55, 55],
    iconAnchor: [27, 27],
    popupAnchor: [0, -25],

  });


// Search করার পরে map-কে নতুন location-এ নিয়ে যাবে
function MapMover({ position }) {

  const map = useMap();

  if (position) {
    map.flyTo(position, 15);
  }

  return null;
}

//  props--------------------------------------------------------------------
//  -------------------------------------------------------------------------  
const Map = ({ friendLocation, friendPhoto, friendName, myPhoto, myName }) => {

  // নিজের location রাখবে
  const [myLocation, setMyLocation] = useState(null);

  // Search input-এর value
  const [search, setSearch] = useState("");

  // Search করা location
  const [searchLocation, setSearchLocation] = useState(null);

  // Search করার সময় loading
  const [loading, setLoading] = useState(false);


  // =================================================
  // 📍 MY LOCATION
  // =================================================

  // 📍 Real Live Location
  const getMyLocation = () => {

    if (!navigator.geolocation) {

      alert("Your browser does not support location.");

      return;

    }


    const watchId = navigator.geolocation.watchPosition(

      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("REAL LOCATION:");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);

        setMyLocation([lat, lng]);
      },


      (error) => {

        console.log("Location Error:", error);


        if (error.code === 1) {

          alert("Please allow location permission.");

        } else if (error.code === 2) {

          alert("Location is unavailable.");

        } else if (error.code === 3) {

          alert("Location request timed out.");

        }

      },


      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 50000,
      }

    );


    console.log("Watching location. Watch ID:", watchId);

  };


  // =================================================
  // 🔍 SEARCH LOCATION
  // =================================================

  const searchPlace = async (e) => {

    e.preventDefault();


    if (!search.trim()) {

      return;

    }


    setLoading(true);


    try {

      const response = await fetch(

        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          search
        )}&limit=1`

      );


      const data = await response.json();


      if (data.length === 0) {

        alert("Location not found.");

        return;

      }


      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);


      console.log("Search Latitude:", lat);
      console.log("Search Longitude:", lng);


      setSearchLocation([lat, lng]);


    } catch (error) {

      console.error("Search Error:", error);

      alert("Something went wrong while searching.");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div
      className="relative w-full"
      style={{ height: "500px" }}
    >


      {/* =================================================
          🔍 SEARCH BOX
      ================================================= */}

      <form
        onSubmit={searchPlace}
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
        }}
      >

        <input
          type="text"
          placeholder="Search a place..."
          value={search}

          onChange={(e) => setSearch(e.target.value)}

          style={{
            width: "220px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
            color: "#111",
            outline: "none",
            marginLeft: "50px",
          }}
        />


        <button
          type="submit"
          disabled={loading}

          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >

          {loading ? "..." : "Search"}

        </button>

      </form>



      {/* =================================================
          🗺️ MAP
      ================================================= */}

      <MapContainer
        center={[23.8103, 90.4125]}
        zoom={13}

        style={{
          height: "500px",
          width: "100%",
        }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* Search করার পরে map move করবে */}

        <MapMover position={searchLocation} />

        <MyLocationMover position={myLocation} />



        {/* =================================================
            📍 MY LOCATION MARKER
        ================================================= */}

        {myLocation && (

          <Marker
            position={myLocation}
            icon={createMyLocationIcon(myPhoto)}
          >

            <Popup>

              <strong>📍 {myName || "You"}</strong>

              <br />

              🟢 Live Now

            </Popup>

          </Marker>

        )}


        {/* =================================================
          🟣 FRIEND LOCATION MARKER
          ================================================= */}

        {friendLocation && (

          <Marker
            position={[
              friendLocation.lat,
              friendLocation.lng
            ]}
            icon={createFriendIcon(friendPhoto)}
          >

            <Popup>

              <strong>📍 {friendName || "Friend"}</strong>

              <br />

              🟢 Live Now

            </Popup>

          </Marker>

        )}


      </MapContainer>



      {/* =================================================
          📍 MY LOCATION BUTTON
      ================================================= */}

      <button
        onClick={getMyLocation}

        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          background: "white",
          color: "#111",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >

        📍 My Location

      </button>


    </div>

  );

};


export default Map;