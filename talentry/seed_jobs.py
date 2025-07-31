import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import time
from datetime import datetime, timedelta

# --- Configuration ---
# Replace with the path to your downloaded Firebase service account key JSON file
SERVICE_ACCOUNT_KEY_PATH = 'serviceAccountKey.json'
# Replace with your actual __app_id from the Canvas environment
APP_ID = 'default-app-id' # <--- IMPORTANT: REPLACE THIS! (e.g., 'default-app-id')
COLLECTION_PATH = f'artifacts/{APP_ID}/public/data/jobs'

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure 'serviceAccountKey.json' is in the correct path and is a valid Firebase service account key.")
    exit()

# --- Jobs with varied timestamps for sorting ---
# These jobs have job_id's that won't conflict with your existing dummy_jobs
# and their timestamps are explicitly set to be very recent or very old.
sorting_test_jobs = [
  {
    "job_id": "job_sort_newest_1",
    "employer_logo": "https://placehold.co/48x48/1A2B3C/ffffff?text=NN",
    "employer_name": "New Horizons Tech",
    "job_title": "Frontend Developer (React)",
    "job_city": "Berlin",
    "job_state": None,
    "job_country": "Germany",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We're looking for a React developer to join our rapidly growing team. Fresh projects and modern stack!",
    "job_highlights": {"Qualifications": ["React", "JavaScript"], "Responsibilities": ["Build UIs"]},
    "job_apply_link": "https://example.com/apply/newest_1",
    "job_required_skills": ["React", "JS"],
    "job_salary_currency": "EUR",
    "job_salary_period": "YEAR",
    "job_salary_min": 55000,
    "job_salary_max": 75000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 0.1)), # Very recent (2.4 hours ago)
    "job_category": "Technology",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "job_sort_newest_2",
    "employer_logo": "https://placehold.co/48x48/3D4F5C/ffffff?text=FF",
    "employer_name": "Future Forward Innovations",
    "job_title": "AI Research Scientist",
    "job_city": "San Francisco",
    "job_state": "CA",
    "job_country": "US",
    "job_is_remote": True,
    "job_employment_type": "FULLTIME",
    "job_description": "Push the boundaries of AI research with our cutting-edge team. Remote opportunity.",
    "job_highlights": {"Qualifications": ["PhD AI", "Python", "ML"], "Responsibilities": ["Research", "Develop models"]},
    "job_apply_link": "https://example.com/apply/newest_2",
    "job_required_skills": ["AI", "Python", "ML"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 180000,
    "job_salary_max": 250000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 0.05)), # Even more recent (1.2 hours ago)
    "job_category": "Technology",
    "job_requirements": ["senior_level"]
  },
  {
    "job_id": "job_sort_oldest_1",
    "employer_logo": "https://placehold.co/48x48/5C6D7E/ffffff?text=OH",
    "employer_name": "Old School Holdings",
    "job_title": "Administrative Assistant",
    "job_city": "New York",
    "job_state": "NY",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Support our busy office with daily administrative tasks. Long-standing company with stable environment.",
    "job_highlights": {"Qualifications": ["Office skills", "Communication"], "Responsibilities": ["Scheduling", "Filing"]},
    "job_apply_link": "https://example.com/apply/oldest_1",
    "job_required_skills": ["Admin", "Organization"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 40000,
    "job_salary_max": 50000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 365 * 2)), # 2 years ago
    "job_category": "Administrative",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "job_sort_oldest_2",
    "employer_logo": "https://placehold.co/48x48/7E8F9A/ffffff?text=TR",
    "employer_name": "Traditional Retail Co.",
    "job_title": "Retail Associate",
    "job_city": "London",
    "job_state": None,
    "job_country": "UK",
    "job_is_remote": False,
    "job_employment_type": "PARTTIME",
    "job_description": "Join our retail team. Provide excellent customer service and maintain store appearance.",
    "job_highlights": {"Qualifications": ["Customer service", "Retail experience"], "Responsibilities": ["Sales", "Stocking"]},
    "job_apply_link": "https://example.com/apply/oldest_2",
    "job_required_skills": ["Customer Service", "Sales"],
    "job_salary_currency": "GBP",
    "job_salary_period": "HOUR",
    "job_salary_min": 10,
    "job_salary_max": 12,
    "job_posted_at_timestamp": int(time.time() - (86400 * 365 * 3)), # 3 years ago
    "job_category": "Retail",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "job_sort_recent_3",
    "employer_logo": "https://placehold.co/48x48/9AAAB9/ffffff?text=IN",
    "employer_name": "Innovate Now",
    "job_title": "Product Designer",
    "job_city": "Chicago",
    "job_state": "IL",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Design user-centric products for our fast-paced startup. Creativity and collaboration are key.",
    "job_highlights": {"Qualifications": ["UX/UI", "Figma"], "Responsibilities": ["Wireframing", "Prototyping"]},
    "job_apply_link": "https://example.com/apply/recent_3",
    "job_required_skills": ["UX Design", "UI Design"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 90000,
    "job_salary_max": 120000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 0.5)), # 12 hours ago
    "job_category": "Design",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "job_sort_recent_4",
    "employer_logo": "https://placehold.co/48x48/B9C8D7/ffffff?text=GR",
    "employer_name": "Green Solutions Inc.",
    "job_title": "Environmental Scientist",
    "job_city": "Nairobi",
    "job_state": None,
    "job_country": "Kenya",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Contribute to sustainable practices and environmental research in East Africa.",
    "job_highlights": {"Qualifications": ["Environmental Science", "Research"], "Responsibilities": ["Fieldwork", "Data analysis"]},
    "job_apply_link": "https://example.com/apply/recent_4",
    "job_required_skills": ["Environmental Science", "Research"],
    "job_salary_currency": "KES",
    "job_salary_period": "YEAR",
    "job_salary_min": 1500000,
    "job_salary_max": 2500000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 0.7)), # ~17 hours ago
    "job_category": "Science",
    "job_requirements": ["mid_level"]
  }
]

# --- Upload data to Firestore ---
def upload_jobs_to_firestore():
    if APP_ID == 'YOUR_APP_ID_HERE':
        print("ERROR: Please replace 'YOUR_APP_ID_HERE' in the script with your actual __app_id.")
        return

    print(f"Attempting to upload {len(sorting_test_jobs)} sorting test jobs to Firestore collection: {COLLECTION_PATH}")
    
    for job_data in sorting_test_jobs:
        job_id = job_data['job_id']
        doc_ref = db.collection(COLLECTION_PATH).document(job_id)
        
        # Convert job_posted_at_timestamp from Unix timestamp to Firestore Timestamp object
        if 'job_posted_at_timestamp' in job_data and job_data['job_posted_at_timestamp'] is not None:
            # Use server timestamp for consistency and to avoid local time zone issues
            # This will set the timestamp to when the document is written on the server
            # For testing sorting, we're using fixed past timestamps, so we convert them.
            job_data['job_posted_at_timestamp'] = datetime.fromtimestamp(job_data['job_posted_at_timestamp'])

        try:
            doc_ref.set(job_data)
            print(f"Successfully uploaded job: {job_id}")
        except Exception as e:
            print(f"Error uploading job {job_id}: {e}")
    print("Sorting test job seeding process completed.")

if __name__ == "__main__":
    upload_jobs_to_firestore()
