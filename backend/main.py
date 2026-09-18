from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from simulation.engine import Machine, simulate_production
from simulation.bottleneck import analyze_bottleneck
from simulation.what_if import run_what_if


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="SmartFactory Twin API",
    description="Production Line Digital Twin & Bottleneck Intelligence",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://smart-fact-health-pvedswo9n-gopalakrishnan2005g-hub.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():

    return {
        "message": "SmartFactory Twin API is running",
        "status": "success"
    }


# ==================================================
# HEALTH
# ==================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==================================================
# DEFAULT MACHINE CONFIGURATION
# ==================================================

def get_machines():

    return [

        Machine(
            name="M1",
            processing_time=8,
            capacity=450
        ),

        Machine(
            name="M2",
            processing_time=10,
            capacity=360
        ),

        Machine(
            name="M3",
            processing_time=7,
            capacity=514
        ),

        Machine(
            name="M4",
            processing_time=9,
            capacity=400
        ),

    ]


# ==================================================
# MACHINES API
# ==================================================

@app.get("/api/machines")
def get_all_machines():

    machines = get_machines()

    result = []

    for machine in machines:

        result.append({

            "name": machine.name,

            "processing_time":
                machine.processing_time,

            "capacity":
                machine.capacity,

            "effective_rate":
                machine.effective_rate(),

            "status":
                machine.status

        })

    return {
        "count": len(result),
        "machines": result
    }


# ==================================================
# NORMAL PRODUCTION SIMULATION
# ==================================================

@app.get("/api/simulation/test")
def simulation_test():

    machines = get_machines()

    result = simulate_production(
        machines,
        production_time=60
    )

    return result


# ==================================================
# BOTTLENECK ANALYSIS
# ==================================================

@app.get("/api/analytics/bottleneck")
def bottleneck_analysis():

    machines = get_machines()

    simulation_result = simulate_production(
        machines,
        production_time=60
    )

    analysis = analyze_bottleneck(
        simulation_result
    )

    return analysis


# ==================================================
# WHAT-IF SIMULATION
# ==================================================

@app.get("/api/simulation/what-if")
def what_if_simulation(

    machine: str = "M2",

    capacity: float = None,

    processing_time: float = None,

    status: str = None

):

    machines = get_machines()

    result = run_what_if(

        base_machines=machines,

        production_time=60,

        machine_name=machine,

        capacity=capacity,

        processing_time=processing_time,

        status=status

    )

    return result