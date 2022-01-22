import axios from 'axios';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import React, { useState, useEffect } from 'react';

import api from 'services/app';
import UserAPI from 'services/user';

const auth = getAuth();

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(
    false || localStorage.getItem('firebaseToken'),
  );

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.clear();
      }
    });
  }, []);

  const handleEmail = (e) => setEmail(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);

  const handleSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setIsAuthenticated(true);
        const firebaseToken = userCredential.user.accessToken;
        localStorage.setItem('firebaseToken', firebaseToken);
        return firebaseToken;
      })
      .then((firebaseToken) => UserAPI.signUpUser(firebaseToken))
      .then(({ data }) => {
        console.log('returnData:', data);
        const { accessToken, refreshToken } = data.token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        setIsAuthenticated(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePrivateRoute = async () => {
    try {
      const res = await api.get('http://localhost:5000/api/private');
      console.log(res.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Logged In</h1>
          <button type="button" onClick={handleSignOut}>
            Sign Out
          </button>
          <br />
          <button type="button" onClick={handlePrivateRoute}>
            Get private route
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSignUp}
          className="flex flex-col justify-center items-center"
        >
          <input
            className="border border-red-600"
            type="email"
            value={email}
            onChange={handleEmail}
          />
          <input
            className="border border-blue-600"
            type="password"
            value={password}
            onChange={handlePassword}
          />
          <button className="border border-black-600" type="submit">
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}

export default SignUpPage;
