"use client"
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/Firebase/firebaseConfig";

import VideoCall from "@/Compunents/Video/VideoCall";

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

import dynamic from "next/dynamic";

const Map = dynamic(
  () => import("@/Compunents/Google_map/Map"),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>,
  }
);


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

  // friendLocation_______________________________________________

  const [friendLocations, setFriendLocations] = useState([]);

  const [shareLocation, setShareLocation] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(15000);
  // Friend_list_____________________________________________________
  const [frnd, setFrnd] = useState([])

  // ⏱️ Refresh friend last-seen display periodically
  const [currentTime, setCurrentTime] = useState(Date.now());



  // my_LocationPlace_Name________________________________________
  const [myPlaceName, setMyPlaceName] = useState("Getting location...");
  // friend_offline-&-Online________________________________________

  console.log("Google/Firebase Display Name:", user?.displayName);


  // =================================================
  // 🚪 LOGOUT
  // =================================================

  const handleLogout = async () => {

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    try {

      await signOut(auth);

      console.log("Logout successful ✅");

      window.location.href = "/login_p";

    } catch (error) {

      console.error("Logout error:", error);

    }
  };


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


  // friend_search.====================================
  const [friendSearch, setFriendSearch] = useState("");
  const [flyToLocation, setFlyToLocation] = useState(null);




  // ⏱️ Refresh the Live / Last seen text every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);

    return () => clearInterval(timer);
  }, []);

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
    if (!user) return;

    if (!navigator.geolocation) {
      console.log("❌ Geolocation is not supported");
      return;
    }

    // -----------------------------------------
    // 📍 SHARE LOCATION OFF
    // -----------------------------------------

    if (!shareLocation) {
      console.log("📍 Share Live Location is OFF");
      return;
    }

    console.log("📍 Location tracking started");
    console.log("🎯 High Accuracy:", highAccuracy);
    console.log("⏱️ Update Interval:", updateInterval, "ms");


    // -----------------------------------------
    // 🔥 SAVE LOCATION TO FIREBASE
    // -----------------------------------------

    const saveLocationToFirebase = async (
      lat,
      lng,
      accuracy
    ) => {
      try {
        await setDoc(
          doc(db, "locations", user.uid),
          {
            uid: user.uid,
            lat,
            lng,
            accuracy,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        console.log("📍 Location saved to Firebase ✅");

      } catch (error) {
        console.error(
          "❌ Location save error:",
          error
        );
      }
    };


    // -----------------------------------------
    // 📍 UPDATE LOCATION
    // -----------------------------------------

    const updateLocation = () => {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log("📍 REAL LOCATION:");
          console.log("Latitude:", lat);
          console.log("Longitude:", lng);
          console.log("Accuracy:", accuracy, "meters");


          // -----------------------------------------
          // 📍 OWN MAP LOCATION
          // -----------------------------------------

          if (accuracy <= 1000) {

            setMyLocation({
              lat,
              lng,
              accuracy,
            });


            // -----------------------------------------
            // 🗺️ PLACE NAME
            // -----------------------------------------

            getPlaceName(lat, lng)
              .then((place) => {

                console.log(
                  "🔵 MY PLACE NAME RESULT:",
                  place
                );

                setMyPlaceName(place);

              })
              .catch((error) => {

                console.error(
                  "🔴 MY PLACE NAME ERROR:",
                  error
                );

                setMyPlaceName(
                  "Location unavailable"
                );

              });


            // -----------------------------------------
            // 🔥 FIREBASE UPDATE
            // -----------------------------------------

            saveLocationToFirebase(
              lat,
              lng,
              accuracy
            );

          }

        },


        // -----------------------------------------
        // ❌ LOCATION ERROR
        // -----------------------------------------

        (error) => {

          console.log(
            "❌ Location Error:",
            error
          );

          if (error.code === 1) {
            console.log(
              "Location permission denied."
            );
          }

          if (error.code === 2) {
            console.log(
              "Location unavailable."
            );
          }

          if (error.code === 3) {
            console.log(
              "Location request timed out."
            );
          }

        },


        // -----------------------------------------
        // 🎯 LOCATION OPTIONS
        // -----------------------------------------

        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 5000,
        }

      );

    };


    // -----------------------------------------
    // 🚀 FIRST LOCATION UPDATE IMMEDIATELY
    // -----------------------------------------

    updateLocation();


    // -----------------------------------------
    // ⏱️ AUTOMATIC UPDATE INTERVAL
    // -----------------------------------------

    const locationInterval = setInterval(
      updateLocation,
      updateInterval
    );


    // -----------------------------------------
    // 🛑 CLEANUP
    // -----------------------------------------

    return () => {

      console.log(
        "🛑 Location tracking stopped"
      );

      clearInterval(locationInterval);

    };

  }, [
    user,
    shareLocation,
    highAccuracy,
    updateInterval,
  ]);

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

  // 🔵 Connected Friends Listener (normalized friend objects)
  useEffect(() => {
    if (!user?.uid) {
      setFrnd([]);
      return;
    }

    const connectionsRef = collection(db, "connections");
    const q1 = query(connectionsRef, where("user1Uid", "==", user.uid));
    const q2 = query(connectionsRef, where("user2Uid", "==", user.uid));

    let friendsFromQ1 = [];
    let friendsFromQ2 = [];

    const updateFriends = () => {
      const allConnections = [...friendsFromQ1, ...friendsFromQ2];
      const friendList = allConnections.map((connection) => {
        if (connection.user1Uid === user.uid) {
          return {
            uid: connection.user2Uid,
            name: connection.user2Name || "Unknown User",
            photo: connection.user2Photo || "",
          };
        }

        return {
          uid: connection.user1Uid,
          name: connection.user1Name || "Unknown User",
          photo: connection.user1Photo || "",
        };
      }).filter((friend) => friend.uid);

      const uniqueFriends = friendList.filter(
        (friend, index, self) =>
          index === self.findIndex((item) => item.uid === friend.uid)
      );

      setFrnd(uniqueFriends);
      console.log("Live Friends:", uniqueFriends);
    };

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      friendsFromQ1 = snapshot.docs.map((doc) => doc.data());
      updateFriends();
    }, (error) => console.error("Connections listener (user1) error:", error));

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      friendsFromQ2 = snapshot.docs.map((doc) => doc.data());
      updateFriends();
    }, (error) => console.error("Connections listener (user2) error:", error));

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user]);

  // 🟢 Listen to each connected friend's live location
  useEffect(() => {
    if (!user?.uid || frnd.length === 0) {
      setFriendLocations([]);
      return;
    }

    const unsubscribers = [];

    frnd.forEach((friend) => {
      const friendUid = friend.uid;
      if (!friendUid) return;

      const unsubscribe = onSnapshot(
        doc(db, "locations", friendUid),
        async (snapshot) => {
          if (!snapshot.exists()) {
            setFriendLocations((prev) => {
              const offlineFriend = {
                uid: friendUid,
                name: friend.name,
                photo: friend.photo,
                location: null,
                place: "Location unavailable",
                isLive: false,
              };
              const exists = prev.some((item) => item.uid === friendUid);
              return exists
                ? prev.map((item) => item.uid === friendUid ? offlineFriend : item)
                : [...prev, offlineFriend];
            });
            return;
          }

          const data = snapshot.data();
          const location = {
            lat: data.lat,
            lng: data.lng,
            accuracy: data.accuracy,
            updatedAt: data.updatedAt,
          };

          const place = await getPlaceName(data.lat, data.lng);
          const updatedAt = data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt);
          const isLive = Number.isFinite(updatedAt.getTime()) &&
            Date.now() - updatedAt.getTime() < 60000;

          const newFriend = {
            uid: friendUid,
            name: friend.name,
            photo: friend.photo,
            location,
            place,
            isLive,
          };

          setFriendLocations((prev) => {
            const exists = prev.some((item) => item.uid === friendUid);
            return exists
              ? prev.map((item) => item.uid === friendUid ? newFriend : item)
              : [...prev, newFriend];
          });
        },
        (error) => console.error("Friend location error:", friendUid, error)
      );

      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user, frnd]);

  // =================================================
  // 🟣 FRIEND REALTIME LOCATION
  // =================================================

  // useEffect(() => {

  //   if (!user || !connection) {
  //     setFriendLocation(null);
  //     return;
  //   }

  //   const friendUid =
  //     connection.user1Uid === user.uid
  //       ? connection.user2Uid
  //       : connection.user1Uid;

  //   if (!friendUid) {
  //     return;
  //   }

  //   console.log("Listening to friend location:", friendUid);

  //   const locationRef = doc(
  //     db,
  //     "locations",
  //     friendUid
  //   );

  //   const unsubscribe = onSnapshot(
  //     locationRef,

  //     (snapshot) => {

  //       if (snapshot.exists()) {

  //         const data = snapshot.data();

  //         console.log("Friend location:", data);

  //         setFriendLocation({
  //           lat: data.lat,
  //           lng: data.lng,
  //           accuracy: data.accuracy,
  //         });

  //         // 📍 Get friend's real place name
  //         getPlaceName(data.lat, data.lng).then((place) => {

  //           setFriendPlaceName(place);

  //         });

  //       } else {

  //         console.log("Friend location not found");

  //         setFriendLocation(null);

  //       }

  //     },

  //     (error) => {

  //       console.error(
  //         "Friend location listener error:",
  //         error
  //       );

  //     }
  //   );

  //   return () => unsubscribe();

  // }, [user, connection]);


  // Location_trecing========================================================
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();

        setShareLocation(
          data.shareLocation !== undefined
            ? data.shareLocation
            : true
        );

        setHighAccuracy(
          data.highAccuracy !== undefined
            ? data.highAccuracy
            : true
        );

        setUpdateInterval(
          data.updateInterval || 15000
        );

        console.log("⚙️ Location settings:", {
          shareLocation: data.shareLocation,
          highAccuracy: data.highAccuracy,
          updateInterval: data.updateInterval,
        });
      },
      (error) => {
        console.error("Location settings error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // updatedTime_Offline & Online===========================================
  // const getFriendStatus = () => {
  //   if (!friendLocation?.updatedAt) {
  //     return {
  //       text: "Offline",
  //       isLive: false,
  //     };
  //   }

  //   let updatedTime;

  //   // Firestore Timestamp হলে
  //   if (typeof friendLocation.updatedAt?.toDate === "function") {
  //     updatedTime = friendLocation.updatedAt.toDate();
  //   } else {
  //     // Date/string হলে
  //     updatedTime = new Date(friendLocation.updatedAt);
  //   }

  //   const now = new Date();

  //   const differenceInSeconds = Math.floor(
  //     (now.getTime() - updatedTime.getTime()) / 1000
  //   );

  //   // গত 1 মিনিটের মধ্যে location update হলে
  //   if (differenceInSeconds < 60) {
  //     return {
  //       text: "Live now",
  //       isLive: true,
  //     };
  //   }

  //   const differenceInMinutes = Math.floor(
  //     differenceInSeconds / 60
  //   );

  //   // 1 hour এর কম হলে
  //   if (differenceInMinutes < 60) {
  //     return {
  //       text: `${differenceInMinutes} ${differenceInMinutes === 1 ? "minute" : "minutes"
  //         } ago`,
  //       isLive: false,
  //     };
  //   }

  //   const differenceInHours = Math.floor(
  //     differenceInMinutes / 60
  //   );

  //   return {
  //     text: `${differenceInHours} ${differenceInHours === 1 ? "hour" : "hours"
  //       } ago`,
  //     isLive: false,
  //   };
  // };
  // const status = getFriendStatus();

  // Firebase realtime data Update_ in people Card_(friend_location)==============
  // useEffect(() => {

  //   if (!user || !connection) {
  //     setFriendLocation(null);
  //     return;
  //   }


  //   // -----------------------------------------
  //   // 👤 FIND FRIEND UID
  //   // -----------------------------------------

  //   const friendUid =
  //     connection.user1Uid === user.uid
  //       ? connection.user2Uid
  //       : connection.user1Uid;


  //   if (!friendUid) {
  //     setFriendLocation(null);
  //     return;
  //   }


  //   // -----------------------------------------
  //   // 📍 REALTIME FRIEND LOCATION
  //   // -----------------------------------------

  //   const unsubscribe = onSnapshot(

  //     doc(db, "locations", friendUid),

  //     (locationDoc) => {

  //       if (locationDoc.exists()) {

  //         // 🔒 NOBODY PRIVACY

  //         if (friendPrivacy === "nobody") {
  //           console.log("🔒 FRIEND PRIVACY VALUE:", friendPrivacy);


  //           console.log(
  //             "🔒 Friend location is hidden"
  //           );

  //           setFriendLocation(null);
  //           setFriendPlaceName("Location hidden");

  //           return;
  //         }

  //         // 🔒 selectedFriends_Privacy

  //         if (
  //           friendPrivacy === "selected" &&
  //           !friendSelectedFriends.includes(user.uid)
  //         ) {

  //           console.log(
  //             "🔒 You are not selected to see this location"
  //           );

  //           setFriendLocation(null);
  //           setFriendPlaceName("Location hidden");

  //           return;
  //         }


  //         const locationData = locationDoc.data();

  //         console.log(
  //           "📍 Friend location updated:",
  //           locationData
  //         );

  //         setFriendLocation(locationData);



  //       } else {

  //         console.log(
  //           "❌ Friend location not found"
  //         );

  //         setFriendLocation(null);

  //       }

  //     },

  //     (error) => {

  //       console.error(
  //         "❌ Friend location listener error:",
  //         error
  //       );

  //       setFriendLocation(null);

  //     }

  //   );


  //   return () => unsubscribe();


  // }, [user, connection, friendPrivacy, friendSelectedFriends,]);

  // Note: per-friend location privacy must be enforced in Firestore rules
  // and integrated into the friend location listener before production.

  // friend_searche...==========================================
  const handleFriendSearch = (e) => {
    e.preventDefault();

    const searchedFriend = friendLocations.find((friend) =>
      friend.name
        ?.toLowerCase()
        .includes(friendSearch.toLowerCase().trim())
    );

    if (!searchedFriend?.location) {
      alert("Friend's location is not available!");
      return;
    }

    setFlyToLocation({
      lat: searchedFriend.location.lat,
      lng: searchedFriend.location.lng,
      zoom: 16,
      timestamp: Date.now(),
    });
  };



  return (
    <>

      <section className=' md:p-10  bg-white text-black dark:bg-[#031627] dark:text-white '>

        {/* mother_div....................................................................... */}
        <div className="md:flex md:flex-row flex flex-col-reverse container mx-auto border md:rounded-t-2xl md:h-screen bg-gray-100 dark:bg-white/5  ">
          {/* left_div ...........................................*/}
          <div className=" shadow-2xl md:w-[25%] border-r  ">
            {/* live_icon ,,,,,,,,,,*/}
            <div className="flex gap-2 mt-2 ">
              <p className='font-bold text-5xl text-blue-500 ' ><FaLocationDot /></p>
              <div className="">
                <h4 className={`${sans.className} font-bold text-2xl`}><span className='text-blue-500'>Live</span><span>Map</span></h4>
                <small className='text-[#8a8f8f] '>Stay Connected, Always</small>
              </div>
            </div>

            {/* my, people & invite_ div ||||||||||||||||||||||||*/}
            <div className="shadow-xl p-4 rounded-lg ">

              {/* my_location ,,,,,,,,,,*/}

              <article className='  border-b pb-2 '>
                <h4 className='font-bold text-lg flex justify-center text-[#2d5350] '>My Location</h4>

                <div className="flex gap-4 mt-2">
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
                    <p className='font-bold uppercase ' >
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



              {/* friend(All),,,,,,,,,,,,,,,, */}

              <article className="pt-2 h-[200px] overflow-auto">

                <h4 className="font-bold text-lg flex justify-center text-[#2d3e53]">
                  Friends({frnd.length})
                </h4>



                {frnd.map((friend) => {
                  const friendData = friendLocations.find(
                    (item) => item.uid === friend.uid
                  );

                  const updatedAt = friendData?.location?.updatedAt;
                  const lastUpdate = updatedAt?.toDate
                    ? updatedAt.toDate().getTime()
                    : updatedAt
                      ? new Date(updatedAt).getTime()
                      : 0;

                  const isFriendLive =
                    lastUpdate > 0 &&
                    Number.isFinite(lastUpdate) &&
                    currentTime - lastUpdate < 60000;

                  return (
                    <div
                      key={friend.uid}
                      className="flex gap-3 mt-3 items-center"
                    >
                      {/* Friend Photo */}
                      <div className="relative shrink-0">
                        {friend.photo ? (
                          <img
                            className="w-14 h-14 rounded-full object-cover"
                            src={friend.photo}
                            alt={friend.name}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                            {friend.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}

                        <p className={`absolute top-0 left-10 font-bold text-3xl ${isFriendLive ? "text-green-500" : "text-gray-400"}`}>
                          <GoDotFill />
                        </p>
                      </div>

                      {/* Friend Information */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{friend.name}</p>

                        <small className="block truncate">
                          {friendData?.place || "Location unavailable"}
                        </small>

                        {/* Live / Last seen status */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`w-2.5 h-2.5 rounded-full ${isFriendLive ? "bg-green-500" : "bg-gray-400"}`} />
                          <span className={isFriendLive ? "text-green-500" : "text-gray-400"}>
                            {isFriendLive
                              ? "Live Now"
                              : lastUpdate > 0
                                ? (() => {
                                    const seconds = Math.max(0, Math.floor((currentTime - lastUpdate) / 1000));
                                    if (seconds < 60) return "Just now";
                                    const minutes = Math.floor(seconds / 60);
                                    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
                                    const hours = Math.floor(minutes / 60);
                                    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
                                    const days = Math.floor(hours / 24);
                                    return `${days} day${days === 1 ? "" : "s"} ago`;
                                  })()
                                : "Offline"}
                          </span>
                        </div>
                      </div>

                      {/* Video Call */}
                      {user && (
                        <VideoCall
                          myId={user.uid}
                          friendId={friend.uid}
                          friendName={friend.name}
                        />
                      )}
                    </div>
                  );
                })}
              </article>



              {/* invite Pepole,,,,,,,,,,,, */}
              <div
                onClick={() => setShowInvite(true)}
                className="flex gap-2 border bg-blue-500 py-2 text-white justify-center items-center rounded-xl mt-5 cursor-pointer"
              >
                <p><FaPlus /></p>
                <p>Invite People</p>
              </div>

            </div>


            {/* setting $ logout,,,,,,,,,,,,,,,,,,,, */}

            <div className="flex  justify-between py-4 px-1 ">
              {/* setting ,,,,,,,,,*/}

              <Link href={"/setting_p"} >
                <div className="flex items-center gap-2 cursor-pointer ">
                  <p><IoSettingsOutline /></p>
                  <p>Settings </p>
                </div>

              </Link>

              {/* logout ,,,,,,,,*/}
              <div
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer"
              >
                <p>
                  <IoMdLogOut />
                </p>

                <p>
                  Logout
                </p>
              </div>
            </div>


          </div>

          {/* Right_div........................................... */}
          <div className="md:w-[75%] ">
            {/* top ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
            <div className='flex justify-between items-center' >

              {/* Friend Location Search_______________________________________ */}
              <form
                onSubmit={handleFriendSearch}
                className=" flex gap-2 bg-white p-2 rounded-xl shadow-lg"
              >
                <input
                  type="text"
                  placeholder="Search friend..."
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  className="outline-none px-3 py-2 w-40 md:w-60 text-black"
                />

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Search
                </button>
              </form>


              <Link href={"setting_p"} >
                <div className="flex items-center gap-2 font-bold justify-end py-2 border-b shadow-xl pr-4   cursor-pointer ">
                  <img className='w-10 h-10 rounded-full  ' src="./live/my/ri_anas.jpg" alt="" />
                  <p className=' md:block hidden' >Profile</p>
                  <p className='cursor-pointer md:block hidden '><TiArrowSortedDown /></p>
                  <p className='cursor-pointer md:block hidden '><BsThreeDotsVertical /></p>
                </div>

              </Link>

            </div>



            {/* live_map_ ___________________________*/}
            <div className="relative ">
              <div className="h-full w-full   ">

                <Map
                  myPhoto={user?.photoURL}
                  myName={user?.displayName}
                  friendLocations={friendLocations}
                  flyToLocation={flyToLocation}
                />



              </div>



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
