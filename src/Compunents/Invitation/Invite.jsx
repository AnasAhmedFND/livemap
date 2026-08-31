"use client";

import React, { useState } from "react";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";


const Invite = ({ onClose }) => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSendInvitation = async () => {

    if (!email.trim()) {
      alert("Please enter your friend's email.");
      return;
    }

    if (!auth.currentUser) {
      alert("User is not logged in.");
      return;
    }

    setLoading(true);

    try {

      const user = auth.currentUser;

      await addDoc(collection(db, "invitations"), {

        fromUid: user.uid,

        fromName: user.displayName,

        fromPhoto: user.photoURL,

        toEmail: email.trim(),

        status: "pending",

        createdAt: serverTimestamp(),

      });

      alert("Invitation sent successfully! ✅");

      setEmail("");

      onClose();

    } catch (error) {

      console.error("Invitation Error:", error);

      alert("Failed to send invitation.");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center">

      <div className="relative w-[500px] bg-white text-black rounded-2xl py-10 px-8 shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer"
        >
          <RxCross1 />
        </button>


        {/* Header */}
        <div className="flex items-center justify-center gap-2">

          <MdOutlineMarkEmailRead className="text-blue-500 text-2xl" />

          <h3 className="font-bold text-xl">
            Invite People
          </h3>

        </div>


        {/* Description */}
        <p className="mt-5 text-center text-gray-600">

          Add people you care about <br />

          Share your live location with <br />

          trusted friends & family.

        </p>


        {/* Email */}
        <input
          className="mt-6 border rounded-xl py-3 px-4 w-full outline-none"
          type="email"
          placeholder="Enter your friend's email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        {/* Send Invitation */}
        <button
          onClick={handleSendInvitation}
          disabled={loading}
          className="bg-blue-500 text-white rounded-xl cursor-pointer w-full py-3 mt-5 font-semibold"
        >

          {loading ? "Sending..." : "Send Invitation"}

        </button>


        {/* OR */}
        <p className="mt-4 text-center text-gray-400">
          ───────── OR ─────────
        </p>


        {/* Invite Link */}
        <button
          className="mt-3 w-full text-blue-500 cursor-pointer"
        >
          🔗 Copy Invite Link
        </button>

      </div>

    </div>

  );
};

export default Invite;