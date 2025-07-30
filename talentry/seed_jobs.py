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
APP_ID ='default-app-id' # <--- IMPORTANT: REPLACE THIS!
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

# --- Dummy Job Data (Same as in previous API, but with full details) ---
dummy_jobs = [
  {
    "job_id": "dummy_job_1",
    "employer_logo": "https://placehold.co/48x48/4640DE/ffffff?text=AC",
    "employer_name": "Acme Corp",
    "job_title": "Senior Software Engineer",
    "job_city": "San Francisco",
    "job_state": "CA",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are looking for a passionate Senior Software Engineer to join our dynamic team. You will be responsible for developing and maintaining high-quality software solutions. Strong problem-solving skills and experience with modern web technologies are essential. This role involves working on cutting-edge projects and collaborating with a talented team of engineers. We offer a vibrant work environment, opportunities for professional growth, and a chance to make a significant impact.",
    "job_highlights": {
      "Qualifications": [
        "5+ years of experience in software development",
        "Proficiency in React, Node.js, and TypeScript",
        "Experience with cloud platforms (AWS, GCP, Azure)",
        "Strong understanding of data structures and algorithms",
        "Bachelor's degree in Computer Science or related field"
      ],
      "Responsibilities": [
        "Design, develop, and deploy scalable web applications",
        "Collaborate with cross-functional teams to define, design, and ship new features",
        "Write clean, maintainable, and efficient code following best practices",
        "Participate in code reviews and mentor junior developers",
        "Troubleshoot and debug issues, ensuring high performance and responsiveness"
      ],
      "Benefits": [
        "Competitive salary",
        "Health, dental, and vision insurance",
        "Unlimited PTO",
        "401(k) matching",
        "Professional development budget",
        "Free daily catered lunch and snacks"
      ],
      "Nice-To-Haves": ["Experience with GraphQL", "Open-source contributions", "Master's degree"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_1",
    "job_required_skills": ["React", "Node.js", "TypeScript", "AWS", "SQL"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 120000,
    "job_salary_max": 180000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 5)), # 5 days ago
    "job_category": "Technology",
    "job_requirements": ["senior_level"] # Added for filtering
  },
  {
    "job_id": "dummy_job_2",
    "employer_logo": "https://placehold.co/48x48/FF5733/ffffff?text=GD",
    "employer_name": "Global Designs",
    "job_title": "UX Designer",
    "job_city": "London",
    "job_state": None,
    "job_country": "UK",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Join our creative team as a UX Designer. You will be instrumental in crafting intuitive and engaging user experiences for our diverse product portfolio. A strong portfolio showcasing your design process is a must. We value creativity, user-centric thinking, and a collaborative spirit. This is an opportunity to shape the future of our digital products.",
    "job_highlights": {
      "Qualifications": [
        "3+ years of UX design experience",
        "Proficiency in Figma, Sketch, or Adobe XD",
        "Strong understanding of user-centered design principles",
        "Experience with user research and usability testing",
        "Bachelor's degree in Design, HCI, or related field"
      ],
      "Responsibilities": [
        "Conduct user research and analyze user feedback to inform design decisions",
        "Create wireframes, prototypes, and high-fidelity mockups for web and mobile applications",
        "Collaborate with product managers and engineers throughout the product development lifecycle",
        "Iterate on designs based on feedback and usability testing results",
        "Develop and maintain design systems and style guides"
      ],
      "Benefits": [
        "Flexible working hours",
        "Creative work environment",
        "Annual design conference budget",
        "Company-sponsored team events",
        "Access to premium design tools and resources"
      ],
      "Nice-To-Haves": ["Animation skills", "Experience with motion design", "Front-end development knowledge"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_2",
    "job_required_skills": ["Figma", "User Research", "Prototyping", "Wireframing", "Usability Testing"],
    "job_salary_currency": "GBP",
    "job_salary_period": "YEAR",
    "job_salary_min": 50000,
    "job_salary_max": 70000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 2)), # 2 days ago
    "job_category": "Design",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "dummy_job_3",
    "employer_logo": "https://placehold.co/48x48/33FF57/ffffff?text=MM",
    "employer_name": "Market Movers",
    "job_title": "Digital Marketing Specialist",
    "job_city": "Remote",
    "job_state": None,
    "job_country": None,
    "job_is_remote": True,
    "job_employment_type": "FULLTIME",
    "job_description": "We are seeking a highly motivated Digital Marketing Specialist to manage our online presence and drive lead generation. You will be responsible for SEO, SEM, social media, and email marketing campaigns. This is a fully remote position, offering flexibility and the opportunity to work with a global team. We're looking for someone who is data-driven and passionate about digital trends.",
    "job_highlights": {
      "Qualifications": [
        "2+ years of experience in digital marketing",
        "Proficiency in Google Analytics and Ads",
        "Strong understanding of SEO best practices and tools",
        "Excellent written and verbal communication skills",
        "Experience with email marketing platforms (e.g., Mailchimp, HubSpot)"
      ],
      "Responsibilities": [
        "Develop and execute digital marketing strategies across various channels",
        "Manage social media accounts and content calendars",
        "Monitor and report on campaign performance, providing actionable insights",
        "Conduct keyword research and competitive analysis to identify opportunities",
        "Optimize website content and landing pages for SEO"
      ],
      "Benefits": [
        "Work from anywhere",
        "Performance bonuses",
        "Access to online courses and certifications",
        "Annual company retreat",
        "Flexible work schedule"
      ],
      "Nice-To-Haves": ["Experience with HubSpot", "Content creation skills", "A/B testing experience"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_3",
    "job_required_skills": ["SEO", "SEM", "Social Media Marketing", "Google Analytics", "Email Marketing"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 60000,
    "job_salary_max": 90000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 10)), # 10 days ago
    "job_category": "Marketing",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "dummy_job_4",
    "employer_logo": "https://placehold.co/48x48/5733FF/ffffff?text=FS",
    "employer_name": "FinTech Solutions",
    "job_title": "Financial Analyst",
    "job_city": "New York",
    "job_state": "NY",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are seeking a detail-oriented Financial Analyst to support our investment team. You will be responsible for financial modeling, data analysis, and preparing reports for stakeholders. This role offers exposure to complex financial instruments and strategic decision-making processes. Ideal candidate is highly analytical and proactive.",
    "job_highlights": {
      "Qualifications": [
        "Bachelor's degree in Finance, Economics, or related field",
        "2+ years of experience in financial analysis or investment banking",
        "Proficiency in Excel and financial modeling tools (e.g., Bloomberg Terminal)",
        "Strong analytical and problem-solving skills",
        "Excellent communication and presentation abilities"
      ],
      "Responsibilities": [
        "Conduct in-depth financial analysis and forecasting for various projects",
        "Prepare comprehensive financial reports and presentations for senior management",
        "Support budgeting and planning processes across departments",
        "Monitor market trends, economic indicators, and industry developments",
        "Evaluate investment opportunities and provide recommendations"
      ],
      "Benefits": [
        "Performance-based bonuses",
        "Health and wellness programs",
        "Retirement plans with company contribution",
        "Opportunities for career advancement and professional certifications (e.g., CFA)",
        "Modern office space in a prime location"
      ],
      "Nice-To-Haves": ["CFA designation", "Experience with Python for data analysis", "Experience in a fast-paced startup environment"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_4",
    "job_required_skills": ["Financial Modeling", "Data Analysis", "Excel", "Valuation"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 75000,
    "job_salary_max": 110000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 7)), # 7 days ago
    "job_category": "Finance",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "dummy_job_5",
    "employer_logo": "https://placehold.co/48x48/FF33A1/ffffff?text=HR",
    "employer_name": "PeopleFirst HR",
    "job_title": "HR Business Partner",
    "job_city": "Chicago",
    "job_state": "IL",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are looking for an experienced HR Business Partner to support our growing teams. You will be responsible for talent acquisition, employee relations, and HR policy implementation. This role requires a strategic thinker who can align HR initiatives with business objectives and foster a positive work culture.",
    "job_highlights": {
      "Qualifications": [
        "5+ years of HR experience, with 2+ years as an HRBP",
        "Strong knowledge of employment law and HR best practices",
        "Excellent communication and interpersonal skills",
        "Ability to build strong relationships with employees and management",
        "Bachelor's degree in Human Resources or related field"
      ],
      "Responsibilities": [
        "Partner with business leaders on HR strategies and initiatives",
        "Manage recruitment and onboarding processes for new hires",
        "Provide guidance and support on employee relations issues, including conflict resolution and disciplinary actions",
        "Develop and implement HR policies and programs that align with company goals",
        "Conduct performance management and talent development activities"
      ],
      "Benefits": [
        "Comprehensive health benefits",
        "Paid time off",
        "Professional development opportunities and tuition reimbursement",
        "Employee assistance program",
        "Wellness initiatives"
      ],
      "Nice-To-Haves": ["HR certification (SHRM-CP, SPHR)", "Experience in tech industry", "Master's degree in HR"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_5",
    "job_required_skills": ["Employee Relations", "Talent Acquisition", "HR Policies", "Performance Management"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 90000,
    "job_salary_max": 130000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 1)), # 1 day ago
    "job_category": "Human Resource",
    "job_requirements": ["senior_level"]
  },
  {
    "job_id": "dummy_job_6",
    "employer_logo": "https://placehold.co/48x48/33A1FF/ffffff?text=ES",
    "employer_name": "Engineered Solutions",
    "job_title": "Mechanical Engineer",
    "job_city": "Berlin",
    "job_state": None,
    "job_country": "DE",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Seeking a skilled Mechanical Engineer to design and develop innovative products. You will work on all phases of product development, from concept to production. We are a leading engineering firm known for our cutting-edge solutions and collaborative environment. This role offers significant opportunities for professional growth and impact.",
    "job_highlights": {
      "Qualifications": [
        "Bachelor's degree in Mechanical Engineering",
        "3+ years of experience in product design and development",
        "Proficiency in CAD software (SolidWorks, AutoCAD, CATIA)",
        "Strong analytical and problem-solving skills with attention to detail",
        "Experience with FEA (Finite Element Analysis) software"
      ],
      "Responsibilities": [
        "Design and develop mechanical components and systems for new products",
        "Conduct simulations and analyze performance data to optimize designs",
        "Create detailed technical drawings and specifications for manufacturing",
        "Collaborate with cross-functional teams, including electrical and software engineers",
        "Participate in design reviews and provide technical expertise"
      ],
      "Benefits": [
        "Innovation-focused environment",
        "Flexible work arrangements",
        "Professional training budget for conferences and courses",
        "Team-building events and company outings",
        "Generous vacation policy"
      ],
      "Nice-To-Haves": ["Experience with 3D printing", "Knowledge of robotics and automation", "Master's degree"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_6",
    "job_required_skills": ["CAD", "Product Design", "FEA", "SolidWorks", "Prototyping"],
    "job_salary_currency": "EUR",
    "job_salary_period": "YEAR",
    "job_salary_min": 65000,
    "job_salary_max": 95000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 4)), # 4 days ago
    "job_category": "Engineering",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "dummy_job_7",
    "employer_logo": "https://placehold.co/48x48/FF5733/ffffff?text=AB",
    "employer_name": "Alpha Beta Inc.",
    "job_title": "Business Development Manager",
    "job_city": "Paris",
    "job_state": None,
    "job_country": "FR",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are looking for a dynamic Business Development Manager to expand our market reach and drive revenue growth. You will identify new opportunities and build strong client relationships. This role is critical to our expansion strategy and requires a proactive, results-oriented individual with excellent interpersonal skills.",
    "job_highlights": {
      "Qualifications": [
        "5+ years of experience in business development or sales management",
        "Proven track record of achieving and exceeding sales targets",
        "Excellent negotiation and communication skills, both written and verbal",
        "Ability to work independently and as part of a collaborative team",
        "Strong understanding of market dynamics and competitive landscape"
      ],
      "Responsibilities": [
        "Identify and pursue new business opportunities and strategic partnerships",
        "Develop and maintain strong, long-lasting client relationships",
        "Prepare and deliver compelling sales presentations and proposals",
        "Negotiate contracts and close deals to achieve revenue goals",
        "Collaborate with marketing and product teams to align strategies"
      ],
      "Benefits": [
        "Commission-based incentives with high earning potential",
        "Travel opportunities for client meetings and industry events",
        "Mentorship programs from senior leadership",
        "Company car allowance or transportation benefits",
        "Comprehensive training and professional development"
      ],
      "Nice-To-Haves": ["MBA", "Fluency in multiple languages (especially French and English)", "Experience in SaaS industry"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_7",
    "job_required_skills": ["Sales", "Negotiation", "Client Relationship Management", "Lead Generation", "Market Analysis"],
    "job_salary_currency": "EUR",
    "job_salary_period": "YEAR",
    "job_salary_min": 80000,
    "job_salary_max": 120000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 9)), # 9 days ago
    "job_category": "Business",
    "job_requirements": ["director"]
  },
  {
    "job_id": "dummy_job_8",
    "employer_logo": "https://placehold.co/48x48/A133FF/ffffff?text=SO",
    "employer_name": "Sales Force One",
    "job_title": "Sales Representative",
    "job_city": "Madrid",
    "job_state": None,
    "job_country": "ES",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Join our growing sales team as a Sales Representative. You will be responsible for generating leads, qualifying prospects, and closing sales to meet revenue targets. We offer a supportive environment with extensive training and opportunities for career advancement. Ideal for a driven individual looking to excel in sales.",
    "job_highlights": {
      "Qualifications": [
        "1+ year of sales experience (inside or outside sales)",
        "Strong communication and persuasion skills",
        "Ability to work in a fast-paced, target-driven environment",
        "Goal-oriented and self-motivated with a positive attitude",
        "High school diploma or equivalent; Bachelor's degree preferred"
      ],
      "Responsibilities": [
        "Identify and contact potential customers through various channels (calls, emails, social media)",
        "Present and demonstrate products/services to prospective clients",
        "Negotiate terms and close sales to achieve monthly/quarterly quotas",
        "Maintain accurate customer records and follow up on leads in CRM system",
        "Collaborate with sales team to share best practices and achieve collective goals"
      ],
      "Benefits": [
        "Uncapped commission structure with competitive base salary",
        "Comprehensive sales training programs",
        "Clear career growth opportunities within the sales organization",
        "Team bonuses and incentives",
        "Health benefits package"
      ],
      "Nice-To-Haves": ["CRM software experience", "Bilingual (Spanish/English)", "Experience in B2B sales"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_8",
    "job_required_skills": ["Sales", "Communication", "Lead Generation", "Customer Service"],
    "job_salary_currency": "EUR",
    "job_salary_period": "YEAR",
    "job_salary_min": 40000,
    "job_salary_max": 60000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 6)), # 6 days ago
    "job_category": "Sales",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "dummy_job_9",
    "employer_logo": "https://placehold.co/48x48/FF33A1/ffffff?text=MR",
    "employer_name": "MediResearch",
    "job_title": "Research Assistant",
    "job_city": "Florence",
    "job_state": None,
    "job_country": "IT",
    "job_is_remote": False,
    "job_employment_type": "PARTTIME",
    "job_description": "We are seeking a dedicated Research Assistant to support our medical research projects. You will assist with data collection, analysis, and literature reviews. This part-time role is ideal for students or individuals looking to gain experience in a research setting. Opportunity to contribute to impactful scientific discoveries.",
    "job_highlights": {
      "Qualifications": [
        "Bachelor's degree in a scientific field (Biology, Chemistry, etc.)",
        "Experience with data collection and basic analysis techniques",
        "Strong organizational skills and attention to detail",
        "Ability to follow protocols and work independently",
        "Excellent written and verbal communication skills"
      ],
      "Responsibilities": [
        "Assist with experimental procedures and laboratory tasks",
        "Collect, record, and organize research data accurately",
        "Perform literature reviews and summarize findings",
        "Prepare data for analysis and assist with preliminary analysis",
        "Maintain laboratory equipment and supplies"
      ],
      "Benefits": [
        "Opportunity to contribute to groundbreaking medical research",
        "Flexible part-time hours to accommodate studies or other commitments",
        "Mentorship from senior researchers and scientists",
        "Exposure to cutting-edge research methodologies",
        "Collaborative and supportive team environment"
      ],
      "Nice-To-Haves": ["Experience with statistical software (e.g., SPSS, R)", "Prior laboratory experience", "Publications or conference presentations"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_9",
    "job_required_skills": ["Data Collection", "Research", "Analysis", "Scientific Writing"],
    "job_salary_currency": "EUR",
    "job_salary_period": "HOUR",
    "job_salary_min": 20,
    "job_salary_max": 30,
    "job_posted_at_timestamp": int(time.time() - (86400 * 3)), # 3 days ago
    "job_category": "Science",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "dummy_job_10",
    "employer_logo": "https://placehold.co/48x48/33FF57/ffffff?text=EI",
    "employer_name": "EduTech Innovations",
    "job_title": "Content Creator (Educational)",
    "job_city": "Remote",
    "job_state": None,
    "job_country": None,
    "job_is_remote": True,
    "job_employment_type": "CONTRACTOR",
    "job_description": "We are looking for a creative Content Creator to develop engaging educational materials for our online learning platform. Experience in e-learning content development is a plus. This contractor role offers the flexibility to work from anywhere and contribute to impactful educational experiences for learners worldwide.",
    "job_highlights": {
      "Qualifications": [
        "Proven experience in content creation, preferably educational or e-learning",
        "Strong writing and communication skills, with ability to simplify complex topics",
        "Ability to explain complex topics clearly and concisely",
        "Familiarity with e-learning platforms and content management systems",
        "Portfolio showcasing previous content creation work"
      ],
      "Responsibilities": [
        "Develop engaging course content, including text, video scripts, quizzes, and interactive exercises",
        "Collaborate with subject matter experts to ensure accuracy and relevance of content",
        "Ensure content aligns with learning objectives and pedagogical best practices",
        "Review and edit existing content for clarity, accuracy, and consistency",
        "Stay updated on e-learning trends and technologies"
      ],
      "Benefits": [
        "Flexible contract work with competitive rates",
        "Opportunity to impact education globally and reach a wide audience",
        "Access to a network of educators and industry experts",
        "Work-life balance with remote work flexibility",
        "Professional growth opportunities in e-learning content development"
      ],
      "Nice-To-Haves": ["Video editing skills", "Instructional design experience", "Experience with graphic design tools"]
    },
    "job_apply_link": "https://example.com/apply/dummy_job_10",
    "job_required_skills": ["Content Creation", "Writing", "E-learning", "Instructional Design"],
    "job_salary_currency": "USD",
    "job_salary_period": "HOUR",
    "job_salary_min": 35,
    "job_salary_max": 50,
    "job_posted_at_timestamp": int(time.time() - (86400 * 8)), # 8 days ago
    "job_category": "Education",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "dummy_job_11",
    "employer_logo": "https://placehold.co/48x48/FF33A1/ffffff?text=DS",
    "employer_name": "Data Solutions Co.",
    "job_title": "Data Scientist",
    "job_city": "Boston",
    "job_state": "MA",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Seeking a Data Scientist to analyze complex datasets and build predictive models. You will work on challenging problems and contribute to data-driven decision-making.",
    "job_highlights": {
      "Qualifications": [
        "Master's or Ph.D. in a quantitative field",
        "3+ years of experience in data science",
        "Proficiency in Python or R and SQL",
        "Experience with machine learning frameworks (TensorFlow, PyTorch)",
      ],
      "Responsibilities": [
        "Develop and implement machine learning models",
        "Perform exploratory data analysis and identify insights",
        "Collaborate with engineering and product teams",
        "Communicate findings to non-technical stakeholders",
      ],
      "Benefits": [
        "Cutting-edge projects",
        "Generous research budget",
        "Conference attendance opportunities",
        "Flexible work arrangements",
      ],
      "Nice-To-Haves": ["Experience with big data technologies (Spark, Hadoop)", "Cloud experience"],
    },
    "job_apply_link": "https://example.com/apply/dummy_job_11",
    "job_required_skills": ["Python", "Machine Learning", "SQL", "Data Analysis"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 130000,
    "job_salary_max": 190000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 12)), # 12 days ago
    "job_category": "Technology",
    "job_requirements": ["senior_level"]
  },
  {
    "job_id": "dummy_job_12",
    "employer_logo": "https://placehold.co/48x48/33A1FF/ffffff?text=PM",
    "employer_name": "Product Mastery",
    "job_title": "Product Manager",
    "job_city": "San Francisco",
    "job_state": "CA",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are hiring a Product Manager to lead the development of our next-generation products. You will define product strategy, roadmaps, and work closely with engineering and design teams.",
    "job_highlights": {
      "Qualifications": [
        "5+ years of product management experience",
        "Proven track record of launching successful products",
        "Strong understanding of agile methodologies",
        "Excellent communication and leadership skills",
      ],
      "Responsibilities": [
        "Define product vision, strategy, and roadmap",
        "Gather and prioritize product requirements",
        "Work closely with engineering, design, and marketing teams",
        "Conduct market research and competitive analysis",
      ],
      "Benefits": [
        "Impactful role in product direction",
        "Equity options",
        "Professional development courses",
        "Team offsites",
      ],
      "Nice-To-Haves": ["MBA", "Technical background", "Experience in SaaS"],
    },
    "job_apply_link": "https://example.com/apply/dummy_job_12",
    "job_required_skills": ["Product Management", "Agile", "Roadmapping", "Market Research"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 140000,
    "job_salary_max": 200000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 6)), # 6 days ago
    "job_category": "Business",
    "job_requirements": ["director"]
  },
  {
    "job_id": "dummy_job_13",
    "employer_logo": "https://placehold.co/48x48/A133FF/ffffff?text=CS",
    "employer_name": "Customer Success Hub",
    "job_title": "Customer Success Manager",
    "job_city": "Remote",
    "job_state": None,
    "job_country": "US",
    "job_is_remote": True,
    "job_employment_type": "FULLTIME",
    "job_description": "Looking for a Customer Success Manager to build strong relationships with our clients and ensure their success. You will be their primary point of contact and advocate.",
    "job_highlights": {
      "Qualifications": [
        "3+ years of customer success or account management experience",
        "Excellent interpersonal and communication skills",
        "Strong problem-solving abilities",
        "Experience with CRM software (e.g., Salesforce)",
      ],
      "Responsibilities": [
        "Onboard new customers and ensure successful adoption",
        "Proactively engage with customers to drive value and retention",
        "Address customer inquiries and resolve issues",
        "Identify upsell and cross-sell opportunities",
      ],
      "Benefits": [
        "Remote-first culture",
        "Client success bonuses",
        "Continuous learning opportunities",
        "Team collaboration tools",
      ],
      "Nice-To-Haves": ["SaaS experience", "Experience with churn reduction strategies"],
    },
    "job_apply_link": "https://example.com/apply/dummy_job_13",
    "job_required_skills": ["Customer Success", "Account Management", "CRM", "Relationship Building"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 80000,
    "job_salary_max": 110000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 2)), # 2 days ago
    "job_category": "Customer Service",
    "job_requirements": ["mid_level"]
  },
  {
    "job_id": "dummy_job_14",
    "employer_logo": "https://placehold.co/48x48/33FF57/ffffff?text=IT",
    "employer_name": "IT Solutions Group",
    "job_title": "IT Support Specialist",
    "job_city": "Austin",
    "job_state": "TX",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "Seeking an IT Support Specialist to provide technical assistance and support to our internal users. You will troubleshoot hardware and software issues and maintain IT systems.",
    "job_highlights": {
      "Qualifications": [
        "2+ years of IT support experience",
        "Proficiency in Windows and macOS operating systems",
        "Knowledge of network troubleshooting and hardware repair",
        "Excellent communication and problem-solving skills",
      ],
      "Responsibilities": [
        "Provide technical support to end-users via phone, email, or in-person",
        "Troubleshoot and resolve hardware, software, and network issues",
        "Install, configure, and maintain computer systems and peripherals",
        "Document support procedures and solutions",
      ],
      "Benefits": [
        "Supportive team environment",
        "Opportunities for IT certifications",
        "Growth within IT department",
        "On-site gym",
      ],
      "Nice-To-Haves": ["Experience with cloud-based IT services", "CompTIA A+ certification"],
    },
    "job_apply_link": "https://example.com/apply/dummy_job_14",
    "job_required_skills": ["Technical Support", "Troubleshooting", "Networking", "Windows", "macOS"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 50000,
    "job_salary_max": 70000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 10)), # 10 days ago
    "job_category": "IT",
    "job_requirements": ["entry_level"]
  },
  {
    "job_id": "dummy_job_15",
    "employer_logo": "https://placehold.co/48x48/FF5733/ffffff?text=PR",
    "employer_name": "Public Relations Pros",
    "job_title": "Public Relations Specialist",
    "job_city": "Washington",
    "job_state": "DC",
    "job_country": "US",
    "job_is_remote": False,
    "job_employment_type": "FULLTIME",
    "job_description": "We are seeking a Public Relations Specialist to manage our public image and media relations. You will develop PR strategies, write press releases, and engage with media outlets. This role offers significant opportunities for professional growth and impact.",
    "job_highlights": {
      "Qualifications": [
        "3+ years of public relations or communications experience",
        "Strong writing and editing skills",
        "Experience with media relations and press outreach",
        "Ability to manage multiple projects simultaneously",
      ],
      "Responsibilities": [
        "Develop and implement PR strategies and campaigns",
        "Write and distribute press releases, media alerts, and pitches",
        "Build and maintain relationships with media contacts",
        "Monitor media coverage and prepare reports",
      ],
      "Benefits": [
        "Dynamic work environment",
        "Opportunity to work with high-profile clients",
        "Networking events",
        "Flexible work options",
      ],
      "Nice-To-Haves": ["Experience with crisis communication", "Journalism background"],
    },
    "job_apply_link": "https://example.com/apply/dummy_job_15",
    "job_required_skills": ["Public Relations", "Media Relations", "Content Writing", "Communications"],
    "job_salary_currency": "USD",
    "job_salary_period": "YEAR",
    "job_salary_min": 65000,
    "job_salary_max": 90000,
    "job_posted_at_timestamp": int(time.time() - (86400 * 7)), # 7 days ago
    "job_category": "Marketing",
    "job_requirements": ["mid_level"]
  }
]

# --- Upload data to Firestore ---
def upload_jobs_to_firestore():
    if APP_ID == 'YOUR_APP_ID_HERE':
        print("ERROR: Please replace 'YOUR_APP_ID_HERE' in the script with your actual __app_id.")
        return

    print(f"Attempting to upload {len(dummy_jobs)} jobs to Firestore collection: {COLLECTION_PATH}")
    
    for job_data in dummy_jobs:
        job_id = job_data['job_id']
        doc_ref = db.collection(COLLECTION_PATH).document(job_id)
        
        # Convert job_posted_at_timestamp from Unix timestamp to Firestore Timestamp object
        if 'job_posted_at_timestamp' in job_data and job_data['job_posted_at_timestamp'] is not None:
            # Use server timestamp for consistency and to avoid local time zone issues
            # This will set the timestamp to when the document is written on the server
            job_data['job_posted_at_timestamp'] = firestore.SERVER_TIMESTAMP 
            # If you specifically want to use the *exact* dummy timestamp, convert it:
            # job_data['job_posted_at_timestamp'] = datetime.fromtimestamp(job_data['job_posted_at_timestamp'])

        try:
            doc_ref.set(job_data)
            print(f"Successfully uploaded job: {job_id}")
        except Exception as e:
            print(f"Error uploading job {job_id}: {e}")
    print("Job seeding process completed.")

if __name__ == "__main__":
    upload_jobs_to_firestore()
