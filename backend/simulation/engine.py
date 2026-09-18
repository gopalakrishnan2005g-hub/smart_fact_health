from dataclasses import dataclass
from math import floor


@dataclass
class Machine:
    name: str
    processing_time: float   # seconds per unit
    capacity: float          # maximum units per hour
    status: str = "RUNNING"

    def effective_rate(self):
        """Return actual production rate in units/hour."""
        if self.status == "DOWN":
            return 0.0

        if self.processing_time <= 0:
            return 0.0

        cycle_rate = 3600 / self.processing_time

        return min(self.capacity, cycle_rate)


def simulate_production(
    machines,
    production_time=3600,
    arrival_rate=None
):
    """
    Simulate a multi-stage production line.

    production_time : simulation duration in seconds
    arrival_rate    : raw material arrival rate in units/second
    """

    if not machines:
        raise ValueError("At least one machine is required.")

    if production_time <= 0:
        raise ValueError("Production time must be greater than 0.")

    machine_count = len(machines)

    # Queue before each machine
    queues = [0.0] * machine_count

    # Total input/output for each machine
    total_input = [0.0] * machine_count
    total_output = [0.0] * machine_count

    # Production accumulator for fractional rates
    accumulators = [0.0] * machine_count

    # Time statistics
    available_seconds = [0.0] * machine_count
    busy_seconds = [0.0] * machine_count

    # Queue statistics
    queue_sum = [0.0] * machine_count
    max_queue = [0.0] * machine_count

    # Feed raw material at the first machine's normal rate
    if arrival_rate is None:
        arrival_rate = machines[0].effective_rate() / 3600

    for _ in range(production_time):

        # Raw material enters production line
        queues[0] += arrival_rate

        outputs = [0.0] * machine_count

        # Process every machine
        for i, machine in enumerate(machines):

            if machine.status == "DOWN":
                continue

            available_seconds[i] += 1

            rate_per_hour = machine.effective_rate()
            rate_per_second = rate_per_hour / 3600

            # Add fractional production capability
            accumulators[i] += rate_per_second

            # Record incoming material
            total_input[i] += queues[i]

            # Number of complete units machine can process
            possible_units = floor(accumulators[i] + 1e-9)

            processed = min(
                possible_units,
                floor(queues[i] + 1e-9)
            )

            if processed > 0:

                queues[i] -= processed
                accumulators[i] -= processed

                outputs[i] = processed
                total_output[i] += processed

                # Estimate machine busy time
                if rate_per_hour > 0:
                    busy_seconds[i] += (
                        processed * 3600 / rate_per_hour
                    )

        # Move output to next machine
        for i in range(machine_count - 1):
            queues[i + 1] += outputs[i]

        # Queue statistics
        for i in range(machine_count):
            queue_sum[i] += queues[i]
            max_queue[i] = max(
                max_queue[i],
                queues[i]
            )

    # Machine statistics
    machine_results = []

    for i, machine in enumerate(machines):

        if available_seconds[i] > 0:
            utilization = (
                busy_seconds[i]
                / available_seconds[i]
            ) * 100
        else:
            utilization = 0.0

        availability = (
            available_seconds[i]
            / production_time
        ) * 100

        average_queue = (
            queue_sum[i]
            / production_time
        )

        machine_results.append({
            "name": machine.name,
            "processing_time": machine.processing_time,
            "capacity": machine.capacity,
            "effective_rate": round(
                machine.effective_rate(),
                2
            ),
            "status": machine.status,
            "input": round(
                total_input[i],
                2
            ),
            "output": int(
                total_output[i]
            ),
            "queue": round(
                queues[i],
                2
            ),
            "average_queue": round(
                average_queue,
                2
            ),
            "max_queue": round(
                max_queue[i],
                2
            ),
            "utilization": round(
                min(utilization, 100),
                2
            ),
            "availability": round(
                availability,
                2
            ),
            "downtime": round(
                production_time - available_seconds[i],
                2
            )
        })

    # Final machine output = line throughput
    throughput = int(total_output[-1])

    # Bottleneck = lowest effective production rate
    bottleneck_index = min(
        range(machine_count),
        key=lambda i: machines[i].effective_rate()
    )

    bottleneck = machines[bottleneck_index].name

    return {
        "simulation_time": production_time,
        "arrival_rate": round(
            arrival_rate * 3600,
            2
        ),
        "throughput": throughput,
        "throughput_per_hour": round(
            throughput / production_time * 3600,
            2
        ),
        "bottleneck": bottleneck,
        "machines": machine_results
    }