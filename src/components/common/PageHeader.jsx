
export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}