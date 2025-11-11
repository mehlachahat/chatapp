import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username.trim()) {
      // Store username in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('username', username.trim());
      }
      
      // Redirect to chat page
      router.push('/chat');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Private Messaging App</h1>
        <p className={styles.subtitle}>Enter your username to start chatting</p>
        
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
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
