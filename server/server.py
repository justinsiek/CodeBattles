from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import json
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

DB_NAME = 'postgres'
DB_USER = 'write_user'
DB_PASSWORD = 'password'
DB_HOST = 'localhost'
DB_PORT = '5432'

@app.route('/api/testcode', methods=['GET'])
def test_code():
    user_code = request.args.get('user_code', default='pass', type=str)

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

    full_code = f"""
import json

{user_code}

def run_tests():
    test_cases = [
        ([2, 7, 11, 15], 9, [0, 1]),
        ([3, 2, 4], 6, [1, 2]),
        ([3, 2], 5, [0, 1]),
        ([1, 5, 3, 8], 11, [2, 3]),
        ([-1, 0, 2, 3], 5, [2, 3]),
        ([1, 6, 4, 4], 8, [2, 3]),
        ([1, 2, 3, 4, 5], 9, [3, 4]),
        ([0, 1, 4, 3], 3, [0, 3]),
        ([-3, 4, 3], 0, [0, 2]), 
        ([10, 5, 2, 3, 7, 6], 13, [0, 3]),
        ([-1, -2, -3, -4, -5], -8, [2, 4])
    ]
    
    results = []
    for i, (nums, target, expected_output) in enumerate(test_cases, 1):
        actual_output = twoSum(nums, target)
        passed = sorted(actual_output) == sorted(expected_output)
        results.append({{
            "test_case": i,
            "input": {{"nums": nums, "target": target}},
            "expected": expected_output,
            "actual": actual_output,
            "passed": passed
        }})
    
    return results

# Execute tests and print results as JSON
print(json.dumps({{"test_results": run_tests()}}))
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

        if stdout:
            output_json = json.loads(stdout)
            test_results = output_json.get("test_results", [])

            passed_tests = sum(result['passed'] for result in test_results)
            total_tests = len(test_results)
            
            results['passed_tests'] = passed_tests
            results['all_passed'] = passed_tests == total_tests

            return jsonify(results)  
        else:
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