import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import logo from '../../assets/images/RSlogo2.png';
import authService from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || 'patient';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    // doctor-only fields
    specialization: '',
    hospital: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    // doctor-only validation
    if (selectedRole === 'doctor') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.hospital.trim()) {
        newErrors.hospital = 'Hospital is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const registrationData = {
        full_name:        formData.fullName.trim(),
        email:            formData.email.trim(),
        password:         formData.password,
        confirm_password: formData.confirmPassword,
        phone_number:     formData.phoneNumber.trim(),
      };

      // add doctor fields only when role is doctor
      if (selectedRole === 'doctor') {
        registrationData.specialization = formData.specialization.trim();
        registrationData.hospital       = formData.hospital.trim();
      }

      let response;
      if (selectedRole === 'doctor') {
        response = await authService.registerDoctor(registrationData);
      } else {
        response = await authService.registerPatient(registrationData);
      }

      if (response.success) {
        localStorage.setItem('pendingUser', JSON.stringify({
          email: formData.email,
          role:  selectedRole,
        }));

        navigate('/verify-email', {
          state: {
            email: formData.email,
            role:  selectedRole,
          },
        });
      } else {
        // backend may return errors array or message string
        const msg = Array.isArray(response.errors)
          ? response.errors[0]
          : (response.message || 'Registration failed');
        setErrors({ general: msg });
      }

    } catch (error) {
      setErrors({ general: error.message || 'Server error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#FCE7F3' }}>
      <div style={{ width: 480, background: '#fff', padding: 30, borderRadius: 12 }}>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src={logo} width="60" alt="logo" />
          <h2>Rossy Resilience</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          {['patient', 'doctor'].map((role) => (
            <div
              key={role}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                background: selectedRole === role ? '#DB2777' : '#eee',
                color:      selectedRole === role ? '#fff'     : '#333',
              }}
            >
              {role}
            </div>
          ))}
        </div>

        {errors.general && (
          <div style={{ color: 'red', marginBottom: 10 }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input name="fullName"        label="Full Name"        value={formData.fullName}        onChange={handleChange} error={errors.fullName} autoComplete="name" />
          <Input name="email"           label="Email"            value={formData.email}           onChange={handleChange} error={errors.email} autoComplete="email" />
          <Input name="password"        label="Password"         value={formData.password}        onChange={handleChange} error={errors.password}        type="password" autoComplete="new-password" />
          <Input name="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} type="password" autoComplete="new-password" />
          <Input name="phoneNumber"     label="Phone"            value={formData.phoneNumber}     onChange={handleChange} error={errors.phoneNumber} autoComplete="tel" />

          {/* show these only for doctors */}
          {selectedRole === 'doctor' && (
            <>
              <Input name="specialization" label="Specialization" value={formData.specialization} onChange={handleChange} error={errors.specialization} />
              <Input name="hospital"       label="Hospital"       value={formData.hospital}       onChange={handleChange} error={errors.hospital} />
            </>
          )}

          <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: 15 }}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 15 }}>
          Already have account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;