# DV Monitoring Dashboard - Quick Reference

## 🎯 Getting Started (Copy & Paste)

```bash
# Navigate to project
cd "C:\Codes\Projects\DV Dashboard\monitoring-system"

# Install
npm install

# Seed demo data
npm run seed

# Start development server
npm run dev

# Open browser
http://localhost:5000
```

## 🔑 Demo Login Credentials

```
Email: admin@dv.com
Password: password123

Email: john@dv.com
Password: password123
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Main Express server entry point |
| `.env` | Configuration (create this file) |
| `src/models/User.js` | User authentication model |
| `src/models/Employee.js` | Employee with team assignment |
| `src/models/Metrics.js` | Daily metrics data |
| `src/controllers/` | Business logic for all endpoints |
| `src/routes/` | API endpoint definitions |
| `public/login.html` | Login page |
| `public/dashboard.html` | Main dashboard interface |
| `public/js/dashboard.js` | Frontend JavaScript |
| `public/css/dashboard.css` | DV brand styling |

---

## 🔌 Essential API Endpoints

### Authentication
```
POST /api/auth/login              → Login & get token
GET /api/auth/me                  → Current user info
```

### Employee Management (Super Admin)
```
GET /api/employees                → All employees
POST /api/employees               → Create employee
PUT /api/employees/:id            → Update employee
DELETE /api/employees/:id         → Delete employee
```

### Metrics
```
POST /api/metrics/submit          → Submit daily metrics
GET /api/metrics/employee/:id     → Get employee metrics
GET /api/metrics/aggregated       → Get aggregated metrics
```

---

## 🎨 Dashboard Pages

| Page | Role | Purpose |
|------|------|---------|
| Overview | Admin/Super Admin | Organization-wide metrics |
| Team Performance | Admin/Super Admin | Compare Admission vs Workshop |
| Individual Performance | Admin/Super Admin | Employee-specific metrics |
| Employee Management | Super Admin | CRUD operations |
| My Daily Data | Employee | Log daily activities |

---

## 🔒 Access Control

### Super Admin
- ✓ Create/Edit/Delete employees
- ✓ View all dashboards
- ✓ Access employee management

### Admin
- ✓ View all dashboards (read-only)
- ✗ Cannot manage employees

### Employee
- ✓ View personal dashboard
- ✓ Log daily data
- ✗ Cannot see other employees' data

---

## 📊 Team Assignment

### Admission Team Metrics
- Fresh Lead Received
- Outbound Calls
- Prospect

### Workshop Team Metrics
- Workshop Lead Received
- Outbound Calls
- Interested

### Post-Workshop Metrics
- Outbound Calls
- Prospect

---

## ⚙️ Configuration

### File: `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dv-dashboard
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running or update connection string |
| Port 5000 in use | Change PORT in `.env` |
| npm install fails | Delete `node_modules`, run `npm install` again |
| Can't login | Check if seed data ran: `npm run seed` |

---

## 🔐 User Roles & Designations

### Roles
- `super-admin` - Full access
- `admin` - Read-only analytics
- `employee` - Personal data only

### Designations
- Manager
- Senior LCE
- LCE

---

## 📝 Database Indexes

- User: `email` (unique)
- Employee: `userId` (unique)
- Metrics: `employeeId + date` (unique)

---

## 🎯 Next Steps

1. ✅ Run `npm install`
2. ✅ Create `.env` file
3. ✅ Run `npm run seed`
4. ✅ Run `npm run dev`
5. ✅ Open http://localhost:5000
6. ✅ Login with demo credentials

---

**Need help? Check README.md or QUICK_START.md**
