"use client";

import React from 'react'
import {
    doc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp
} from "firebase/firestore";

import { db, auth } from "@/firebase/firebaseConfig";


const InvitationCard = ({ invitation }) => {

    const handleAccept = async () => {
        try {

            const currentUser = auth.currentUser;

            if (!currentUser) {
                console.log("User is not logged in");
                return;
            }

            // 1. Invitation accepted
            await updateDoc(
                doc(db, "invitations", invitation.id),
                {
                    status: "accepted"
                }
            );

            // 2. Create connection
            await addDoc(collection(db, "connections"), {

                user1Uid: invitation.fromUid,
                user1Name: invitation.fromName,
                user1Photo: invitation.fromPhoto,

                user2Uid: currentUser.uid,
                user2Name: currentUser.displayName,
                user2Photo: currentUser.photoURL,

                createdAt: serverTimestamp()

            });

            console.log("Connection created successfully ✅");

        } catch (error) {

            console.error("Accept Error:", error);

        }
    };
    return (
        <section className='p-4 shadow-2xl mt-2 border text-center'>

            <div className="w-full">

                <h3>🔔 New Invitation</h3>

                <div className="flex gap-2 mt-1">

                    <img
                        className='w-10 h-10 rounded-full'
                        src={invitation?.fromPhoto}
                        alt={invitation?.fromName || "User"}
                    />

                    <div className="text-start">

                        <p className='font-bold'>
                            {invitation?.fromName}
                        </p>

                        <p>
                            Wants to connect with you
                        </p>

                    </div>

                </div>

                <div className="flex justify-between mt-2">

                    <button
                        className='border px-2 py-1 rounded-lg cursor-pointer'
                    >
                        Decline
                    </button>

                    <button
                        onClick={handleAccept}
                        className='border px-2 py-1 rounded-lg cursor-pointer'
                    >
                        Accept
                    </button>

                </div>

            </div>

        </section>
    )
}

export default InvitationCard