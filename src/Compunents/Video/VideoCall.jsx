"use client";

import { useState, useEffect, useRef } from "react";

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/Firebase/firebaseConfig";

export default function VideoCall({ myId, friendId, friendName }) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [callId, setCallId] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");

  // ==============================
  // Camera + Microphone
  // ==============================

  const getMedia = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  // ==============================
  // Create WebRTC Connection
  // ==============================

  const createPeer = () => {

    const peer = new RTCPeerConnection({

      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],

    });

    peerRef.current = peer;

    peer.ontrack = (event) => {

      if (remoteVideoRef.current) {

        remoteVideoRef.current.srcObject =
          event.streams[0];

      }

    };

    return peer;
  };

  // ==============================
  // 📞 Call Friend
  // ==============================

  const startCall = async () => {

    try {

      if (!myId || !friendId) {

        alert("User ID missing!");

        return;

      }

      setCallStatus("calling");

      const stream = await getMedia();

      const peer = createPeer();

      stream.getTracks().forEach((track) => {

        peer.addTrack(track, stream);

      });

      // Create Firebase call document

      const callDoc = await addDoc(
        collection(db, "videoCalls"),
        {
          callerId: myId,
          calleeId: friendId,
          status: "calling",
          createdAt: Date.now(),
        }
      );

      setCallId(callDoc.id);

      const callerCandidates = collection(
        db,
        "videoCalls",
        callDoc.id,
        "callerCandidates"
      );

      const calleeCandidates = collection(
        db,
        "videoCalls",
        callDoc.id,
        "calleeCandidates"
      );

      // Send ICE candidates

      peer.onicecandidate = async (event) => {

        if (event.candidate) {

          await addDoc(
            callerCandidates,
            event.candidate.toJSON()
          );

        }

      };

      // Create offer

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      await updateDoc(
        doc(db, "videoCalls", callDoc.id),
        {
          offer: {
            type: offer.type,
            sdp: offer.sdp,
          },
        }
      );

      // Listen for friend's answer

      onSnapshot(callDoc, async (snapshot) => {

        const data = snapshot.data();

        if (
          data?.answer &&
          !peer.currentRemoteDescription
        ) {

          await peer.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );

          setCallStatus("connected");

        }

        if (data?.status === "ended") {

          stopCall();

        }

      });

      // Receive friend's ICE candidates

      onSnapshot(calleeCandidates, (snapshot) => {

        snapshot.docChanges().forEach(async (change) => {

          if (change.type === "added") {

            await peer.addIceCandidate(
              new RTCIceCandidate(change.doc.data())
            );

          }

        });

      });

    } catch (error) {

      console.error("Call Error:", error);

      alert("Could not start video call.");

      stopCall();

    }

  };

  // ==============================
  // Incoming Call Listener
  // ==============================

  useEffect(() => {

    if (!myId) return;

    const q = query(
      collection(db, "videoCalls"),
      where("calleeId", "==", myId),
      where("status", "==", "calling")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      snapshot.forEach((document) => {

        setIncomingCall({
          id: document.id,
          ...document.data(),
        });

      });

    });

    return () => unsubscribe();

  }, [myId]);

  // ==============================
  // Accept Call
  // ==============================

  const acceptCall = async () => {

    try {

      const id = incomingCall.id;

      setCallId(id);

      setCallStatus("connecting");

      const stream = await getMedia();

      const peer = createPeer();

      stream.getTracks().forEach((track) => {

        peer.addTrack(track, stream);

      });

      const callDoc = doc(db, "videoCalls", id);

      const callerCandidates = collection(
        db,
        "videoCalls",
        id,
        "callerCandidates"
      );

      const calleeCandidates = collection(
        db,
        "videoCalls",
        id,
        "calleeCandidates"
      );

      // Send our ICE candidates

      peer.onicecandidate = async (event) => {

        if (event.candidate) {

          await addDoc(
            calleeCandidates,
            event.candidate.toJSON()
          );

        }

      };

      // Get caller offer

      const callSnapshot = await new Promise((resolve) => {

        const unsubscribe = onSnapshot(callDoc, (snapshot) => {

          if (snapshot.data()?.offer) {

            unsubscribe();

            resolve(snapshot);

          }

        });

      });

      const offer = callSnapshot.data().offer;

      await peer.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Create answer

      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      await updateDoc(callDoc, {

        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },

        status: "connected",

      });

      // Receive caller candidates

      onSnapshot(callerCandidates, (snapshot) => {

        snapshot.docChanges().forEach(async (change) => {

          if (change.type === "added") {

            await peer.addIceCandidate(
              new RTCIceCandidate(change.doc.data())
            );

          }

        });

      });

      setIncomingCall(null);

      setCallStatus("connected");

    } catch (error) {

      console.error("Accept Call Error:", error);

      alert("Could not accept call.");

      stopCall();

    }

  };

  // ==============================
  // End Call
  // ==============================

  const stopCall = async () => {

    // Stop Camera + Microphone

    streamRef.current?.getTracks().forEach((track) => {

      track.stop();

    });

    streamRef.current = null;

    // Close WebRTC

    peerRef.current?.close();

    peerRef.current = null;

    // Update Firebase

    if (callId) {

      try {

        await updateDoc(
          doc(db, "videoCalls", callId),
          {
            status: "ended",
          }
        );

      } catch (error) {

        console.log(error);

      }

    }

    if (localVideoRef.current) {

      localVideoRef.current.srcObject = null;

    }

    if (remoteVideoRef.current) {

      remoteVideoRef.current.srcObject = null;

    }

    setCallId(null);

    setIncomingCall(null);

    setCallStatus("idle");

  };

  // ==============================
  // UI
  // ==============================

  return (

    <div className="p-3">

      {/* Incoming Call */}

      {incomingCall && callStatus === "idle" && (

        <div className="bg-green-100 p-4 rounded-xl mb-3">

          <p className="font-bold">

            📞 Incoming Video Call

          </p>

          <button
            onClick={acceptCall}
            className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2"
          >

            Accept

          </button>

        </div>

      )}

      {/* Call Button */}

      {callStatus === "idle" && !incomingCall && (

        <button
          onClick={startCall}
          className="bg-blue-600 text-white p-2 rounded-lg text-[10px] "
        >

          📹 Video Call

        </button>

      )}

      {/* Video Screens */}

      {callStatus !== "idle" && (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

          {/* My Video */}

          <div>

            <p className="text-sm mb-1">You</p>

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-xl bg-black"
            />

          </div>

          {/* Friend Video */}

          <div>

            <p className="text-sm mb-1">{friendName || "Friend"}</p>

            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl bg-black"
            />

          </div>

        </div>

      )}

      {/* Call Status */}

      {callStatus !== "idle" && (

        <div className="mt-3">

          <p className="mb-2">

            Status: {callStatus}

          </p>

          <button
            onClick={stopCall}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >

            ❌ End Call

          </button>

        </div>

      )}

    </div>

  );

}