from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import redis
from socketio import AsyncServer, ASGIApp
import asyncio
import os
from dotenv import load_dotenv

app = FastAPI()
sio = AsyncServer(async_mode='asgi', cors_allowed_origins=['http://localhost:3000'])
app.mount("/socket.io", ASGIApp(sio))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
try:
    r = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
    r.ping()
except redis.RedisError:
    print("Warning: Redis connection failed, using in-memory cache")
    r = None

employees = json.load(open('mock_data/employees.json'))
projects = json.load(open('mock_data/projects.json'))
tickets = json.load(open('mock_data/tickets.json'))

class ApiConfig(BaseModel):
    hrms: str
    snowflake: str
    zendesk: str

@app.post("/api/config")
async def save_config(config: ApiConfig):
    if r:
        r.set('api_config', json.dumps(config.dict()))
    else:
        with open('config.json', 'w') as f:
            json.dump(config.dict(), f)
    return {"status": "saved"}

@sio.event
async def connect(sid, environ):
    print(f"WebSocket Connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"WebSocket Disconnected: {sid}")

@sio.on('user_query')
async def handle_query(sid, data):
    query = data['query'].lower()
    await sio.emit('status_update', {'message': 'Processing query...'}, room=sid)

    if 'list employees' in query and 'java' in query and '7' in query:
        await sio.emit('status_update', {'message': 'HR Agent is fetching data...'}, room=sid)
        filtered_employees = [emp for emp in employees if 'java' in emp['skills'].lower() and emp['experience'] >= 7]
        if r:
            r.set('query_results', json.dumps(filtered_employees))
        await sio.emit('query_results', filtered_employees, room=sid)
    elif 'payroll' in query:
        await sio.emit('status_update', {'message': 'Security Agent blocked unauthorized access'}, room=sid)
        with open('logs/unauthorized.txt', 'a') as f:
            f.write(query + '\n')
        await sio.emit('error', {'message': 'Unauthorized access'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Unsupported query'}, room=sid)

@sio.on('user_action')
async def handle_action(sid, data):
    await sio.emit('status_update', {'message': 'Project Agent is adding employee...'}, room=sid)
    await asyncio.sleep(1)
    await sio.emit('action_confirmation', {'message': 'Employee added to Project X'}, room=sid)

@app.get("/mock/hrms/employees")
async def mock_hrms(skills: str, experience: int):
    return [emp for emp in employees if skills.lower() in emp['skills'].lower() and emp['experience'] >= experience]

@app.post("/mock/jira/issue")
async def mock_jira():
    return {"status": "added"}

if not os.path.exists('logs'):
    os.makedirs('logs')