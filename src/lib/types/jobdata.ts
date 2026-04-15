//data

import { Client ,HR,HRWithClient,EmailTemplate} from "./jobs";

// TEMPORARY DATA


export let role = "recruiter";

const today = new Date();
const event = (title: string, year: number, month: number, day: number, startHour: number, startMin: number, endHour: number, endMin: number) => ({
  title,
  start: new Date(year, month, day, startHour, startMin),
  end: new Date(year, month, day, endHour, endMin),
});
// YOU SHOULD CHANGE THE DATES OF THE EVENTS TO THE CURRENT DATE TO SEE THE EVENTS ON THE CALENDAR
export const calendarEvents = [
  event("Interview: Alice Johnson", today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 9, 45),
  event("Interview: Bob Smith", today.getFullYear(), today.getMonth(), today.getDate(), 10, 30, 11, 15),
  event("Interview: Charlie Lee", today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 14, 45),

  // Tomorrow
  event("Interview: Diana Ross", today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0, 9, 45),
  event("Interview: Ethan Hunt", today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0, 11, 45),
  event("Interview: Fiona Patel", today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0, 15, 45),

  // Day after tomorrow
  event("Interview: George Kim", today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0, 10, 45),
  event("Interview: Hannah White", today.getFullYear(), today.getMonth(), today.getDate() + 2, 13, 0, 13, 45),

  // Next week
  event("Interview: Ian Brown", today.getFullYear(), today.getMonth(), today.getDate() + 5, 9, 0, 9, 45),
  event("Interview: Jessica Green", today.getFullYear(), today.getMonth(), today.getDate() + 6, 11, 0, 11, 45),
];

export const jobsData = [
  {
    id: 1,
    department: 'DESIGN',
    title: 'Senior Product Designer',
    candidates: { total: 57, new: 3 },
    location: 'Purwokerto',
    type: 'Full time',
    status: 'Draft',
    client: 'Client A',
    jobStatus: 'active'
  },
  {
    id: 2,
    department: 'DESIGN',
    title: 'UI/UX Designer',
    candidates: { total: 10, new: 6 },
    location: 'Purwokerto',
    type: 'Freelancer',
    status: 'Published',
    client: 'Client B',
    jobStatus: 'active'
  },
  {
    id: 3,
    department: 'DESIGN',
    title: 'Head of UX',
    candidates: { total: 2, new: 0 },
    location: 'Purwokerto',
    type: 'Full time',
    status: 'Published',
    client: 'Client A',
    jobStatus: 'active'
  },
  {
    id: 4,
    department: 'MARKETING',
    title: 'Copywriter',
    candidates: { total: 78, new: 5 },
    location: 'Purwokerto',
    type: 'Full time',
    status: 'Draft',
    client: 'Client C',
    jobStatus: 'active'
  },
  {
    id: 5,
    department: 'DESIGN',
    title: 'Senior Designer',
    candidates: { total: 10, new: 3 },
    location: 'Purwokerto',
    type: 'Full time',
    status: 'Published',
    client: 'Client A',
    jobStatus: 'active'
  },
  {
    id: 6,
    department: 'DESIGN',
    title: 'Junior Designer',
    candidates: { total: 20, new: 8 },
    location: 'Purwokerto',
    type: 'Full time',
    status: 'Published',
    client: 'Client D',
    jobStatus: 'active'
  },
  {
    id: 7,
    department: 'DEVELOPMENT',
    title: 'Wordpress Developer',
    candidates: { total: 35, new: 12 },
    location: 'Purwokerto',
    type: 'Freelancer',
    status: 'Published',
    client: 'Client E',
    jobStatus: 'active'
  },
  {
    id: 8,
    department: 'HR',
    title: 'Recruiter',
    candidates: { total: 5, new: 0 },
    location: 'Jogja',
    type: 'Full time',
    status: 'On Hold',
    client: 'Client C',
    jobStatus: 'inactive'
  },
  {
    id: 9,
    department: 'IT',
    title: 'IT Support',
    candidates: { total: 12, new: 1 },
    location: 'Jogja',
    type: 'Full time',
    status: 'Closed',
    client: 'Client A',
    jobStatus: 'inactive'
  }
];

export const candidateJobData = [
  {
    id: 1,
    name: 'Hood Robin',
    pipelineStatus: 'Screening',
    dateApplied: '2025-09-14',
    photo: "https://i.pravatar.cc/150?u=1",
    email: "hood.robin@example.com",
    phone: "+1 555-100-0001",
    sourcedBy: "Recruiter A",
    location: "New York, USA",
    currentCompany: "TechCorp",
    currentJob: "Frontend Developer",
    appliedFor: "Senior Frontend Engineer",
    experience: "4 ",
    education: "B.Sc. Computer Science",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    currentCTC: "$70,000"
  },
  {
    id: 2,
    name: 'Jane Doe',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-03',
    photo: "https://i.pravatar.cc/150?u=2",
    email: "jane.doe@example.com",
    phone: "+1 555-100-0002",
    sourcedBy: "Recruiter B",
    location: "San Francisco, USA",
    currentCompany: "InnovateX",
    currentJob: "Data Analyst",
    appliedFor: "Data Scientist",
    experience: "3 ",
    education: "M.Sc. Data Science",
    skills: ["Python", "SQL", "Tableau", "Machine Learning"],
    currentCTC: "$80,000"
  },
  {
    id: 3,
    name: 'John Smith',
    pipelineStatus: 'Test',
    dateApplied: '2025-08-28',
    photo: "https://i.pravatar.cc/150?u=3",
    email: "john.smith@example.com",
    phone: "+1 555-100-0003",
    sourcedBy: "Recruiter C",
    location: "Austin, USA",
    currentCompany: "NextGen Systems",
    currentJob: "Backend Developer",
    appliedFor: "Fullstack Engineer",
    experience: "5 ",
    education: "B.Tech. Software Engineering",
    skills: ["Node.js", "Express", "MongoDB", "Docker"],
    currentCTC: "$95,000"
  },
  {
    id: 4,
    name: 'Alice Johnson',
    pipelineStatus: 'Rejected',
    dateApplied: '2025-09-05',
    photo: "https://i.pravatar.cc/150?u=4",
    email: "alice.johnson@example.com",
    phone: "+1 555-100-0004",
    sourcedBy: "Recruiter A",
    location: "Chicago, USA",
    currentCompany: "SoftSolutions",
    currentJob: "QA Engineer",
    appliedFor: "Automation Test Engineer",
    experience: "2 ",
    education: "B.Sc. Information Technology",
    skills: ["Selenium", "Cypress", "Java", "Postman"],
    currentCTC: "$65,000"
  },
  {
    id: 5,
    name: 'Bob Williams',
    pipelineStatus: 'Hired',
    dateApplied: '2025-08-30',
    photo: "https://i.pravatar.cc/150?u=5",
    email: "bob.williams@example.com",
    phone: "+1 555-100-0005",
    sourcedBy: "Recruiter D",
    location: "Los Angeles, USA",
    currentCompany: "CloudNet",
    currentJob: "DevOps Engineer",
    appliedFor: "Senior DevOps Engineer",
    experience: "6 ",
    education: "M.Sc. Computer Networks",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
    currentCTC: "$110,000"
  },
  {
    id: 6,
    name: 'Charlie Brown',
    pipelineStatus: 'Screening',
    dateApplied: '2025-09-07',
    photo: "https://i.pravatar.cc/150?u=6",
    email: "charlie.brown@example.com",
    phone: "+1 555-100-0006",
    sourcedBy: "Recruiter B",
    location: "Seattle, USA",
    currentCompany: "VisionWorks",
    currentJob: "UI/UX Designer",
    appliedFor: "Product Designer",
    experience: "3 ",
    education: "B.A. Graphic Design",
    skills: ["Figma", "Sketch", "Adobe XD", "UI/UX"],
    currentCTC: "$68,000"
  },
  {
    id: 7,
    name: 'Diana Prince',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-06',
    photo: "https://i.pravatar.cc/150?u=7",
    email: "diana.prince@example.com",
    phone: "+1 555-100-0007",
    sourcedBy: "Recruiter C",
    location: "Boston, USA",
    currentCompany: "GlobalFin",
    currentJob: "Business Analyst",
    appliedFor: "Product Manager",
    experience: "5 ",
    education: "MBA Business Administration",
    skills: ["Agile", "Scrum", "Stakeholder Management", "Jira"],
    currentCTC: "$90,000"
  },
  {
    id: 8,
    name: 'Clark Kent',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-04',
    photo: "https://i.pravatar.cc/150?u=8",
    email: "clark.kent@example.com",
    phone: "+1 555-100-0008",
    sourcedBy: "Recruiter D",
    location: "Metropolis, USA",
    currentCompany: "Daily Planet",
    currentJob: "Reporter",
    appliedFor: "Content Strategist",
    experience: "6 ",
    education: "M.A. Journalism",
    skills: ["Writing", "SEO", "Editing", "Public Relations"],
    currentCTC: "$75,000"
  },
  {
    id: 9,
    name: 'Bruce Wayne',
    pipelineStatus: 'Test',
    dateApplied: '2025-09-02',
    photo: "https://i.pravatar.cc/150?u=9",
    email: "bruce.wayne@example.com",
    phone: "+1 555-100-0009",
    sourcedBy: "Recruiter A",
    location: "Gotham, USA",
    currentCompany: "Wayne Enterprises",
    currentJob: "CEO",
    appliedFor: "Investor",
    experience: "10 ",
    education: "MBA Finance",
    skills: ["Leadership", "Strategy", "Finance", "Negotiation"],
    currentCTC: "$250,000"
  },
  {
    id: 10,
    name: 'Peter Parker',
    pipelineStatus: 'Rejected',
    dateApplied: '2025-08-31',
    photo: "https://i.pravatar.cc/150?u=10",
    email: "peter.parker@example.com",
    phone: "+1 555-100-0010",
    sourcedBy: "Recruiter C",
    location: "Queens, USA",
    currentCompany: "Daily Bugle",
    currentJob: "Photographer",
    appliedFor: "Creative Designer",
    experience: "2 ",
    education: "B.A. Photography",
    skills: ["Photoshop", "Lightroom", "Illustrator", "Storytelling"],
    currentCTC: "$55,000"
  },
  {
    id: 11,
    name: 'Tony Stark',
    pipelineStatus: 'Hired',
    dateApplied: '2025-08-25',
    photo: "https://i.pravatar.cc/150?u=11",
    email: "tony.stark@example.com",
    phone: "+1 555-100-0011",
    sourcedBy: "Recruiter D",
    location: "Malibu, USA",
    currentCompany: "Stark Industries",
    currentJob: "CTO",
    appliedFor: "Chief Innovation Officer",
    experience: "15 ",
    education: "M.Sc. Electrical Engineering",
    skills: ["AI", "IoT", "Robotics", "Cloud"],
    currentCTC: "$300,000"
  },
  {
    id: 12,
    name: 'Natasha Romanoff',
    pipelineStatus: 'Screening',
    dateApplied: '2025-09-08',
    photo: "https://i.pravatar.cc/150?u=12",
    email: "natasha.romanoff@example.com",
    phone: "+1 555-100-0012",
    sourcedBy: "Recruiter A",
    location: "Washington DC, USA",
    currentCompany: "Shield",
    currentJob: "Security Analyst",
    appliedFor: "Cybersecurity Engineer",
    experience: "7 ",
    education: "B.Sc. Cybersecurity",
    skills: ["Network Security", "Python", "SIEM", "Risk Analysis"],
    currentCTC: "$120,000"
  },
  {
    id: 13,
    name: 'Steve Rogers',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-09',
    photo: "https://i.pravatar.cc/150?u=13",
    email: "steve.rogers@example.com",
    phone: "+1 555-100-0013",
    sourcedBy: "Recruiter B",
    location: "Brooklyn, USA",
    currentCompany: "Freedom Corp",
    currentJob: "Project Manager",
    appliedFor: "Program Manager",
    experience: "8 ",
    education: "MBA Operations",
    skills: ["Leadership", "Agile", "Scrum", "Communication"],
    currentCTC: "$105,000"
  },
  {
    id: 14,
    name: 'Wanda Maximoff',
    pipelineStatus: 'Rejected',
    dateApplied: '2025-09-01',
    photo: "https://i.pravatar.cc/150?u=14",
    email: "wanda.maximoff@example.com",
    phone: "+1 555-100-0014",
    sourcedBy: "Recruiter C",
    location: "Sokovia, EU",
    currentCompany: "VisionSoft",
    currentJob: "Software Engineer",
    appliedFor: "AI Engineer",
    experience: "3 ",
    education: "M.Sc. Artificial Intelligence",
    skills: ["Python", "TensorFlow", "NLP", "Deep Learning"],
    currentCTC: "$85,000"
  },
  {
    id: 15,
    name: 'Sam Wilson',
    pipelineStatus: 'Test',
    dateApplied: '2025-09-05',
    photo: "https://i.pravatar.cc/150?u=15",
    email: "sam.wilson@example.com",
    phone: "+1 555-100-0015",
    sourcedBy: "Recruiter D",
    location: "New Orleans, USA",
    currentCompany: "SkyTech",
    currentJob: "Aerospace Engineer",
    appliedFor: "Drone Systems Engineer",
    experience: "6 ",
    education: "B.Sc. Aerospace Engineering",
    skills: ["CAD", "MATLAB", "Embedded Systems", "Flight Mechanics"],
    currentCTC: "$110,000"
  },
  {
    id: 16,
    name: 'Scott Lang',
    pipelineStatus: 'Screening',
    dateApplied: '2025-09-07',
    photo: "https://i.pravatar.cc/150?u=16",
    email: "scott.lang@example.com",
    phone: "+1 555-100-0016",
    sourcedBy: "Recruiter B",
    location: "San Diego, USA",
    currentCompany: "NanoLabs",
    currentJob: "Research Scientist",
    appliedFor: "Microelectronics Engineer",
    experience: "5 ",
    education: "Ph.D. Physics",
    skills: ["Nanotechnology", "Circuit Design", "Lab Research", "C++"],
    currentCTC: "$98,000"
  },
  {
    id: 17,
    name: 'Stephen Strange',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-04',
    photo: "https://i.pravatar.cc/150?u=17",
    email: "stephen.strange@example.com",
    phone: "+1 555-100-0017",
    sourcedBy: "Recruiter A",
    location: "New York, USA",
    currentCompany: "MedLife",
    currentJob: "Neurosurgeon",
    appliedFor: "Medical Research Lead",
    experience: "12 ",
    education: "M.D. Neurosurgery",
    skills: ["Surgery", "Research", "Medical Devices", "Leadership"],
    currentCTC: "$200,000"
  },
  {
    id: 18,
    name: 'T’Challa',
    pipelineStatus: 'Test',
    dateApplied: '2025-09-03',
    photo: "https://i.pravatar.cc/150?u=18",
    email: "tchalla@example.com",
    phone: "+1 555-100-0018",
    sourcedBy: "Recruiter C",
    location: "Wakanda, Africa",
    currentCompany: "WakandaTech",
    currentJob: "CEO",
    appliedFor: "Global Strategy Advisor",
    experience: "10 ",
    education: "MBA International Business",
    skills: ["Leadership", "Strategy", "Blockchain", "Innovation"],
    currentCTC: "$250,000"
  },
  {
    id: 19,
    name: 'Carol Danvers',
    pipelineStatus: 'Hired',
    dateApplied: '2025-08-29',
    photo: "https://i.pravatar.cc/150?u=19",
    email: "carol.danvers@example.com",
    phone: "+1 555-100-0019",
    sourcedBy: "Recruiter D",
    location: "Boston, USA",
    currentCompany: "AeroForce",
    currentJob: "Pilot",
    appliedFor: "Aerospace Project Lead",
    experience: "9 ",
    education: "B.Sc. Aeronautics",
    skills: ["Flight Operations", "Leadership", "Systems Engineering", "Risk Management"],
    currentCTC: "$130,000"
  },
  {
    id: 20,
    name: 'Bucky Barnes',
    pipelineStatus: 'Rejected',
    dateApplied: '2025-08-27',
    photo: "https://i.pravatar.cc/150?u=20",
    email: "bucky.barnes@example.com",
    phone: "+1 555-100-0020",
    sourcedBy: "Recruiter B",
    location: "Brooklyn, USA",
    currentCompany: "MetalWorks",
    currentJob: "Mechanical Engineer",
    appliedFor: "Robotics Engineer",
    experience: "7 ",
    education: "B.Tech. Mechanical Engineering",
    skills: ["CAD", "Robotics", "Automation", "CNC"],
    currentCTC: "$95,000"
  },
  {
    id: 21,
    name: 'Gamora Zen',
    pipelineStatus: 'Screening',
    dateApplied: '2025-09-06',
    photo: "https://i.pravatar.cc/150?u=21",
    email: "gamora.zen@example.com",
    phone: "+1 555-100-0021",
    sourcedBy: "Recruiter A",
    location: "Los Angeles, USA",
    currentCompany: "GreenLeaf Corp",
    currentJob: "Environmental Consultant",
    appliedFor: "Sustainability Manager",
    experience: "6 ",
    education: "M.Sc. Environmental Science",
    skills: ["Sustainability", "Research", "Policy Analysis", "Leadership"],
    currentCTC: "$100,000"
  },
  {
    id: 22,
    name: 'Rocket Raccoon',
    pipelineStatus: 'Interview',
    dateApplied: '2025-09-08',
    photo: "https://i.pravatar.cc/150?u=22",
    email: "rocket.raccoon@example.com",
    phone: "+1 555-100-0022",
    sourcedBy: "Recruiter D",
    location: "Houston, USA",
    currentCompany: "SpaceTech",
    currentJob: "Mechanical Specialist",
    appliedFor: "Aerospace Systems Engineer",
    experience: "8 ",
    education: "B.Sc. Mechanical Engineering",
    skills: ["Rocket Design", "Engineering", "Problem Solving", "Innovation"],
    currentCTC: "$115,000"
  }
];


export const employeeData = [
  {
    "id": "EMP001",
    "name": "Alice Johnson",
    "phone": "+1-202-555-0147",
    "email": "alice.johnson@example.com",
    "address": "123 Maple Street, Springfield, IL, USA",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "joiningDate": "2021-03-15",
    "isPresentToday": true,
    "salary": 85000,
    "manager": "Robert Smith",
    "photo": "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    "id": "EMP002",
    "name": "Michael Brown",
    "phone": "+1-202-555-0189",
    "email": "michael.brown@example.com",
    "address": "456 Oak Avenue, Austin, TX, USA",
    "jobTitle": "HR Manager",
    "department": "Human Resources",
    "joiningDate": "2019-07-01",
    "isPresentToday": true,
    "salary": 95000,
    "manager": "N/A",
    "photo": "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    "id": "EMP003",
    "name": "Sophia Martinez",
    "phone": "+1-202-555-0123",
    "email": "sophia.martinez@example.com",
    "address": "789 Pine Road, Denver, CO, USA",
    "jobTitle": "Marketing Specialist",
    "department": "Marketing",
    "joiningDate": "2022-11-10",
    "isPresentToday": true,
    "salary": 67000,
    "manager": "Emily Davis",
    "photo": "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    "id": "EMP004",
    "name": "David Wilson",
    "phone": "+1-202-555-0199",
    "email": "david.wilson@example.com",
    "address": "321 Birch Blvd, Seattle, WA, USA",
    "jobTitle": "Accountant",
    "department": "Finance",
    "joiningDate": "2020-05-20",
    "isPresentToday": true,
    "salary": 72000,
    "manager": "Laura Green",
    "photo": "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    "id": "EMP005",
    "name": "Emma Thompson",
    "phone": "+1-202-555-0172",
    "email": "emma.thompson@example.com",
    "address": "654 Cedar Lane, Miami, FL, USA",
    "jobTitle": "Project Manager",
    "department": "Operations",
    "joiningDate": "2018-09-12",
    "isPresentToday": true,
    "salary": 105000,
    "manager": "Robert Smith",
    "photo": "https://randomuser.me/api/portraits/women/5.jpg"
  },
  {
    "id": "EMP006",
    "name": "James Anderson",
    "phone": "+1-202-555-0156",
    "email": "james.anderson@example.com",
    "address": "987 Elm Street, Boston, MA, USA",
    "jobTitle": "Business Analyst",
    "department": "Business Intelligence",
    "joiningDate": "2021-06-25",
    "isPresentToday": true,
    "salary": 80000,
    "manager": "Laura Green",
    "photo": "https://randomuser.me/api/portraits/men/6.jpg"
  },
  {
    "id": "EMP007",
    "name": "Olivia Taylor",
    "phone": "+1-202-555-0110",
    "email": "olivia.taylor@example.com",
    "address": "741 Willow Drive, San Diego, CA, USA",
    "jobTitle": "UI/UX Designer",
    "department": "Design",
    "joiningDate": "2020-08-17",
    "isPresentToday": false,
    "salary": 75000,
    "manager": "Robert Smith",
    "photo": "https://randomuser.me/api/portraits/women/7.jpg"
  },
  {
    "id": "EMP008",
    "name": "Daniel Harris",
    "phone": "+1-202-555-0165",
    "email": "daniel.harris@example.com",
    "address": "852 Lakeview Rd, Orlando, FL, USA",
    "jobTitle": "DevOps Engineer",
    "department": "Engineering",
    "joiningDate": "2022-02-01",
    "isPresentToday": true,
    "salary": 88000,
    "manager": "Alice Johnson",
    "photo": "https://randomuser.me/api/portraits/men/8.jpg"
  },
  {
    "id": "EMP009",
    "name": "Grace Lee",
    "phone": "+1-202-555-0190",
    "email": "grace.lee@example.com",
    "address": "963 Park Lane, Chicago, IL, USA",
    "jobTitle": "Recruiter",
    "department": "Human Resources",
    "joiningDate": "2019-12-05",
    "isPresentToday": true,
    "salary": 62000,
    "manager": "Michael Brown",
    "photo": "https://randomuser.me/api/portraits/women/9.jpg"
  },
  {
    "id": "EMP010",
    "name": "William Clark",
    "phone": "+1-202-555-0104",
    "email": "william.clark@example.com",
    "address": "147 Aspen Way, Dallas, TX, USA",
    "jobTitle": "Sales Executive",
    "department": "Sales",
    "joiningDate": "2020-10-11",
    "isPresentToday": false,
    "salary": 70000,
    "manager": "Emily Davis",
    "photo": "https://randomuser.me/api/portraits/men/10.jpg"
  },
  {
    "id": "EMP011",
    "name": "Ava White",
    "phone": "+1-202-555-0183",
    "email": "ava.white@example.com",
    "address": "258 Walnut St, New York, NY, USA",
    "jobTitle": "Content Writer",
    "department": "Marketing",
    "joiningDate": "2022-07-08",
    "isPresentToday": true,
    "salary": 60000,
    "manager": "Sophia Martinez",
    "photo": "https://randomuser.me/api/portraits/women/11.jpg"
  },
  {
    "id": "EMP012",
    "name": "Benjamin Lewis",
    "phone": "+1-202-555-0128",
    "email": "benjamin.lewis@example.com",
    "address": "369 Cherry Lane, Phoenix, AZ, USA",
    "jobTitle": "System Administrator",
    "department": "IT",
    "joiningDate": "2021-09-13",
    "isPresentToday": true,
    "salary": 82000,
    "manager": "Daniel Harris",
    "photo": "https://randomuser.me/api/portraits/men/12.jpg"
  },
  {
    "id": "EMP013",
    "name": "Mia Scott",
    "phone": "+1-202-555-0144",
    "email": "mia.scott@example.com",
    "address": "147 Magnolia Blvd, Portland, OR, USA",
    "jobTitle": "Financial Analyst",
    "department": "Finance",
    "joiningDate": "2020-04-27",
    "isPresentToday": true,
    "salary": 78000,
    "manager": "David Wilson",
    "photo": "https://randomuser.me/api/portraits/women/13.jpg"
  },
  {
    "id": "EMP014",
    "name": "Henry Walker",
    "phone": "+1-202-555-0198",
    "email": "henry.walker@example.com",
    "address": "753 Sycamore St, San Jose, CA, USA",
    "jobTitle": "QA Engineer",
    "department": "Engineering",
    "joiningDate": "2019-02-14",
    "isPresentToday": true,
    "salary": 71000,
    "manager": "Alice Johnson",
    "photo": "https://randomuser.me/api/portraits/men/14.jpg"
  },
  {
    "id": "EMP015",
    "name": "Charlotte King",
    "phone": "+1-202-555-0177",
    "email": "charlotte.king@example.com",
    "address": "951 Redwood Ave, Tampa, FL, USA",
    "jobTitle": "Operations Coordinator",
    "department": "Operations",
    "joiningDate": "2021-05-30",
    "isPresentToday": true,
    "salary": 65000,
    "manager": "Emma Thompson",
    "photo": "https://randomuser.me/api/portraits/women/15.jpg"
  },
  {
    "id": "EMP016",
    "name": "Jack Hall",
    "phone": "+1-202-555-0139",
    "email": "jack.hall@example.com",
    "address": "357 Poplar Rd, Atlanta, GA, USA",
    "jobTitle": "Technical Lead",
    "department": "Engineering",
    "joiningDate": "2017-11-22",
    "isPresentToday": false,
    "salary": 110000,
    "manager": "Robert Smith",
    "photo": "https://randomuser.me/api/portraits/men/16.jpg"
  },
  {
    "id": "EMP017",
    "name": "Amelia Young",
    "phone": "+1-202-555-0155",
    "email": "amelia.young@example.com",
    "address": "258 Cypress Lane, Houston, TX, USA",
    "jobTitle": "Legal Advisor",
    "department": "Legal",
    "joiningDate": "2019-08-19",
    "isPresentToday": true,
    "salary": 90000,
    "manager": "N/A",
    "photo": "https://randomuser.me/api/portraits/women/17.jpg"
  },
  {
    "id": "EMP018",
    "name": "Ethan Allen",
    "phone": "+1-202-555-0115",
    "email": "ethan.allen@example.com",
    "address": "654 Aspen Rd, Philadelphia, PA, USA",
    "jobTitle": "Data Scientist",
    "department": "Business Intelligence",
    "joiningDate": "2022-01-09",
    "isPresentToday": true,
    "salary": 99000,
    "manager": "James Anderson",
    "photo": "https://randomuser.me/api/portraits/men/18.jpg"
  },
  {
    "id": "EMP019",
    "name": "Harper Nelson",
    "phone": "+1-202-555-0182",
    "email": "harper.nelson@example.com",
    "address": "852 Juniper St, Minneapolis, MN, USA",
    "jobTitle": "Training Coordinator",
    "department": "Human Resources",
    "joiningDate": "2020-06-16",
    "isPresentToday": false,
    "salary": 64000,
    "manager": "Michael Brown",
    "photo": "https://randomuser.me/api/portraits/women/19.jpg"
  },
  {
    "id": "EMP020",
    "name": "Lucas Carter",
    "phone": "+1-202-555-0161",
    "email": "lucas.carter@example.com",
    "address": "951 Spruce Ave, Charlotte, NC, USA",
    "jobTitle": "Network Engineer",
    "department": "IT",
    "joiningDate": "2021-12-21",
    "isPresentToday": true,
    "salary": 86000,
    "manager": "Benjamin Lewis",
    "photo": "https://randomuser.me/api/portraits/men/20.jpg"
  }
]

// export const clients: Client[] = [
//   {
//     id: 1,
//     name: "TechNova Solutions Pvt. Ltd.",
//     location: "Bangalore, India",
//     contactPerson: "Rahul Mehta",
//     contactPersonNumber: "+91-9876543210",
//     industry: "Information Technology"
//   },
//   {
//     id: 2,
//     name: "GreenField Agro Corp.",
//     location: "Ahmedabad, India",
//     contactPerson: "Priya Shah",
//     contactPersonNumber: "+91-9823456789",
//     industry: "Agriculture"
//   },
//   {
//     id: 3,
//     name: "SkyReach Logistics",
//     location: "Mumbai, India",
//     contactPerson: "Vikram Joshi",
//     contactPersonNumber: "+91-9765432109",
//     industry: "Logistics & Supply Chain"
//   },
//   {
//     id: 4,
//     name: "HealthBridge Pharmaceuticals",
//     location: "Hyderabad, India",
//     contactPerson: "Neha Reddy",
//     contactPersonNumber: "+91-9945123456",
//     industry: "Healthcare"
//   },
//   {
//     id: 5,
//     name: "EduNext Learning Systems",
//     location: "Pune, India",
//     contactPerson: "Arjun Desai",
//     contactPersonNumber: "+91-9988776655",
//     industry: "Education Technology"
//   }
// ];

// export const hr: HR[] = [
//   {
//     id: 1,
//     clientId: 1,
//     name: "Sanjana Rao",
//     email: "sanjana.rao@technova.com",
//     designation: "Senior HR Manager",
//     number: "+91-9988776655"
//   },
//   {
//     id: 2,
//     clientId: 1,
//     name: "Karan Patel",
//     email: "karan.patel@technova.com",
//     designation: "HR Executive",
//     number: "+91-9988776655"
//   },
//   {
//     id: 3,
//     clientId: 2,
//     name: "Ritika Shah",
//     email: "ritika.shah@greenfieldagro.com",
//     designation: "HR Lead",
//     number: "+91-9988776655"
//   },
//   {
//     id: 4,
//     clientId: 3,
//     name: "Abhishek Kumar",
//     email: "abhishek.kumar@skyreachlogistics.com",
//     designation: "Talent Acquisition Manager",
//     number: "+91-9988776655"
//   },
//   {
//     id: 5,
//     clientId: 4,
//     name: "Divya Nair",
//     email: "divya.nair@healthbridgepharma.com",
//     designation: "HR Business Partner",
//     number: "+91-9988776655"
//   },
//   {
//     id: 6,
//     clientId: 5,
//     name: "Rohit Bansal",
//     email: "rohit.bansal@edunext.com",
//     designation: "HR Coordinator",
//     number: "+91-9988776655"
//   }
// ];

// export const getHRsWithClients = (): HRWithClient[] => {
//   return hr.map(h => {
//     const relatedClient = clients.find(c => c.id === h.clientId);

//     // Safety check in case no client is found (optional)
//     if (!relatedClient) {
//       throw new Error(`Client not found for HR ID: ${h.id}`);
//     }

//     return {
//       ...h,
//       client: relatedClient
//     };
//   });
// };


export const template: EmailTemplate[] = [
  {
    "id": 1,
    "hrId": 1,
    "fields": [
      { "id": 1, "label": "Email", "key": "email", "isCustom": false },
      { "id": 2, "label": "Name", "key": "name", "isCustom": false },
      { "id": 3, "label": "New Field Start", "key": "custom_1", "isCustom": true },
      { "id": 4, "label": "Notice Period", "key": "noticePeriod", "isCustom": false },
      { "id": 5, "label": "Skills", "key": "skills", "isCustom": false },
      { "id": 6, "label": "Experience", "key": "experience", "isCustom": false },
      { "id": 7, "label": "Current CTC", "key": "currentCTC", "isCustom": false },
      { "id": 8, "label": "Current Company", "key": "currentCompany", "isCustom": false },
      { "id": 9, "label": "Location", "key": "location", "isCustom": false },
      { "id": 10, "label": "Phone", "key": "phone", "isCustom": false },
      { "id": 11, "label": "Expected CTC", "key": "expectedCTC", "isCustom": false },
      { "id": 12, "label": "New Field End", "key": "custom_2", "isCustom": true }
    ],
    "createdAt": "2025-10-29T14:12:48.553Z",
    "updatedAt": "2025-10-29T14:12:48.553Z"
  },
  {
    "id": 2,
    "hrId": 2,
    "fields": [
      { "id": 1, "label": "New Field Start", "key": "custom_3", "isCustom": true },
      { "id": 2, "label": "Expected CTC", "key": "expectedCTC", "isCustom": false },
      { "id": 3, "label": "Notice Period", "key": "noticePeriod", "isCustom": false },
      { "id": 4, "label": "Current Company", "key": "currentCompany", "isCustom": false },
      { "id": 5, "label": "Phone", "key": "phone", "isCustom": false },
      { "id": 6, "label": "Email", "key": "email", "isCustom": false },
      { "id": 7, "label": "Experience", "key": "experience", "isCustom": false },
      { "id": 8, "label": "Current CTC", "key": "currentCTC", "isCustom": false },
      { "id": 9, "label": "Skills", "key": "skills", "isCustom": false },
      { "id": 10, "label": "Location", "key": "location", "isCustom": false },
      { "id": 11, "label": "Name", "key": "name", "isCustom": false },
      { "id": 12, "label": "New Field End", "key": "custom_4", "isCustom": true }
    ],
    "createdAt": "2025-10-29T14:13:01.122Z",
    "updatedAt": "2025-10-29T14:13:01.122Z"
  },
  {
    "id": 3,
    "hrId": 3,
    "fields": [
      { "id": 1, "label": "Skills", "key": "skills", "isCustom": false },
      { "id": 2, "label": "New Field Start", "key": "custom_5", "isCustom": true },
      { "id": 3, "label": "Experience", "key": "experience", "isCustom": false },
      { "id": 4, "label": "Email", "key": "email", "isCustom": false },
      { "id": 5, "label": "Current Company", "key": "currentCompany", "isCustom": false },
      { "id": 6, "label": "Name", "key": "name", "isCustom": false },
      { "id": 7, "label": "Notice Period", "key": "noticePeriod", "isCustom": false },
      { "id": 8, "label": "Expected CTC", "key": "expectedCTC", "isCustom": false },
      { "id": 9, "label": "Current CTC", "key": "currentCTC", "isCustom": false },
      { "id": 10, "label": "Phone", "key": "phone", "isCustom": false },
      { "id": 11, "label": "Location", "key": "location", "isCustom": false },
      { "id": 12, "label": "New Field End", "key": "custom_6", "isCustom": true }
    ],
    "createdAt": "2025-10-29T14:13:25.441Z",
    "updatedAt": "2025-10-29T14:13:25.441Z"
  },
  {
    "id": 4,
    "hrId": 4,
    "fields": [
      { "id": 1, "label": "New Field Start", "key": "custom_7", "isCustom": true },
      { "id": 2, "label": "Phone", "key": "phone", "isCustom": false },
      { "id": 3, "label": "Location", "key": "location", "isCustom": false },
      { "id": 4, "label": "Skills", "key": "skills", "isCustom": false },
      { "id": 5, "label": "Current CTC", "key": "currentCTC", "isCustom": false },
      { "id": 6, "label": "Notice Period", "key": "noticePeriod", "isCustom": false },
      { "id": 7, "label": "Email", "key": "email", "isCustom": false },
      { "id": 8, "label": "Expected CTC", "key": "expectedCTC", "isCustom": false },
      { "id": 9, "label": "Experience", "key": "experience", "isCustom": false },
      { "id": 10, "label": "Current Company", "key": "currentCompany", "isCustom": false },
      { "id": 11, "label": "Name", "key": "name", "isCustom": false },
      { "id": 12, "label": "New Field End", "key": "custom_8", "isCustom": true }
    ],
    "createdAt": "2025-10-29T14:14:10.119Z",
    "updatedAt": "2025-10-29T14:14:10.119Z"
  },
  {
    "id": 5,
    "hrId": 5,
    "fields": [
      { "id": 1, "label": "New Field Start", "key": "custom_9", "isCustom": true },
      { "id": 2, "label": "Name", "key": "name", "isCustom": false },
      { "id": 3, "label": "Expected CTC", "key": "expectedCTC", "isCustom": false },
      { "id": 4, "label": "Skills", "key": "skills", "isCustom": false },
      { "id": 5, "label": "Experience", "key": "experience", "isCustom": false },
      { "id": 6, "label": "Notice Period", "key": "noticePeriod", "isCustom": false },
      { "id": 7, "label": "Current CTC", "key": "currentCTC", "isCustom": false },
      { "id": 8, "label": "Current Company", "key": "currentCompany", "isCustom": false },
      { "id": 9, "label": "Location", "key": "location", "isCustom": false },
      { "id": 10, "label": "Phone", "key": "phone", "isCustom": false },
      { "id": 11, "label": "Email", "key": "email", "isCustom": false },
      { "id": 12, "label": "New Field End", "key": "custom_10", "isCustom": true }
    ],
    "createdAt": "2025-10-29T14:15:22.220Z",
    "updatedAt": "2025-10-29T14:15:22.220Z"
  },
]



//data*