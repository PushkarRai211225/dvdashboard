import Metrics from '../models/Metrics.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

export const submitMetrics = async (req, res) => {
  try {
    const { date, admissionMetrics = {}, workshopMetrics = {}, postWorkshopMetrics = {} } = req.body;
    const userId = req.user._id;

    // Get employee record
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const metricDate = date ? new Date(date) : new Date();
    metricDate.setHours(0, 0, 0, 0);

    let metrics = await Metrics.findOne({ employeeId: employee._id, date: metricDate });

    if (!metrics) {
      metrics = new Metrics({ employeeId: employee._id, date: metricDate });
    }

    // Update metrics based on team assignment
    if (employee.teams.includes('admission')) {
      metrics.admissionMetrics = { ...metrics.admissionMetrics, ...admissionMetrics };
    }
    if (employee.teams.includes('workshop')) {
      metrics.workshopMetrics = { ...metrics.workshopMetrics, ...workshopMetrics };
      metrics.postWorkshopMetrics = { ...metrics.postWorkshopMetrics, ...postWorkshopMetrics };
    }

    await metrics.save();

    res.json({
      success: true,
      message: 'Metrics submitted successfully',
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEmployeeMetrics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { period = 'overall', startDate, endDate } = req.query;

    const filter = { employeeId };

    // Handle period filtering
    let dateFilter = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (period === 'today') {
      dateFilter = { $gte: now };
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else if (period === 'custom') {
      if (startDate || endDate) {
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          dateFilter.$lte = end;
        }
      }
    }
    // 'overall' has no date filter

    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    const metrics = await Metrics.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      employeeId,
      period,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTeamMetrics = async (req, res) => {
  try {
    const { team } = req.params;
    const { period = 'overall', startDate, endDate } = req.query;

    // Get all employees in the team
    const employees = await Employee.find({ teams: team });
    const employeeIds = employees.map(e => e._id);

    const filter = { employeeId: { $in: employeeIds } };

    // Handle period filtering
    let dateFilter = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (period === 'today') {
      dateFilter = { $gte: now };
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else if (period === 'custom') {
      if (startDate || endDate) {
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          dateFilter.$lte = end;
        }
      }
    }
    // 'overall' has no date filter

    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    const metrics = await Metrics.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      team,
      period,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrganizationMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const metrics = await Metrics.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAggregatedMetrics = async (req, res) => {
  try {
    const { period = 'overall', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (period === 'today') {
      dateFilter = { $gte: now };
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { $gte: start, $lte: end };
    }

    const filter = {};
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    const metrics = await Metrics.find(filter);

    // Aggregate data
    const aggregated = {
      admissionMetrics: {
        freshLeadReceived: 0,
        outboundCalls: 0,
        prospect: 0,
      },
      workshopMetrics: {
        workshopLeadReceived: 0,
        outboundCalls: 0,
        interested: 0,
      },
      postWorkshopMetrics: {
        outboundCalls: 0,
        prospect: 0,
      },
    };

    metrics.forEach(metric => {
      Object.keys(metric.admissionMetrics).forEach(key => {
        aggregated.admissionMetrics[key] += metric.admissionMetrics[key];
      });
      Object.keys(metric.workshopMetrics).forEach(key => {
        aggregated.workshopMetrics[key] += metric.workshopMetrics[key];
      });
      Object.keys(metric.postWorkshopMetrics).forEach(key => {
        aggregated.postWorkshopMetrics[key] += metric.postWorkshopMetrics[key];
      });
    });

    res.json({
      success: true,
      period,
      data: aggregated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActivityReport = async (req, res) => {
  try {
    const { date, team } = req.query;

    // Get all employees
    let employeeFilter = {};
    if (team) {
      employeeFilter = { teams: team };
    }
    const employees = await Employee.find(employeeFilter).populate('userId');

    if (!employees || employees.length === 0) {
      return res.json({
        success: true,
        data: [],
        summary: {
          total: 0,
          submitted: 0,
          pending: 0,
          submissionPercentage: 0,
        },
      });
    }

    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    // Get yesterday's date
    const yesterday = new Date(reportDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const report = await Promise.all(
      employees.map(async (employee) => {
        // Check if submitted for the report date
        const todaySubmission = await Metrics.findOne({
          employeeId: employee._id,
          date: reportDate,
        });

        // Check if submitted for yesterday
        const yesterdaySubmission = await Metrics.findOne({
          employeeId: employee._id,
          date: yesterday,
        });

        // Get the last submission date
        const lastSubmission = await Metrics.findOne({
          employeeId: employee._id,
          date: { $lte: reportDate },
        }).sort({ date: -1 });

        // Calculate days without submission
        let daysWithoutSubmit = 0;
        if (lastSubmission) {
          const daysDiff = Math.floor(
            (reportDate - new Date(lastSubmission.date)) / (1000 * 60 * 60 * 24)
          );
          daysWithoutSubmit = daysDiff > 0 ? daysDiff : 0;
        } else {
          // Never submitted
          daysWithoutSubmit = -1;
        }

        return {
          employeeId: employee._id,
          name: employee.userId?.name || 'N/A',
          email: employee.userId?.email || 'N/A',
          designation: employee.designation,
          teams: employee.teams,
          todaySubmitted: !!todaySubmission,
          yesterdaySubmitted: !!yesterdaySubmission,
          lastSubmittedDate: lastSubmission ? lastSubmission.date : null,
          daysWithoutSubmit,
        };
      })
    );

    // Calculate summary
    const submitted = report.filter((r) => r.todaySubmitted).length;
    const pending = report.filter((r) => !r.todaySubmitted).length;
    const total = report.length;
    const submissionPercentage = total > 0 ? Math.round((submitted / total) * 100) : 0;

    res.json({
      success: true,
      data: report,
      summary: {
        total,
        submitted,
        pending,
        submissionPercentage,
        reportDate: reportDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
