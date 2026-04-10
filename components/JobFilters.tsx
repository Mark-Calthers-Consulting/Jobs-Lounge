type FilterData = {
  datePosted: string
  level: string[]
}

type JobFiltersProps = {
  filterData: FilterData
  setFilterData: React.Dispatch<React.SetStateAction<FilterData>>
}

const JobFilters: React.FC<JobFiltersProps> = ({ filterData, setFilterData }) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target

    setFilterData(prev => {
      if (name === "level") {
        return {
          ...prev,
          level: checked
            ? [...prev.level, value]
            : prev.level.filter(v => v !== value)
        }
      }

      return {
        ...prev,
        [name]: value
      }
    })
  }

  const resetFilters = () => {
    setFilterData({
      datePosted: "",
      level: []
    })
  }

  return (
    <section className="shadow p-6 space-y-4">
      <h6 className="font-semibold text-xl">Filters</h6>

      <fieldset>
        <legend>Date Posted</legend>
        <label className="flex items-center gap-2">
          <input
            onChange={handleFilterChange}
            checked={filterData.datePosted === "anytime"}
            type="radio"
            name="datePosted"
            value="anytime"
          />
          Anytime
        </label>
        <label className="flex items-center gap-2">
          <input
            onChange={handleFilterChange}
            checked={filterData.datePosted === "24h"}
            type="radio"
            name="datePosted"
            value="24h"
          />
          Last 24 hours
        </label>
        <label className="flex items-center gap-2">
          <input
            onChange={handleFilterChange}
            checked={filterData.datePosted === "7d"}
            type="radio"
            name="datePosted"
            value="7d"
          />
          Last 7 days
        </label>
        <label className="flex items-center gap-2">
          <input
            onChange={handleFilterChange}
            checked={filterData.datePosted === "30d"}
            type="radio"
            name="datePosted"
            value="30d"
          />
          Last 30 days
        </label>
      </fieldset>

      <fieldset>
        <legend>Job level</legend>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Entry")} type="checkbox" name="level" value="Entry" /> Entry</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Junior")} type="checkbox" name="level" value="Junior" /> Junior</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Mid")} type="checkbox" name="level" value="Mid" /> Mid</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Senior")} type="checkbox" name="level" value="Senior" /> Senior</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Lead")} type="checkbox" name="level" value="Lead" /> Lead</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Manager")} type="checkbox" name="level" value="Manager" /> Manager</label>
        <label className="flex items-center gap-2"><input onChange={handleFilterChange} checked={filterData.level.includes("Executive")} type="checkbox" name="level" value="Executive" /> Executive</label>
      </fieldset>

      <button onClick={resetFilters} className="text-sm px-2 cursor-pointer py-1 border rounded">
        Reset Filters
      </button>
    </section>
  )
}

export default JobFilters