import random
from dotenv import load_dotenv
import string
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os
import requests
from flask_socketio import SocketIO, emit, join_room
import time

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://172.20.10.2:3000"]}})
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://write_user:password@localhost:5432/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret_key'

db = SQLAlchemy(app)

connected_users = {}
active_battles = {}

class Problem(db.Model):
    __tablename__ = 'problems'
    __table_args__ = {'schema': 'codebattles'}

    problem_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    difficulty = db.Column(db.String)
    description = db.Column(db.JSON)
    examples = db.Column(db.JSON)
    starter_code = db.Column(db.Text)
    test_cases = db.Column(db.Text)

@app.route('/api/retrieveproblem', methods=['GET'])
def retrieve_problem():
    problem_id = request.args.get('problem', default=1, type=int)
    problem = Problem.query.get(problem_id)

    if problem:
        problem_data = {
            'problem_id': problem.problem_id,
            'title': problem.title,
            'difficulty': problem.difficulty,
            'description': problem.description,
            'examples': problem.examples,
            'starter_code': problem.starter_code,
            'test_cases': problem.test_cases
        }
        return jsonify(problem_data)
    else:
        return jsonify({'error': 'Problem not found'}), 404

@app.route('/api/testcode', methods=['GET'])
def test_code():
    user_code = request.args.get('user_code', default='pass', type=str)
    problem_id = request.args.get('problem_id', default=1, type=int)
    battle_room_id = request.args.get('battle_room_id', default=None, type=str)
    opponent_username = request.args.get('opponent_username', default=None, type=str)
    user_sid = request.args.get('user_sid', default=None, type=str)
    
    response_data = {"passed_tests": 0, "all_passed": False, "error": None}
    status_code = 200

    try:
        url = "https://judge0-ce.p.rapidapi.com"

        rapidapi_key = os.getenv('RAPIDAPI_KEY')
        if not rapidapi_key:
            response_data['error'] = 'RAPIDAPI_KEY not set in environment variables'
            status_code = 500
            return

        problem = Problem.query.get(problem_id)
        if not problem:
            response_data['error'] = 'Problem not found'
            status_code = 404
            return

        test_cases = problem.test_cases

        full_code = f"""
import json

{user_code}

{test_cases}
"""

        print("\nAttempting to create submission...")

        headers = {
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
        }

        submission_data = {
            "language_id": 71, 
            "source_code": full_code,
            "stdin": ""
        }
        
        response = requests.post(f"{url}/submissions", headers=headers, json=submission_data)
        response.raise_for_status()  

        response_json = response.json()
        token = response_json.get("token")
        
        if not token:
            print("Error: No token received from the API")
            response_data['error'] = 'No token received from the API'
            status_code = 500
            return

        print("\nChecking submission status...")
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            print(f"\nAttempt {attempt}/{max_attempts}")
            
            status_response = requests.get(f"{url}/submissions/{token}", headers=headers)
            status_response.raise_for_status() 
            status = status_response.json()
            
            if status.get("status", {}).get("id", 0) >= 3:
                break

        stdout = status.get("stdout", "")
        stderr = status.get("stderr", "")
        if stderr:
            print(f"Error: {stderr}")
            stderr = stderr.strip().split('\n')[-1]

        if stdout:
            output_json = json.loads(stdout)
            test_results = output_json.get("test_results", [])
            passed_tests = sum(result['passed'] for result in test_results)
            total_tests = len(test_results)
            
            response_data['passed_tests'] = passed_tests
            response_data['all_passed'] = passed_tests == total_tests
        else:
            response_data['error'] = stderr or 'No output received from the API'
            status_code = 500

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        if http_err.response.status_code == 429:
            response_data['error'] = 'API rate limit exceeded. Please try again later.'
            status_code = 429
        else:
            response_data['error'] = f'HTTP error: {http_err}'
            status_code = 500

    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
        response_data['error'] = f'Request error: {req_err}'
        status_code = 500

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        response_data['error'] = f'Unexpected error: {str(e)}'
        status_code = 500

    finally:
        # Decrement submissions and notify opponent
        if battle_room_id and battle_room_id in active_battles:
            if user_sid and user_sid in active_battles[battle_room_id]['players']:
                active_battles[battle_room_id]['players'][user_sid]['submissions_left'] -= 1
                submissions_left = active_battles[battle_room_id]['players'][user_sid]['submissions_left']
                opponent_sid = next((sid for sid, player in active_battles[battle_room_id]['players'].items() 
                    if player['username'] == opponent_username), None)
                
                if opponent_sid:
                    socketio.emit('update_opponent_progress', {
                        "opponent_passed_tests": response_data['passed_tests'],
                        "opponent_all_passed": response_data['all_passed'],
                        "opponent_submissions_left": submissions_left
                    }, room=opponent_sid)
                    if response_data['passed_tests'] > 0:
                        socketio.emit('battle_ended', {'winner': user_sid}, room=battle_room_id)
                        print("Battle ended")
                        active_battles.pop(battle_room_id)
                    print(f"Updated opponent progress: {response_data['passed_tests']} tests passed, {submissions_left} submissions left")

    # Return response after finally block
    return jsonify(response_data), status_code

@socketio.on('connect')
def handle_connect():
    user_id = request.sid  
    connected_users[user_id] = {'username': None, 'sid': user_id}  
    print(f"Client connected: {user_id}")
    emit('connection_response', {'status': 'connected', 'user_id': user_id})

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.sid
    if user_id in connected_users:
        username = connected_users[user_id]['username']
        del connected_users[user_id]
        print(f"Client disconnected: {user_id} (Username: {username})")
    emit('update_connected_users', [user for user in connected_users.values() if user['username']], broadcast=True)

@socketio.on('set_username')
def handle_set_username(data):
    user_id = request.sid
    username = data['username']
    if user_id in connected_users:
        connected_users[user_id]['username'] = username
        print(f"Username set for {user_id}: {username}")
        emit('username_set', {'status': 'success', 'username': username})
    else:
        emit('username_set', {'status': 'error', 'message': 'User not found'})
    print(connected_users)
    emit('update_connected_users', list(connected_users.values()), broadcast=True)

@socketio.on('sendInvite')
def handle_send_invite(data):
    target_username = data['username']
    sender_sid = request.sid
    sender_username = connected_users[sender_sid]['username']
    
    target_user = next((user for user in connected_users.values() if user['username'] == target_username), None)
    
    if target_user:
        emit('invite_received', {
            'sender': sender_username,
            'sender_sid': sender_sid,
            'isRated': data.get('isRated', False)
        }, room=target_user['sid'])
        emit('invite_sent', {'status': 'success', 'message': f"Invite sent to {target_username}"}, room=sender_sid)
        print(f"Invite sent from {sender_username} to {target_username}")
    else:
        emit('invite_sent', {'status': 'error', 'message': f"User {target_username} not found or offline"}, room=sender_sid)
        print(f"Failed to send invite: User {target_username} not found")

@socketio.on('accept_invite')
def handle_accept_invite(data):
    battle_room_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    inviter_id = data['inviterId']
    invitee_id = data['inviteeId']

    join_room(battle_room_id, sid=inviter_id)
    join_room(battle_room_id, sid=invitee_id)

    battle_state = {
        'room_id': battle_room_id,
        'players': {
            inviter_id: {'username': connected_users[inviter_id]['username'], 'submissions_left': 3, 'passed_tests': 0},
            invitee_id: {'username': connected_users[invitee_id]['username'], 'submissions_left': 3, 'passed_tests': 0}
        },
        'problem_id': 2,  
        'start_time': time.time(),
        'duration': 300  

    }

    active_battles[battle_room_id] = battle_state

    emit('battleStarting', {'battleRoomId': battle_state['room_id']}, room=inviter_id)
    emit('battleStarting', {'battleRoomId': battle_state['room_id']}, room=invitee_id)

    print(f"Battle room {battle_room_id} created for {inviter_id} and {invitee_id}")

@socketio.on('retrieve_match_info')
def handle_retrieve_match_info(data):
    battle_room_id = data['battleRoomId']
    
    if battle_room_id in active_battles:
        battle_info = active_battles[battle_room_id]
        player_ids = list(battle_info['players'].keys())
        inviter_id, invitee_id = player_ids[0], player_ids[1]
        
        opponent_id = invitee_id if inviter_id == request.sid else inviter_id
        opponent_username = battle_info['players'][opponent_id]['username']

        start_time = battle_info['start_time']
        duration = battle_info['duration']
    
        emit('match_info_received', 
            {'opponent_username': opponent_username, 
             'start_time': start_time, 
             'duration': duration}, 
             room=request.sid)
    else:
        print(f"Battle room {battle_room_id} not found")
        emit('error', {'message': 'Battle room not found'}, room=request.sid)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8080)
