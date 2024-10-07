import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_question():

    url = "https://judge0-ce.p.rapidapi.com"
    
    rapidapi_key = os.getenv('RAPIDAPI_KEY')
    if not rapidapi_key:
        raise ValueError("RAPIDAPI_KEY not found in environment variables")
    
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
    }
    
    code = """
def double_number(number):
    return number * 2

def run_tests():
    test_cases = [
        (2, 5),
        (3, 5),
        (4, 8),
        (0, 0),
        (-1, -2)
    ]
    
    results = []
    for i, (input_val, expected_output) in enumerate(test_cases, 1):
        actual_output = double_number(input_val)
        passed = actual_output == expected_output
        results.append({
            "test_case": i,
            "input": input_val,
            "expected": expected_output,
            "actual": actual_output,
            "passed": passed
        })
    
    return results

test_results = run_tests()
for result in test_results:
    print(f"Test case {result['test_case']}:")
    print(f"Input: {result['input']}")
    print(f"Expected: {result['expected']}")
    print(f"Actual: {result['actual']}")
    print(f"Passed: {result['passed']}")
    print()
"""

    try:
        submission_data = {
            "language_id": 71, 
            "source_code": code,
            "stdin": ""
        }
        
        print("\nAttempting to create submission...")
        response = requests.post(f"{url}/submissions", headers=headers, json=submission_data)
        
        response_json = response.json()
        token = response_json.get("token")
        if not token:
            return False, "No token received in response"
        
        print("\nChecking submission status...")
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            print(f"\nAttempt {attempt}/{max_attempts}")
            
            status_response = requests.get(f"{url}/submissions/{token}", headers=headers)
            status = status_response.json()
            
            if status.get("status", {}).get("id", 0) >= 3:
                break
        
        stdout = status.get("stdout", "")
        stderr = status.get("stderr", "")
        
        if stdout:
            output_lines = [line.strip() for line in stdout.split('\n') if line.strip()]
            
            passed_tests = sum("Passed: True" in line for line in output_lines if line.startswith("Passed:"))
            total_tests = sum(1 for line in output_lines if line.startswith("Passed:"))
            
            if passed_tests == total_tests:
                return True, f"All double number tests passed! ({passed_tests}/{total_tests} test cases passed)"
            else:
                failed_tests = [i//6 for i, line in enumerate(output_lines) if line.startswith("Passed:") and "True" not in line]
                failure_messages = [
                    f"Test case {i+1} failed: " + 
                    ", ".join(output_lines[i*6:(i+1)*6])
                    for i in failed_tests
                ]
                return False, f"Some tests failed ({passed_tests}/{total_tests} test cases passed):\n" + "\n".join(failure_messages)
        else:
            return False, f"No output received. Errors: {stderr}"
            
    except Exception as e:
        return False, f"Error occurred: {str(e)}\nRaw output: {stdout}"

print("Starting test...")
success, message = test_question()
print(f"\nFinal Results:")
print(f"Success: {success}")
print(f"Message: {message}")