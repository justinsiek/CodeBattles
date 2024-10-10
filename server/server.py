from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import json
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://172.20.10.2:3000"]}})

DB_NAME = 'postgres'
DB_USER = 'write_user'
DB_PASSWORD = 'password'
DB_HOST = 'localhost'
DB_PORT = '5432'

@app.route('/api/retrieveproblem', methods=['GET'])
def retrieve_problem():
    problem_id = request.args.get('problem', default=1, type=int)

    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM codebattles.problems WHERE problem_id = %s", (problem_id,))
        result = cursor.fetchone()

        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': f'Database error: {e}'})
        
    if result:
        problem_id, title, difficulty, description, examples, starter_code, test_cases = result
        
        problem = {
            'problem_id': problem_id,
            'title': title,
            'difficulty': difficulty,
            'description': description,  
            'examples': examples,  
            'starter_code': starter_code,
            'test_cases': test_cases
        }

    return jsonify(problem)

@app.route('/api/testcode', methods=['GET'])
def test_code():
    user_code = request.args.get('user_code', default='pass', type=str)
    problem_id = request.args.get('problem_id', default=1, type=int)
    url = "https://judge0-ce.p.rapidapi.com"
    #url = "https://judge029.p.rapidapi.com"

    rapidapi_key = os.getenv('RAPIDAPI_KEY')
    #rapidapi_key = os.getenv('OTHER_RAPIDAPI_KEY')

    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        #"X-RapidAPI-Host": "judge029.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    results = {"passed_tests": 0, "all_passed": False, "error" : None}

    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()

        cursor.execute("SELECT test_cases FROM codebattles.problems WHERE problem_id = %s", (problem_id,))
        test_cases = cursor.fetchone()[0]

        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        results['error'] = f'Database error: {e}'
        return jsonify(results)
    
    print(test_cases)

        


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
            stderr = stderr.strip().split('\n')[-1]

        if stdout:
            output_json = json.loads(stdout)
            test_results = output_json.get("test_results", [])

            passed_tests = sum(result['passed'] for result in test_results)
            total_tests = len(test_results)
            
            results['passed_tests'] = passed_tests
            results['all_passed'] = passed_tests == total_tests

            return jsonify(results)  
        else: #this is where the main error handling is
            print(f"Error: No stdout received. Full status: {status}")
            return jsonify({'error': stderr or 'No output received from the API'})
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        if http_err.response.status_code == 429:
            results['error'] = 'API rate limit exceeded. Please try again later.'
            return jsonify(results)
        return jsonify({'error': f'HTTP error: {http_err}'})
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
        return jsonify({'error': f'Request error: {req_err}'})
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'})

    

if __name__ == '__main__':
    app.run(debug=True, port=8080)