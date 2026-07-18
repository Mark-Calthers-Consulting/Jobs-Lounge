import { IoIosNotificationsOutline } from "react-icons/io"


const SettingsClient: React.FC = () => {
    return (
        <div>
            <h1 className='text-3xl'>Settings</h1>
            <p className='my-3 text-gray-600'>Manage your account settings and preferences</p>

            <section className="ring-1 ring-black/10 p-5 rounded">
                <div className="flex gap-3">
                    <IoIosNotificationsOutline aria-hidden="true" size={24} color='#155DFC' />
                    <div className="">
                        <h2 className='font-semibold text-xl'>Notifications</h2>
                        <p className="text-gray-600">Manage your notification preferences</p>
                    </div>
                </div>
                <div className="my-6">
                    <div className="flex justify-between border-b border-gray-400 my-4 pb-4">
                        <div className="">
                            <label htmlFor="candidate-job-alerts" className="font-semibold">New job alerts</label>
                            <p id="candidate-job-alerts-description" className="text-gray-600">Get notified when new jobs matching your profile are posted</p>
                        </div>
                        <input type="checkbox" name="jobAlerts" id="candidate-job-alerts" aria-describedby="candidate-job-alerts-description" className="h-5 w-5" />
                    </div>
                    <div className="flex justify-between my-4">
                        <div className="">
                            <label htmlFor="candidate-newsletter" className="font-semibold">Newsletter</label>
                            <p id="candidate-newsletter-description" className="text-gray-600">Receive weekly job market insights and career tips</p>
                        </div>
                        <input type="checkbox" name="newsletter" id="candidate-newsletter" aria-describedby="candidate-newsletter-description" className="h-5 w-5" />
                    </div>
                </div>
            </section>

            <section>

            </section>
        </div>
    )
}

export default SettingsClient
