import { useState } from "react";
import data from "./data";
import AnimatedChart from "./animated-chart";
import { Tooltip } from "./tooltip";

const stages = [
  {
    value: 0,
    title: "Packed Bubble",
    text: "Have you ever wondered which Portuguese companies have the largest market capital?",
    layout: "pack",
  },
  {
    value: 1,
    title: "Grouped Bubble",
    text: "How many of them do you think are football clubs?",
    layout: "group",
  },
  {
    value: 2,
    title: "Beeswarm",
    text: "Which company has performed best in terms of market capital growth over the past year?",
    layout: "swarm",
  },
];

export default function App() {
  const [stage, setStage] = useState(0);
  const [interactionData, setInteractionData] = useState(null);

  return (
    <main className="bg-neutral-900 min-h-screen p-6">
      <div className="flex flex-wrap justify-center gap-3 mb-3 lg:mb-5">
        {stages.map((s) => (
          <button
            key={s.value}
            onClick={() => setStage(s.value)}
            className={`px-4 py-2 rounded transition-colors ${
              s.value === stage
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <p className="text-center text-slate-200 text-lg mb-3 lg:sm-6">
        {stages[stage].text}
      </p>

      <div className="relative w-full h-[60vh] lg:h-[80vh]">
        <AnimatedChart
          width={800}
          height={600}
          data={data}
          layout={stages[stage].layout}
          setInteractionData={setInteractionData}
        />

        <Tooltip
          interactionData={interactionData}
          layout={stages[stage].layout}
        />
      </div>
      <div className="text-center text-xs text-neutral-500 mt-4 h-6">
        <a
          href="https://tradingview.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-700"
        >
          Date: 21/07/2026 Data Source: https://tradingview.com
        </a>
      </div>
    </main>
  );
}
