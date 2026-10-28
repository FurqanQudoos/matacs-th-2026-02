# AI Proposal Triage Design

## 1. AI vs. Rules

AI will extract proposal facts such as price, licence details, experience, timelines, warranties, and team information from uploaded proposal text. It will return structured data with supporting evidence and identify missing or suspicious content.

Normal application code will validate the extracted data, apply mandatory pass/fail rules, calculate weighted scores, and sort eligible proposals. This separation makes numeric scoring more predictable and repeatable. AI will not make the final award decision.

## 2. Consistency and Explainability

The system will use a documented scoring rubric, fixed arithmetic, and a consistent rounding policy. Each assessment will retain the criteria version, extracted facts, evidence, scores, and ranking reasons.

AI extraction can vary between runs, so identical results cannot be guaranteed by the prompt alone. Schema validation, evidence checks, controlled scoring rules, and human review will reduce this risk. Reviewers will see the evidence and score contribution for each criterion.

## 3. Human in the Loop

A reviewer will check missing, ambiguous, or conflicting information and verify flagged mandatory requirements before accepting the results. The reviewer may override a recommendation with a recorded reason. The final contract award remains a human decision.

The audit log will record the proposal identifier, source evidence, criteria version, extraction output, scoring results, reviewer actions, overrides, timestamps, and final decision.

## 4. Changing Criteria

Every criteria configuration will have a version number. Each scoring run will retain the version used at that time. If an administrator changes a weight or rule, the system will validate the new configuration and ensure weighted criteria total 100%.

Previous results will not be silently overwritten. Proposals can be rescored using the new version, with the old and new results retained for comparison and audit.

## 5. Risks and Safeguards

- **Incorrect extraction:** Retain supporting evidence, validate data types and ranges, and request human verification when information is unclear.
- **Hallucinated facts:** Accept only evidence-supported facts; represent missing values as unknown rather than inventing them.
- **Prompt injection:** Treat proposal text as untrusted input. Ignore embedded instructions that attempt to change scoring or ranking, and log suspicious content.
- **Bias or inconsistent scoring:** Use documented criteria, transparent formulas, consistent treatment of equivalent evidence, and reviewer oversight.
- **Missing information:** Flag incomplete proposals for review rather than silently assuming compliance.
- **Cost and reliability:** Process only necessary text, avoid unnecessary AI calls, validate outputs, and handle extraction failures safely.

The proposed formulas and handling of missing evidence are design assumptions because the assessment brief does not specify every scoring detail.