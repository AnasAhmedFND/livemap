import React from 'react'

const InvitationCard = () => {
    return (
        <section className='p-4 shadow-2xl mt-2 border text-center'>
            <div className="w-full ">
                <h3>🔔 New Invitation</h3>
                <div className="flex gap-2 mt-1  ">
                    <img className='w-10 h-10 rounded-full  ' src="./live/my/Rifa_s(2).jpeg" alt="woman" />
                    <div className="text-start ">
                        <p className='font-bold  '>Rifa</p>
                        <p>Wants to connect with you</p>

                    </div>

                </div>

                <div className="flex justify-between mt-2 ">
                    <button className='border px-2 py-1 rounded-lg cursor-pointer ' >Decline</button>
                    <button className='border px-2 py-1 rounded-lg cursor-pointer ' >Accept</button>

                </div>

            </div>
        </section>
    )
}

export default InvitationCard
