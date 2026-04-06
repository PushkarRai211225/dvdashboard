import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', designation, teams = [] } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, role, designation });
    await user.save();

    // If employee role, create employee record with teams
    if (role === 'employee' && teams.length > 0) {
      const employee = new Employee({
        userId: user._id,
        teams,
      });
      await employee.save();
    }

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const employee = await Employee.findOne({ userId: user._id });
    
    res.json({
      user: {
        id: user._id,
        employeeId: employee?._id, // Add employee ID for metrics queries
        name: user.name,
        phone: user.phone,
        role: user.role,
        designation: user.designation,
        teams: employee?.teams || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
