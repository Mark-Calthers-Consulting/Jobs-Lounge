
const JobFilters: React.FC = () => {
    return (
        <section className="shadow p-6 space-y-4">
            <h6 className="font-semibold text-xl">Filters</h6>
            <fieldset className="">
                <legend>Date Posted</legend>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="anytime" />
                    Anytime
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="24h" />
                    Last 24 hours
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="7d" />
                    Last 7 days
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="30d" />
                    Last 30 days
                </label>
            </fieldset>
            <fieldset className="">
                <legend>Employment Type</legend>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="fulltime" />
                    Full Time
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="contract" />
                    Contract
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="parttime" />
                    Part Time
                </label>

                <label className="flex items-center gap-2">
                    <input type="radio" name="datePosted" value="internship" />
                    Internship
                </label>
            </fieldset>
        </section>
    )
}

export default JobFilters
