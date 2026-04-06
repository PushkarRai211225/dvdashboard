import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    },
  },
  admissionMetrics: {
    freshLeadReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    outboundCalls: {
      type: Number,
      default: 0,
      min: 0,
    },
    prospect: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  workshopMetrics: {
    workshopName: {
      type: String,
      default: '',
    },
    workshopLeadReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    outboundCalls: {
      type: Number,
      default: 0,
      min: 0,
    },
    interested: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  postWorkshopMetrics: {
    workshopName: {
      type: String,
      default: '',
    },
    outboundCalls: {
      type: Number,
      default: 0,
      min: 0,
    },
    prospect: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Compound unique index for employeeId + date
metricsSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Metrics', metricsSchema);
