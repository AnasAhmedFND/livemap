"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Permission = () => {

    const router = useRouter();


    // 📍 Browser Geolocation API ব্যবহার করে user's current location-এর permission চাওয়া
    // User "Allow" করলে browser latitude ও longitude আমাদের কাছে পাঠায়

    const handleLocationPermission = () => {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                console.log("Location permission allowed");

                console.log("Latitude:", position.coords.latitude);
                console.log("Longitude:", position.coords.longitude);


                // Location permission সফল হলে LiveMap page-এ নিয়ে যাবে
                router.push("/home_p");

            },

            (error) => {

                console.log(
                    "Location permission denied/error:",
                    error
                );

            }

        );

    };


    return (
        <section className='container mx-auto border bg-[#031627] flex justify-center py-20 h-screen'>

            <div className="bg-white w-1/2 text-center py-10 flex flex-col items-center">

                <h4 className='font-bold text-xl'>
                    Location permission
                </h4>

                <p>
                    📍 Allow Location Access
                </p>


                <div className='text-start mt-4'>

                    {/* Allow Location */}
                    <div>

                        <input
                            type="radio"
                            id="location-allow"
                            name="location_permission"
                            onChange={handleLocationPermission}
                        />

                        <label htmlFor="location-allow">
                            {" "}Allow While Using App
                        </label>

                    </div>


                    {/* Not Now */}
                    <div>

                        <input
                            type="radio"
                            id="location-not"
                            name="location_permission"
                        />

                        <label htmlFor="location-not">
                            {" "}Not Now
                        </label>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default Permission;