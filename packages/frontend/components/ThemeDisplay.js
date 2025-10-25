'use client';

export default function ThemeDisplay({ theme }) {
  if (!theme) return null;

  const { theme: themeName, score, allThemes } = theme;

  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Current Theme</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-semibold capitalize">{themeName}</span>
          <span className="text-sm text-gray-500">Score: {score.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(score * 20, 100)}%` }}
          ></div>
        </div>
      </div>

      {allThemes && Object.keys(allThemes).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            All Active Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(allThemes).map(([name, value]) => (
              <span
                key={name}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {name}: {value.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
