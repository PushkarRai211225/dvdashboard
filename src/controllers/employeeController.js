import User from '../models/User.js';
import Employee from '../models/Employee.js';

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email phone designation role isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: employees.map(emp => ({
        id: emp._id,
        userId: emp.userId._id,
        name: emp.userId.name,
        email: emp.userId.email,
        phone: emp.userId.phone,
        designation: emp.userId.designation,
        teams: emp.teams,
        role: emp.userId.role,
        isActive: emp.userId.isActive,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email phone designation role isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: {
        id: employee._id,
        userId: employee.userId._id,
        name: employee.userId.name,
        email: employee.userId.email,
        phone: employee.userId.phone,
        designation: employee.userId.designation,
        teams: employee.teams,
        role: employee.userId.role,
        isActive: employee.userId.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password, designation, teams, role } = req.body;

    if (!teams || teams.length === 0 || teams.length > 2) {
      return res.status(400).json({ message: 'Employee must be assigned to 1-2 teams' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use provided role or default to 'employee'
    const userRole = role === 'admin' ? 'admin' : 'employee';
    
    // Designation is required only for employees, not for admins
    const userDesignation = userRole === 'admin' ? null : designation;
    
    user = new User({ 
      name, 
      email, 
      phone, 
      password, 
      designation: userDesignation, 
      role: userRole 
    });
    await user.save();

    const employee = new Employee({ userId: user._id, teams });
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        id: employee._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        teams: employee.teams,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { name, phone, designation, teams, isActive } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await User.findById(employee.userId);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (designation) user.designation = designation;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    if (teams && teams.length > 0) {
      if (teams.length > 2) {
        return res.status(400).json({ message: 'Employee can be assigned to maximum 2 teams' });
      }
      employee.teams = teams;
      await employee.save();
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        id: employee._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        teams: employee.teams,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await User.findByIdAndDelete(employee.userId);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
