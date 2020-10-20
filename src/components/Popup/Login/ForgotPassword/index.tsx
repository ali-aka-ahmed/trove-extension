import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { forgotPassword } from '../../../../server/auth';
import { createForgotPasswordArgs } from '../../helpers/auth';
import '../../style.scss';
import '../style.scss';
import './style.scss';

interface ForgotPassword {
  goToLogin: () => void;
}

export default function ForgotPassword({ goToLogin }: ForgotPassword) {
  const [forgotPasswordInput, setForgotPasswordInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successScreenMessage, setSuccessScreenMessage] = useState('')

  const handleForgotPasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => setForgotPasswordInput(e.target.value);
  const handleForgotPasswordSubmit = async () => {
    if (forgotPasswordInput === '') return setErrorMessage('Enter your phone number or email!');
    setLoading(true);
    const args = createForgotPasswordArgs(forgotPasswordInput)
    if (args === null) {
      setLoading(false);
      return setErrorMessage('Invalid email or phone number. Try again!');
    }
    const res = await forgotPassword(args);
    if (!res.success) {
      setLoading(false);
      return setErrorMessage(res.message);
    }
    setSuccessScreenMessage('Password reset link sent!');
    setForgotPasswordInput('');
    setLoading(false);
  }

  if (successScreenMessage) {
    return (
      <div className='TbdAuth'>
        <div className='TbdAuth__Header'>
          <div className='TbdAuth__Header__Title--forgot'>
            Password reset sent!
          </div>
        </div>
        <div className='TbdAuth__ButtonWrapper--success'>
          <button
            className='TbdAuth__Button'
            onClick={goToLogin}
          >
            back
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className='TbdAuth'>
      <div className='TbdAuth__Header'>
        <div className='TbdAuth__Header__Title--forgot'>
          Enter your phone number or email
        </div>
      </div>
      <div className='TbdAuth__FieldWrapper'>
        <div className='TbdAuth__InputWrapper'>
          <input
            className='TbdAuth__Input'
            type='text'
            autoFocus={true}
            value={forgotPasswordInput}
            onChange={handleForgotPasswordInput}
          />
        </div>
      </div>
      <div className='TbdAuth__ButtonWrapper'>
        {!loading ? (
          <button
            className='TbdAuth__Button'
            onClick={handleForgotPasswordSubmit}
          >
            submit
          </button>
        ) : (
          <div className='TbdAuth__Loading'><LoadingOutlined /></div>
        )}
        <button
          className='TbdAuth__Button--cancel'
          onClick={goToLogin}
        >
          cancel
        </button>
      </div>
      <div className={`TbdAuth__Error ${errorMessage 
          ? 'TbdAuth__Error--show' 
          : 'TbdAuth__Error--hide'}`}
      >
        <Alert showIcon message={errorMessage} type='error' className='TbdAuth__Alert' />
      </div>
    </div>
  )
}