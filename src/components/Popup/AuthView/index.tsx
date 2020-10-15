import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { socket } from '../../../app/background';
import User from '../../../entities/User';
import { login } from '../../../server/auth';
import { set } from '../../../utils/chrome/storage';
import { createLoginArgs } from '../helpers/auth';
import '../style.scss';
import './style.scss';

interface AuthViewProps {}

export default function AuthView({}: AuthViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleLogin = async () => {
    if (username === '') return setError('Enter your phone number, email or username');
    if (password === '') return setError('Enter your password');
    setLoading(true);
    const args = createLoginArgs(username, password);
    const res = await login(args);
    if (!res.success) {
      setLoading(false)
      return setError(res.message);
    }
    socket.emit('join room', res.user?.id);
    await set({
      user: new User(res.user!),
      token: res.token,
      isExtensionOn: true,
    });
    await set({ isAuthenticated: true })
    setUsername('');
    setPassword('');
    setLoading(false);
  }

  return (
    <div className='TbdAuthView'>
      <div className='TbdAuthView__Header'>
        <div className='TbdAuthView__Header__Title'>
          Login
        </div>
      </div>
      <div className='TbdAuthView__FieldWrapper'>
        <div className='TbdAuthView__Label'>
          Phone, email or username
        </div>
        <div className='TbdAuthView__InputWrapper'>
          <input
            className='TbdAuthView__Input'
            type='text'
            autoFocus={true}
            value={username}
            onChange={handleUsernameInput}
          />
        </div>
      </div>
      <div className='TbdAuthView__FieldWrapper'>
        <div className='TbdAuthView__Label'>
          Password
        </div>
        <div className='TbdAuthView__InputWrapper'>
          <input
            onChange={handlePasswordInput}
            type='password'
            value={password}
            className='TbdAuthView__Input'
          />
        </div>
      </div>
      <div className='TbdAuthView__ButtonWrapper'>
        {!loading ? (
          <button
            className='TbdAuthView__Button'
            onClick={handleLogin}
          >
            login
          </button>
        ) : (
          <div className='TbdAuthView__Loading'><LoadingOutlined /></div>
        )}
      </div>
      <div className={`TbdAuthView__Error ${error 
          ? 'TbdAuthView__Error--show' 
          : 'TbdAuthView__Error--hide'}`}
      >
        <Alert showIcon message={error} type='error' className='TbdAuthView__Alert' />
      </div>
    </div>
  );
};
