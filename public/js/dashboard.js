// Dashboard JavaScript
let currentUser = null;
let allEmployees = [];
let currentEditingEmployeeId = null;
let performanceChart = null;
let admissionChart = null;
let workshopChart = null;

// Hamburger Menu Toggle - Global function
function toggleMenu() {
  try {
    const menu = document.getElementById('sidebarMenu');
    const hamburger = document.getElementById('hamburgerMenu');
    
    if (!menu || !hamburger) {
      console.warn('Menu elements not found');
      return;
    }
    
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
    console.log('Menu toggled. Active:', menu.classList.contains('active'));
  } catch (error) {
    console.error('Error toggling menu:', error);
  }
}

// Close menu when nav link is clicked
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(event) {
    const menu = document.getElementById('sidebarMenu');
    const hamburger = document.getElementById('hamburgerMenu');
    
    if (!menu || !hamburger) return;
    
    // Check if click is on a nav link
    if (event.target.closest('.nav-link')) {
      if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
    // Close menu if click is outside menu and hamburger
    else if (!event.target.closest('.sidebar') && menu.classList.contains('active')) {
      menu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initializeDashboard();
  setupNavigation();
  setDefaultDate();
});

async function initializeDashboard() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    // Get current user info
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      logout();
      return;
    }

    const data = await response.json();
    currentUser = data.user;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.replace('-', ' ').toUpperCase();

    // Setup role-based UI
    setupRoleBasedUI();

    // Setup event listeners for filters
    setupFilterListeners();

    // Load initial data
    await loadMetrics();
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    logout();
  }
}

function setupRoleBasedUI() {
  const isEmployee = currentUser.role === 'employee';
  const isAdmin = currentUser.role !== 'employee';
  const isSuperAdmin = currentUser.role === 'super-admin';

  // Hide/show sidebar items based on role
  document.querySelectorAll('.hidden-for-employee').forEach(el => {
    if (isEmployee) el.style.display = 'none';
  });

  document.querySelectorAll('.hidden-for-admin').forEach(el => {
    if (isAdmin) el.style.display = 'none';
  });

  document.querySelectorAll('.hidden-for-non-admin').forEach(el => {
    if (!isSuperAdmin) el.style.display = 'none';
  });

  // Remove all active states before setting the correct one
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show appropriate page initially
  if (isEmployee) {
    showPage('my-data');
    document.querySelector('[data-page="my-data"]').classList.add('active');
  } else {
    showPage('overview');
    document.querySelector('[data-page="overview"]').classList.add('active');
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');

      // Update active link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      showPage(page);
    });
  });
}

function setupFilterListeners() {
  console.log('setupFilterListeners() - Attaching event listeners to filter elements');
  
  // Main metrics filter
  const timePeriodSelect = document.getElementById('timePeriod');
  if (timePeriodSelect) {
    console.log('Found timePeriod select, attaching change listener');
    timePeriodSelect.addEventListener('change', function() {
      console.log('timePeriod change event triggered!');
      applyFilters();
    });
  } else {
    console.warn('timePeriod select element not found');
  }

  // Custom date range inputs
  const startDateInput = document.getElementById('startDate');
  if (startDateInput) {
    console.log('Found startDate input, attaching change listener');
    startDateInput.addEventListener('change', function() {
      console.log('startDate change event triggered!');
      applyFilters();
    });
  }

  const endDateInput = document.getElementById('endDate');
  if (endDateInput) {
    console.log('Found endDate input, attaching change listener');
    endDateInput.addEventListener('change', function() {
      console.log('endDate change event triggered!');
      applyFilters();
    });
  }

  // Team filter
  const teamFilterSelect = document.getElementById('teamFilter');
  if (teamFilterSelect) {
    console.log('Found teamFilter select, attaching change listener');
    teamFilterSelect.addEventListener('change', function() {
      console.log('teamFilter change event triggered!');
      applyTeamFilter();
    });
  } else {
    console.warn('teamFilter select element not found');
  }

  // Team performance filter
  const teamTimePeriodSelect = document.getElementById('teamTimePeriod');
  if (teamTimePeriodSelect) {
    console.log('Found teamTimePeriod select, attaching change listener');
    teamTimePeriodSelect.addEventListener('change', function(e) {
      console.log('teamTimePeriod change event triggered! New value:', e.target.value);
      applyTeamFilter();
    });
  } else {
    console.warn('teamTimePeriod select element not found');
  }

  // Workshop type filter
  const workshopTypeFilter = document.getElementById('workshopTypeFilter');
  if (workshopTypeFilter) {
    console.log('Found workshopTypeFilter select, attaching change listener');
    workshopTypeFilter.addEventListener('change', function(e) {
      console.log('workshopTypeFilter change event triggered! New value:', e.target.value);
      loadTeamMetrics();
    });
  } else {
    console.warn('workshopTypeFilter select element not found');
  }

  // Employee search input
  const employeeSearch = document.getElementById('employeeSearch');
  if (employeeSearch) {
    console.log('Found employeeSearch input, attaching keyup listener');
    employeeSearch.addEventListener('keyup', function(e) {
      console.log('employeeSearch keyup event triggered');
      searchEmployees();
    });
  } else {
    console.warn('employeeSearch input element not found');
  }

  // Individual performance team filter
  const individualTeamFilter = document.getElementById('individualTeamFilter');
  if (individualTeamFilter) {
    console.log('Found individualTeamFilter select, attaching change listener');
    individualTeamFilter.addEventListener('change', function(e) {
      console.log('individualTeamFilter change event triggered! New value:', e.target.value);
      applyIndividualFilter();
    });
  } else {
    console.warn('individualTeamFilter select element not found');
  }

  // Individual performance time period filter
  const individualTimePeriod = document.getElementById('individualTimePeriod');
  if (individualTimePeriod) {
    console.log('Found individualTimePeriod select, attaching change listener');
    individualTimePeriod.addEventListener('change', function(e) {
      console.log('individualTimePeriod change event triggered! New value:', e.target.value);
      applyIndividualFilter();
    });
  } else {
    console.warn('individualTimePeriod select element not found');
  }
}

function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });

  // Show selected page
  const page = document.getElementById(pageName);
  if (page) {
    page.classList.remove('hidden');
    // Page title removed - using h1.page-title instead

    // Use setTimeout to ensure page is visible before loading data
    setTimeout(() => {
      // Load page-specific data
      if (pageName === 'overview') {
        loadMetrics();
      } else if (pageName === 'team-performance') {
        loadTeamMetrics();
      } else if (pageName === 'individual-performance') {
        loadEmployeesList();
      } else if (pageName === 'activity-report') {
        loadActivityReport();
      } else if (pageName === 'employee-management') {
        loadEmployeesManagement();
      } else if (pageName === 'my-data') {
        loadMyData();
      }
    }, 50);
  }
}

function getPageTitle(pageName) {
  const titles = {
    'overview': 'Dashboard Overview',
    'team-performance': 'Team Performance',
    'individual-performance': 'Individual Performance',
    'employee-management': 'Employee Management',
    'my-data': 'My Daily Data'
  };
  return titles[pageName] || 'Dashboard';
}

// Dashboard Metrics
async function loadMetrics() {
  try {
    const period = document.getElementById('timePeriod')?.value || 'overall';
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    let url = '/api/metrics/aggregated?period=' + period;
    if (startDate) url += '&startDate=' + startDate;
    if (endDate) url += '&endDate=' + endDate;

    console.log('Fetching metrics from:', url);
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    console.log('Metrics data received:', data);

    // Display metrics
    const grid = document.getElementById('metricsGrid');
    grid.innerHTML = '';

    if (data.data) {
      const metrics = data.data;

      // Admission Metrics
      if (currentUser.teams.includes('admission') || !currentUser.teams.length) {
        grid.innerHTML += `
          <div class="metric-card admission">
            <div class="metric-label">Fresh Lead Received</div>
            <div class="metric-value">${metrics.admissionMetrics.freshLeadReceived || 0}</div>
          </div>
          <div class="metric-card admission">
            <div class="metric-label">Admission Outbound Calls</div>
            <div class="metric-value">${metrics.admissionMetrics.outboundCalls || 0}</div>
          </div>
          <div class="metric-card admission">
            <div class="metric-label">Admission Prospect</div>
            <div class="metric-value">${metrics.admissionMetrics.prospect || 0}</div>
          </div>
        `;
      }

      // Workshop Metrics
      if (currentUser.teams.includes('workshop') || !currentUser.teams.length) {
        grid.innerHTML += `
          <div class="metric-card workshop">
            <div class="metric-label">Workshop Lead Received</div>
            <div class="metric-value">${metrics.workshopMetrics.workshopLeadReceived || 0}</div>
          </div>
          <div class="metric-card workshop">
            <div class="metric-label">Workshop Outbound Calls</div>
            <div class="metric-value">${metrics.workshopMetrics.outboundCalls || 0}</div>
          </div>
          <div class="metric-card workshop">
            <div class="metric-label">Workshop Interested</div>
            <div class="metric-value">${metrics.workshopMetrics.interested || 0}</div>
          </div>
          <div class="metric-card post-workshop">
            <div class="metric-label">Post-Workshop Calls</div>
            <div class="metric-value">${metrics.postWorkshopMetrics.outboundCalls || 0}</div>
          </div>
          <div class="metric-card post-workshop">
            <div class="metric-label">Post-Workshop Prospect</div>
            <div class="metric-value">${metrics.postWorkshopMetrics.prospect || 0}</div>
          </div>
        `;
      }
    }

    console.log('Metrics grid updated, now rendering charts...');
    // Render charts
    renderCharts(data.data);
  } catch (error) {
    console.error('Error loading metrics:', error);
  }
}

function renderCharts(metrics) {
  if (!metrics) {
    console.warn('No metrics data to render charts');
    return;
  }

  console.log('renderCharts() called with metrics:', metrics);

  // Use setTimeout to ensure DOM is ready and Chart.js is loaded
  setTimeout(() => {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded yet');
      return;
    }

    console.log('Chart.js is loaded, rendering charts...');
    // Main performance chart (Bar chart)
    renderPerformanceChart(metrics);
    
    // Admission pie chart
    renderAdmissionChart(metrics);
    
    // Workshop pie chart
    renderWorkshopChart(metrics);
    
    console.log('All charts rendered successfully');
  }, 10);
}

function renderPerformanceChart(metrics) {
  console.log('renderPerformanceChart() called');
  const ctx = document.getElementById('performanceChart');
  if (!ctx) {
    console.warn('performanceChart canvas not found');
    return;
  }

  // Destroy existing chart
  if (performanceChart) {
    console.log('Destroying existing performanceChart');
    performanceChart.destroy();
  }

  try {
    console.log('Creating new performanceChart with data:', metrics);
    performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Admission', 'Workshop', 'Post-Workshop'],
        datasets: [
          {
            label: 'Leads',
            data: [
              metrics.admissionMetrics.freshLeadReceived || 0,
              metrics.workshopMetrics.workshopLeadReceived || 0,
              0
            ],
            backgroundColor: '#2c4a8d',
            borderRadius: 5
          },
          {
            label: 'Calls',
            data: [
              metrics.admissionMetrics.outboundCalls || 0,
              metrics.workshopMetrics.outboundCalls || 0,
              metrics.postWorkshopMetrics.outboundCalls || 0
            ],
            backgroundColor: '#ff6633',
            borderRadius: 5
          },
          {
            label: 'Prospects',
            data: [
              metrics.admissionMetrics.prospect || 0,
              metrics.workshopMetrics.interested || 0,
              metrics.postWorkshopMetrics.prospect || 0
            ],
            backgroundColor: '#e84c3d',
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Performance Overview'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
    console.log('performanceChart created successfully');
  } catch (error) {
    console.error('Error rendering performance chart:', error);
  }
}

function renderAdmissionChart(metrics) {
  const ctx = document.getElementById('admissionChart');
  if (!ctx) {
    console.warn('admissionChart canvas not found');
    return;
  }

  // Destroy existing chart
  if (admissionChart) {
    admissionChart.destroy();
  }

  try {
    admissionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fresh Leads', 'Calls', 'Prospects'],
        datasets: [{
          data: [
            metrics.admissionMetrics.freshLeadReceived || 0,
            metrics.admissionMetrics.outboundCalls || 0,
            metrics.admissionMetrics.prospect || 0
          ],
          backgroundColor: [
            '#2c4a8d',
            '#4a7acc',
            '#6b9fd9'
          ],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Admission Team'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering admission chart:', error);
  }
}

function renderWorkshopChart(metrics) {
  const ctx = document.getElementById('workshopChart');
  if (!ctx) {
    console.warn('workshopChart canvas not found');
    return;
  }

  // Destroy existing chart
  if (workshopChart) {
    workshopChart.destroy();
  }

  try {
    workshopChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Workshop Leads', 'Interested', 'Calls'],
        datasets: [{
          data: [
            metrics.workshopMetrics.workshopLeadReceived || 0,
            metrics.workshopMetrics.interested || 0,
            metrics.workshopMetrics.outboundCalls || 0
          ],
          backgroundColor: [
            '#ff6633',
            '#ff8555',
            '#ffa477'
          ],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Workshop Team'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering workshop chart:', error);
  }
}

// Team Performance
async function loadTeamMetrics() {
  try {
    console.log('=== loadTeamMetrics() called ===');
    
    // Verify DOM elements exist
    const teamMetricsContainer = document.getElementById('teamMetricsContainer');
    const teamMembersTable = document.querySelector('#teamMembersTable tbody');
    
    if (!teamMetricsContainer) {
      console.error('DOM ERROR: teamMetricsContainer not found');
      return;
    }
    if (!teamMembersTable) {
      console.error('DOM ERROR: teamMembersTable tbody not found');
      return;
    }
    
    console.log('✓ DOM elements verified');
    console.log('Current DOM state:');
    console.log('  teamFilter element:', document.getElementById('teamFilter'));
    console.log('  teamTimePeriod element:', document.getElementById('teamTimePeriod'));
    
    const team = document.getElementById('teamFilter')?.value || 'admission';
    const period = document.getElementById('teamTimePeriod')?.value || 'overall';
    const workshopType = document.getElementById('workshopTypeFilter')?.value || '';

    console.log(`TEAM FILTER VALUES: team=${team}, period=${period}, workshop=${workshopType}`);

    const apiUrl = `/api/metrics/team/${team}?period=${period}`;
    console.log('Making API call to:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    console.log('✓ API Response received');
    console.log('Response object:', data);
    console.log('data.data type:', typeof data.data);
    console.log('data.data is array?:', Array.isArray(data.data));
    console.log('data.data length:', data.data?.length);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('ERROR: data.data is not an array!');
      console.error('data.data value:', data.data);
      throw new Error('API returned invalid data format');
    }
    
    if (data.data.length > 0) {
      console.log('📊 First metric object:');
      console.log('  Full object:', data.data[0]);
      console.log('  Keys:', Object.keys(data.data[0]));
      console.log('  employeeId field:', data.data[0].employeeId);
      console.log('  _id field:', data.data[0]._id);
    } else {
      console.warn('⚠️ API returned empty array');
    }
    
    console.log(`Response has ${data.data?.length || 0} metrics records`);

    // Update title
    document.getElementById('teamMetricsTitle').textContent = 
      `${team.charAt(0).toUpperCase() + team.slice(1)} Team Statistics`;

    // Aggregate team metrics
    let admissionStats = { leads: 0, calls: 0, prospects: 0 };
    let workshopStats = { leads: 0, calls: 0, interested: 0, byType: { excel: 0, sql: 0, genai: 0 } };

    data.data.forEach(metric => {
      if (team === 'admission') {
        admissionStats.leads += metric.admissionMetrics.freshLeadReceived || 0;
        admissionStats.calls += metric.admissionMetrics.outboundCalls || 0;
        admissionStats.prospects += metric.admissionMetrics.prospect || 0;
      } else {
        // Filter by workshop type if specified
        if (!workshopType || metric.workshopMetrics.workshopName === workshopType) {
          workshopStats.leads += metric.workshopMetrics.workshopLeadReceived || 0;
          workshopStats.calls += metric.workshopMetrics.outboundCalls || 0;
          workshopStats.interested += metric.workshopMetrics.interested || 0;
          
          // Track by workshop type for breakdown
          if (metric.workshopMetrics.workshopName) {
            if (metric.workshopMetrics.workshopName === 'excel') workshopStats.byType.excel += metric.workshopMetrics.workshopLeadReceived || 0;
            if (metric.workshopMetrics.workshopName === 'sql') workshopStats.byType.sql += metric.workshopMetrics.workshopLeadReceived || 0;
            if (metric.workshopMetrics.workshopName === 'genai') workshopStats.byType.genai += metric.workshopMetrics.workshopLeadReceived || 0;
          }
        }
      }
    });

    console.log('Aggregated stats:', team === 'admission' ? admissionStats : workshopStats);

    const statsFor = team === 'admission' ? admissionStats : workshopStats;
    let label1, label2, label3, val1, val2, val3;

    if (team === 'admission') {
      label1 = 'Fresh Leads'; val1 = admissionStats.leads;
      label2 = 'Calls'; val2 = admissionStats.calls;
      label3 = 'Prospects'; val3 = admissionStats.prospects;
    } else {
      label1 = 'Workshop Leads'; val1 = workshopStats.leads;
      label2 = 'Calls'; val2 = workshopStats.calls;
      label3 = 'Interested'; val3 = workshopStats.interested;
    }

    let metricsHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">${label1}</div>
          <div class="metric-value">${val1}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${label2}</div>
          <div class="metric-value">${val2}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${label3}</div>
          <div class="metric-value">${val3}</div>
        </div>
      </div>
    `;

    // Add workshop breakdown if viewing workshop team
    if (team === 'workshop' && !workshopType) {
      metricsHTML += `
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(109, 92, 231, 0.05); border: 1px solid rgba(109, 92, 231, 0.1); border-radius: 12px;">
          <div style="font-weight: 700; margin-bottom: 1rem; color: var(--primary);">Workshop Breakdown by Type</div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Excel Leads</div>
              <div class="metric-value">${workshopStats.byType.excel}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">SQL Leads</div>
              <div class="metric-value">${workshopStats.byType.sql}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Gen AI Leads</div>
              <div class="metric-value">${workshopStats.byType.genai}</div>
            </div>
          </div>
        </div>
      `;
    }

    document.getElementById('teamMetricsContainer').innerHTML = metricsHTML;

    // Now fetch and populate team members table
    console.log('Fetching employees list...');
    const empResponse = await fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const empData = await empResponse.json();
    console.log(`Employees data received: ${empData.data?.length || 0} total employees`);

    // Filter employees by team
    const filteredEmployees = empData.data.filter(emp => emp.teams.includes(team));
    console.log(`Filtered ${filteredEmployees.length} employees for team: ${team}`);

    // Set dynamic header labels based on team
    if (team === 'admission') {
      document.getElementById('metricHeader1').textContent = 'Fresh Leads';
      document.getElementById('metricHeader2').textContent = 'Calls';
      document.getElementById('metricHeader3').textContent = 'Prospects';
    } else {
      document.getElementById('metricHeader1').textContent = 'Workshop Leads';
      document.getElementById('metricHeader2').textContent = 'Calls';
      document.getElementById('metricHeader3').textContent = 'Interested';
    }

    // Create a map of employee metrics by employee ID
    const employeeMetricsMap = {};
    
    data.data.forEach((metric, index) => {
      // Try multiple possible ID fields
      let empId = metric.employeeId || metric._id || metric.employee_id;
      
      if (!empId) {
        console.warn(`⚠️ Metric at index ${index} has no ID field. Metric keys:`, Object.keys(metric));
        return; // Skip this metric
      }
      
      empId = empId.toString ? empId.toString() : String(empId);
      console.log(`Processing metric ${index}: empId=${empId}`);
      
      if (!employeeMetricsMap[empId]) {
        employeeMetricsMap[empId] = {
          admissionMetrics: { freshLeadReceived: 0, outboundCalls: 0, prospect: 0 },
          workshopMetrics: { workshopName: '', workshopLeadReceived: 0, outboundCalls: 0, interested: 0 },
          postWorkshopMetrics: { outboundCalls: 0, prospect: 0 }
        };
      }
      // Aggregate metrics
      if (metric.admissionMetrics) {
        employeeMetricsMap[empId].admissionMetrics.freshLeadReceived += metric.admissionMetrics.freshLeadReceived || 0;
        employeeMetricsMap[empId].admissionMetrics.outboundCalls += metric.admissionMetrics.outboundCalls || 0;
        employeeMetricsMap[empId].admissionMetrics.prospect += metric.admissionMetrics.prospect || 0;
      }
      if (metric.workshopMetrics) {
        // Only include if workshopType filter is not set, or if it matches the metric's workshop
        if (!workshopType || metric.workshopMetrics.workshopName === workshopType) {
          employeeMetricsMap[empId].workshopMetrics.workshopLeadReceived += metric.workshopMetrics.workshopLeadReceived || 0;
          employeeMetricsMap[empId].workshopMetrics.outboundCalls += metric.workshopMetrics.outboundCalls || 0;
          employeeMetricsMap[empId].workshopMetrics.interested += metric.workshopMetrics.interested || 0;
        }
      }
      if (metric.postWorkshopMetrics) {
        employeeMetricsMap[empId].postWorkshopMetrics.outboundCalls += metric.postWorkshopMetrics.outboundCalls || 0;
        employeeMetricsMap[empId].postWorkshopMetrics.prospect += metric.postWorkshopMetrics.prospect || 0;
      }
    });

    console.log('Employee metrics map:', employeeMetricsMap);

    // Populate team members table
    const tbody = document.querySelector('#teamMembersTable tbody');
    tbody.innerHTML = '';

    if (filteredEmployees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No employees in this team</td></tr>';
      console.log('No employees found for this team');
      return;
    }

    filteredEmployees.forEach(emp => {
      let metric1, metric2, metric3;
      
      // Try multiple ID fields
      let empId = emp._id || emp.id || emp.userId;
      if (!empId) {
        console.warn(`⚠️ Employee has no ID field!`, emp);
        console.log('Employee object keys:', Object.keys(emp));
        return; // Skip this employee
      }
      
      empId = (empId.toString ? empId.toString() : String(empId));
      const empMetrics = employeeMetricsMap[empId];

      console.log(`Looking up metrics for employee ${emp.name} (${empId}):`, empMetrics);

      if (team === 'admission') {
        metric1 = empMetrics?.admissionMetrics.freshLeadReceived || 0;
        metric2 = empMetrics?.admissionMetrics.outboundCalls || 0;
        metric3 = empMetrics?.admissionMetrics.prospect || 0;
      } else {
        metric1 = empMetrics?.workshopMetrics.workshopLeadReceived || 0;
        metric2 = empMetrics?.workshopMetrics.outboundCalls || 0;
        metric3 = empMetrics?.workshopMetrics.interested || 0;
      }

      tbody.innerHTML += `
        <tr>
          <td>${emp.name || emp.userId}</td>
          <td>${emp.designation || 'N/A'}</td>
          <td>${metric1}</td>
          <td>${metric2}</td>
          <td>${metric3}</td>
        </tr>
      `;
    });

    console.log('=== Team metrics page loaded successfully ===');
  } catch (error) {
    console.error('❌ ERROR in loadTeamMetrics():', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    try {
      const container = document.getElementById('teamMetricsContainer');
      if (container) {
        container.innerHTML = `<p style="color: red;">⚠️ Error: ${error.message}</p>`;
      }
    } catch (e) {
      console.error('Could not update teamMetricsContainer:', e);
    }
    
    try {
      const tbody = document.querySelector('#teamMembersTable tbody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">⚠️ Error: ${error.message}</td></tr>`;
      }
    } catch (e) {
      console.error('Could not update table:', e);
    }
  }
}

function applyTeamFilter() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  APPLY TEAM FILTER CALLED              ║');
  console.log('╚════════════════════════════════════════╝');
  
  const teamFilter = document.getElementById('teamFilter');
  const workshopFilterGroup = document.getElementById('workshopFilterGroup');
  const team = teamFilter?.value || 'admission';
  
  // Show workshop filter only when Workshop team is selected
  if (workshopFilterGroup) {
    workshopFilterGroup.style.display = team === 'workshop' ? 'block' : 'none';
  }
  
  console.log('Filter elements found:');
  console.log('  teamFilter:', teamFilter ? '✓ FOUND' : '✗ NOT FOUND', teamFilter ? `(value: ${teamFilter.value})` : '');
  
  console.log('SELECTED VALUES:');
  console.log('  team:', team);
  console.log('');
  console.log('Calling loadTeamMetrics()...');
  console.log('');
  
  loadTeamMetrics();
}

// Individual Performance
async function loadEmployeesList() {
  try {
    console.log('📋 loadEmployeesList() called');
    const response = await fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    console.log(`✅ Employees loaded: ${data.data?.length || 0} employees`);
    allEmployees = data.data;

    // Apply filters and display
    applyIndividualFilter();
  } catch (error) {
    console.error('❌ Error loading employees:', error);
    const tbody = document.getElementById('employeesTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error loading employees: ${error.message}</td></tr>`;
    }
  }
}

function applyIndividualFilter() {
  console.log('🔍 applyIndividualFilter() called');
  
  const searchQuery = (document.getElementById('employeeSearch')?.value || '').toLowerCase();
  const teamFilter = document.getElementById('individualTeamFilter')?.value || 'all';
  const period = document.getElementById('individualTimePeriod')?.value || 'overall';
  
  console.log(`Filters: team=${teamFilter}, period=${period}, search="${searchQuery}"`);
  
  // Filter employees
  let filtered = allEmployees.filter(emp => {
    // Search filter
    const matchesSearch = !searchQuery || 
                          (emp.name && emp.name.toLowerCase().includes(searchQuery)) || 
                          (emp.email && emp.email.toLowerCase().includes(searchQuery));
    
    // Team filter
    const matchesTeam = teamFilter === 'all' || emp.teams?.includes(teamFilter);
    
    return matchesSearch && matchesTeam;
  });
  
  console.log(`Filtered to ${filtered.length} employees`);
  displayEmployeesWithMetrics(filtered, period);
}

async function displayEmployeesWithMetrics(employees, period) {
  console.log(`📊 displayEmployeesWithMetrics() called with ${employees.length} employees, period=${period}`);
  
  const tbody = document.getElementById('employeesTableBody');
  const teamFilter = document.getElementById('individualTeamFilter')?.value || 'all';
  
  if (!tbody) {
    console.error('❌ employeesTableBody element not found');
    return;
  }

  tbody.innerHTML = '';

  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No employees found</td></tr>';
    return;
  }

  // Set metric headers based on team
  if (teamFilter === 'workshop') {
    document.getElementById('individualMetricHeader1').textContent = 'Workshop Leads';
    document.getElementById('individualMetricHeader2').textContent = 'Calls';
    document.getElementById('individualMetricHeader3').textContent = 'Interested';
  } else if (teamFilter === 'all') {
    document.getElementById('individualMetricHeader1').textContent = 'Fresh Leads / Workshop Leads';
    document.getElementById('individualMetricHeader2').textContent = 'Calls';
    document.getElementById('individualMetricHeader3').textContent = 'Prospects / Interested';
  } else {
    document.getElementById('individualMetricHeader1').textContent = 'Fresh Leads';
    document.getElementById('individualMetricHeader2').textContent = 'Calls';
    document.getElementById('individualMetricHeader3').textContent = 'Prospects';
  }

  // Fetch metrics for each employee
  for (const emp of employees) {
    try {
      // Use correct employee ID field (API returns 'id', not '_id')
      const empId = emp.id || emp._id || emp.userId;
      if (!empId) {
        console.warn(`⚠️ No ID found for employee ${emp.name}:`, emp);
        continue;
      }
      
      let url = `/api/metrics/employee/${empId}?period=${period}`;
      console.log(`📡 Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const metricsData = await response.json();
      console.log(`✅ Response for ${emp.name}:`, metricsData);
      console.log(`   Data array length: ${metricsData.data?.length}`);
      console.log(`   First item structure:`, metricsData.data?.[0]);
      
      // Aggregate metrics
      let metric1 = 0, metric2 = 0, metric3 = 0;
      
      if (metricsData.data && Array.isArray(metricsData.data)) {
        console.log(`   Processing ${metricsData.data.length} metric records...`);
        metricsData.data.forEach((metric, idx) => {
          console.log(`   Record ${idx}:`, metric);
          if (teamFilter === 'workshop') {
            const m1 = metric.workshopMetrics?.workshopLeadReceived || 0;
            const m2 = metric.workshopMetrics?.outboundCalls || 0;
            const m3 = metric.workshopMetrics?.interested || 0;
            console.log(`     Workshop: leads=${m1}, calls=${m2}, interested=${m3}`);
            metric1 += m1;
            metric2 += m2;
            metric3 += m3;
          } else if (teamFilter === 'admission') {
            const m1 = metric.admissionMetrics?.freshLeadReceived || 0;
            const m2 = metric.admissionMetrics?.outboundCalls || 0;
            const m3 = metric.admissionMetrics?.prospect || 0;
            console.log(`     Admission: leads=${m1}, calls=${m2}, prospects=${m3}`);
            metric1 += m1;
            metric2 += m2;
            metric3 += m3;
          } else {
            // All teams - aggregate all metrics
            const adm1 = metric.admissionMetrics?.freshLeadReceived || 0;
            const adm2 = metric.admissionMetrics?.outboundCalls || 0;
            const adm3 = metric.admissionMetrics?.prospect || 0;
            const ws1 = metric.workshopMetrics?.workshopLeadReceived || 0;
            const ws2 = metric.workshopMetrics?.outboundCalls || 0;
            const ws3 = metric.workshopMetrics?.interested || 0;
            const pw2 = metric.postWorkshopMetrics?.outboundCalls || 0;
            const pw3 = metric.postWorkshopMetrics?.prospect || 0;
            console.log(`     Admission: leads=${adm1}, calls=${adm2}, prospects=${adm3}`);
            console.log(`     Workshop: leads=${ws1}, calls=${ws2}, interested=${ws3}`);
            console.log(`     PostWS: calls=${pw2}, prospects=${pw3}`);
            metric1 += adm1 + ws1;
            metric2 += adm2 + ws2 + pw2;
            metric3 += adm3 + ws3 + pw3;
          }
        });
      } else {
        console.warn(`   ⚠️ No data array found in response!`);
      }
      
      console.log(`📊 Final for ${emp.name}: m1=${metric1}, m2=${metric2}, m3=${metric3}`);
      
      tbody.innerHTML += `
        <tr>
          <td>${emp.name || 'N/A'}</td>
          <td>${emp.designation || 'N/A'}</td>
          <td>${metric1}</td>
          <td>${metric2}</td>
          <td>${metric3}</td>
        </tr>
      `;
    } catch (e) {
      console.error(`Error fetching metrics for employee ${emp.name}:`, e);
      tbody.innerHTML += `
        <tr>
          <td>${emp.name || 'N/A'}</td>
          <td>${emp.designation || 'N/A'}</td>
          <td colspan="3" style="color: red;">Error loading metrics</td>
        </tr>
      `;
    }
  }

  console.log(`✅ displayEmployeesWithMetrics() completed`);
}

function searchEmployees() {
  console.log('🔍 searchEmployees() called');
  applyIndividualFilter();
}

async function viewEmployeeDetails(employeeId) {
  try {
    const response = await fetch(`/api/metrics/employee/${employeeId}?startDate=2024-01-01`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();

    // Calculate stats from metrics
    let totalAdmissionLeads = 0, totalWorkshopLeads = 0, totalCalls = 0;
    
    data.data.forEach(metric => {
      totalAdmissionLeads += metric.admissionMetrics.freshLeadReceived || 0;
      totalWorkshopLeads += metric.workshopMetrics.workshopLeadReceived || 0;
      totalCalls += (metric.admissionMetrics.outboundCalls || 0) + 
                    (metric.workshopMetrics.outboundCalls || 0) +
                    (metric.postWorkshopMetrics.outboundCalls || 0);
    });

    document.getElementById('employeeDetailsContent').innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Admission Leads</div>
          <div class="metric-value">${totalAdmissionLeads}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Workshop Leads</div>
          <div class="metric-value">${totalWorkshopLeads}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Calls</div>
          <div class="metric-value">${totalCalls}</div>
        </div>
      </div>
      <div style="margin-top: 1.5rem;">
        <h4 style="color: var(--primary-dark); margin-bottom: 1rem;">Recent History</h4>
        <div class="table-responsive">
          <table style="font-size: 0.9rem;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admission</th>
                <th>Workshop</th>
                <th>Calls</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.slice(0, 10).map(metric => `
                <tr>
                  <td>${new Date(metric.date).toLocaleDateString()}</td>
                  <td>${metric.admissionMetrics.freshLeadReceived || 0}</td>
                  <td>${metric.workshopMetrics.workshopLeadReceived || 0}</td>
                  <td>${(metric.admissionMetrics.outboundCalls || 0) + 
                        (metric.workshopMetrics.outboundCalls || 0) +
                        (metric.postWorkshopMetrics.outboundCalls || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('employeeDetailsModal').classList.add('active');
  } catch (error) {
    console.error('Error loading employee details:', error);
  }
}

function closeEmployeeModal() {
  document.getElementById('employeeDetailsModal').classList.remove('active');
}

// Employee Management
async function loadEmployeesManagement() {
  await loadEmployeesList();
  populateManagementTable();
}

function populateManagementTable() {
  const tbody = document.getElementById('managementTableBody');
  tbody.innerHTML = '';

  allEmployees.forEach(emp => {
    const teams = emp.teams.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${emp.phone || 'N/A'}</td>
        <td>${emp.designation}</td>
        <td>${teams}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editEmployee('${emp.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

function showCreateEmployeeModal() {
  currentEditingEmployeeId = null;
  document.getElementById('modalTitle').textContent = 'Add New Employee';
  document.getElementById('empPasswordGroup').style.display = 'block';
  document.getElementById('empPassword').required = true; // Password required for new employees
  document.getElementById('empPhone').required = true; // Phone required for new employees
  document.getElementById('employeeForm').reset();
  document.getElementById('phoneError').style.display = 'none';
  document.querySelector('input[name="teams"][value="admission"]').checked = false;
  document.querySelector('input[name="teams"][value="workshop"]').checked = false;
  
  // Show create admin option for super admin
  const createAdminGroup = document.getElementById('createAdminGroup');
  const createAsAdmin = document.getElementById('createAsAdmin');
  const designationGroup = document.getElementById('designationGroup');
  const empDesignation = document.getElementById('empDesignation');
  
  if (currentUser && currentUser.role === 'super-admin') {
    createAdminGroup.style.display = 'block';
    createAsAdmin.checked = false;
    // Show designation by default
    designationGroup.style.display = 'block';
    empDesignation.required = true;
  } else {
    createAdminGroup.style.display = 'none';
    createAsAdmin.checked = false;
    designationGroup.style.display = 'block';
    empDesignation.required = true;
  }
  
  document.getElementById('employeeModal').classList.add('active');
}

function editEmployee(employeeId) {
  currentEditingEmployeeId = employeeId;
  const emp = allEmployees.find(e => e.id === employeeId);

  document.getElementById('modalTitle').textContent = 'Edit Employee';
  document.getElementById('empPasswordGroup').style.display = 'none';
  document.getElementById('empPassword').required = false; // Password not required when editing
  document.getElementById('empPhone').required = false; // Phone optional when editing old employees
  document.getElementById('empName').value = emp.name;
  document.getElementById('empPhone').value = emp.phone || '';
  document.getElementById('empDesignation').value = emp.designation;
  document.getElementById('phoneError').style.display = 'none';

  // Set teams
  document.querySelector('input[name="teams"][value="admission"]').checked = emp.teams.includes('admission');
  document.querySelector('input[name="teams"][value="workshop"]').checked = emp.teams.includes('workshop');

  // Hide create admin option when editing
  const createAdminGroup = document.getElementById('createAdminGroup');
  createAdminGroup.style.display = 'none';

  document.getElementById('employeeModal').classList.add('active');
}

// Toggle designation visibility when Create as Admin checkbox changes
document.getElementById('createAsAdmin')?.addEventListener('change', function() {
  const designationGroup = document.getElementById('designationGroup');
  const empDesignation = document.getElementById('empDesignation');
  
  if (this.checked) {
    designationGroup.style.display = 'none';
    empDesignation.required = false;
    empDesignation.value = '';
  } else {
    designationGroup.style.display = 'block';
    empDesignation.required = true;
  }
});

async function saveEmployee(event) {
  event.preventDefault();

  const name = document.getElementById('empName').value;
  const phone = document.getElementById('empPhone').value;
  const password = document.getElementById('empPassword').value;
  const designation = document.getElementById('empDesignation').value;
  const createAsAdmin = document.getElementById('createAsAdmin').checked;
  const teams = Array.from(document.querySelectorAll('input[name="teams"]:checked')).map(t => t.value);

  console.log('💾 Saving employee:', { name, phone, designation, teams, createAsAdmin, isEditing: !!currentEditingEmployeeId });

  // Validate phone - if provided, must be exactly 10 digits
  const phoneError = document.getElementById('phoneError');
  if (phone && phone.replace(/\D/g, '').length !== 10) {
    phoneError.textContent = '⚠️ Phone must be exactly 10 digits';
    phoneError.style.display = 'block';
    return;
  } else {
    phoneError.style.display = 'none';
  }

  if (teams.length === 0) {
    alert('Please select at least one team');
    return;
  }

  // Validate password for new employees
  if (!currentEditingEmployeeId && !password) {
    alert('Password is required for new employees');
    return;
  }

  try {
    let url = '/api/employees';
    let method = 'POST';
    let body = { name, designation, teams };
    
    // Add role if creating as admin
    if (createAsAdmin) {
      body.role = 'admin';
    }
    
    // Only include phone if it has a value
    if (phone) {
      body.phone = phone;
    }

    if (currentEditingEmployeeId) {
      url += `/${currentEditingEmployeeId}`;
      method = 'PUT';
      console.log('🔄 Editing employee:', url, body);
    } else {
      body.email = `${name.toLowerCase().replace(/\s+/g, '.')}@dv.com`;
      body.password = password;
      console.log('✨ Creating employee:', url, body);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });

    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      throw new Error(errorData.message || `Failed to save employee (${response.status})`);
    }

    const result = await response.json();
    console.log('✅ Save successful:', result);
    
    alert(currentEditingEmployeeId ? 'Employee updated successfully' : 'Employee created successfully');
    closeEmployeeForm();
    loadEmployeesManagement();
  } catch (error) {
    console.error('❌ Save error:', error);
    alert('Error: ' + error.message);
  }
}

function closeEmployeeForm() {
  document.getElementById('employeeModal').classList.remove('active');
  document.getElementById('employeeForm').reset();
  currentEditingEmployeeId = null;
}

async function deleteEmployee(employeeId) {
  if (!confirm('Are you sure you want to delete this employee?')) return;

  try {
    const response = await fetch(`/api/employees/${employeeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) throw new Error('Failed to delete employee');

    alert('Employee deleted successfully');
    loadEmployeesManagement();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// My Data Entry
async function loadMyData() {
  // Show/hide team sections based on current user's teams
  if (currentUser.teams.includes('admission')) {
    document.getElementById('admissionSection').style.display = 'block';
  }
  if (currentUser.teams.includes('workshop')) {
    document.getElementById('workshopSection').style.display = 'block';
  }

  loadMySubmissions();
}

async function submitMyData(event) {
  event.preventDefault();

  const date = document.getElementById('myDate').value;
  const body = { date };

  // Collect admission metrics if applicable
  if (currentUser.teams.includes('admission')) {
    body.admissionMetrics = {
      freshLeadReceived: parseInt(document.getElementById('freshLeadReceived').value) || 0,
      outboundCalls: parseInt(document.getElementById('admissionCalls').value) || 0,
      prospect: parseInt(document.getElementById('admissionProspect').value) || 0,
    };
  }

  // Collect workshop metrics if applicable
  if (currentUser.teams.includes('workshop')) {
    body.workshopMetrics = {
      workshopName: document.getElementById('workshopName').value || '',
      workshopLeadReceived: parseInt(document.getElementById('workshopLeadReceived').value) || 0,
      outboundCalls: parseInt(document.getElementById('workshopCalls').value) || 0,
      interested: parseInt(document.getElementById('workshopInterested').value) || 0,
    };
    body.postWorkshopMetrics = {
      workshopName: document.getElementById('postWorkshopName').value || '',
      outboundCalls: parseInt(document.getElementById('postWorkshopCalls').value) || 0,
      prospect: parseInt(document.getElementById('postWorkshopProspect').value) || 0,
    };
  }

  try {
    const response = await fetch('/api/metrics/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error('Failed to submit metrics');

    alert('Metrics submitted successfully!');
    document.getElementById('myDataForm').reset();
    setDefaultDate();
    loadMySubmissions();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function loadMySubmissions() {
  try {
    const employeeId = currentUser.employeeId;
    console.log('Loading submissions for employee:', employeeId);
    
    const response = await fetch(`/api/metrics/employee/${employeeId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) {
      console.error('Failed to load submissions:', response.status);
      return;
    }

    const data = await response.json();
    console.log('Submissions loaded:', data.data?.length);
    
    const tbody = document.getElementById('mySubmissionsBody');
    tbody.innerHTML = '';

    if (!data.data || data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No submissions yet</td></tr>';
      return;
    }

    data.data.slice(0, 10).forEach(metric => {
      const admissionLeads = metric.admissionMetrics?.freshLeadReceived || 0;
      const workshopLeads = metric.workshopMetrics?.workshopLeadReceived || 0;
      const totalCalls = (metric.admissionMetrics?.outboundCalls || 0) + 
                         (metric.workshopMetrics?.outboundCalls || 0) +
                         (metric.postWorkshopMetrics?.outboundCalls || 0);

      tbody.innerHTML += `
        <tr>
          <td>${new Date(metric.date).toLocaleDateString()}</td>
          <td>${admissionLeads}</td>
          <td>${workshopLeads}</td>
          <td>${totalCalls}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error('Error loading submissions:', error);
  }
}

// Utility Functions
function applyFilters() {
  console.log('Filter changed - applyFilters() called');
  const period = document.getElementById('timePeriod').value;
  console.log('Selected period:', period);
  
  // Show/hide custom date range inputs
  document.getElementById('customDateRange').style.display = 
    period === 'custom' ? 'block' : 'none';
  document.getElementById('customDateRangeEnd').style.display = 
    period === 'custom' ? 'block' : 'none';

  // Force clear and reload metrics immediately - no delays
  console.log('Forcing metrics reload...');
  
  // Destroy all existing charts first
  if (performanceChart) {
    try {
      performanceChart.destroy();
      performanceChart = null;
    } catch (e) {
      console.error('Error destroying performanceChart:', e);
    }
  }
  if (admissionChart) {
    try {
      admissionChart.destroy();
      admissionChart = null;
    } catch (e) {
      console.error('Error destroying admissionChart:', e);
    }
  }
  if (workshopChart) {
    try {
      workshopChart.destroy();
      workshopChart = null;
    } catch (e) {
      console.error('Error destroying workshopChart:', e);
    }
  }

  // Load metrics without delay
  loadMetrics();
}

function setDefaultDate() {
  const today = new Date();
  document.getElementById('myDate').valueAsDate = today;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Activity Report Functions
async function loadActivityReport() {
  try {
    const dateInput = document.getElementById('activityReportDate');
    const statusFilter = document.getElementById('activityStatusFilter').value;
    const teamFilter = document.getElementById('activityTeamFilter').value;

    const selectedDate = dateInput.value ? new Date(dateInput.value) : new Date();
    selectedDate.setHours(0, 0, 0, 0);

    let url = `/api/metrics/report/activity?date=${selectedDate.toISOString().split('T')[0]}`;
    if (teamFilter) url += `&team=${teamFilter}`;

    console.log('Fetching activity report from:', url);

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await response.json();
    console.log('Activity report data:', data);

    // Update summary cards
    document.getElementById('totalEmployeesCount').textContent = data.summary.total;
    document.getElementById('submittedCount').textContent = data.summary.submitted;
    document.getElementById('pendingCount').textContent = data.summary.pending;
    document.getElementById('submissionPercentage').textContent = data.summary.submissionPercentage + '%';

    // Filter data based on status
    let filteredData = data.data;
    if (statusFilter === 'submitted') {
      filteredData = filteredData.filter(emp => emp.todaySubmitted);
    } else if (statusFilter === 'pending') {
      filteredData = filteredData.filter(emp => !emp.todaySubmitted);
    }

    // Populate table
    const tbody = document.getElementById('activityReportBody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No employees to display</td></tr>`;
      document.getElementById('notSubmittedCard').style.display = 'none';
      return;
    }

    filteredData.forEach(emp => {
      const lastSubmittedText = emp.lastSubmittedDate 
        ? new Date(emp.lastSubmittedDate).toLocaleDateString()
        : 'Never';

      const todayStatus = emp.todaySubmitted 
        ? '<span style="color: #00B894; font-weight: 700;">✓ Submitted</span>'
        : '<span style="color: #FF7675; font-weight: 700;">✗ Pending</span>';

      const yesterdayStatus = emp.yesterdaySubmitted 
        ? '<span style="color: #00B894;">✓ Submitted</span>'
        : '<span style="color: #FF7675;">✗ Pending</span>';

      const daysText = emp.daysWithoutSubmit === -1 
        ? 'Never' 
        : emp.daysWithoutSubmit + ' days';

      tbody.innerHTML += `
        <tr>
          <td>${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${emp.teams.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</td>
          <td>${lastSubmittedText}</td>
          <td>${todayStatus}</td>
          <td>${yesterdayStatus}</td>
          <td>${daysText}</td>
        </tr>
      `;
    });

    // Show not submitted list if there are pending submissions
    const notSubmitted = filteredData.filter(emp => !emp.todaySubmitted);
    if (notSubmitted.length > 0) {
      const notSubmittedDiv = document.getElementById('notSubmittedList');
      notSubmittedDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
          ${notSubmitted.map(emp => `
            <div style="padding: 1rem; background: rgba(255, 118, 117, 0.08); border: 1px solid rgba(255, 118, 117, 0.2); border-radius: 8px;">
              <div style="font-weight: 700; color: #FF7675;">${emp.name}</div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">${emp.designation}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                Last submitted: ${emp.lastSubmittedDate ? new Date(emp.lastSubmittedDate).toLocaleDateString() : 'Never'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      document.getElementById('notSubmittedCard').style.display = 'block';
    } else {
      document.getElementById('notSubmittedCard').style.display = 'none';
    }

  } catch (error) {
    console.error('Error loading activity report:', error);
    alert('Error loading report: ' + error.message);
  }
}

// Initialize activity report date picker
document.addEventListener('DOMContentLoaded', function() {
  const dateInput = document.getElementById('activityReportDate');
  if (dateInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.valueAsDate = today;
  }
});
