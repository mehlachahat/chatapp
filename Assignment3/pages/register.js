import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Login.module.css'; // We can reuse the login styles

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      const res = await fetch(`/api/register?username=${username}&password=${password}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.status === 201) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/'); // Redirect to login page
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Register New User</h1>
        
        <form onSubmit={handleRegister} className={styles.form}>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
            minLength={3}
            maxLength={20}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            minLength={6}
          />
          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link href="/" legacyBehavior>
            <a className={styles.link}>Login here</a>
          </Link>
        </p>
      </div>
    </div>
  );
}

// Add some basic error/success styles to Login.module.css if you like:
/*
.errorMessage {
  color: red;
  font-size: 0.9rem;
  margin-top: 10px;
}
.successMessage {
  color: green;
  font-size: 0.9rem;
  margin-top: 10px;
}
.link {
  color: #0070f3;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
*/