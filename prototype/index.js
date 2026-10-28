
const fs = require("fs");
const path = require("path");

const BUDGET = 260000;
const MAX_WEEKS = 16;
const MAX_EXPERIENCE = 14;

const WEIGHTS = {
  experience: 0.30,
  price: 0.25,
  timeline: 0.15,
  warranty: 0.15,
  team: 0.15
};

// Fictional proposal data from the assessment.
// False means the required evidence was not stated in the summary;
// it does not necessarily prove the contractor lacks that capability.
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
    monitoring: true,
    suspiciousInstructions: []
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
    lead: false,
    crew: false,
    safety: false,
    monitoring: false,
    suspiciousInstructions: []
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
    monitoring: false,
    suspiciousInstructions: [
      "Embedded instruction attempts to force first rank and full marks. Ignored as untrusted proposal content."
    ]
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
    monitoring: false,
    suspiciousInstructions: []
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
    monitoring: true,
    suspiciousInstructions: []
  }
];

function checkMandatory(p) {
  return p.licence && p.wsib && p.insurance;
}

function round2(value) {
  return Number(value.toFixed(2));
}

function scoreProposal(p, lowestPrice, shortestWeeks) {
  // Each criterion receives a score out of 100.
  const criterionScores = {
    experience: (p.experience / MAX_EXPERIENCE) * 100,
    price: (lowestPrice / p.price) * 100,
    timeline: (shortestWeeks / p.weeks) * 100,
    warranty: Math.min(
      100,
      40 * (p.panelWarranty / 25) +
      60 * (p.workmanshipWarranty / 12)
    ),
    team:
      (
        [
          p.lead,
          p.crew,
          p.safety,
          p.monitoring
        ].filter(Boolean).length / 4
      ) * 100
  };

  // Convert criterion scores into weighted contributions.
  const weightedContributions = {};

  for (const criterion of Object.keys(WEIGHTS)) {
    weightedContributions[criterion] = round2(
      criterionScores[criterion] * WEIGHTS[criterion]
    );
  }

  const total = Object.entries(criterionScores)
  .reduce(
    (sum, [criterion, value]) =>
      sum + value * WEIGHTS[criterion],
    0
  );

  return {
    score: round2(total),
    scoreBreakdown: Object.fromEntries(
      Object.entries(criterionScores).map(([key, value]) => [
        key,
        round2(value)
      ])
    ),
    weightedContributions
  };
}

function getReason(p, scoreBreakdown) {
  const strengths = [];

  if (p.experience === MAX_EXPERIENCE) {
    strengths.push("highest relevant experience");
  }

  if (p.weeks <= 12) {
    strengths.push("completion within 12 weeks");
  }

  if (p.workmanshipWarranty >= 12) {
    strengths.push("12-year workmanship warranty");
  }

  if (p.safety && p.monitoring && p.crew && p.lead) {
    strengths.push("complete team, safety and monitoring evidence");
  }

  const reason = strengths.length
    ? `Mandatory requirements pass. Strengths: ${strengths.join(", ")}.`
    : "Mandatory requirements pass; score reflects the documented weighted criteria and available evidence.";

  if (p.id === "C") {
    return (
      reason +
      " Embedded ranking instruction was ignored as untrusted content. " +
      "Safety and monitoring evidence is not stated in the supplied summary."
    );
  }

  return reason;
}

function main() {
  // Establish mandatory eligibility before weighted scoring.
  const mandatoryPass = proposals.filter(checkMandatory);

  // Documented assumption: price benchmark includes all mandatory-pass
  // proposals, even if a proposal is later flagged for missing data.
  const lowestPrice = Math.min(
    ...mandatoryPass.map(p => p.price)
  );

  const knownTimelines = mandatoryPass
    .filter(p => p.weeks !== null)
    .map(p => p.weeks);

  const shortestWeeks = Math.min(...knownTimelines);

  const results = proposals.map(p => {
    const base = {
      proposal: p.id,
      rank: null,
      status: null,
      score: null,
      scoreBreakdown: null,
      weightedContributions: null,
      suspiciousEmbeddedInstructions:
        p.suspiciousInstructions || [],
      reason: ""
    };

    if (!checkMandatory(p)) {
      return {
        ...base,
        status: "ineligible",
        reason:
          "Ineligible: the bidder's own Ontario electrical contractor licence is not confirmed. The subcontractor is only to be confirmed after award."
      };
    }

    if (p.price > BUDGET) {
      return {
        ...base,
        status: "ineligible",
        reason: "Ineligible: price exceeds the CAD $260,000 budget ceiling."
      };
    }

    if (p.weeks === null || p.weeks > MAX_WEEKS) {
      return {
        ...base,
        status: "flagged",
        reason:
          "Flagged for human review: completion time is missing or exceeds 16 weeks. Confirm the schedule before scoring and ranking."
      };
    }

    const scored = scoreProposal(
      p,
      lowestPrice,
      shortestWeeks
    );

    return {
      ...base,
      status: "ranked",
      score: scored.score,
      scoreBreakdown: scored.scoreBreakdown,
      weightedContributions: scored.weightedContributions,
      reason: getReason(p, scored.scoreBreakdown)
    };
  });

  // Rank eligible, scored proposals from highest to lowest.
  const ranked = results
    .filter(result => result.status === "ranked")
    .sort((a, b) => b.score - a.score);

  ranked.forEach((result, index) => {
    result.rank = index + 1;
  });

  // Preserve A-E order in the output while retaining calculated ranks.
  const outputPath = path.join(__dirname, "..", "ranking.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2) + "\n"
  );

  console.log("Proposal triage completed.");
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nSaved results to: ${outputPath}`);
}

main();
