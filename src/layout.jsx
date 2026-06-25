import * as d3 from "d3";

export const footballClubs = ["SCP", "SLBEN", "SCB", "FCP"];

export const gridValues = [-50, 0, 50, 100, 150, 200, 250];

export function getRadiusScale(data) {
  const maxCap = d3.max(data, (d) => d.mktCap) ?? 1;

  return d3.scaleSqrt().domain([0, maxCap]).range([8, 65]);
}

export function getColor(label) {
  return footballClubs.includes(label) ? "#4f7d00" : "#6e11eb";
}

export function buildPackLayout(data, width, height, radiusScale) {
  const hierarchy = d3
    .hierarchy({
      children: data.map((d) => ({
        label: d.label,
        value: radiusScale(d.mktCap) ** 2,
      })),
    })
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const root = d3.pack().size([width, height]).padding(4)(hierarchy);

  return root
    .descendants()
    .slice(1)
    .map((node) => ({
      id: node.data.label,
      x: node.x,
      y: node.y,
      r: node.r,
    }));
}

export function buildGroupedLayout(data, width, height, radiusScale) {
  const nodes = data.map((d) => ({
    id: d.label,
    r: radiusScale(d.mktCap),
    group: footballClubs.includes(d.label) ? "football" : "other",
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "x",
      d3
        .forceX((d) => (d.group === "football" ? width * 0.3 : width * 0.7))
        .strength(0.15),
    )
    .force("y", d3.forceY(height / 2).strength(0.15))
    .force(
      "collide",
      d3.forceCollide((d) => d.r + 2),
    );

  for (let i = 0; i < 300; i++) simulation.tick();

  simulation.stop();

  return nodes;
}

export function buildSwarmLayout(data, width, height, radiusScale) {
  const extent = d3.extent(data, (d) => d.mktCapPerf1Y) ?? [0, 1];

  const safeExtent =
    extent[0] === extent[1] ? [extent[0] - 1, extent[1] + 1] : extent;

  const xScale = d3
    .scaleLinear()
    .domain(safeExtent)
    .range([80, width - 80]);

  const nodes = data.map((d) => ({
    id: d.label,
    value: d.mktCapPerf1Y,
    r: radiusScale(d.mktCap),
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .force("x", d3.forceX((d) => xScale(d.value)).strength(1))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .force(
      "collide",
      d3.forceCollide((d) => d.r + 2),
    );

  for (let i = 0; i < 300; i++) simulation.tick();

  simulation.stop();

  return { nodes, xScale };
}
