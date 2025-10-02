import asyncio
import websockets
import json
import sim  # CoppeliaSim Remote API

# Connect to CoppeliaSim
def connect_to_sim():
    sim.simxFinish(-1)  # close old connections
    clientID = sim.simxStart('127.0.0.1', 19999, True, True, 5000, 5)
    if clientID == -1:
        raise Exception("Could not connect to CoppeliaSim")
    print("✅ Connected to CoppeliaSim")
    return clientID

async def rover_stream(websocket, path):
    clientID = connect_to_sim()

    # Example: get handles for robots
    rover_names = ["SCOUT-1", "SCOUT-2", "SCOUT-3", "MAINT-1"]
    rover_handles = {}
    for name in rover_names:
        err, h = sim.simxGetObjectHandle(clientID, name, sim.simx_opmode_blocking)
        if err == sim.simx_return_ok:
            rover_handles[name] = h

    # Example: environment sensor handles
    _, env_sensor = sim.simxGetObjectHandle(clientID, "Env_Sensor", sim.simx_opmode_blocking)

    while True:
        robots_data = []
        for name, handle in rover_handles.items():
            _, pos = sim.simxGetObjectPosition(clientID, handle, -1, sim.simx_opmode_blocking)
            _, battery = sim.simxGetFloatSignal(clientID, f"{name}_battery", sim.simx_opmode_blocking)
            _, status = sim.simxGetStringSignal(clientID, f"{name}_status", sim.simx_opmode_blocking)

            robots_data.append({
                "name": name,
                "status": status if status else "active",
                "battery": int(battery) if battery else 100,
                "position": {"x": pos[0]*100+200, "y": pos[1]*100+200},  # scaled for UI map
                "task": "Mapping Sector A"
            })

        # Example environment signals
        _, o2 = sim.simxGetFloatSignal(clientID, "O2_level", sim.simx_opmode_blocking)
        _, pressure = sim.simxGetFloatSignal(clientID, "Pressure", sim.simx_opmode_blocking)
        _, temp = sim.simxGetFloatSignal(clientID, "Temperature", sim.simx_opmode_blocking)
        _, rad = sim.simxGetFloatSignal(clientID, "Radiation", sim.simx_opmode_blocking)

        env_data = {
            "O2": round(o2, 2) if o2 else 21.0,
            "Pressure": round(pressure, 2) if pressure else 101.3,
            "Temperature": round(temp, 2) if temp else 22.0,
            "Radiation": round(rad, 2) if rad else 0.1
        }

        packet = {
            "robots": robots_data,
            "environment": env_data,
            "alerts": [
                {"id": 1, "level": "info", "msg": "Sector scan complete", "time": "14:23"},
                {"id": 2, "level": "warning", "msg": "Radiation spike detected", "time": "14:18"}
            ]
        }

        await websocket.send(json.dumps(packet))
        await asyncio.sleep(1)  # send every 1s

start_server = websockets.serve(rover_stream, "0.0.0.0", 8765)

print("🌐 Backend running on ws://localhost:8765")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
