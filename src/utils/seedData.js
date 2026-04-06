import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Metrics from '../models/Metrics.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Metrics.deleteMany({});

    // Create Super Admin
    const superAdmin = new User({
      name: 'Admin User',
      email: 'admin@dv.com',
      phone: '9876543210',
      password: 'password123',
      role: 'super-admin',
      designation: 'Manager',
    });
    await superAdmin.save();

    // Create Admin
    const admin = new User({
      name: 'Admin Two',
      email: 'admin2@dv.com',
      phone: '9876543211',
      password: 'password123',
      role: 'admin',
      designation: 'Manager',
    });
    await admin.save();

    // Create Employees
    const employeeUsers = [];
    const employeeNames = [
      { name: 'John Smith', email: 'john@dv.com', phone: '9876543212', teams: ['admission', 'workshop'] },
      { name: 'Jane Doe', email: 'jane@dv.com', phone: '9876543213', teams: ['admission'] },
      { name: 'Mike Johnson', email: 'mike@dv.com', phone: '9876543214', teams: ['workshop'] },
      { name: 'Sarah Williams', email: 'sarah@dv.com', phone: '9876543215', teams: ['admission', 'workshop'] },
      { name: 'David Brown', email: 'david@dv.com', phone: '9876543216', teams: ['workshop'] },
    ];

    for (const empData of employeeNames) {
      const user = new User({
        name: empData.name,
        email: empData.email,
        phone: empData.phone,
        password: 'password123',
        role: 'employee',
        designation: ['Manager', 'Senior LCE', 'LCE'][Math.floor(Math.random() * 3)],
      });
      await user.save();
      employeeUsers.push({ user, teams: empData.teams, designation: user.designation });
    }

    // Create Employee records with team assignments
    for (const { user, teams, designation } of employeeUsers) {
      const employee = new Employee({
        userId: user._id,
        designation,
        teams,
      });
      await employee.save();

      // Add sample metrics for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const workshopOptions = ['excel', 'sql', 'genai'];
        const randomWorkshop = workshopOptions[Math.floor(Math.random() * workshopOptions.length)];

        const metrics = new Metrics({
          employeeId: employee._id,
          date,
          admissionMetrics: teams.includes('admission') ? {
            freshLeadReceived: Math.floor(Math.random() * 10) + 1,
            outboundCalls: Math.floor(Math.random() * 20) + 5,
            prospect: Math.floor(Math.random() * 5) + 1,
          } : {},
          workshopMetrics: teams.includes('workshop') ? {
            workshopName: randomWorkshop,
            workshopLeadReceived: Math.floor(Math.random() * 8) + 1,
            outboundCalls: Math.floor(Math.random() * 15) + 5,
            interested: Math.floor(Math.random() * 4) + 1,
          } : {},
          postWorkshopMetrics: teams.includes('workshop') ? {
            workshopName: randomWorkshop,
            outboundCalls: Math.floor(Math.random() * 10) + 2,
            prospect: Math.floor(Math.random() * 3) + 1,
          } : {},
        });

        await metrics.save();
      }
    }

    console.log('✅ Database seeding complete!');
    console.log('📝 Demo Credentials (Login with Phone Number & Password):');
    console.log('   Super Admin Phone: 9876543210 / Password: password123');
    console.log('   Admin Phone: 9876543211 / Password: password123');
    console.log('   Employees:');
    console.log('     - John Smith: 9876543212 / Password: password123');
    console.log('     - Jane Doe: 9876543213 / Password: password123');
    console.log('     - Mike Johnson: 9876543214 / Password: password123');
    console.log('     - Sarah Williams: 9876543215 / Password: password123');
    console.log('     - David Brown: 9876543216 / Password: password123');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
