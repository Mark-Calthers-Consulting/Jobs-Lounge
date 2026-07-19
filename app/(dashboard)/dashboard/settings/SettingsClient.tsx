import { IoIosNotificationsOutline } from "react-icons/io"
import NotificationSettings from '@/components/NotificationSettings'


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
                <NotificationSettings idPrefix="candidate-notification" />
            </section>

            <section>

            </section>
        </div>
    )
}

export default SettingsClient
