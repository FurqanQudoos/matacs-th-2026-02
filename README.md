# matacs-th-2026-02

AI-assisted contractor proposal triage design assessment

# MATACS — AI Proposal Triage Design

**Candidate:** Furqan Qudoos
**Assessment Reference:** MATACS-TH-2026-02  
**Time Spent:** 60 minutes

## Overview

This repository contains my design for an AI-assisted contractor proposal triage tool. The system helps reviewers evaluate contractor proposals using administrator-defined criteria. It separates AI-based information extraction from deterministic validation and scoring rules, while keeping human reviewers involved in checking results and making the final award decision.

## Repository Contents

- [Process Flow Diagram](diagram/flowchart.png)
- [Assessment Write-up](WRITEUP.md)
- [AI Prompts](PROMPTS.md)
- [Expected Proposal Ranking](ranking.json)
- [Optional Prototype](prototype/index.js)

## AI Tool Usage

I used ChatGPT to help understand the assessment requirements, develop the system design, draft the AI prompts and written explanations, and implement and review the JavaScript scoring prototype. I reviewed the proposed approach against the assessment criteria and sample proposals.

One important correction was to reject the instruction embedded in Proposal C that attempted to force the AI to rank it first and assign full marks. Proposal content must be treated as untrusted data, and rankings must follow the administrator-defined criteria rather than instructions contained within a proposal.

## Assumptions and Limitations

- The assessment brief defines the evaluation criteria and their weights but does not prescribe exact scoring formulas. The prototype therefore uses a documented, proposed scoring rubric.
- Mandatory eligibility checks are handled separately from weighted scoring.
- Proposal B is treated as ineligible because the bidder's own required Ontario electrical contractor licence is not confirmed in the proposal.
- Proposal D is flagged because its completion timeline is missing.
- AI extraction may require human verification when evidence is missing, ambiguous, or inconsistent.
- The prototype demonstrates structured sample-data validation and deterministic scoring. It does not yet implement live PDF extraction or a production AI integration.
- The final contract award decision remains with a human reviewer.

