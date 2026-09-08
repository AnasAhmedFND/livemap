"use client"
import React, { useEffect, useState } from "react";
import { AiTwotoneSetting } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { FcPrivacy } from "react-icons/fc";
import { MdSunny } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { IoMdNotifications } from "react-icons/io";
import { FaMapMarkedAlt } from "react-icons/fa";
import { FcAbout } from "react-icons/fc";

import { useTheme } from "@/Theme/ThemeProvider";

// functional_import===================================================
// =======================================================================
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    deleteDoc,
    where,
    onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";


const Setting = () => {

    const [user, setUser] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photo, setPhoto] = useState("");
    // friend_section_________________________________________
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    // Block_friends__________________________________________
    const [blockedUsers, setBlockedUsers] = useState([]);

    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [originalPhone, setOriginalPhone] = useState("");
    const [originalBio, setOriginalBio] = useState("");
    // Location-এর_যোগ_______________________________________________________________________
    const [shareLocation, setShareLocation] = useState(true);
    const [highAccuracy, setHighAccuracy] = useState(true);
    const [updateInterval, setUpdateInterval] = useState(5000);
    const [savingLocation, setSavingLocation] = useState(false);
    // light & Dark_____________________________________________________
    const { theme, changeTheme } = useTheme();
    // Section_Privacy_state____________________________________________
    const [locationPrivacy, setLocationPrivacy] = useState("friends");
    const [selectedFriends, setSelectedFriends] = useState([]);






    // ==========================================
    // 🔵 GET LOGGED IN USER
    // ==========================================

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

            if (!currentUser) return;

            setUser(currentUser);

            setName(currentUser.displayName || "");
            setEmail(currentUser.email || "");
            setPhoto(currentUser.photoURL || "");

            // Firestore থেকে Phone + Bio
            try {

                const userRef = doc(db, "users", currentUser.uid);

                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setPhone(data.phone || "");
                    setBio(data.bio || "");

                    setOriginalPhone(data.phone || "");
                    setOriginalBio(data.bio || "");

                    // Location settings
                    setShareLocation(
                        data.shareLocation !== undefined ? data.shareLocation : true
                    );

                    setHighAccuracy(
                        data.highAccuracy !== undefined ? data.highAccuracy : true
                    );

                    setUpdateInterval(data.updateInterval || 5000);
                }

            } catch (error) {

                console.error("Profile data loading error:", error);

            }

        });

        return () => unsubscribe();

    }, []);


    // ==========================================
    // 🟢 SAVE PROFILE
    // ==========================================

    const handleSaveProfile = async () => {

        if (!user) return;

        if (!name.trim()) {

            alert("Name cannot be empty.");

            return;
        }

        setSaving(true);

        try {

            // Firebase Auth → Name update
            await updateProfile(user, {
                displayName: name.trim(),
            });


            // Firestore → Phone + Bio
            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name: name.trim(),
                    email: user.email,
                    phone: phone.trim(),
                    bio: bio.trim(),
                    photoURL: user.photoURL || "",
                    updatedAt: new Date(),
                },
                {
                    merge: true,
                }
            );


            setOriginalPhone(phone.trim());
            setOriginalBio(bio.trim());

            setEditMode(false);

            alert("Profile updated successfully ✅");

        } catch (error) {

            console.error("Profile update error:", error);

            alert("Failed to update profile.");

        } finally {

            setSaving(false);

        }

    };

    // Location_access============================

    const handleSaveLocation = async () => {
        if (!user) return;

        setSavingLocation(true);

        try {
            await setDoc(
                doc(db, "users", user.uid),
                {
                    shareLocation,
                    highAccuracy,
                    updateInterval,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            alert("Location settings updated successfully ✅");
        } catch (error) {
            console.error("Location settings update error:", error);
            alert("Failed to update location settings.");
        } finally {
            setSavingLocation(false);
        }
    };


    // ==========================================
    // 👥 LOAD MY FRIENDS
    // ==========================================

    useEffect(() => {
        if (!user) return;

        const connectionsRef = collection(db, "connections");

        // User is user1
        const q1 = query(
            connectionsRef,
            where("user1Uid", "==", user.uid)
        );

        // User is user2
        const q2 = query(
            connectionsRef,
            where("user2Uid", "==", user.uid)
        );

        let friendsFromQ1 = [];
        let friendsFromQ2 = [];

        const updateFriends = () => {
            const allConnections = [
                ...friendsFromQ1,
                ...friendsFromQ2,
            ];

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
            });

            // Remove duplicate friends
            const uniqueFriends = friendList.filter(
                (friend, index, self) =>
                    index === self.findIndex(
                        (item) => item.uid === friend.uid
                    )
            );

            setFriends(uniqueFriends);
        };

        const unsubscribe1 = onSnapshot(q1, (snapshot) => {
            friendsFromQ1 = snapshot.docs.map((doc) => doc.data());
            updateFriends();
        });

        const unsubscribe2 = onSnapshot(q2, (snapshot) => {
            friendsFromQ2 = snapshot.docs.map((doc) => doc.data());
            updateFriends();
        });

        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }, [user]);

    // ==========================================
    // 📩 LOAD PENDING FRIEND REQUESTS
    // ==========================================

    useEffect(() => {
        if (!user?.email) return;

        const invitationsRef = collection(db, "invitations");

        const q = query(
            invitationsRef,
            where("toEmail", "==", user.email),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const requests = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

                setPendingRequests(requests);
            },
            (error) => {
                console.error("Pending requests error:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // ==========================================
    // ✅ ACCEPT FRIEND REQUEST
    // ==========================================

    const handleAcceptRequest = async (request) => {
        try {
            await setDoc(
                doc(db, "invitations", request.id),
                {
                    status: "accepted",
                },
                { merge: true }
            );

            const connectionId =
                request.fromUid < user.uid
                    ? `${request.fromUid}_${user.uid}`
                    : `${user.uid}_${request.fromUid}`;

            await setDoc(
                doc(db, "connections", connectionId),
                {
                    user1Uid: request.fromUid,
                    user1Name: request.fromName,
                    user1Photo: request.fromPhoto || "",

                    user2Uid: user.uid,
                    user2Name: user.displayName || "",
                    user2Photo: user.photoURL || "",

                    createdAt: new Date(),
                },
                { merge: true }
            );

            console.log("Friend request accepted ✅");

        } catch (error) {
            console.error("Accept request error:", error);
            alert("Failed to accept request.");
        }
    };


    // ==========================================
    // ❌ REJECT FRIEND REQUEST
    // ==========================================

    const handleRejectRequest = async (request) => {
        try {
            await setDoc(
                doc(db, "invitations", request.id),
                {
                    status: "rejected",
                },
                { merge: true }
            );

            console.log("Friend request rejected ❌");

        } catch (error) {
            console.error("Reject request error:", error);
            alert("Failed to reject request.");
        }
    };

    // ==========================================
    // 🚫 LOAD BLOCKED USERS__1 (part)
    // ==========================================

    useEffect(() => {
        if (!user) return;

        const blockedRef = collection(db, "blockedUsers");

        const q = query(
            blockedRef,
            where("blockedBy", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const blockedList = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

                setBlockedUsers(blockedList);
            },
            (error) => {
                console.error("Blocked users error:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleUnblockUser = async (blockedUser) => {
        try {
            await deleteDoc(
                doc(db, "blockedUsers", blockedUser.id)
            );

            console.log("User unblocked successfully ✅");

        } catch (error) {
            console.error("Unblock error:", error);
            alert("Failed to unblock user.");
        }
    };

    // ==========================================
    // 🚫 BLOCK USER___2 (part)
    // ==========================================

    const handleBlockUser = async (friend) => {
        if (!user || !friend) return;

        const confirmBlock = window.confirm(
            `Are you sure you want to block ${friend.name}?`
        );

        if (!confirmBlock) return;

        try {
            // ------------------------------------------
            // 🚫 SAVE BLOCKED USER
            // ------------------------------------------

            const blockedId = `${user.uid}_${friend.uid}`;

            await setDoc(
                doc(db, "blockedUsers", blockedId),
                {
                    blockedBy: user.uid,

                    userUid: friend.uid,
                    userName: friend.name,
                    userPhoto: friend.photo || "",

                    createdAt: new Date(),
                }
            );

            // ------------------------------------------
            // ❌ REMOVE CONNECTION
            // ------------------------------------------

            const connectionId =
                user.uid < friend.uid
                    ? `${user.uid}_${friend.uid}`
                    : `${friend.uid}_${user.uid}`;

            await deleteDoc(
                doc(db, "connections", connectionId)
            );

            console.log(
                "User blocked and connection removed 🚫"
            );

            alert(`${friend.name} has been blocked.`);

        } catch (error) {
            console.error("Block user error:", error);
            alert("Failed to block user.");
        }
    };

    // ==========================================
    // Light and Dark
    // ==========================================
    const handleThemeChange = async (newTheme) => {
        if (!user) return;

        try {
            // UI immediately change
            changeTheme(newTheme);

            // Save theme to Firebase
            await setDoc(
                doc(db, "users", user.uid),
                {
                    theme: newTheme,
                },
                { merge: true }
            );

            console.log("Theme saved:", newTheme);

        } catch (error) {
            console.error("Theme update error:", error);
        }
    };

    // ==========================================
    // 🎨 LOAD SAVED THEME
    // ==========================================

    useEffect(() => {
        if (!user) return;

        const loadTheme = async () => {
            try {
                const userDoc = await getDoc(
                    doc(db, "users", user.uid)
                );

                if (userDoc.exists()) {
                    const data = userDoc.data();

                    if (data.theme) {
                        changeTheme(data.theme);
                    }
                }

            } catch (error) {
                console.error("Theme load error:", error);
            }
        };

        loadTheme();

    }, [user]);


    // Privacy_function========================
    // ===========================================
    const saveLocationPrivacy = async (privacy) => {
        if (!user?.uid) return;

        try {
            await setDoc(
                doc(db, "users", user.uid),
                {
                    locationPrivacy: privacy,
                },
                { merge: true }
            );


            console.log(
                "🔒 Location privacy saved:",
                privacy
            );


        } catch (error) {
            console.error(
                "Privacy save error:",
                error
            );
        }
    };

    useEffect(() => {
        if (!user?.uid) return;

        const loadLocationPrivacy = async () => {
            try {
                const userDoc = await getDoc(
                    doc(db, "users", user.uid)
                );


                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.selectedFriends) {
                        setSelectedFriends(data.selectedFriends);
                    }


                    if (data.locationPrivacy) {
                        setLocationPrivacy(
                            data.locationPrivacy
                        );
                    }
                }

            } catch (error) {
                console.error(
                    "Privacy load error:",
                    error
                );
            }


        };

        loadLocationPrivacy();

    }, [user]);

    // handleSelectedFriend===========================

    const handleSelectedFriend = async (friend) => {
        if (!user?.uid || !friend?.uid) return;

        let updatedFriends;

        if (selectedFriends.includes(friend.uid)) {
            // Remove friend
            updatedFriends = selectedFriends.filter(
                (uid) => uid !== friend.uid
            );
        } else {
            // Add friend
            updatedFriends = [
                ...selectedFriends,
                friend.uid,
            ];
        }

        setSelectedFriends(updatedFriends);

        try {
            await setDoc(
                doc(db, "users", user.uid),
                {
                    selectedFriends: updatedFriends,
                },
                { merge: true }
            );


            console.log(
                "🎯 Selected friends updated:",
                updatedFriends
            );


        } catch (error) {
            console.error(
                "Selected friends error:",
                error
            );
        }
    };






    return (
        <section className=' '>
            {/* Settings mother_div ...........................................*/}
            <div className="container mx-auto  flex   ">
                {/* left_div _________________________*/}
                <div className=" w-[30%] h-screen    ">
                    <h2 className='flex items-center gap-2  h-14 font-bold text-2xl px-2 shadow-xl fixed border-b w-[461px]  ' ><AiTwotoneSetting className='text-4xl ' /> Settings </h2>

                    {/* Category______________________ */}
                    <div className="p-2 pt-5 flex flex-col gap-3 shadow-2xl h-screen mt-14 fixed  w-[28%] ">

                        {/* Profile,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">

                            <h3 className='flex items-center gap-2 font-bold    '> <CgProfile className='text-2xl ' /> Profile </h3>

                        </div>

                        {/* Location,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <IoLocationOutline className='text-2xl ' /> Location </h3>


                        </div>

                        {/* Friends & Permimssions,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <FaUserFriends className='text-2xl ' /> Friends & Permissions </h3>


                        </div>

                        {/* Privacy ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <FcPrivacy className='text-2xl ' /> Privacy </h3>


                        </div>

                        {/* Notifications,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <IoMdNotifications className='text-2xl ' /> Notifications </h3>


                        </div>

                        {/* Appearance ,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> 🎨 Appearance </h3>


                        </div>

                        {/* Map,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <FaMapMarkedAlt className='text-2xl ' /> Map </h3>

                        </div>

                        {/* Security,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> 🔐 Security </h3>


                        </div>

                        {/* About,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold mt-4 '> <FcAbout className='text-2xl ' /> About </h3>


                        </div>

                    </div>


                </div>

                {/* Right_div_________________________ */}
                <div className=" w-[70%] border-l ">
                    {/* Search ,,,,,,,,,,,,,,,,,,,,,, */}
                    <div className=" h-14 shadow-xl flex  align-middle w-full border-b  ">
                        <input className=' px-4 outline-none text-xl w-full ' type="search" placeholder='Search..' />

                    </div>

                    {/* Settings_Details,,,,,,,,,,,,, */}
                    <div className="  w-full p-2 px-5 pb-10 overflow-y-auto mt-14  ">

                        <div className="   ">
                            <h2 className='flex items-center gap-2 text-4xl font-bold text-blue-500  ' ><AiTwotoneSetting /> Settings__ </h2>

                            {/* =================================================
                                PROFILE
                                ================================================= */}

                            <div className="">

                                <div className="flex items-center justify-between mt-5">

                                    <h3 className="flex items-center gap-2 text-2xl font-bold text-blue-500">
                                        <CgProfile />
                                        Profile
                                        <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span>


                                    </h3>


                                    {/* Edit Button */}

                                    {!editMode && (

                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 "
                                        >
                                            Edit
                                        </button>

                                    )}

                                </div>


                                {/* PROFILE CARD */}

                                <div className="mt-5 border rounded-2xl p-6 shadow-sm bg-white">


                                    {/* PROFILE PHOTO */}

                                    <div className="flex items-center gap-5 mb-6">

                                        <img
                                            src={
                                                photo ||
                                                "https://ui-avatars.com/api/?name=User"
                                            }
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                                        />

                                        <div>

                                            <p className="text-xl text-black font-bold">
                                                {name || "User"}
                                            </p>

                                            <p className="text-black ">
                                                {email || "No email"}
                                            </p>

                                        </div>

                                    </div>


                                    {/* NAME */}

                                    <div className="mb-5 text-black ">

                                        <label className="block font-semibold mb-2">
                                            Name
                                        </label>

                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={!editMode}
                                            className={`w-full border rounded-lg px-4 py-3 outline-none ${editMode
                                                ? "border-blue-400"
                                                : "bg-gray-100"
                                                }`}
                                        />

                                    </div>


                                    {/* EMAIL */}

                                    <div className="mb-5 text-black">

                                        <label className="block font-semibold mb-2">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full border rounded-lg px-4 py-3 bg-gray-100 outline-none"
                                        />

                                        <small className="text-gray-500">
                                            Email is connected to your Google account.
                                        </small>

                                    </div>


                                    {/* PHONE */}

                                    <div className="mb-5 text-black">

                                        <label className="block font-semibold mb-2">
                                            Phone
                                        </label>

                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={!editMode}
                                            placeholder="Enter your phone number"
                                            className={`w-full border rounded-lg px-4 py-3 outline-none ${editMode
                                                ? "border-blue-400"
                                                : "bg-gray-100"
                                                }`}
                                        />

                                    </div>


                                    {/* BIO */}

                                    <div className="mb-5 text-black">

                                        <label className="block font-semibold mb-2">
                                            Bio
                                        </label>

                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            disabled={!editMode}
                                            placeholder="Write something about yourself..."
                                            rows="4"
                                            className={`w-full border rounded-lg px-4 py-3 outline-none resize-none ${editMode
                                                ? "border-blue-400"
                                                : "bg-gray-100"
                                                }`}
                                        />

                                    </div>


                                    {/* SAVE / CANCEL */}



                                    {editMode && (

                                        <div className="flex gap-3 justify-end">

                                            <button
                                                onClick={() => {

                                                    setName(user?.displayName || "");
                                                    setPhone(originalPhone);
                                                    setBio(originalBio);

                                                    setEditMode(false);

                                                }}
                                                className="px-5 py-2 border rounded-lg cursor-pointer  hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="px-5 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>

                                        </div>

                                    )}

                                </div>

                            </div>

                            {/* Location,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'><IoLocationOutline className='text-3xl ' /> Location <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                {/* Share Live Location:__________________________________ */}
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">Share Live Location</p>
                                        <small className="text-gray-500">
                                            Allow others to see your live location
                                        </small>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={shareLocation}
                                        onChange={(e) => setShareLocation(e.target.checked)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                </div>

                                {/* High Accuracy Mode:_____________________________________ */}
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">High Accuracy Mode</p>
                                        <small className="text-gray-500">
                                            Use GPS for more accurate location
                                        </small>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={highAccuracy}
                                        onChange={(e) => setHighAccuracy(e.target.checked)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                </div>

                                {/* Update Interval:____________________________________________ */}
                                <div className="py-3">
                                    <p className="font-medium mb-3">Update Interval</p>

                                    <div className="flex flex-col gap-3">

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="updateInterval"
                                                value={5000}
                                                checked={updateInterval === 5000}
                                                onChange={() => setUpdateInterval(5000)}
                                            />
                                            <span>Every 5 sec</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="updateInterval"
                                                value={15000}
                                                checked={updateInterval === 15000}
                                                onChange={() => setUpdateInterval(15000)}
                                            />
                                            <span>Every 15 sec</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="updateInterval"
                                                value={30000}
                                                checked={updateInterval === 30000}
                                                onChange={() => setUpdateInterval(30000)}
                                            />
                                            <span>Every 30 sec</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="updateInterval"
                                                value={60000}
                                                checked={updateInterval === 60000}
                                                onChange={() => setUpdateInterval(60000)}
                                            />
                                            <span>Every 1 min</span>
                                        </label>

                                    </div>
                                </div>

                                {/* Save Changes button:_______________________________________ */}
                                <div className="flex justify-end mt-5">
                                    <button
                                        onClick={handleSaveLocation}
                                        disabled={savingLocation}
                                        className="px-5 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {savingLocation ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>


                            </div>

                            {/* Friends & Permimssions,,,,,,,,,,,,,,,*/}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <FaUserFriends /> Friends & Permissions <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                <ul>
                                    {/* My_friend_lode__________________________ */}
                                    <li className='flex items-center gap-2 '>

                                        <div className="flex flex-col gap-3 w-full">

                                            <span className="font-semibold">
                                                → MY Friends ({friends.length})
                                            </span>

                                            {friends.length === 0 ? (
                                                <p className="text-sm text-gray-400 ml-5">
                                                    No friends yet.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-3 ml-5 border-l-2 ">

                                                    {friends.map((friend) => (
                                                        <div
                                                            key={friend.uid}
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                                                        >

                                                            {/* Friend Photo */}
                                                            {friend.photo ? (
                                                                <img
                                                                    src={friend.photo}
                                                                    alt={friend.name}
                                                                    className="w-11 h-11 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                                    {friend.name?.charAt(0)?.toUpperCase()}
                                                                </div>
                                                            )}

                                                            {/* Friend Info */}
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold  ">
                                                                    {friend.name}
                                                                </span>


                                                                <span className="text-xs text-gray-400">
                                                                    Connected Friend
                                                                </span>
                                                            </div>

                                                            <button
                                                                onClick={() => handleBlockUser(friend)}
                                                                className="ml-auto px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition"
                                                            >
                                                                Block
                                                            </button>

                                                        </div>
                                                    ))}

                                                </div>
                                            )}

                                        </div>
                                    </li>

                                    {/* Pendding_Friend___________________________ */}
                                    <li className='flex items-center gap-2'>


                                        <div className="flex flex-col gap-3 w-full">

                                            <span className="font-semibold">
                                                → Pending Requests ({pendingRequests.length})
                                            </span>

                                            {pendingRequests.length === 0 ? (
                                                <p className="text-sm text-gray-400 ml-5">
                                                    No pending requests.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-3 ml-5">

                                                    {pendingRequests.map((request) => (
                                                        <div
                                                            key={request.id}
                                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5"
                                                        >

                                                            {/* User info */}
                                                            <div className="flex items-center gap-3">

                                                                {request.fromPhoto ? (
                                                                    <img
                                                                        src={request.fromPhoto}
                                                                        alt={request.fromName}
                                                                        className="w-11 h-11 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                                        {request.fromName?.charAt(0)?.toUpperCase()}
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-black">
                                                                        {request.fromName || "Unknown User"}
                                                                    </span>

                                                                    <span className="text-xs text-gray-400">
                                                                        Wants to connect with you
                                                                    </span>
                                                                </div>

                                                            </div>

                                                            {/* Buttons */}
                                                            <div className="flex gap-2">

                                                                <button
                                                                    onClick={() => handleAcceptRequest(request)}
                                                                    className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm"
                                                                >
                                                                    Accept
                                                                </button>

                                                                <button
                                                                    onClick={() => handleRejectRequest(request)}
                                                                    className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
                                                                >
                                                                    Reject
                                                                </button>

                                                            </div>

                                                        </div>
                                                    ))}

                                                </div>
                                            )}

                                        </div>
                                    </li>
                                    {/* Block_friends____________________________ */}
                                    <li className='flex items-center gap-2'>


                                        <div className="flex flex-col gap-3 w-full">

                                            <span className="font-semibold">
                                                → Blocked Users ({blockedUsers.length})
                                            </span>

                                            {blockedUsers.length === 0 ? (
                                                <p className="text-sm text-gray-400 ml-5">
                                                    No blocked users.
                                                </p>
                                            ) : (
                                                <div className="flex flex-col gap-3 ml-5">

                                                    {blockedUsers.map((blockedUser) => (
                                                        <div
                                                            key={blockedUser.id}
                                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5"
                                                        >

                                                            <div className="flex items-center gap-3">

                                                                {blockedUser.userPhoto ? (
                                                                    <img
                                                                        src={blockedUser.userPhoto}
                                                                        alt={blockedUser.userName}
                                                                        className="w-11 h-11 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                                                                        {blockedUser.userName
                                                                            ?.charAt(0)
                                                                            ?.toUpperCase()}
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-white">
                                                                        {blockedUser.userName || "Unknown User"}
                                                                    </span>

                                                                    <span className="text-xs text-gray-400">
                                                                        Blocked user
                                                                    </span>
                                                                </div>

                                                            </div>

                                                            <button
                                                                onClick={() => handleUnblockUser(blockedUser)}
                                                                className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm"
                                                            >
                                                                Unblock
                                                            </button>

                                                        </div>
                                                    ))}

                                                </div>
                                            )}

                                        </div>
                                    </li>


                                </ul>

                            </div>

                            {/* Privacy ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <FcPrivacy /> Privacy <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                <ul className="space-y-3 mt-2">

                                    {/* 👥 ONLY FRIENDS */}
                                    <li className="flex items-center gap-2">

                                        <input
                                            type="radio"
                                            name="locationPrivacy"
                                            value="friends"
                                            checked={locationPrivacy === "friends"}
                                            onChange={(e) => {
                                                const newPrivacy = e.target.value;

                                                setLocationPrivacy(newPrivacy);
                                                saveLocationPrivacy(newPrivacy);
                                            }}

                                        />

                                        <label>
                                            Only Friends
                                        </label>

                                    </li>


                                    {/* 🎯 SELECTED FRIENDS */}
                                    <li className="flex items-center gap-2">

                                        <input
                                            type="radio"
                                            name="locationPrivacy"
                                            value="selected"
                                            checked={locationPrivacy === "selected"}
                                            onChange={(e) => {
                                                const newPrivacy = e.target.value;

                                                setLocationPrivacy(newPrivacy);
                                                saveLocationPrivacy(newPrivacy);
                                            }}

                                        />

                                        <label>
                                            Selected Friends
                                        </label>

                                    </li>


                                    {/* 🚫 NOBODY */}
                                    <li className="flex items-center gap-2">

                                        <input
                                            type="radio"
                                            name="locationPrivacy"
                                            value="nobody"
                                            checked={locationPrivacy === "nobody"}
                                            onChange={(e) => {
                                                const newPrivacy = e.target.value;

                                                setLocationPrivacy(newPrivacy);
                                                saveLocationPrivacy(newPrivacy);
                                            }}

                                        />

                                        <label>
                                            Nobody
                                        </label>

                                    </li>

                                </ul>

                                {locationPrivacy === "selected" && (

                                    <div className="mt-3 space-y-2 pb-2 border-l pl-2">

                                        
                                        <p className="font-semibold">
                                            Select friends who can see your location
                                        </p>

                                        {friends.length === 0 ? (

                                            <p className="text-sm text-gray-400">
                                                No friends available
                                            </p>

                                        ) : (

                                            friends.map((friend) => (

                                                <div
                                                    key={friend.uid}
                                                    className="flex items-center justify-between"
                                                >

                                                    <div className="flex items-center gap-2">

                                                        <img
                                                            src={
                                                                friend.photo ||
                                                                "/default-avatar.png"
                                                            }
                                                            alt={friend.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />

                                                        <span>
                                                            {friend.name}
                                                        </span>

                                                    </div>


                                                    <input
                                                        type="checkbox"

                                                        checked={
                                                            selectedFriends.includes(
                                                                friend.uid
                                                            )
                                                        }

                                                        onChange={() =>
                                                            handleSelectedFriend(friend)
                                                        }
                                                    />

                                                </div>

                                            ))

                                        )}
                                        

                                    </div>
                                )}

                                <div className="">
                                    <p>Hide my location</p>
                                    <p>Invisible Mode</p>
                                    <p>Show Last Seen</p>
                                </div>

                            </div>

                            {/* Notifications,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <IoMdNotifications /> Notifications <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span></h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot />Friend came online  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Friend went offline  </li>

                                </ul>

                            </div>

                            {/* Appearance ,,,,,,,,,,,,,,,,,,,,,,,,,,*/}

                            <div>
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'>
                                    🎨 Appearance
                                    <span className='font-bold text-3xl text-white hover:text-black pr-4'>
                                        #
                                    </span>
                                </h3>

                                <div className="flex flex-col gap-3 mt-3">

                                    {/* ☀️ Light Mode */}
                                    <button
                                        onClick={() => handleThemeChange("light")}
                                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${theme === "light"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <MdSunny className="text-xl" />

                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold">
                                                Light Mode
                                            </span>

                                            <span className="text-xs opacity-70">
                                                Use a bright appearance
                                            </span>
                                        </div>

                                        {theme === "light" && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </button>


                                    {/* 🌙 Dark Mode */}
                                    <button
                                        onClick={() => handleThemeChange("dark")}
                                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${theme === "dark"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <MdDarkMode className="text-xl" />

                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold">
                                                Dark Mode
                                            </span>

                                            <span className="text-xs opacity-70">
                                                Use a dark appearance
                                            </span>
                                        </div>

                                        {theme === "dark" && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </button>

                                </div>
                            </div>

                            {/* Map,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <FaMapMarkedAlt /> Map <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span></h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot />Google Map </li>
                                    <li className='flex items-center gap-2'> <BsDot />Satellite </li>
                                    <li className='flex items-center gap-2'> <BsDot />Terrain </li>


                                </ul>

                            </div>

                            {/* Security,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> 🔐 Security <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot />Google Accout </li>
                                    <li className='flex items-center gap-2'> <BsDot />Active Devices </li>
                                    <li className='flex items-center gap-2'> <BsDot />Logout All Devices </li>


                                </ul>

                            </div>

                            {/* About,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <FcAbout /> About <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span></h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot /> Version </li>
                                    <li className='flex items-center gap-2'> <BsDot /> Contact Support </li>
                                    <li className='flex items-center gap-2'> <BsDot /> Report Bug </li>
                                    <li className='flex items-center gap-2'> <BsDot /> Rate App </li>
                                    <li className='flex items-center gap-2'> <BsDot /> Privacy Policy </li>


                                </ul>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    )
}

export default Setting
