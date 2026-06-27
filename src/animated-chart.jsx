import { useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { Typewriter } from "./type-writer";

import {
  footballClubs,
  gridValues,
  getRadiusScale,
  getColor,
  buildPackLayout,
  buildGroupedLayout,
  buildSwarmLayout,
} from "./layout";

export default function AnimatedChart({
  width,
  height,
  data,
  layout = "pack",
  setInteractionData,
}) {
  const companyCount = data.length;

  const totalMktCap = d3.sum(data, (d) => d.mktCap);
  const totalMktCapB = `${(totalMktCap / 1_000_000_000).toFixed(2)} B`;

  const footballCompanies = data.filter((d) => footballClubs.includes(d.label));

  const otherCompanies = data.filter((d) => !footballClubs.includes(d.label));

  const fcCount = footballCompanies.length;
  const otherCount = otherCompanies.length;

  const fcMktCap = d3.sum(footballCompanies, (d) => d.mktCap);
  const otherMktCap = d3.sum(otherCompanies, (d) => d.mktCap);

  const fcMktCapB = `${(fcMktCap / 1_000_000).toFixed(2)} M`;
  const otherMktCapB = `${(otherMktCap / 1_000_000_000).toFixed(2)} B`;

  const topGainer = useMemo(() => {
    if (!data?.length) return null;

    return data.reduce((a, b) =>
      (a.mktCapPerf1Y ?? -Infinity) > (b.mktCapPerf1Y ?? -Infinity) ? a : b,
    );
  }, [data]);

  const radiusScale = useMemo(() => getRadiusScale(data), [data]);

  const { nodes, xScale } = useMemo(() => {
    if (layout === "group") {
      return {
        nodes: buildGroupedLayout(data, width, height, radiusScale),
      };
    }

    if (layout === "swarm") {
      return buildSwarmLayout(data, width, height, radiusScale);
    }

    return {
      nodes: buildPackLayout(data, width, height, radiusScale),
    };
  }, [layout, data, width, height, radiusScale]);

  const nodesWithData = useMemo(() => {
    const lookup = new Map(data.map((d) => [d.label, d]));

    return nodes.map((node) => ({
      ...node,
      company: lookup.get(node.id),
    }));
  }, [nodes, data]);

  const companyName = topGainer?.name ?? "";
  const maxGrowth = topGainer?.mktCapPerf1Y ?? 0;

  const swarmBottom =
    layout === "swarm" ? (d3.max(nodesWithData, (d) => d.y + d.r) ?? 0) : 0;

  const swarmTop =
    layout === "swarm" ? (d3.min(nodesWithData, (d) => d.y - d.r) ?? 0) : 0;

  const labelY = swarmBottom + 20;

  const safeX = (value) => (xScale ? xScale(value) : 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center text-slate-200 text-lg mb-2">
        <motion.div
          key={layout}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.5,
          }}
        >
          {layout === "pack" && (
            <Typewriter
              text={`${companyCount} companies · €${totalMktCapB} total capital`}
            />
          )}

          {layout === "group" && (
            <Typewriter
              text={`${fcCount} football clubs · €${fcMktCapB} | ${otherCount} other companies · €${otherMktCapB}`}
            />
          )}

          {layout === "swarm" && (
            <Typewriter
              text={`${companyName} · ${maxGrowth.toFixed(2)}% growth`}
            />
          )}
        </motion.div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
      >
        <AnimatePresence mode="wait">
          {layout === "swarm" && xScale && (
            <motion.g
              key="swarm-axis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {gridValues.map((value) => (
                <line
                  key={value}
                  x1={safeX(value)}
                  x2={safeX(value)}
                  y1={swarmTop}
                  y2={swarmBottom}
                  stroke="#444"
                  strokeDasharray="3 3"
                />
              ))}

              {gridValues.map((value) => (
                <text
                  key={`label-${value}`}
                  x={safeX(value)}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {value}%
                </text>
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {nodesWithData.map((node) => {
          const baseColor = layout === "pack" ? "#6e11eb" : getColor(node.id);

          return (
            <motion.circle
              key={node.id}
              fill={baseColor}
              initial={false}
              animate={{
                cx: node.x,
                cy: node.y,
                r: node.r,
                fill: baseColor,
              }}
              whileHover={{
                fill: baseColor === "#6e11eb" ? "#8961f6" : "#84cc16",
              }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 20,
              }}
              onMouseMove={(e) => {
                if (!node.company) return;

                const rect =
                  e.currentTarget.ownerSVGElement.getBoundingClientRect();

                setInteractionData?.({
                  xPos: e.clientX - rect.left,
                  yPos: e.clientY - rect.top,
                  data: node.company,
                });
              }}
              onMouseLeave={() => setInteractionData?.(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {nodesWithData.map((node) => {
          const isFootball = footballClubs.includes(node.id);

          const fontSize = Math.min(Math.max(node.r / 3, 8), 18);

          if (!isFootball && node.r <= 18) return null;

          return (
            <motion.text
              key={`label-${node.id}`}
              fill="white"
              fontWeight={isFootball ? 700 : 600}
              pointerEvents="none"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              initial={false}
              animate={{
                x: node.x,
                y: node.y,
              }}
            >
              {node.id}
            </motion.text>
          );
        })}
      </svg>
    </div>
  );
}
