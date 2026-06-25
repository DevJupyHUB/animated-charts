export function formatMarketCap(value) {
  if (value >= 1_000_000_000) {
    return `€${(value / 1_000_000_000).toFixed(2)}B`;
  }

  return `€${(value / 1_000_000).toFixed(2)}M`;
}

export function formatPerformance(value) {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}

export function Tooltip({ interactionData, layout }) {
  if (!interactionData) return null;

  const { xPos, yPos, data } = interactionData;

  return (
    <div
      className="
        absolute
        z-50
        min-w-40
        rounded-lg
        border
        border-gray-200
        bg-white
        text-sm
        p-4
        pointer-events-none
      "
      style={{
        left: xPos,
        top: yPos,
        transform: "translate(12px, -50%)",
      }}
    >
      <div className="mb-3">
        <div className="text-gray-500">{data.label}</div>

        <div className="font-bold leading-tight">{data.name}</div>
      </div>

      <div className="flex justify-between py-1">
        <span className="text-gray-500">Capital</span>

        <span className="text-right">{formatMarketCap(data.mktCap)}</span>
      </div>

      {layout === "group" && (
        <div className="flex justify-between gap-4 py-1">
          <span className="text-gray-500">Sector</span>

          <span className="text-right">{data.sector}</span>
        </div>
      )}

      {layout === "swarm" && (
        <>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Sector</span>
            <span className="text-right">{data.sector}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-gray-500">Performance</span>

            <span
              className={
                data.mktCapPerf1Y >= 0
                  ? "font-bold text-green-600"
                  : "font-bold text-red-600"
              }
            >
              {formatPerformance(data.mktCapPerf1Y)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
