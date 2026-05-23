import requests
import json
import sys
import os

API_URL = "http://localhost:8000/process-documents"

def test_api(pdf_paths):
    # Ensure all files exist
    for path in pdf_paths:
        if not os.path.exists(path):
            print(f"Error: File '{path}' not found.")
            sys.exit(1)

    for path in pdf_paths:
        filename = os.path.basename(path)
        # Prepare form data simulating frontend input
        data = {
            "patient_name": "Jane Doe",
            "patient_details": json.dumps({"age": 52, "gender": "Female", "notes": f"Testing {filename}"})
        }

        # Prepare file for multipart/form-data upload
        with open(path, 'rb') as f:
            files = [('files', (filename, f, 'application/pdf'))]

            print(f"Sending '{filename}' to {API_URL}...")
            
            try:
                response = requests.post(API_URL, data=data, files=files)
                response.raise_for_status()  # Check for HTTP errors
                
                output_data = response.json()
                
                # Save the formatted JSON response to a separate file
                output_filename = f"{os.path.splitext(filename)[0]}.json"
                with open(output_filename, "w", encoding="utf-8") as out_f:
                    json.dump(output_data, out_f, indent=2)
                    
                print(f"✅ Success! Response saved to '{output_filename}'")
                print(f"   Document Date: {output_data['records'][0]['date'] or 'Not Found'}")
                
            except requests.exceptions.RequestException as e:
                print(f"❌ API Request Failed for '{filename}': {e}")
                if e.response is not None:
                    print(f"Response: {e.response.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_live_api.py <path_to_pdf_1> [path_to_pdf_2 ...]")
        sys.exit(1)
        
    test_api(sys.argv[1:])
