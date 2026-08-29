"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

import Link from 'next/link';
import React from 'react'
import { FcGoogle } from "react-icons/fc";

const Login = () => {

  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      console.log("User:", result.user);

      router.push("/permission");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };


  return (
    <section className='container mx-auto border bg-[#031627] flex justify-center py-20 h-screen '>

      <div className="bordr p-5 bg-white w-1/2 text-center flex flex-col justify-center py-10 ">
        <p className='font-bold '>Stay Connected with the People Who Matter Most. </p>
        <p>Share your live location securely with family and trusted friends. </p>

        {/* login_button...................................... */}
        
          <button className='mt-5 text-2xl font-bold   ' >Login.. </button>
      

        {/* continue_with_google_button....................... */}        
          <button
            onClick={handleGoogleLogin}
            className="flex items-center border py-2 text-center rounded-lg justify-center gap-2 mt-5 cursor-pointer w-full"
          >
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>
       


        <div className="  ">
          <p className='mt-2' >🔒 Your location is shared only with people you approve.</p>
          <p>📜 Privacy Policy</p>
          <p>📄 Terms of Service</p>

        </div>
      </div>

    </section>
  )
}

export default Login
