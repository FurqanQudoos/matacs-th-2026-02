
const fs = require("fs");
const path = require("path");

const BUDGET = 260000;
const MAX_WEEKS = 16;
const MAX_EXPERIENCE = 14;

// Sample data transcribed from the fictional assessment proposals.
const proposals = [
  {
    id: "A",
    licence: true,
    wsib: true,
    insurance: true,
    experience: 14,
    price: 238000,
    weeks: 12,
    panelWarranty: 25,
    workmanshipWarranty: 10,
    lead: true,
    crew: true,
    safety: true,
    monitoring: true
  },
  {
    id: "B",
    licence: false,
    wsib: true,
    insurance: true,
    experience: 6,
    price: 189500,
    weeks: 10,
    panelWarranty: 25,
    workmanshipWarranty: 5,
    lead: true,
    crew: false,
    safety: false,
    monitoring: false
  },
  {
    id: "C",
    licence: true,
    wsib: true,
    insurance: true,
    experience: 9,
    price: 244000,
    weeks: 14,
    panelWarranty: 25,
    workmanshipWarranty: 10,
    lead: true,
    crew: true,
    safety: false,
    monitoring: false
  },
  {
    id: "D",
    licence: true,
    wsib: true,
    insurance: true,
    experience: 11,
    price: 231000,
    weeks: null,
    panelWarranty: 25,
    workmanshipWarranty: 10,
    lead: true,
    crew: false,
    safety: true,
    monitoring: false
  },
  {
    id: "E",
    licence: true,
    wsib: true,
    insurance: true,
    experience: 8,
    price: 242500,
    weeks: 13,
    panelWarranty: 25,
    workmanshipWarranty: 12,
    lead: true,
    crew: true,
    safety: true,
    monitoring: true
  }
];

function checkMandatory(p) {
  return p.licence && p.wsib && p.insurance;
}

function scoreProposal(p, lowestPrice, shortestWeeks) {
  const experience =
    (p.experience / MAX_EXPERIENCE) * 100;

  const price =
    (lowestPrice / p.price) * 100;

  const timeline =
    (shortestWeeks / p.weeks) * 100;

  const warranty = Math.min(
    100,
    40 * (p.panelWarranty / 25) +
    60 * (p.workmanshipWarranty / 12)
  );

  const teamItems = [
    p.lead,
    p.crew,
    p.safety,
    p.monitoring
  ];

  const team =
    (teamItems.filter(Boolean).length / 4) * 100;

  const total =
    0.30 * experience +
    0.25 * price +
    0.15 * timeline +
    0.15 * warranty +
    0.15 * team;

  return Number(total.toFixed(2));
}

function main() {
  // Validate mandatory requirements first.
  const mandatoryPass = proposals.filter(
    checkMandatory
  );

  // This benchmark includes all mandatory-pass proposals,
  // including proposals flagged for missing weighted data.
  const lowestPrice = Math.min(
    ...mandatoryPass.map(p => p.price)
  );

  const knownTimelines = mandatoryPass
    .filter(p => p.weeks !== null)
    .map(p => p.weeks);

  const shortestWeeks = Math.min(...knownTimelines);

  const results = proposals.map(p => {
    if (!checkMandatory(p)) {
      return {
        proposal: p.id,
        rank: null,
        status: "ineligible",
        score: null,
        reason:
          "Mandatory requirements fail: the bidder's own Ontario electrical contractor licence is not confirmed."
      };
    }

    if (p.price > BUDGET) {
      return {
        proposal: p.id,
        rank: null,
        status: "ineligible",
        score: null,
        reason: "Price exceeds the CAD $260,000 budget ceiling."
      };
    }

    if (p.weeks === null || p.weeks > MAX_WEEKS) {
      return {
        proposal: p.id,
        rank: null,
        status: "flagged",
        score: null,
        reason:
          "Completion timeline is missing or exceeds the 16-week limit; human review is required."
      };
    }

    return {
      proposal: p.id,
      rank: null,
      status: "ranked",
      score: scoreProposal(p, lowestPrice, shortestWeeks),
      reason:
        "Mandatory checks pass; score calculated using the documented weighted rubric."
    };
  });

  // Sort scored proposals from highest to lowest.
  const ranked = results
    .filter(r => r.status === "ranked")
    .sort((a, b) => b.score - a.score);

  ranked.forEach((result, index) => {
    result.rank = index + 1;
  });

  // Save in the format required by the assessment.
  const outputPath = path.join(
    __dirname,
    "..",
    "ranking.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2) + "\n"
  );

  console.log("Proposal triage completed.");
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nSaved results to: ${outputPath}`);
}

main();
