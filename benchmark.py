import json
import uuid
from memory_profiler import profile

def create_dummy_ndjson():
    print("creating 500k lines of dummy data...")
    with open('bulk_export.ndjson', 'w') as f:
        for _ in range(500000):
            
            patient = {
                "id": str(uuid.uuid4())[:8],
                "name": [{"family": "Student"}]
            }
            f.write(json.dumps(patient) + '\n')
    print("done creating file")

@profile
def stream_fhir_data():
    count = 0
    with open('bulk_export.ndjson', 'r') as f:
        for line in f:
            data = json.loads(line)
            patient_id = data.get("id")
            count += 1
            

    print(f"finished streaming {count} patients")

if __name__ == '__main__':
    create_dummy_ndjson()
    print("starting stream...")
    stream_fhir_data()
