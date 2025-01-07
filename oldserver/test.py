import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_question(user_code):

    url = "https://judge0-ce.p.rapidapi.com"
    
    rapidapi_key = os.getenv('RAPIDAPI_KEY')
    if not rapidapi_key:
        raise ValueError("RAPIDAPI_KEY not found in environment variables")
    
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
    }
    
    full_code = f"""
import json

{user_code}

def run_tests():
    test_cases = [
        (2, 4),
        (3, 6),
        (4, 8),
        (0, 0),
        (-1, -2)
    ]
    
    results = []
    for i, (input_val, expected_output) in enumerate(test_cases, 1):
        actual_output = double_number(input_val)
        passed = actual_output == expected_output
        results.append({{
            "test_case": i,
            "input": input_val,
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
            try:
                # Parse the entire stdout as JSON
                output_json = json.loads(stdout)
                
                # Extract test results from the parsed JSON
                test_results = output_json.get("test_results", [])

                print(test_results)

                results = {}

                passed_tests = sum(result['passed'] for result in test_results)
                total_tests = len(test_results)
                
                results['all_passed'] = passed_tests == total_tests
                

                if passed_tests == total_tests:
                    return True, f"All double number tests passed! ({passed_tests}/{total_tests} test cases passed)"
                else:
                    failure_messages = [
                        f"Test case {result['test_case']} failed: " + 
                        f"Input: {result['input']}, Expected: {result['expected']}, Actual: {result['actual']}"
                        for result in test_results if not result['passed']
                    ]
                    return False, f"Some tests failed ({passed_tests}/{total_tests} test cases passed):\n" + "\n".join(failure_messages)
            except json.JSONDecodeError:
                return False, f"Failed to parse test results. Raw output: {stdout}"
        else:
            return False, f"No output received. Errors: {stderr}"
            
    except Exception as e:
        return False, f"Error occurred: {str(e)}\nRaw output: {stdout}"

# Example usage
user_code = """
def double_number(number):
    return number * 2
"""

success, message = test_question(user_code)
print(f"\nFinal Results:")
print(f"Success: {success}")
print(f"Message: {message}")