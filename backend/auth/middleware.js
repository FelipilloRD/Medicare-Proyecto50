const authService = require('./authService');

/**
 * Middleware to check if user is authenticated
 * Adds user object to req.user if authenticated
 */
function requireAuth(req, res, next) {
  // Check if session exists and has user ID
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Get user from database
  const user = authService.getUserById(req.session.userId);
  
  if (!user) {
    // User not found, clear invalid session
    req.session.destroy();
    return res.status(401).json({ 
      error: 'Invalid session',
      message: 'Please log in again'
    });
  }
  
  // Add user to request object
  req.user = user;
  next();
}

/**
 * Middleware to check if user has admin role
 * Must be used after requireAuth middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'Admin access required'
    });
  }
  
  next();
}

/**
 * Middleware to check if user has patient role
 * Must be used after requireAuth middleware
 */
function requirePatient(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  if (req.user.role !== 'patient') {
    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'Patient access required'
    });
  }
  
  next();
}

/**
 * Middleware to check if user has patient role or is accessing their own data
 * Must be used after requireAuth middleware
 */
function requirePatientOrOwn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Admin users can access everything
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Patient users can only access their own data
  if (req.user.role === 'patient') {
    // Add email filter to request for patient users
    req.patientEmail = req.user.email;
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Insufficient permissions',
    message: 'Access denied'
  });
}

/**
 * Middleware to check if user can access specific appointment
 * Must be used after requireAuth middleware
 * Checks appointment ownership for patients
 */
function requireAppointmentAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Admin users can access all appointments
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For patients, we need to check appointment ownership
  if (req.user.role === 'patient') {
    const appointmentId = req.params.id;
    if (appointmentId) {
      // Get appointment to check ownership
      const database = require('../database-postgres');
      const appointment = database.getAppointmentById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ 
          error: 'Appointment not found',
          message: 'The requested appointment does not exist'
        });
      }
      
      if (appointment.email !== req.user.email) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'You can only access your own appointments'
        });
      }
    }
    
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Insufficient permissions',
    message: 'Access denied'
  });
}

/**
 * Middleware to filter data based on user role
 * Must be used after requireAuth middleware
 * Automatically filters appointments for patients
 */
function applyRoleBasedFiltering(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Admin users see all data - no filtering needed
  if (req.user.role === 'admin') {
    req.dataFilter = { type: 'admin', email: null };
    return next();
  }
  
  // Patient users only see their own data
  if (req.user.role === 'patient') {
    req.dataFilter = { type: 'patient', email: req.user.email };
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Insufficient permissions',
    message: 'Invalid user role'
  });
}

/**
 * Optional authentication middleware
 * Adds user to req.user if authenticated, but doesn't require it
 */
function optionalAuth(req, res, next) {
  if (req.session && req.session.userId) {
    const user = authService.getUserById(req.session.userId);
    if (user) {
      req.user = user;
    }
  }
  next();
}

/**
 * Middleware to check session validity and refresh if needed
 */
function checkSession(req, res, next) {
  if (req.session && req.session.userId) {
    // Update last activity timestamp
    req.session.lastActivity = new Date().toISOString();
    
    // Check if session has expired (24 hours)
    const sessionAge = Date.now() - new Date(req.session.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (sessionAge > maxAge) {
      req.session.destroy();
      return res.status(401).json({ 
        error: 'Session expired',
        message: 'Your session has expired. Please log in again.'
      });
    }
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requirePatient,
  requirePatientOrOwn,
  requireAppointmentAccess,
  applyRoleBasedFiltering,
  optionalAuth,
  checkSession
};