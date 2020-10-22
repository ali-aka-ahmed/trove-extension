import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { socket } from '../../../app/background';
import User from '../../../entities/User';
import { login } from '../../../server/auth';
import { MessageType, sendMessageToWebsite } from '../../../utils/chrome/external';
import { set } from '../../../utils/chrome/storage';
import { createLoginArgs } from '../helpers/auth';
import '../style.scss';
import ForgotPassword from './ForgotPassword';
import './style.scss';

interface LoginProps {}

export default function Login({}: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleLogin = async () => {
    if (username === '') return setErrorMessage('Enter your phone number, email or username');
    if (password === '') return setErrorMessage('Enter your password');
    setLoading(true);
    const args = createLoginArgs(username, password);
    const res = await login(args);
    if (!res.success) {
      setLoading(false);
      return setErrorMessage(res.message);
    }
    socket.emit('join room', res.user?.id);
    await set({
      user: new User(res.user!),
      token: res.token,
      isExtensionOn: true,
    });
    await set({ isAuthenticated: true });
    await sendMessageToWebsite({ type: MessageType.Login, user: res.user, token: res.token })
    setUsername('');
    setPassword('');
    setLoading(false);
  }

  if (showForgotPassword) {
    return <ForgotPassword goToLogin={() => setShowForgotPassword(false)} />
  } else return (
    <div className='TbdAuth'>
      <div className='TbdAuth__FieldWrapper'>
        <div className='TbdAuth__Label'>
          Email or username
        </div>
        <div className='TbdAuth__InputWrapper'>
          <input
            className='TbdAuth__Input'
            type='text'
            autoFocus={true}
            value={username}
            onChange={handleUsernameInput}
          />
        </div>
      </div>
      <div className='TbdAuth__FieldWrapper'>
        <div className='TbdAuth__Label'>
          Password
        </div>
        <div className='TbdAuth__InputWrapper'>
          <input
            onChange={handlePasswordInput}
            type='password'
            value={password}
            className='TbdAuth__Input'
          />
        </div>
        <div className='TbdLogin__ForgotPassword' onClick={() => setShowForgotPassword(true)}>
          Forgot password?
        </div>
      </div>
      <div className='TbdAuth__ButtonWrapper'>
        {!loading ? (
          <button
            className='TbdAuth__Button'
            onClick={handleLogin}
          >
            Login
          </button>
        ) : (
          <div className='TbdAuth__Loading'><LoadingOutlined /></div>
        )}
      </div>
      <div className={`TbdAuth__Error ${errorMessage 
          ? 'TbdAuth__Error--show' 
          : 'TbdAuth__Error--hide'}`}
      >
        <Alert showIcon message={errorMessage} type='error' className='TbdAuth__Alert' />
      </div>
    </div>
  );
};
