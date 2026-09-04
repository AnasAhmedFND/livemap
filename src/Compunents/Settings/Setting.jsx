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

// functional_import===================================================
// =======================================================================
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";


const Setting = () => {

    const [user, setUser] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photo, setPhoto] = useState("");

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


    return (
        <section className=' '>
            {/* Settings mother_div ...........................................*/}
            <div className="container mx-auto  flex   ">
                {/* left_div _________________________*/}
                <div className=" w-[30%] h-screen   ">
                    <h2 className='flex items-center gap-2  h-14 font-bold text-2xl px-2 shadow-xl fixed w-2xl border-b   ' ><AiTwotoneSetting className='text-4xl ' /> Settings </h2>

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
                    <div className=" h-14 shadow-xl flex  align-middle fixed  bg-white z-10  w-full border-b  ">
                        <input className=' px-4 outline-none text-xl w-full ' type="search" placeholder='Search..' />

                    </div>

                    {/* Settings_Details,,,,,,,,,,,,, */}
                    <div className="  w-full p-2 px-5 pb-10 overflow-y-auto mt-14  ">

                        <div className="   ">
                            <h2 className='flex items-center gap-2 text-4xl font-bold text-blue-500  ' ><AiTwotoneSetting /> Settings__ </h2>

                            {/* Profile,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            {/* =================================================
                                PROFILE
                                ================================================= */}

                            <div className="">

                                <div className="flex items-center justify-between mt-5">

                                    <h3 className="flex items-center gap-2 text-2xl font-bold text-blue-500">
                                        <CgProfile />
                                        Profile


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

                                            <p className="text-xl font-bold">
                                                {name || "User"}
                                            </p>

                                            <p className="text-gray-500">
                                                {email || "No email"}
                                            </p>

                                        </div>

                                    </div>


                                    {/* NAME */}

                                    <div className="mb-5">

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

                                    <div className="mb-5">

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

                                    <div className="mb-5">

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

                                    <div className="mb-5">

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
                                    <li className='flex items-center gap-2'> <BsDot />MY Friends  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Pending Requests  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Blocked Users  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Invite Friend  </li>

                                </ul>

                            </div>

                            {/* Privacy ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <FcPrivacy /> Privacy <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot />Only Friends  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Selected Friends </li>
                                    <li className='flex items-center gap-2'> <BsDot />Nobody </li>

                                </ul>
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
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> 🎨 Appearance <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span></h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot /><MdSunny /> Light </li>
                                    <li className='flex items-center gap-2'> <BsDot /><MdDarkMode /> Dark </li>

                                </ul>

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
