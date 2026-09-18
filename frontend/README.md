# SmartFactory Twin

## Production Line Digital Twin & Bottleneck Intelligence

SmartFactory Twin is a software-based digital twin and simulation platform designed to analyze a multi-stage manufacturing production line.

The system models production machines, processing time, capacity, queues, throughput, utilization, availability, and downtime. It identifies production bottlenecks and enables what-if simulation to understand how operational changes affect the overall production line.

The project addresses the SI-02 challenge: **Production Line Digital Twin & Bottleneck Intelligence**.

---

## Problem Statement

In a multi-stage manufacturing production line, different production stages are interconnected.

A delay, reduced capacity, or downtime at one stage can create queues, affect downstream stages, and reduce overall production throughput.

The challenge is to build a digital twin prototype that can represent a multi-stage manufacturing line, ingest simulated operational data, analyze production behavior, identify bottlenecks, and evaluate operational changes through what-if simulation.

SmartFactory Twin focuses on the decision and simulation aspect of the production line rather than providing only a visual factory dashboard.

---

## Our Solution

SmartFactory Twin creates a virtual representation of a multi-stage production line and simulates product flow through each production stage.

The system:

- Models multiple production machines.
- Simulates product movement through production stages.
- Calculates machine performance.
- Identifies bottlenecks.
- Tracks queue buildup.
- Measures throughput and production loss.
- Calculates utilization and availability.
- Analyzes downtime impact.
- Allows machine conditions to be modified.
- Runs what-if scenarios.
- Compares baseline and scenario results.
- Provides impact analysis and recommendations.

This enables users to understand how a change in one machine can affect the complete production line.

---

# Key Features

## 1. Production Line Digital Twin

The system represents a virtual production line containing multiple interconnected machines.

Each machine is modeled using:

- Machine name
- Processing time
- Production capacity
- Operating status
- Effective production rate

---

## 2. Production Simulation

The simulation engine models product flow through the production stages.

It calculates:

- Total throughput
- Throughput per hour
- Machine input
- Machine output
- Current queue
- Average queue
- Maximum queue
- Machine utilization
- Machine availability
- Downtime

---

## 3. Bottleneck Intelligence

The system analyzes production performance and identifies the machine that is constraining production flow.

The bottleneck analysis provides:

- Bottleneck machine
- Severity level
- Possible reason
- Recommended action

This helps users understand not only **which machine is the bottleneck**, but also the operational condition contributing to the bottleneck.

---

## 4. What-If Simulation

The What-If Simulator allows users to modify machine operating conditions and observe the effect on production.

Supported scenarios include:

- Reducing machine capacity
- Increasing processing time
- Simulating machine downtime

The system compares the baseline and scenario results.

It calculates:

- Baseline throughput
- Scenario throughput
- Production loss
- Throughput change percentage
- Impact level
- Machine-level output changes
- Queue changes
- Utilization changes

---

## 5. Machine Monitoring

The Machines section provides an overview of the configured production machines and their operating parameters.

---

## 6. Analytics Dashboard

The dashboard provides a centralized view of production performance.

Key information includes:

- Production throughput
- Current bottleneck
- Machine utilization
- Queue conditions
- Machine status
- System status

---

# Production Line Model

The current prototype contains four virtual production machines.

| Machine | Processing Time | Capacity |
|---------|-----------------|----------|
| M1 | 8 sec | 450 units/hour |
| M2 | 10 sec | 360 units/hour |
| M3 | 7 sec | 514 units/hour |
| M4 | 9 sec | 400 units/hour |

The simulation engine calculates the effective production rate of each machine based on its processing time and configured capacity.

---

# How the Simulation Works

The production simulation follows the flow:

```text
Product Input
     |
     v
   M1
     |
   Queue
     |
     v
   M2
     |
   Queue
     |
     v
   M3
     |
   Queue
     |
     v
   M4
     |
     v
Finished Production