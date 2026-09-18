from copy import deepcopy

from simulation.engine import simulate_production


def run_what_if(
    base_machines,
    production_time=60,
    machine_name=None,
    capacity=None,
    processing_time=None,
    status=None
):
    """
    Run baseline and what-if production simulations.

    The scenario can modify:
    - machine capacity
    - processing time
    - machine status
    """

    if not base_machines:
        raise ValueError("At least one machine is required.")

    # -------------------------
    # BASELINE SIMULATION
    # -------------------------

    baseline_machines = deepcopy(base_machines)

    baseline_result = simulate_production(
        baseline_machines,
        production_time
    )

    # -------------------------
    # CREATE SCENARIO
    # -------------------------

    scenario_machines = deepcopy(base_machines)

    target_machine = None

    for machine in scenario_machines:
        if machine.name == machine_name:
            target_machine = machine
            break

    if target_machine is None:
        raise ValueError(
            f"Machine '{machine_name}' not found."
        )

    # Change capacity
    if capacity is not None:

        if capacity <= 0:
            raise ValueError(
                "Capacity must be greater than 0."
            )

        target_machine.capacity = capacity

    # Change processing time
    if processing_time is not None:

        if processing_time <= 0:
            raise ValueError(
                "Processing time must be greater than 0."
            )

        target_machine.processing_time = processing_time

    # Change machine status
    if status is not None:

        status = status.upper()

        allowed_status = [
            "RUNNING",
            "DOWN",
            "IDLE"
        ]

        if status not in allowed_status:
            raise ValueError(
                "Status must be RUNNING, DOWN, or IDLE."
            )

        target_machine.status = status

    # -------------------------
    # SCENARIO SIMULATION
    # -------------------------

    scenario_result = simulate_production(
        scenario_machines,
        production_time
    )

    # -------------------------
    # THROUGHPUT COMPARISON
    # -------------------------

    baseline_throughput = baseline_result["throughput"]
    scenario_throughput = scenario_result["throughput"]

    production_loss = (
        baseline_throughput
        - scenario_throughput
    )

    if baseline_throughput > 0:

        throughput_change_percent = (
            production_loss
            / baseline_throughput
        ) * 100

    else:

        throughput_change_percent = 0

    # -------------------------
    # MACHINE COMPARISON
    # -------------------------

    machine_comparison = []

    for baseline_machine in baseline_result["machines"]:

        for scenario_machine in scenario_result["machines"]:

            if (
                baseline_machine["name"]
                == scenario_machine["name"]
            ):

                machine_comparison.append({
                    "name": baseline_machine["name"],

                    "baseline_output":
                        baseline_machine["output"],

                    "scenario_output":
                        scenario_machine["output"],

                    "output_change":
                        scenario_machine["output"]
                        - baseline_machine["output"],

                    "baseline_queue":
                        baseline_machine["queue"],

                    "scenario_queue":
                        scenario_machine["queue"],

                    "queue_change":
                        round(
                            scenario_machine["queue"]
                            - baseline_machine["queue"],
                            2
                        ),

                    "baseline_utilization":
                        baseline_machine["utilization"],

                    "scenario_utilization":
                        scenario_machine["utilization"],

                    "utilization_change":
                        round(
                            scenario_machine["utilization"]
                            - baseline_machine["utilization"],
                            2
                        )
                })

                break

    # -------------------------
    # IMPACT LEVEL
    # -------------------------

    if throughput_change_percent >= 20:

        impact = "HIGH"

    elif throughput_change_percent >= 5:

        impact = "MEDIUM"

    else:

        impact = "LOW"

    # -------------------------
    # IMPACT SUMMARY
    # -------------------------

    if production_loss > 0:

        summary = (
            f"The scenario reduces production by "
            f"{production_loss} units over "
            f"{production_time} seconds."
        )

    elif production_loss < 0:

        summary = (
            f"The scenario increases production by "
            f"{abs(production_loss)} units over "
            f"{production_time} seconds."
        )

    else:

        summary = (
            "The scenario produces no throughput change."
        )

    # -------------------------
    # FINAL RESULT
    # -------------------------

    return {

        "scenario": {
            "machine": machine_name,
            "capacity": capacity,
            "processing_time": processing_time,
            "status": status
        },

        "baseline": {
            "throughput":
                baseline_result["throughput"],

            "throughput_per_hour":
                baseline_result["throughput_per_hour"],

            "bottleneck":
                baseline_result["bottleneck"]
        },

        "scenario_result": {
            "throughput":
                scenario_result["throughput"],

            "throughput_per_hour":
                scenario_result["throughput_per_hour"],

            "bottleneck":
                scenario_result["bottleneck"]
        },

        "impact": {

            "production_loss":
                production_loss,

            "throughput_change_percent":
                round(
                    throughput_change_percent,
                    2
                ),

            "level":
                impact,

            "summary":
                summary
        },

        "machine_comparison":
            machine_comparison
    }