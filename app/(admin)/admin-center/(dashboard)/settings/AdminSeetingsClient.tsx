import { IoIosNotificationsOutline } from "react-icons/io"


const AdminSettingsClient: React.FC = () => {
    return (
        <div>
            <h1 className='text-3xl'>Settings</h1>
            <p className='my-3 text-[#797979]'>Manage your account settings and preferences</p>

            <section className="ring-1 ring-black/10 p-5 rounded">
                <div className="flex gap-3">
                    <IoIosNotificationsOutline size={24} color='155DFC' />
                    <div className="">
                        <h3 className='font-semibold text-xl'>Notifications</h3>
                        <p className="text-[#797979]">Manage your notification preferences</p>
                    </div>
                </div>
                <div className="my-6">
                    <div className="flex justify-between border-b border-gray-400 my-4 pb-4">
                        <div className="">
                            <h6 className="font-semibold">New Job Alerts</h6>
                            <p className="text-[#797979]">Get notified when new jobs matching your profile are posted</p>
                        </div>
                        <input className="" type="checkbox" name="" id="" />
                    </div>
                    <div className="flex justify-between my-4">
                        <div className="">
                            <h6 className="font-semibold">Newsletter</h6>
                            <p className="text-[#797979]">Receive weekly job market insights and career tips</p>
                        </div>
                        <input type="checkbox" name="" id="" />
                    </div>
                </div>
            </section>

            <section>

            </section>
        </div>
    )
}

export default AdminSettingsClient