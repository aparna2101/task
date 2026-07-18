import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://task-55v5.onrender.com/api';

const countryCodes = [
  { code: '+91', name: 'in' },
  { code: '+1', name: 'us' },
  { code: '+1', name: 'ca' },
  { code: '+44', name: 'gb' },
  { code: '+61', name: 'au' },
  { code: '+971', name: 'ae' },
  { code: '+65', name: 'sg' },
  { code: '+49', name: 'de' },
  { code: '+33', name: 'fr' },
  { code: '+966', name: 'sa' },
  { code: '+81', name: 'jp' },
  { code: '+86', name: 'cn' },
  { code: '+27', name: 'za' },
  { code: '+977', name: 'np' },
  { code: '+880', name: 'bd' },
  { code: '+92', name: 'pk' },
  { code: '+94', name: 'lk' },
  { code: '+64', name: 'nz' },
  { code: '+39', name: 'it' },
  { code: '+34', name: 'es' },
  { code: '+31', name: 'nl' },
  { code: '+60', name: 'my' },
  { code: '+62', name: 'id' },
  { code: '+63', name: 'ph' },
  { code: '+66', name: 'th' },
  { code: '+52', name: 'mx' },
  { code: '+55', name: 'br' },
  { code: '+7', name: 'ru' },
  { code: '+90', name: 'tr' },
  { code: '+41', name: 'ch' },
  { code: '+46', name: 'se' },
  { code: '+32', name: 'be' },
  { code: '+43', name: 'at' },
  { code: '+47', name: 'no' },
  { code: '+45', name: 'dk' },
  { code: '+353', name: 'ie' },
  { code: '+48', name: 'pl' },
  { code: '+351', name: 'pt' },
  { code: '+30', name: 'gr' },
  { code: '+972', name: 'il' },
  { code: '+20', name: 'eg' },
  { code: '+234', name: 'ng' },
  { code: '+254', name: 'ke' },
  { code: '+54', name: 'ar' },
  { code: '+56', name: 'cl' },
  { code: '+57', name: 'co' },
  { code: '+51', name: 'pe' },
  { code: '+84', name: 'vn' },
  { code: '+852', name: 'hk' },
  { code: '+82', name: 'kr' },
  { code: '+98', name: 'ir' },
  { code: '+964', name: 'iq' },
  { code: '+965', name: 'kw' },
  { code: '+968', name: 'om' },
  { code: '+974', name: 'qa' },
  { code: '+962', name: 'jo' },
  { code: '+961', name: 'lb' },
  { code: '+973', name: 'bh' },
  { code: '+380', name: 'ua' },
  { code: '+358', name: 'fi' },
  { code: '+420', name: 'cz' },
  { code: '+36', name: 'hu' },
  { code: '+40', name: 'ro' },
  { code: '+212', name: 'ma' },
  { code: '+216', name: 'tn' },
  { code: '+213', name: 'dz' },
  { code: '+251', name: 'et' },
  { code: '+218', name: 'ly' },
  { code: '+249', name: 'sd' },
  { code: '+255', name: 'tz' },
  { code: '+256', name: 'ug' },
  { code: '+263', name: 'zw' },
  { code: '+260', name: 'zm' },
  { code: '+244', name: 'ao' },
  { code: '+233', name: 'gh' },
  { code: '+225', name: 'ci' },
  { code: '+221', name: 'sn' },
  { code: '+93', name: 'af' },
  { code: '+998', name: 'uz' },
  { code: '+992', name: 'tj' },
  { code: '+993', name: 'tm' },
  { code: '+996', name: 'kg' },
  { code: '+995', name: 'ge' },
  { code: '+374', name: 'am' },
  { code: '+994', name: 'az' },
  { code: '+976', name: 'mn' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Custom Smooth Cursor States
  const [cursorHovered, setCursorHovered] = useState(false);

  // Performance-optimized direct DOM mouse position tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cursor = document.getElementById('custom-cursor');
      const dot = document.getElementById('custom-cursor-dot');
      if (cursor && dot) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOverInteractive = (e) => {
      const isInteractive = e.target.closest('button, select, input, a, tr, td, .pay-badge, option');
      setCursorHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOverInteractive);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOverInteractive);
    };
  }, []);

  // Dashboard states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    placed: 0,
    processing: 0,
    ready: 0,
    completed: 0
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCronModal, setShowCronModal] = useState(false);

  // Scheduler Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Form states
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [newOrder, setNewOrder] = useState({
    orderId: '',
    customerName: '',
    phoneNumber: '',
    productName: '',
    amount: '',
    paymentStatus: 'PENDING',
    orderStatus: 'PLACED'
  });

  // Scheduler Trigger states
  const [schedulerKey, setSchedulerKey] = useState('super_secret_scheduler_key_123');
  const [schedulerResult, setSchedulerResult] = useState(null);
  const [schedulerRunning, setSchedulerRunning] = useState(false);

  // Click-away close listener for Custom Country Dropdown (Positioned safely after states initialization)
  useEffect(() => {
    if (!showCountryDropdown) return;
    const closeDropdown = () => setShowCountryDropdown(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [showCountryDropdown]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter
      });
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      const response = await fetch(`${API_URL}/orders?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalOrders(result.pagination.totalOrders);
        setCurrentPage(result.pagination.currentPage);
      } else {
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Could not connect to the backend server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/orders?limit=1000`);
      const result = await response.json();
      if (result.success) {
        const counts = { placed: 0, processing: 0, ready: 0, completed: 0 };
        result.data.forEach(order => {
          if (order.orderStatus === 'PLACED') counts.placed++;
          else if (order.orderStatus === 'PROCESSING') counts.processing++;
          else if (order.orderStatus === 'READY_TO_SHIP') counts.ready++;
          else if (order.orderStatus === 'DELIVERED') counts.completed++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const response = await fetch(`${API_URL}/scheduler/logs?page=${logsPage}&limit=10`);
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
        setLogsTotalPages(result.pagination.totalPages);
        setTotalLogs(result.pagination.totalLogs);
      }
    } catch (err) {
      console.error('Failed to fetch scheduler logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, [logsPage]);

  // Trigger effect for dashboard fetching
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchOrders();
      fetchStats();
    } else {
      fetchLogs();
    }
  }, [activeTab, fetchOrders, fetchStats, fetchLogs]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle Filter Change
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Inline text-only filter for Customer Name
  const handleNameChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-Z\s]/g, '');
    setNewOrder({ ...newOrder, customerName: cleanValue });
  };

  // Inline digit-only & length limit filter for Phone Number
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, '');
    const trimmedValue = cleanValue.slice(0, 10);
    setPhoneNumberInput(trimmedValue);
  };

  // Create Order Submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (phoneNumberInput.length !== 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          phoneNumber: `${countryCode} ${phoneNumberInput}`,
          amount: Number(newOrder.amount)
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setNewOrder({
          orderId: '',
          customerName: '',
          phoneNumber: '',
          productName: '',
          amount: '',
          paymentStatus: 'PENDING',
          orderStatus: 'PLACED'
        });
        setPhoneNumberInput('');
        setCountryCode('+91');
        fetchOrders();
        fetchStats();
      } else {
        alert(result.message || 'Error creating order');
      }
    } catch (err) {
      alert('Failed to connect to the backend server.');
    }
  };

  // Toggle order payment status directly
  const handleTogglePaymentStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        fetchOrders();
      } else {
        alert(result.message || 'Failed to update payment status');
      }
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  // Trigger Scheduler
  const handleTriggerScheduler = async () => {
    setSchedulerRunning(true);
    setSchedulerResult(null);
    try {
      const response = await fetch(`${API_URL}/scheduler/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-scheduler-key': schedulerKey
        }
      });
      const result = await response.json();
      setSchedulerResult({
        status: response.status,
        data: result
      });

      // Refresh list and stats
      fetchOrders();
      fetchStats();
    } catch (err) {
      setSchedulerResult({
        status: 'Error',
        data: { message: 'Failed to connect to scheduler API endpoint.' }
      });
    } finally {
      setSchedulerRunning(false);
    }
  };

  // Seed Dummy Test Orders
  const handleSeedDummyOrders = async () => {
    if (!window.confirm('Do you want to seed 3 mock orders with custom timestamps (old dates) to test the scheduler rules?')) return;
    try {
      const response = await fetch(`${API_URL}/orders/seed-dummy`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        alert('Dummy orders successfully seeded! Use the Cron trigger to process them.');
        fetchOrders();
        fetchStats();
      } else {
        alert(result.message || 'Failed to seed dummy orders');
      }
    } catch (err) {
      alert('Could not seed dummy orders. Please make sure the seed API is mounted.');
    }
  };

  // Change order status manually
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        fetchOrders();
        fetchStats();
      } else {
        alert(result.message || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background Glowing Nebula Orbs */}
      <div className="glowing-orb orb-purple"></div>
      <div className="glowing-orb orb-blue"></div>

      {/* Custom Smooth Cursor Elements */}
      <div id="custom-cursor" className={`custom-cursor ${cursorHovered ? 'cursor-active' : ''}`}></div>
      <div id="custom-cursor-dot" className="custom-cursor-dot"></div>

      {/* Header */}
      <header className="glass" style={{ margin: '12px 20px', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary-gradient)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)' }}>O</div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OrderProg</h1>
        </div>

        {/* Navigation Tabs with SVG Icons */}
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn nav-tab-item ${activeTab === 'dashboard' ? 'active' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
            Dashboard
          </button>
          <button
            className={`btn nav-tab-item ${activeTab === 'schedulerLogs' ? 'active' : 'btn-secondary'}`}
            onClick={() => setActiveTab('schedulerLogs')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            Scheduler Logs
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0 20px 40px 20px', maxWidth: '1400px', width: 'calc(100% - 40px)', margin: '0 auto', zIndex: 5 }}>

        {activeTab === 'dashboard' ? (
          <div className="fade-in">
            {/* Quick Metrics */}
            <div className="dashboard-grid">
              <div className="glass card-metric metric-placed">
                <div className="metric-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                </div>
                <div className="metric-title">Placed Orders</div>
                <div className="metric-value">{stats.placed}</div>
                <div className="metric-desc">Awaiting initial progression</div>
              </div>
              <div className="glass card-metric metric-processing">
                <div className="metric-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                </div>
                <div className="metric-title">In Processing</div>
                <div className="metric-value">{stats.processing}</div>
                <div className="metric-desc">Running progression checks</div>
              </div>
              <div className="glass card-metric metric-ready">
                <div className="metric-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </div>
                <div className="metric-title">Ready To Ship</div>
                <div className="metric-value">{stats.ready}</div>
                <div className="metric-desc">Cleared for deployment</div>
              </div>
              <div className="glass card-metric metric-completed">
                <div className="metric-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <div className="metric-title">Delivered</div>
                <div className="metric-value">{stats.completed}</div>
                <div className="metric-desc">Fulfillment finalized</div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass" style={{ padding: '16px 20px', borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--danger-bg)', color: 'var(--text-primary)', marginBottom: '24px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>System Link Failure</span>
                  <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                    Retry
                  </button>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            )}

            {/* Toolbar Panel */}
            <div className="glass" style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>

              {/* Search & Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '320px' }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Search order ID, customer or product..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ flex: 1, minWidth: '240px' }}
                />

                <select
                  className="input-control"
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  style={{ minWidth: '160px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="READY_TO_SHIP">Ready To Ship</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons with clean SVG icons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handleSeedDummyOrders} title="Seed simulated data with backdated values for cron verification">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5M12 2v10M9 8l3-3 3 3M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Z" /></svg>
                  Seed Test Orders
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCronModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Cron Control
                </button>
                <button className="btn" onClick={() => setShowAddModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Create Order
                </button>
                <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '12px' }} title="Reload database orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                </button>
              </div>
            </div>

            {/* Orders Table Container */}
            <div className="glass" style={{ padding: '1px' }}>
              {loading ? (
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(191,149,63,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Retrieving order entries...</div>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '16px', filter: 'drop-shadow(0 8px 16px rgba(191,149,63,0.15))' }}>📦</div>
                  <h3 style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No Orders Found</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                    {searchTerm || statusFilter !== 'ALL' ? 'No orders match your filter criteria.' : 'Start by generating an order using the actions above.'}
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product Details</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.orderId}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.phoneNumber}</div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{order.productName}</td>
                          <td style={{ fontWeight: 600 }}>${order.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${order.orderStatus === 'READY_TO_SHIP' ? 'ready' : order.orderStatus.toLowerCase()
                              }`}>
                              <span className="badge-dot"></span>
                              {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`badge pay-badge pay-${order.paymentStatus.toLowerCase()}`}
                              style={{ border: 'none' }}
                              onClick={() => handleTogglePaymentStatus(order._id, order.paymentStatus)}
                              title="Click to toggle status"
                            >
                              {order.paymentStatus}
                            </button>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowTimelineModal(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                Timeline
                              </button>

                              <select
                                className="input-control"
                                value={order.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: '120px' }}
                              >
                                <option value="PLACED">Placed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="READY_TO_SHIP">Ready to Ship</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Pagination */}
              {orders.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Showing page <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentPage}</span> of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalPages}</span> ({totalOrders} total orders)
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Previous
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Scheduler Logs Tab */
          <div className="fade-in">
            <div className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 600 }}>Scheduler Executions</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Detailed history of cron executions and processed states.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setShowCronModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Trigger Cron
                </button>
                <button className="btn btn-secondary" onClick={fetchLogs} style={{ padding: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: '1px' }}>
              {logsLoading ? (
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(191,149,63,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Retrieving scheduler execution logs...</div>
                </div>
              ) : logs.length === 0 ? (
                <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '16px', filter: 'drop-shadow(0 8px 16px rgba(191,149,63,0.15))' }}>🗒️</div>
                  <h3 style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No Log Entries</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                    Cron tasks run automatically every 5 minutes. No executions have run yet.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Execution Timestamp</th>
                        <th>Execution Status</th>
                        <th>Orders Shifted</th>
                        <th>Activity Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontWeight: 500 }}>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${log.status === 'SUCCESS' ? 'badge-delivered' : 'badge-cancelled'}`}>
                              <span className="badge-dot"></span>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.ordersProcessed}</td>
                          <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'normal', maxWidth: '500px' }}>
                            {log.errorMessage ? (
                              <span style={{ color: 'var(--danger)' }}>Error: {log.errorMessage}</span>
                            ) : (
                              log.details
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Logs Table Pagination */}
              {logs.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Showing log page <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{logsPage}</span> of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{logsTotalPages}</span> ({totalLogs} executions logged)
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      disabled={logsPage === 1}
                      onClick={() => setLogsPage(prev => Math.max(prev - 1, 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Previous
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      disabled={logsPage === logsTotalPages}
                      onClick={() => setLogsPage(prev => Math.min(prev + 1, logsTotalPages))}
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ margin: '20px', padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', zIndex: 5 }}>
        Order Management and Cron Scheduling Dashboard • Built in Sandboxed environment.
      </footer>

      {/* CREATE ORDER MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass fade-in" style={{ padding: '30px', width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Create New Order</h2>

            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order ID (Optional - auto-generated if left empty)</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. ORD-1004"
                  value={newOrder.orderId}
                  onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer Name (Letters only)</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Enter customer full name"
                  required
                  value={newOrder.customerName}
                  onChange={handleNameChange}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number (10 Digits)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', width: '120px' }}>
                    {/* Selected Trigger Button */}
                    <button
                      type="button"
                      className="input-control"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCountryDropdown(!showCountryDropdown);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        height: '42px',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                        <img
                          src={`https://flagcdn.com/16x12/${(countryCodes.find(c => c.code === countryCode)?.name || 'in').toLowerCase()}.png`}
                          alt="flag"
                          style={{ width: '16px', height: '12px', objectFit: 'cover' }}
                        />
                        {countryCode}
                      </span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
                    </button>

                    {/* Country List Dropdown Menu (Always Downward) */}
                    {showCountryDropdown && (
                      <div
                        className="glass"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '180px',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          marginTop: '4px',
                          zIndex: 1100,
                          padding: '4px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                          backgroundColor: '#0c0e17'
                        }}
                      >
                        {countryCodes.map((country, idx) => (
                          <div
                            key={idx}
                            className="dropdown-item"
                            onClick={() => {
                              setCountryCode(country.code);
                              setShowCountryDropdown(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.85rem',
                              color: 'var(--text-primary)',
                              transition: 'background 0.2s',
                              cursor: 'none'
                            }}
                          >
                            <img
                              src={`https://flagcdn.com/16x12/${country.name.toLowerCase()}.png`}
                              alt={country.name}
                              style={{ width: '16px', height: '12px', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: 600 }}>{country.code}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({country.name.toUpperCase()})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="9876543210"
                    required
                    value={phoneNumberInput}
                    onChange={handlePhoneChange}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Product Name</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Item description / name"
                  required
                  value={newOrder.productName}
                  onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-control"
                  placeholder="0.00"
                  required
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Status</label>
                  <select
                    className="input-control"
                    value={newOrder.paymentStatus}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order Status</label>
                  <select
                    className="input-control"
                    value={newOrder.orderStatus}
                    onChange={(e) => setNewOrder({ ...newOrder, orderStatus: e.target.value })}
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE VIEW MODAL */}
      {showTimelineModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass fade-in" style={{ padding: '30px', width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Order Lifecycle History</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Tracking updates for ID: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.orderId}</span>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '20px', margin: '20px 0' }}>
              {/* Vertical line connector */}
              <div style={{ position: 'absolute', left: '4px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.map((historyItem, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Timeline indicator circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '6px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: idx === selectedOrder.statusHistory.length - 1 ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: idx === selectedOrder.statusHistory.length - 1 ? '0 0 8px var(--primary)' : 'none'
                  }}></div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${historyItem.status === 'READY_TO_SHIP' ? 'ready' : historyItem.status.toLowerCase()}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        {historyItem.status.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(historyItem.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn" onClick={() => {
                setShowTimelineModal(false);
                setSelectedOrder(null);
              }}>Close View</button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULER CONTROL / TRIGGER CRON MODAL */}
      {showCronModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass fade-in" style={{ padding: '30px', width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Manual Scheduler Execution</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0', fontSize: '0.85rem' }}>
              Trigger the backend Order Status Progression check API secured via authorization headers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Header Verification Key (x-scheduler-key)</label>
                <input
                  type="text"
                  className="input-control"
                  value={schedulerKey}
                  onChange={(e) => setSchedulerKey(e.target.value)}
                  placeholder="Enter key secret..."
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn"
                  disabled={schedulerRunning}
                  onClick={handleTriggerScheduler}
                  style={{ flex: 1 }}
                >
                  {schedulerRunning ? 'Triggering API...' : '🚀 Execute Cron API'}
                </button>
              </div>

              {/* Execution result console view */}
              {schedulerResult && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>HTTP Response Status:</span>
                    <span style={{
                      fontWeight: 600,
                      color: schedulerResult.status === 200 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {schedulerResult.status} {schedulerResult.status === 200 ? '(OK)' : '(Error)'}
                    </span>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    backgroundColor: '#0a0a0d',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    color: '#c5a867',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    overflowX: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(schedulerResult.data, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={() => {
                  setShowCronModal(false);
                  setSchedulerResult(null);
                }}>
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
