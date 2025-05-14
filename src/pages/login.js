import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { signIn, getCurrentUser, logout } from '../utils/cognito';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      user.getSession((err, session) => {
        if (!err && session.isValid()) {
          setUserSession(session);
        }
      });
    }
  }, []);

  const handleLogin = async () => {
    try {
      const session = await signIn(username, password);
      setUserSession(session);
      alert('Login successful');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    logout();
    setUserSession(null);
    alert('Logged out');
  };

  return (
    <Layout title="Login">
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{userSession ? 'Welcome!' : 'Login to your account'}</h2>

          {!userSession && (
            <>
              <input
                className={styles.input}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="button button--primary" onClick={handleLogin}>
                Login
              </button>
            </>
          )}

          {userSession && (
            <button className="button button--secondary" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}