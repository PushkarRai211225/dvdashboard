import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  designation: {
    type: String,
    enum: ['Manager', 'Senior LCE', 'LCE'],
    required: true,
    default: 'LCE',
  },
  teams: {
    type: [String],
    enum: ['admission', 'workshop'],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 2;
      },
      message: 'Employee must be assigned to at least one team, maximum two teams',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Ensure unique employee per user
employeeSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Employee', employeeSchema);
