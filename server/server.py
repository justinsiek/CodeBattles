from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os
import requests
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://172.20.10.2:3000"]}})
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://write_user:password@localhost:5432/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

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
    url = "https://judge0-ce.p.rapidapi.com"

    rapidapi_key = os.getenv('RAPIDAPI_KEY')
    if not rapidapi_key:
        return jsonify({'error': 'RAPIDAPI_KEY not set in environment variables'}), 500

    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    results = {"passed_tests": 0, "all_passed": False, "error": None}
    
    problem = Problem.query.get(problem_id)
    if not problem:
        results['error'] = 'Problem not found'
        return jsonify(results), 404

    test_cases = problem.test_cases

    full_code = f"""
import json

{user_code}

{test_cases}
"""

    try:
        submission_data = {
            "language_id": 71, 
            "source_code": full_code,
            "stdin": ""
        }
        
        print("\nAttempting to create submission...")

        response = requests.post(f"{url}/submissions", headers=headers, json=submission_data)
        response.raise_for_status()  

        response_json = response.json()
        token = response_json.get("token")
        
        if not token:
            print("Error: No token received from the API")
            return jsonify({'error': 'No token received from the API'})

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
            print(test_results)
            passed_tests = sum(result['passed'] for result in test_results)
            total_tests = len(test_results)
            
            results['passed_tests'] = passed_tests
            results['all_passed'] = passed_tests == total_tests
            return jsonify(results)  
        else:
            print(f"Error: No stdout received. Full status: {status}")
            return jsonify({'error': stderr or 'No output received from the API'}), 500
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        if http_err.response.status_code == 429:
            results['error'] = 'API rate limit exceeded. Please try again later.'
            return jsonify(results), 429
        return jsonify({'error': f'HTTP error: {http_err}'}), 500
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
        return jsonify({'error': f'Request error: {req_err}'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8080)
