from fastapi import FastAPI
from simulation.engine import Machine, simulate_production
from simulation.bottleneck import analyze_bottleneck
from simulation.what_if import run_what_if


app = FastAPI(title="SmartFactory Twin API")


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SmartFactory Twin API is running",
        "status": "success"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# BASIC PRODUCTION SIMULATION
# --------------------------------------------------

@app.get("/api/simulation/test")
def simulation_test():

    machines = [
        Machine("M1", 8, 450),
        Machine("M2", 10, 360),
        Machine("M3", 7, 514),
        Machine("M4", 9, 400),
    ]

    result = simulate_production(
        machines,
        60
    )

    return result


# --------------------------------------------------
# BOTTLENECK INTELLIGENCE
# --------------------------------------------------

@app.get("/api/analytics/bottleneck")
def bottleneck_analysis():

    machines = [
        Machine("M1", 8, 450),
        Machine("M2", 10, 360),
        Machine("M3", 7, 514),
        Machine("M4", 9, 400),
    ]

    simulation_result = simulate_production(
        machines,
        60
    )

    analysis = analyze_bottleneck(
        simulation_result
    )

    return analysis


# --------------------------------------------------
# WHAT-IF SIMULATION
# --------------------------------------------------

@app.get("/api/simulation/what-if")
def what_if_simulation(
    machine: str = "M2",
    capacity: float = 250,
    status: str = None
):

    machines = [
        Machine("M1", 8, 450),
        Machine("M2", 10, 360),
        Machine("M3", 7, 514),
        Machine("M4", 9, 400),
    ]

    result = run_what_if(
        base_machines=machines,
        production_time=60,
        machine_name=machine,
        capacity=capacity,
        status=status
    )

    return result