import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // 1. Add password state
  const [error, setError] = useState('');     // 2. Add error state
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        // Login successful
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('username', username.trim());
        }
        router.push('/chat');
      } else {
        // Login failed
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Private Messaging App</h1>
        <p className={styles.subtitle}>Enter your credentials to start chatting</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
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
          {/* 3. Add password input field */}
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>

        {/* 4. Show error messages */}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
          Don't have an account?{' '}
          <Link href="/register" legacyBehavior>
            <a style={{ color: '#0070f3' }}>Register here</a>
          </Link>
        </p>
      </div>
    </div>
  );
}