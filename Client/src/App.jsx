import React from 'react';
import RootLayout from './RootLayout';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Bookmarks from './pages/Bookmarks';
import ErrorPage from './pages/ErrorPage';
import SinglePost from './pages/SinglePost';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Home from './pages/Home';
import MessagesList from './components/MessagesList';
import Messages from './pages/Messages';
import store from './store/store';
import Search from './pages/Search';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Stats from './components/Stats'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'messages', element: <MessagesList /> },
      { path: 'messages/:receiverId', element: <Messages /> },
      { path: 'bookmarks', element: <Bookmarks /> },
      { path: 'users/:id', element: <Profile /> },
      { path: 'posts/:id', element: <SinglePost /> },
      { path: 'groups', element: <Groups /> },
      { path: 'groups/:id', element: <GroupDetails /> },
      { path: 'search', element: <Search /> },
      { path: 'stats', element: <Stats /> } 
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/logout', element: <Logout /> }
]);

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;
