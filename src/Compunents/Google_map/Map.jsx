"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import { TbVideo } from "react-icons/tb";

import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { IoClose, IoVideocamOff } from "react-icons/io5";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MyLocationMover from "./MyLocationMover";


// =================================================
// 🔵 CUSTOM MY LOCATION ICON
// =================================================

// =================================================
// 🟢 MY LOCATION ICON
// =================================================

const createMyLocationIcon = (photo, name) =>
  L.divIcon({

    className: "",

    html: `
      <div style="
        position: relative;
        width: 150px;
        height: 105px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">

        <!-- Profile Image -->
        <div style="
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #22c55e;
          background: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.30);
          z-index: 2;
        ">

          <img
            src="${photo || ""}"
            alt=""
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            "
          />

        </div>


        <!-- 🟢 Live Dot -->
        <div style="
          position: absolute;
          top: 43px;
          right: 42px;
          width: 15px;
          height: 15px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 3;
        "></div>


        <!-- Pin Point -->
        <div style="
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 12px solid #22c55e;
          margin-top: -1px;
          z-index: 1;
        "></div>


        <!-- Name -->
        <div style="
          margin-top: 4px;
          padding: 6px 12px;
          background: white;
          border: 2px solid #22c55e;
          border-radius: 9px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.20);
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          line-height: 18px;
        ">
          ${name || "You"}
        </div>

      </div>
    `,

    iconSize: [150, 105],

    // GPS location থাকবে pin-এর মাথায়
    iconAnchor: [75, 70],

    popupAnchor: [0, -65],

  });

// =================================================
// 🟣 CUSTOM FRIEND LOCATION ICON
// =================================================

// =================================================
// 🔵 FRIEND LOCATION ICON
// =================================================

const createFriendIcon = (photo, name) =>
  L.divIcon({

    className: "",

    html: `
      <div style="
        position: relative;
        width: 150px;
        height: 105px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">

        <!-- Profile Image -->
        <div style="
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #3b82f6;
          background: white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.30);
          z-index: 2;
        ">

          <img
            src="${photo || ""}"
            alt=""
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            "
          />

        </div>


        <!-- 🔵 Live Dot -->
        <div style="
          position: absolute;
          top: 43px;
          right: 42px;
          width: 15px;
          height: 15px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 3;
        "></div>


        <!-- Pin Point -->
        <div style="
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 12px solid #3b82f6;
          margin-top: -1px;
          z-index: 1;
        "></div>


        <!-- Name -->
        <div style="
          margin-top: 4px;
          padding: 6px 12px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 9px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.20);
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          line-height: 18px;
        ">
          ${name || "Friend"}
        </div>

      </div>
    `,

    iconSize: [150, 105],

    iconAnchor: [75, 70],

    popupAnchor: [0, -65],

  });


// Search করার পরে map-কে নতুন location-এ নিয়ে যাবে
function MapMover({ position, zoom = 15 }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, zoom, map]);

  return null;
}

//  props--------------------------------------------------------------------
//  -------------------------------------------------------------------------  
const Map = ({ friendLocation, friendPhoto, friendName, myPhoto, myName, flyToLocation }) => {

  // নিজের location রাখবে
  const [myLocation, setMyLocation] = useState(null);

  // Search input-এর value
  const [search, setSearch] = useState("");

  // Search করা location
  const [searchLocation, setSearchLocation] = useState(null);

  // Search করার সময় loading
  const [loading, setLoading] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  // Video reference
  const videoRef = useRef(null);


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
  // 🔍 SEARCH LOCATION MyLocationMover 
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

  // 🎥 Start Camera=================================================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera Error:", error);
      alert("Camera permission denied or camera unavailable!");
    }
  };

  // 🎥 Show camera stream in video element===================
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraOpen]);

  // 🔄 Switch Camera==================================================
  const switchCamera = async () => {
    const newMode =
      facingMode === "user" ? "environment" : "user";

    // আগের camera বন্ধ করবে
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode,
        },
        audio: false,
      });

      setCameraStream(stream);
      setFacingMode(newMode);
    } catch (error) {
      console.error("Switch Camera Error:", error);
      alert("Unable to switch camera!");
    }
  };

  // ⛔ Stop Camera============================================
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setCameraOpen(false);
  };

  // 🧹 Stop camera when component unmounts===============================
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);


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
            width: "200px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
            color: "#111",
            outline: "none",
            marginLeft: "40px",
          }}
        />


        <button
          type="submit"
          disabled={loading}

          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
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
          height: "490px",
          width: "100%",
        }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* Search করার পরে map move করবে */}

        {/* Search করা place-এ map move করবে */}
        <MapMover position={searchLocation} zoom={15} />

        {/* Friend search করলে তার location-এ map move করবে */}
        <MapMover
          position={
            flyToLocation
              ? [flyToLocation.lat, flyToLocation.lng]
              : null
          }
          zoom={flyToLocation?.zoom || 16}
        />

        <MyLocationMover position={myLocation} />



        {/* =================================================
            📍 MY LOCATION MARKER
        ================================================= */}

        {myLocation && (

          <Marker
            position={myLocation}
            icon={createMyLocationIcon(myPhoto, myName)}
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
            icon={createFriendIcon(friendPhoto, friendName)}
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
          bottom: "40px",
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

      {/* Camara Show================================================== */}
      {/* 🎥 Camera Button */}
      <button
        type="button"
        onClick={startCamera}
        disabled={cameraOpen}
        style={{ zIndex: 1000 }}
        className={`flex flex-col items-center justify-center text-center
          border border-blue-200 text-blue-600 rounded-xl
          bg-blue-100/90 w-[90px] h-[60px]
          absolute md:left-10 left-2 md:bottom-[40px] bottom-[20px]
          p-1 transition-all duration-200
    ${cameraOpen
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-blue-200"
          }`}
      >
        <span className="text-2xl">
          <TbVideo />
        </span>

        <span className="text-sm font-medium">
          {cameraOpen ? "Camera On" : "Camera"}
        </span>
      </button>



      {/* 🎥 Floating Camera Window */}
      {cameraOpen && (
        <div
          className="absolute top-16 right-3 z-[2000]
      w-[260px] sm:w-[300px]
      bg-gray-900 rounded-2xl overflow-hidden
      shadow-2xl border border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

              <span className="text-white text-sm font-medium">
                Camera Preview
              </span>
            </div>

            <button
              onClick={stopCamera}
              className="text-white hover:bg-gray-700 rounded-full p-1"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Video Preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video object-cover bg-black"
          />

          {/* Controls */}
          <div className="flex items-center justify-between p-2 gap-2">
            <button
              onClick={switchCamera}
              className="flex items-center justify-center gap-1
          text-white bg-blue-600 hover:bg-blue-700
          rounded-lg px-3 py-2 text-sm flex-1"
            >
              <MdOutlineFlipCameraAndroid size={20} />
              Switch
            </button>

            <button
              onClick={stopCamera}
              className="flex items-center justify-center gap-1
          text-white bg-red-600 hover:bg-red-700
          rounded-lg px-3 py-2 text-sm flex-1"
            >
              <IoVideocamOff size={20} />
              Stop
            </button>
          </div>
        </div>
      )}





    </div>

  );

};


export default Map;