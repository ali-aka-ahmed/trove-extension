import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { AxiosRes } from '../../../app/server';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import { createForgotPasswordArgs } from '../../Popup/helpers/auth';
import '../style.scss';
import './style.scss';

interface ForgotPassword {
  goToLogin: () => void;
}

export default function ForgotPassword({ goToLogin }: ForgotPassword) {
  const [forgotPasswordInput, setForgotPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successScreenMessage, setSuccessScreenMessage] = useState('');

  const handleForgotPasswordInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForgotPasswordInput(e.target.value);
  const handleForgotPasswordSubmit = async () => {
    if (forgotPasswordInput === '') return setErrorMessage('Enter your email!');
    setLoading(true);
    const args = createForgotPasswordArgs(forgotPasswordInput);
    if (args === null) {
      setLoading(false);
      return setErrorMessage('Invalid email. Try again!');
    }
    sendMessageToExtension({ type: MessageType.ForgotPassword, forgotPasswordArgs: args }).then(
      (res: AxiosRes) => {
        if (!res.success) {
          setLoading(false);
          return setErrorMessage(res.message);
        }
        setSuccessScreenMessage('Password reset link sent!');
        setForgotPasswordInput('');
        setLoading(false);
      },
    );
  };

  if (successScreenMessage) {
    return (
      <div className="TbdAuth">
        <div className="TbdAuth__Header">
          <div className="TbdAuth__Header__Title--forgot">Password reset sent!</div>
        </div>
        <div className="TbdAuth__ButtonWrapper--success">
          <button className="Trove__Button--secondary" onClick={goToLogin}>
            Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="TbdAuth">
      <div className="TbdAuth__Header">
        <div className="TbdAuth__Header__Title--forgot">Enter your email</div>
      </div>
      <div className="TbdAuth__FieldWrapper">
        <div className="TbdAuth__InputWrapper">
          <input
            className="TbdAuth__Input"
            type="text"
            autoFocus={true}
            value={forgotPasswordInput}
            onChange={handleForgotPasswordInput}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleForgotPasswordSubmit();
            }}
          />
        </div>
      </div>
      <div className="TbdAuth__ButtonWrapper">
        <button className="Trove__Button--secondary" onClick={goToLogin}>
          Cancel
        </button>
        <button className="Trove__Button" onClick={handleForgotPasswordSubmit}>
          {loading && (
            <div className="TbdAuth__Loading">
              <LoadingOutlined />
            </div>
          )}
          Submit
        </button>
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
