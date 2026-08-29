"use client"
import React from 'react'
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

const Setting = () => {
    return (
        <section className=' '>
            {/* Settings mother_div ...........................................*/}
            <div className="container mx-auto  flex   ">
                {/* left_div _________________________*/}
                <div className=" w-[30%] h-screen   ">
                    <h2 className='flex items-center gap-2  h-14 font-bold text-2xl px-2 shadow-xl fixed w-2xl border   ' ><AiTwotoneSetting className='text-4xl ' /> Settings </h2>

                    {/* Options______________________ */}
                    <div className="p-2 pt-5 flex flex-col gap-3 shadow-2xl h-screen mt-14 fixed w-full border ">

                        {/* Profile,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer '> <CgProfile className='text-2xl ' /> Profile </h3>
                            {/* <ul>
                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>
                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>
                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>
                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>
                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>

                    
                         </ul> */}
                        </div>

                        {/* Location,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <IoLocationOutline className='text-2xl ' /> Location </h3>
                            {/* ul_items____________ */}
                            {/* <div className="">
                         <ul>
                            <li className='flex items-center gap-2'> <BsDot />Share Live Location ✅  </li>
                            <li className='flex items-center gap-2'> <BsDot />High Accuracy Mode  </li>
                            <li className='flex items-center gap-2'> <BsDot />Update Interval  </li>
                         </ul>
                         <ul>
                            <li className='flex items-center gap-2'> <BsDot />Every 5 sec  </li>
                            <li className='flex items-center gap-2'> <BsDot /> 15 sec  </li>
                            <li className='flex items-center gap-2'> <BsDot /> 30 sec  </li>
                            <li className='flex items-center gap-2'> <BsDot /> 1 min  </li>


                         </ul>

                         </div> */}

                        </div>

                        {/* Friends & Permimssions,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <FaUserFriends className='text-2xl ' /> Friends & Permissions </h3>
                            {/* <ul>
                            <li className='flex items-center gap-2'> <BsDot />MY Friends  </li>
                            <li className='flex items-center gap-2'> <BsDot />Pending Requests  </li>
                            <li className='flex items-center gap-2'> <BsDot />Blocked Users  </li>
                            <li className='flex items-center gap-2'> <BsDot />Invite Friend  </li>
                            
                         </ul> */}

                        </div>

                        {/* Privacy ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <FcPrivacy className='text-2xl ' /> Privacy </h3>
                            {/* <ul>
                            <li className='flex items-center gap-2'> <BsDot />Only Friends  </li>
                            <li className='flex items-center gap-2'> <BsDot />Selected Friends </li>
                            <li className='flex items-center gap-2'> <BsDot />Nobody </li>



                         </ul> */}
                            {/* <div className="">
                            <p>Hide my location</p>
                            <p>Invisible Mode</p>
                            <p>Show Last Seen</p>
                         </div> */}

                        </div>

                        {/* Notifications,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <IoMdNotifications className='text-2xl ' /> Notifications </h3>
                            {/* <ul>
                             <li className='flex items-center gap-2'> <BsDot />Friend came online  </li>
                              <li className='flex items-center gap-2'> <BsDot />Friend went offline  </li>

                         </ul> */}

                        </div>

                        {/* Appearance ,,,,,,,,,,,,,,,,,,,,,,,,,,*/}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> 🎨 Appearance </h3>
                            {/* <ul>
                             <li className='flex items-center gap-2'> <BsDot /><MdSunny /> Light </li>
                             <li className='flex items-center gap-2'> <BsDot /><MdDarkMode /> Dark </li>

                         </ul> */}

                        </div>

                        {/* Map,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <FaMapMarkedAlt className='text-2xl ' /> Map </h3>
                            {/* <ul>
                            <li className='flex items-center gap-2'> <BsDot />Google Map </li>
                            <li className='flex items-center gap-2'> <BsDot />Satellite </li>
                            <li className='flex items-center gap-2'> <BsDot />Terrain </li>


                         </ul> */}

                        </div>

                        {/* Security,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> 🔐 Security </h3>
                            {/* <ul>
                            <li className='flex items-center gap-2'> <BsDot />Google Accout </li>
                            <li className='flex items-center gap-2'> <BsDot />Active Devices </li>
                            <li className='flex items-center gap-2'> <BsDot />Logout All Devices </li>


                         </ul> */}

                        </div>

                        {/* About,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                        <div className="">
                            <h3 className='flex items-center gap-2 font-bold cursor-pointer'> <FcAbout className='text-2xl ' /> About </h3>
                            {/* <ul>
                            <li className='flex items-center gap-2'> <BsDot /> Version </li>
                            <li className='flex items-center gap-2'> <BsDot /> Contact Support </li>
                            <li className='flex items-center gap-2'> <BsDot /> Report Bug </li>
                            <li className='flex items-center gap-2'> <BsDot /> Rate App </li>
                            <li className='flex items-center gap-2'> <BsDot /> Privacy Policy </li>


                         </ul> */}

                        </div>

                    </div>


                </div>

                {/* Right_div_________________________ */}
                <div className=" w-[70%] border-l ">
                    {/* Search ,,,,,,,,,,,,,,,,,,,,,, */}
                    <div className=" h-14 shadow-xl flex  align-middle fixed  bg-white z-10  w-full ">
                        <input className=' px-4 outline-none text-xl w-full ' type="search" placeholder='Search..' />

                    </div>

                    {/* Settings_Details,,,,,,,,,,,,, */}
                    <div className="  w-full p-2 px-5 pb-10 overflow-y-auto mt-14  ">

                        <div className="   ">
                            <h2 className='flex items-center gap-2 text-4xl font-bold text-blue-500  ' ><AiTwotoneSetting /> Settings__ </h2>

                            {/* Profile,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5   '> <CgProfile /> Profile <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                <ul>
                                    <li className='flex items-center gap-2'> <BsDot />Profile Photo  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Name  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Email  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Phone  </li>
                                    <li className='flex items-center gap-2'> <BsDot />Bio  </li>


                                </ul>
                            </div>

                            {/* Location,,,,,,,,,,,,,,,,,,,,,,,,,,, */}
                            <div className="">
                                <h3 className='flex items-center gap-2 text-2xl font-bold text-blue-500 mt-5'> <IoLocationOutline /> Location <span className='font-bold text-3xl text-white  hover:text-black pr-4 '>#</span> </h3>
                                {/* ul_items____________ */}
                                <div className="">
                                    <ul>
                                        <li className='flex items-center gap-2'> <BsDot />Share Live Location ✅  </li>
                                        <li className='flex items-center gap-2'> <BsDot />High Accuracy Mode  </li>
                                        <li className='flex items-center gap-2'> <BsDot />Update Interval  </li>
                                    </ul>
                                    <ul className='pl-5 '>
                                        <li className="flex items-center ">
                                            <input className='w-20 ' type="radio" />
                                            <p>Every 5 sec</p>
                                        </li>

                                        <li className="flex items-center ">
                                            <input className='w-20 ' type="radio" />
                                            <p className='flex items-center'> 15 sec  </p>
                                        </li>

                                        <li className="flex items-center ">
                                            <input className='w-20 ' type="radio" />
                                            <p className='flex items-center '>30 sec  </p>
                                        </li>

                                        <li className="flex items-center ">
                                            <input className='w-20 ' type="radio" />
                                            <p className='flex items-center '> 1 min  </p>
                                        </li>             
                                       

                                    </ul>

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
