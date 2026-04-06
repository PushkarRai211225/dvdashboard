# DV Monitoring Dashboard - Complete Setup Guide

## 📋 Overview

The DV Monitoring Dashboard is a comprehensive performance management system designed to track metrics across two primary teams: **Admission** and **Workshop**. The system supports hierarchical access control (Super Admin, Admin, Employee) and enables multi-team data entry for individual employees.

## ✨ Key Features

### 1. **User Roles & Permissions**
- **Super Admin**: Full access to all data, employee management (CRUD), team/individual analytics
- **Admin**: Access to all team and individual performance analytics, global dashboards (read-only)
- **Employee**: Access to personal dashboard only, data entry for their own metrics

### 2. **Multi-Team Assignment**
- Employees can be assigned to 1 or 2 teams (Admission, Workshop)
- Dynamic UI that shows only relevant fields based on team assignment
- Strict row-level security (RLS) - employees see only their own data

### 3. **Team Structure**

#### Admission Team
- Fresh Lead Received (Count)
- Outbound Calls (Count)
- Prospect (Count)

#### Workshop Team
- Workshop Lead Received (Count)
- Outbound Calls (Count)
- Interested (Count)

#### Post-Workshop Module
- Outbound Calls (Count)
- Prospect (Count)

### 4. **Dashboards & Views**

#### For Super Admin & Admin:
- **Global Dashboard**: Comprehensive metrics across all teams
- **Team Performance Page**: Comparative stats between Admission and Workshop
- **Individual Performance Page**: Searchable directory for employee-specific metrics
- **Filters**: Day, Week, Month, Overall, and Custom Range date filtering

#### For Employees:
- **Personal Dashboard**: Visual charts showing individual trends
- **Daily Update Section**: Dynamic form for logging activities
- **My Recent Submissions**: View submission history

#### For Super Admin Only:
- **Employee Management**: CRUD interface for workforce management

## 🚀 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs (password hashing), Helmet.js (security headers)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn

### Step 1: Install Dependencies
```bash
cd "C:\Codes\Projects\DV Dashboard\monitoring-system"
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dv-dashboard
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/dv-dashboard?retryWrites=true&w=majority
```

### Step 3: Seed Demo Data
```bash
npm run seed
```

This will create:
- 1 Super Admin (admin@dv.com)
- 1 Admin (admin2@dv.com)
- 5 Employees with sample metrics for the last 30 days

### Step 4: Start the Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

## 🔑 Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@dv.com | password123 |
| Admin | admin2@dv.com | password123 |
| Employee | john@dv.com | password123 |
| Employee | jane@dv.com | password123 |
| Employee | mike@dv.com | password123 |

## 📂 Project Structure

```
monitoring-system/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env                      # Configuration (create this)
├── .gitignore               # Git ignore rules
│
├── src/
│   ├── models/
│   │   ├── User.js          # User authentication model
│   │   ├── Employee.js      # Employee with team assignment
│   │   └── Metrics.js       # Daily metrics storage
│   │
│   ├── controllers/
│   │   ├── authController.js      # Login/register logic
│   │   ├── employeeController.js  # Employee CRUD
│   │   └── metricsController.js   # Metrics analytics
│   │
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── employees.js     # Employee management endpoints
│   │   └── metrics.js       # Metrics endpoints
│   │
│   ├── middleware/
│   │   └── auth.js          # JWT & RBAC middleware
│   │
│   └── utils/
│       ├── generateToken.js # JWT token generation
│       └── seedData.js      # Demo data seeding
│
└── public/
    ├── login.html           # Login page
    ├── dashboard.html       # Main dashboard
    ├── css/
    │   └── dashboard.css    # DV Analytics brand styling
    └── js/
        └── dashboard.js     # Frontend logic
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Employees (Admin only)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Metrics
- `POST /api/metrics/submit` - Submit daily metrics (Employee)
- `GET /api/metrics/employee/:id` - Get employee metrics (with date range)
- `GET /api/metrics/team/:team` - Get team metrics (Admin)
- `GET /api/metrics/organization` - Get org metrics (Admin)
- `GET /api/metrics/aggregated?period=:period` - Get aggregated metrics

## 🎨 Branding & Design

The dashboard uses the DV Analytics brand colors:
- **Primary Dark**: #1a2847
- **Primary Blue**: #2c4a8d
- **Accent Orange**: #ff6633
- **Accent Red**: #e84c3d

Responsive design supports desktop, tablet, and mobile devices.

## 🔒 Security Features

✅ Password hashing with bcryptjs
✅ JWT-based authentication (7-day expiry)
✅ Role-based access control (RBAC)
✅ Row-level security (employees see only their data)
✅ Helmet.js security headers
✅ CORS configuration
✅ Input validation

## 📊 Data Model

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'super-admin' | 'admin' | 'employee',
  designation: 'Manager' | 'Senior LCE' | 'LCE',
  isActive: Boolean,
  createdAt: Date
}
```

### Employee Schema
```javascript
{
  userId: ObjectId (User reference),
  teams: ['admission' | 'workshop'],
  createdAt: Date
}
```

### Metrics Schema
```javascript
{
  employeeId: ObjectId (Employee reference),
  date: Date (unique per employee),
  admissionMetrics: {
    freshLeadReceived: Number,
    outboundCalls: Number,
    prospect: Number
  },
  workshopMetrics: {
    workshopLeadReceived: Number,
    outboundCalls: Number,
    interested: Number
  },
  postWorkshopMetrics: {
    outboundCalls: Number,
    prospect: Number
  }
}
```

## 🎯 User Workflows

### Super Admin
1. Login → Overview dashboard with org-wide metrics
2. Access Team Performance to compare Admission vs Workshop
3. View Individual Performance to drill into specific employees
4. Manage employees (create, edit, delete, assign teams)
5. Use date filters for period-based analysis

### Admin
1. Login → Overview dashboard with org-wide metrics
2. View team and individual performance
3. Cannot create/edit/delete employees (read-only)

### Employee
1. Login → Personal dashboard showing their own metrics
2. Navigate to "My Daily Data" to log daily activities
3. Form dynamically shows fields for assigned teams only
4. Submit metrics for each day
5. View submission history

## ⚙️ Configuration

### Change JWT Secret
Edit `.env`:
```
JWT_SECRET=your-new-secret-key
```

### Change MongoDB Connection
Edit `.env`:
```
MONGODB_URI=your_mongodb_connection_string
```

### Change Port
Edit `.env`:
```
PORT=3000
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or check connection string
- For MongoDB Atlas, verify IP whitelist includes your IP
- Check credentials in connection string

### Port Already in Use
```bash
# Windows: Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID <PID> /F

# Or change PORT in .env
```

### JWT Token Expired
- Tokens expire after 7 days
- User will be redirected to login
- Login again to get a new token

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] CSV/PDF export functionality
- [ ] Email notifications
- [ ] Advanced charting with Chart.js
- [ ] Audit logs
- [ ] Two-factor authentication
- [ ] Bulk data import
- [ ] Custom report builder

## 📞 Support

For issues or questions, please check:
1. `.env` file configuration
2. MongoDB connection
3. Browser console for javascript errors
4. Server console logs

## 📄 License

This project is confidential and proprietary to DV Analytics.

---

**Happy monitoring! 📊**
