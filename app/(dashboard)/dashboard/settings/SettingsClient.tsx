

const SettingsClient: React.FC = () => {
    return (
        <div>
            <h1 className='text-3xl'>Settings</h1>
            <p className='my-3'>Manage your account settings and preferences</p>

            <section className="ring-1 ring-black/10 p-5 rounded">
                <h3 className='font-semibold text-2xl'>Notification</h3>
                <p>Manage your notification preferences</p>
                <div className="">
                    <div className="flex justify-between border-b border-gray-400">
                        <div className="">
                            <h6 className="font-semibold">New Job Alerts</h6>
                            <p>Get notified when new jobs matching your profile are posted</p>
                        </div>
                        <input className="" type="checkbox" name="" id="" />
                    </div>
                    <div className="flex justify-between">
                        <div className="">
                            <h6 className="font-semibold">Newsletter</h6>
                            <p>Receive weekly job market insights and career tips</p>
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

export default SettingsClient