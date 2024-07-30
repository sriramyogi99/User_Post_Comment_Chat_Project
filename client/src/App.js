import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import NewPost from './components/NewPost';
import PostDetail from './components/PostDetail';
import UserPosts from './components/UserPosts';
import StartPage from './components/StartPage';
//
import Dashboard from './chatModules/Dashboard';

const ProtectedRoute = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem('user:token') !== null || false;

  if (!isLoggedIn && auth) {
    return <Navigate to={'/start'} />;
  } else if (isLoggedIn && ['/signin', '/signup'].includes(window.location.pathname)) {
    return <Navigate to={'/'} />;
  }

  return children;
};
//

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user:data');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  //

  return (
    <Router>
      <Routes>
        <Route path="/start" element={ <ProtectedRoute> <StartPage /> </ProtectedRoute> } />
        <Route path="/" element={ <ProtectedRoute auth={true}> <HomePage /> </ProtectedRoute> } />
        <Route path="/signup" element={ <SignUp /> } />
        <Route path="/signin" element={ <SignIn setUser={setUser} /> } />
        <Route path="/profile" element={ <ProtectedRoute auth={true}> <Profile /> </ProtectedRoute> } />
        <Route path="/newpost" element={ <ProtectedRoute auth={true}> <NewPost /> </ProtectedRoute> } />
        <Route path="/post/:postId" element={<ProtectedRoute auth={true}><PostDetail /></ProtectedRoute>} />
        <Route path="/:userId/posts" element={<ProtectedRoute auth={true}><UserPosts /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute auth={true}><Dashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
