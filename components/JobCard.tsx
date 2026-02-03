const JobCard = ({ job }) => {
  return (
    <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center gap-4">
        {job.company?.logo && (
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="h-14 w-14 rounded-md object-contain border"
          />
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {job.title}
          </h2>
          <p className="text-sm text-gray-500">
            {job.company?.name}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          {job.jobType}
        </span>

        <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
          {job.workMode}
        </span>

        <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
          {job.level} Level
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
          {job.location}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
        {job.description}
      </p>

      {/* Responsibilities */}
      {job.responsibilities?.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Key Responsibilities
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {job.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Benefits
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {job.benefits.map((benefit, index) => (
              <li key={index}>• {benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Posted by <strong>{job.postedBy?.name}</strong>
        </span>

        <a
          href={job.applyLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default JobCard;
