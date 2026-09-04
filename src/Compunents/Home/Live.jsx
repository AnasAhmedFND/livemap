"use client"
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";

import { FaLocationDot } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { TiArrowSortedDown } from "react-icons/ti";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Libertinus_Keyboard, Open_Sans } from 'next/font/google';
import Link from 'next/link';
import { RiMenuUnfoldFill } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { FaMinus } from "react-icons/fa";
import { MdOutlineRefresh } from "react-icons/md";
import Map from '@/Compunents/Google_map/Map'
import Invite from '../Invitation/Invite';
import InvitationCard from '../Invitation/InvitationCard';

import {
  collection,
  onSnapshot,
  query,
  where,
  setDoc,
  doc
} from "firebase/firestore";






// fonts..............................
const sans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '500']
})
// const liver = Libertinus_Keyboard({
//   subsets: ['latin'],
//   weight: ['400']
// })

const Live = () => {
  // Google user__________________________________________________
  const [user, setUser] = useState(null);
  // Real location_______________________________________________
  const [myLocation, setMyLocation] = useState(null);


  // invite friend_________________________________________________
  const [showInvite, setShowInvite] = useState(false);

  // Invitationcard_call__________________________________________
  const [invitation, setInvitation] = useState(null);

  // All_People_Add_______________________________________________
  const [connection, setConnection] = useState(null);

  // friendLocation_______________________________________________
  const [friendLocation, setFriendLocation] = useState(null);

  const [myPlaceName, setMyPlaceName] = useState("Getting location...");
  const [friendPlaceName, setFriendPlaceName] = useState("Location loading...");


  // =================================================
  // 📍 GET REAL PLACE NAME
  // =================================================

  const getPlaceName = async (lat, lng) => {

    try {

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );

      const data = await response.json();

      if (!data || !data.address) {
        return "Location unavailable";
      }

      const address = data.address;

      const place =
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.suburb ||
        address.neighbourhood;

      const district =
        address.state_district ||
        address.county ||
        address.state;

      if (place && district) {
        return `${place}, ${district}`;
      }

      if (place) {
        return place;
      }

      return data.display_name || "Unknown location";

    } catch (error) {

      console.error("Place name error:", error);

      return "Location unavailable";

    }

  };

  // Google_user________________________________________________________________

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      if (currentUser) {

        setUser(currentUser);

        console.log("User Name:", currentUser.displayName);
        console.log("User Photo:", currentUser.photoURL);

      }

    });

    return () => unsubscribe();

  }, []);

  // MY_Real_Location______________________________________________________________

  useEffect(() => {

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(

      async (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("REAL LOCATION:");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);
        console.log("Accuracy:", accuracy, "meters");

        // ভালো accuracy হলে location update করবে
        if (accuracy <= 1000) {

          setMyLocation({
            lat: lat,
            lng: lng,
            accuracy: accuracy,
          });

          // 📍 Get my real place name
          console.log("🔵 MY LOCATION → Getting place name...");

          getPlaceName(lat, lng)
            .then((place) => {

              console.log("🔵 MY PLACE NAME RESULT:", place);

              setMyPlaceName(place);

            })
            .catch((error) => {

              console.error("🔴 MY PLACE NAME ERROR:", error);

              setMyPlaceName("Location unavailable");

            });

          // Firebase-এ নিজের location save
          if (auth.currentUser) {

            try {

              await setDoc(
                doc(db, "locations", auth.currentUser.uid),
                {
                  uid: auth.currentUser.uid,
                  lat: lat,
                  lng: lng,
                  accuracy: accuracy,
                  updatedAt: new Date(),
                },
                { merge: true }
              );

              console.log("Location saved to Firebase ✅");

            } catch (error) {

              console.error("Location save error:", error);

            }

          }

        }

      },

      (error) => {

        console.log("Location Error:", error);

        if (error.code === 1) {
          console.log("Location permission denied.");
        }

        if (error.code === 2) {
          console.log("Location unavailable.");
        }

        if (error.code === 3) {
          console.log("Location request timed out.");
        }

      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 5000,
      }

    );

    console.log("Watching location. Watch ID:", watchId);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };

  }, []);

  // Firebase থেকে invitation receive___________________________________________

  useEffect(() => {

    if (!user?.email) return;

    const q = query(
      collection(db, "invitations"),
      where("toEmail", "==", user.email),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      if (!snapshot.empty) {

        const doc = snapshot.docs[0];

        setInvitation({
          id: doc.id,
          ...doc.data(),
        });

        console.log("Invitation received:", doc.data());

      } else {

        setInvitation(null);

        console.log("No pending invitation");

      }

    });

    return () => unsubscribe();

  }, [user]);

  // Firebase থেকে connection_People_Add_________________________________________

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "connections"),
      where("user1Uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      if (!snapshot.empty) {

        const doc = snapshot.docs[0];

        setConnection({
          id: doc.id,
          ...doc.data(),
        });

        console.log("Connection found:", doc.data());

      } else {

        // User যদি user1 না হয়ে user2 হয়
        const q2 = query(
          collection(db, "connections"),
          where("user2Uid", "==", user.uid)
        );

        const unsubscribe2 = onSnapshot(q2, (snapshot2) => {

          if (!snapshot2.empty) {

            const doc = snapshot2.docs[0];

            setConnection({
              id: doc.id,
              ...doc.data(),
            });

            console.log("Connection found:", doc.data());

          } else {
            setConnection(null);
            console.log("No connection found");
          }

        });

        return () => unsubscribe2();
      }

    });

    return () => unsubscribe();

  }, [user]);

  // =================================================
  // 🟣 FRIEND REALTIME LOCATION
  // =================================================

  useEffect(() => {

    if (!user || !connection) {
      setFriendLocation(null);
      return;
    }

    const friendUid =
      connection.user1Uid === user.uid
        ? connection.user2Uid
        : connection.user1Uid;

    if (!friendUid) {
      return;
    }

    console.log("Listening to friend location:", friendUid);

    const locationRef = doc(
      db,
      "locations",
      friendUid
    );

    const unsubscribe = onSnapshot(
      locationRef,

      (snapshot) => {

        if (snapshot.exists()) {

          const data = snapshot.data();

          console.log("Friend location:", data);

          setFriendLocation({
            lat: data.lat,
            lng: data.lng,
            accuracy: data.accuracy,
          });

          // 📍 Get friend's real place name
          getPlaceName(data.lat, data.lng).then((place) => {

            setFriendPlaceName(place);

          });

        } else {

          console.log("Friend location not found");

          setFriendLocation(null);

        }

      },

      (error) => {

        console.error(
          "Friend location listener error:",
          error
        );

      }
    );

    return () => unsubscribe();

  }, [user, connection]);


  return (
    <>

      <section className='bg-[#aaf4e7] p-10 '>

        {/* mother_div....................................................................... */}
        <div className="flex container mx-auto border rounded-2xl bg-white  ">
          {/* left_div ...........................................*/}
          <div className="p-4 shadow-2xl w-[25%] ">
            {/* live_icon ,,,,,,,,,,*/}
            <div className="flex gap-2">
              <p className='font-bold text-5xl text-blue-500 ' ><FaLocationDot /></p>
              <div className="">
                <h4 className={`${sans.className} font-bold text-2xl`}><span className='text-blue-500'>Live</span><span>Map</span></h4>
                <small className='text-[#8a8f8f] '>Stay Connected, Always</small>
              </div>
            </div>
            {/* my, people & invite_ div ||||||||||||||||||||||||*/}
            <div className="shadow-xl p-4 rounded-lg ">
              {/* my_location ,,,,,,,,,,*/}
              <article className='  border-b pb-4 '>
                <h4 className='font-bold text-lg flex justify-center text-[#2d3e53] '>My Location</h4>

                <div className="flex gap-4 mt-4">
                  <div className="relative ">
                    {/* MY_Live_Img_________________________________________
                  ________________________________________________________ */}
                    <img
                      className='w-14 h-14 rounded-full'
                      src={user?.photoURL || "./live/my/ri_anas.jpg"}
                      alt={user?.displayName || "User"}
                    />
                    <p className='absolute top-0 left-10 font-bold text-3xl text-green-500 '> <GoDotFill /> </p>

                  </div>


                  <div className="">
                    {/* User_Name__________________________________________
                  ___________________________________________________ */}
                    <p className='font-bold '>
                      {user?.displayName || "User"}
                    </p>
                    {/* Real_Location_place_Name___________________________________________
                  ___________________________________________________________________ */}

                    <small>{myPlaceName}</small>

                    <p className='flex items-center text-green-500' > <GoDotFill /> Live Now</p>
                  </div>

                </div>


              </article>

              {/* invitation_card____________________________________________ */}

              {invitation && (
                <InvitationCard invitation={invitation} />
              )}



              {/* Pepole(All),,,,,,,,,,,,,,,, */}

              <article className='overflow-y-auto pt-4'>

                <h4 className='font-bold text-lg flex justify-center text-[#2d3e53]'>
                  People({connection ? 1 : 0})
                </h4>

                {connection && (

                  <div className="flex gap-4 mt-4">

                    <div className="relative">

                      <img
                        className='w-14 h-14 rounded-full'
                        src={
                          connection.user1Uid === user?.uid
                            ? connection.user2Photo
                            : connection.user1Photo
                        }
                        alt=""
                      />

                      <p className='absolute top-0 left-10 font-bold text-3xl text-green-500'>
                        <GoDotFill />
                      </p>

                    </div>

                    <div>

                      <p className='font-bold'>
                        {connection.user1Uid === user?.uid
                          ? connection.user2Name
                          : connection.user1Name}
                      </p>
                      {/* friend_map_Place-name_________________________________________ */}

                      <small> {friendPlaceName} </small>

                      <p className='flex items-center text-green-500'>
                        <GoDotFill /> Live Now
                      </p>

                    </div>

                  </div>

                )}

              </article>


              {/* invite Pepole,,,,,,,,,,,, */}
              <div
                onClick={() => setShowInvite(true)}
                className="flex gap-2 border bg-blue-500 py-4 text-white justify-center items-center rounded-xl mt-12 cursor-pointer"
              >
                <p><FaPlus /></p>
                <p>Invite People</p>
              </div>

            </div>


            {/* setting $ logout,,,,,,,,,,,,,,,,,,,, */}

            <div className="flex mt-4 justify-between py-4 ">
              {/* setting ,,,,,,,,,*/}

              <Link href={"/setting_p"} >
                <div className="flex items-center gap-2 cursor-pointer ">
                  <p><IoSettingsOutline /></p>
                  <p>Settings </p>
                </div>

              </Link>

              {/* logout ,,,,,,,,*/}
              <Link href={"/login_p"} >
                <div className="flex items-center gap-2 ">
                  <p><IoMdLogOut /> </p>
                  <p>Logout</p>
                </div>

              </Link>
            </div>


          </div>

          {/* Right_div........................................... */}
          <div className="w-[75%] ">
            {/* top ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
            <div>

              <div className="flex items-center gap-2 font-bold justify-end py-4 border-b shadow-xl pr-4 ">
                <img className='w-10 h-10 rounded-full  ' src="./live/my/ri_anas.jpg" alt="" />
                <p>Anas Ahmed</p>
                <p className='cursor-pointer  '><TiArrowSortedDown /></p>
                <p className='cursor-pointer  '><BsThreeDotsVertical /></p>
              </div>

            </div>


            {/* live_map_ ___________________________*/}
            <div className="relative ">
              <div className="h-full w-full  ">

                <Map
                  myPhoto={user?.photoURL}
                  myName={user?.displayName}

                  friendLocation={friendLocation}

                  friendPhoto={
                    connection?.user1Uid === user?.uid
                      ? connection?.user2Photo
                      : connection?.user1Photo
                  }

                  friendName={
                    connection?.user1Uid === user?.uid
                      ? connection?.user2Name
                      : connection?.user1Name
                  }
                />

              </div>

              {/* Setalite_&_All_firend menu_________________ */}
              {/* <div className="flex items-center justify-between  absolute top-10 z-20 w-full px-10 ">
              <div className="flex items-center   ">
                <p className='border py-2 px-4 bg-white font-bold rounded-l-lg cursor-pointer  '>Map</p>
                <p className='border py-2 px-4 bg-[#dde3e4] rounded-r-lg cursor-pointer  '>Setalite </p>
              </div>

              <div className="flex items-center cursor-pointer  ">
                <p className='border py-2 px-4 bg-white  rounded-l-lg '>All Friends</p>
                <p className='border py-2 px-4 bg-[#dde3e4] rounded-r-lg font-bold text-2xl  '><RiMenuUnfoldFill /> </p>
              </div>
            </div> */}

              {/* plus and minus_______________________________ */}
              {/* <div className="flex items-center justify-between  absolute bottom-10 z-20 w-full px-10  ">
              <div className=" bg-white  rounded-l-lg cursor-pointer ">
                <p className='border rounded-t-lg py-3 font-bold px-4 '><FiPlus /> </p>
                <p className='border rounded-b-lg py-3 px-4   '><FaMinus /> </p>

              </div>
              
              <div className="flex items-center  ">
                <div className="border  px-4 bg-white rounded-l-lg cursor-pointer ">
                  <small className='font-bold'>Live Updates</small > <br />
                  <small> Auto-refresh on </small>
                </div>

                <p className='border py-2 px-4 bg-white text-[32px] rounded-r-lg cursor-pointer '><MdOutlineRefresh /></p>


              </div>

            </div> */}

            </div>


          </div>

        </div>

      </section>

      {
        showInvite && (
          <Invite
            onClose={() => setShowInvite(false)}
          />
        )
      }

    </>
  )
}

export default Live
