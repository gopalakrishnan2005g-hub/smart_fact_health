from fastapi import FastAPI
from simulation.engine import Machine, simulate_production

app = FastAPI(title="SmartFactory Twin API")


@app.get("/")
def root():
    return {
        "message": "SmartFactory Twin API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/simulation/test")
def simulation_test():

    machines = [
        Machine("M1", 8, 1),
        Machine("M2", 10, 1),
        Machine("M3", 7, 1),
        Machine("M4", 9, 1),
    ]

    result = simulate_production(machines, 60)

    return result