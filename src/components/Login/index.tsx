import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { IAuthRes } from '../../app/server/auth';
import { ORIGIN } from '../../config';
import User from '../../entities/User';
import { analytics } from '../../utils/analytics';
import { set } from '../../utils/chrome/storage';
import {
  ExternalMessageType,
  MessageType,
  sendMessageToExtension,
  SocketMessageType,
} from '../../utils/chrome/tabs';
import { createLoginArgs } from '../Popup/helpers/auth';
import ForgotPassword from './ForgotPassword';
import './style.scss';

interface LoginProps {
  type: 'tooltip' | 'popup';
  onCancel?: () => void;
  onLogin?: () => void;
}

export default function Login({ type, onCancel, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEmail(e.target.value);
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if (email === '') return setErrorMessage('Enter your email');
    if (password === '') return setErrorMessage('Enter your password');
    setLoading(true);
    const args = createLoginArgs(email, password);
    sendMessageToExtension({ type: MessageType.Login, loginArgs: args }).then((res: IAuthRes) => {
      if (!res.success) {
        setLoading(false);
        return setErrorMessage(res.message);
      }
      sendMessageToExtension({ type: SocketMessageType.JoinRoom, userId: res.user?.id });
      sendMessageToExtension({ type: ExternalMessageType.Login, user: res.user, token: res.token });
      setEmail('');
      setPassword('');
      setLoading(false);
      set({
        user: new User(res.user!),
        token: res.token,
        isExtensionOn: true,
        notificationDisplayIcon: 0,
      })
        .then(() => set({ isAuthenticated: true }))
        .then(() => {
          if (onLogin) onLogin();
        });

      analytics('Logged In', res.user, {});
    });
  };

  const goToSignup = () => chrome.tabs.update({ url: `${ORIGIN}/signup` });

  if (showForgotPassword) {
    return <ForgotPassword goToLogin={() => setShowForgotPassword(false)} />;
  } else
    return (
      <div className={type === 'tooltip' ? 'TroveAuth--tooltip' : 'TbdAuth'}>
        <div className="TroveTooltip__LogoWrapper">
          <div className="TroveTooltip__LogoText">Trove</div>
          <div className="TroveTooltip__LogoUnderscore" />
        </div>
        <div className="TbdAuth__FieldWrapper">
          <div className="TbdAuth__Label">Email</div>
          <div className="TbdAuth__InputWrapper">
            <input
              className="TbdAuth__Input"
              type="text"
              autoFocus={true}
              value={email}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onChange={handleEmailInput}
            />
          </div>
        </div>
        <div className="TbdAuth__FieldWrapper">
          <div className="TbdAuth__Label">Password</div>
          <div className="TbdAuth__InputWrapper">
            <input
              onChange={handlePasswordInput}
              type="password"
              value={password}
              className="TbdAuth__Input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </div>
          <div className="TbdLogin__ForgotPassword" onClick={() => setShowForgotPassword(true)}>
            Forgot password?
          </div>
        </div>
        <div className="TbdAuth__ButtonWrapper--login">
          {type === 'tooltip' && (
            <button className="Trove__Button--secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="Trove__Button" onClick={handleLogin}>
            {loading && (
              <div className="TbdAuth__Loading">
                <LoadingOutlined />
              </div>
            )}
            Login
          </button>
          <div className="TbdLogin__SignupHere" onClick={goToSignup}>
            or signup here
          </div>
        </div>
        <div
          className={`TbdAuth__Error ${
            errorMessage ? 'TbdAuth__Error--show' : 'TbdAuth__Error--hide'
          }`}
        >
          <Alert showIcon message={errorMessage} type="error" className="TbdAuth__Alert" />
        </div>
      </div>
    );
}
