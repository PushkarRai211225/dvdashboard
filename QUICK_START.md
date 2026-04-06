# DV Monitoring Dashboard - Quick Start (5 Minutes)

## 🚀 Get Started in 5 Steps

### 1. Install Dependencies (1 minute)
```bash
cd "C:\Codes\Projects\DV Dashboard\monitoring-system"
npm install
```

### 2. Configure Database (1 minute)
Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dv-dashboard
JWT_SECRET=change_this_in_production
NODE_ENV=development
```

**Using MongoDB Atlas instead?**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dv-dashboard
```

### 3. Seed Demo Data (1 minute)
```bash
npm run seed
```

### 4. Start Server (1 minute)
```bash
npm run dev
```

### 5. Login (1 minute)
Open browser: **http://localhost:5000**

**Demo Credentials:**
- Admin: `admin@dv.com` / `password123`
- Employee: `john@dv.com` / `password123`

---

## 📊 What You Can Do

✅ **As Super Admin:**
- View all metrics across teams
- Create/Edit/Delete employees
- Assign employees to teams
- Compare team performance

✅ **As Employee:**
- Log daily metrics
- View personal performance trends
- See submission history

---

## ❌ Common Issues

**MongoDB not found?**
- Start MongoDB: `mongod` (Windows) or `brew services start mongodb-community` (Mac)
- Or use MongoDB Atlas with a remote connection string

**Port 5000 already in use?**
- Change PORT in `.env` file
- Or: `netstat -ano | findstr :5000` then kill the process

**npm install fails?**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

---

**Everything working? 🎉 Check the full README.md for detailed documentation.**
