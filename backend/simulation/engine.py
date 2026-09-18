from dataclasses import dataclass


@dataclass
class Machine:
    name: str
    processing_time: float
    capacity: int
    status: str = "RUNNING"


def simulate_production(machines, production_time=60):

    queues = [0 for _ in machines]
    total_output = [0 for _ in machines]
    working_time = [0 for _ in machines]
    time_since_process = [0 for _ in machines]

    for _ in range(production_time):

        incoming = 1

        for i, machine in enumerate(machines):

            if machine.status == "DOWN":
                processed = 0

            else:
                time_since_process[i] += 1

                if time_since_process[i] >= machine.processing_time:
                    processed = min(incoming + queues[i], machine.capacity)
                    time_since_process[i] = 0
                else:
                    processed = 0

                if processed > 0:
                    working_time[i] += 1

            queues[i] = max(0, queues[i] + incoming - processed)

            total_output[i] += processed

            incoming = processed

    utilization = []

    for i, machine in enumerate(machines):

        if machine.status == "DOWN":
            value = 0

        else:
            value = (working_time[i] / production_time) * 100

        utilization.append(round(value, 2))

    throughput = total_output[-1]

    bottleneck_index = min(
        range(len(machines)),
        key=lambda i: machines[i].capacity / machines[i].processing_time
    )

    bottleneck = machines[bottleneck_index].name

    return {
        "throughput": throughput,
        "machines": [
            {
                "name": machines[i].name,
                "processing_time": machines[i].processing_time,
                "capacity": machines[i].capacity,
                "status": machines[i].status,
                "queue": queues[i],
                "output": total_output[i],
                "utilization": utilization[i],
            }
            for i in range(len(machines))
        ],
        "bottleneck": bottleneck
    }