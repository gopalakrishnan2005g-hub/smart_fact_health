def analyze_bottleneck(simulation_result):
    """
    Analyze production simulation results and identify
    the main bottleneck and its operational impact.
    """

    machines = simulation_result.get("machines", [])

    if not machines:
        return {
            "bottleneck": None,
            "reason": "No machine data available",
            "severity": "UNKNOWN",
            "recommendation": "Run a production simulation first."
        }

    bottleneck_name = simulation_result.get("bottleneck")

    bottleneck_machine = None

    for machine in machines:
        if machine["name"] == bottleneck_name:
            bottleneck_machine = machine
            break

    if bottleneck_machine is None:
        return {
            "bottleneck": None,
            "reason": "Bottleneck machine not found",
            "severity": "UNKNOWN",
            "recommendation": "Check simulation results."
        }

    utilization = bottleneck_machine.get("utilization", 0)
    queue = bottleneck_machine.get("queue", 0)
    average_queue = bottleneck_machine.get("average_queue", 0)
    effective_rate = bottleneck_machine.get("effective_rate", 0)

    reasons = []

    # High utilization
    if utilization >= 90:
        reasons.append(
            f"High machine utilization ({utilization}%)"
        )

    # Queue buildup
    if queue > 0:
        reasons.append(
            f"Queue buildup detected ({queue} units)"
        )

    # Average queue
    if average_queue > 0.5:
        reasons.append(
            f"Persistent queue buildup "
            f"(average {average_queue} units)"
        )

    # Machine down
    if bottleneck_machine.get("status") == "DOWN":
        reasons.append("Machine is currently DOWN")

    if not reasons:
        reasons.append(
            "Lowest effective production rate in the line"
        )

    # Determine severity
    if (
        bottleneck_machine.get("status") == "DOWN"
        or utilization >= 95
        or average_queue >= 2
    ):
        severity = "HIGH"

    elif utilization >= 80 or average_queue >= 0.5:
        severity = "MEDIUM"

    else:
        severity = "LOW"

    # Recommendation
    if bottleneck_machine.get("status") == "DOWN":

        recommendation = (
            f"Restore {bottleneck_name} availability "
            "to recover production flow."
        )

    elif utilization >= 90 and queue > 0:

        recommendation = (
            f"Increase {bottleneck_name} capacity or reduce "
            "its processing time to improve throughput."
        )

    elif utilization >= 90:

        recommendation = (
            f"Consider increasing {bottleneck_name} capacity "
            "to reduce production constraints."
        )

    elif queue > 0:

        recommendation = (
            f"Investigate queue buildup before {bottleneck_name} "
            "and improve material flow."
        )

    else:

        recommendation = (
            f"Monitor {bottleneck_name} for future capacity constraints."
        )

    return {
        "bottleneck": bottleneck_name,
        "severity": severity,
        "effective_rate": effective_rate,
        "utilization": utilization,
        "queue": queue,
        "average_queue": average_queue,
        "reasons": reasons,
        "recommendation": recommendation
    }