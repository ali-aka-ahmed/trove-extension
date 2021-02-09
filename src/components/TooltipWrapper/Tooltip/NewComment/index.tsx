import { CloseOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { IPostRes } from '../../../../app/server/posts';
import User from '../../../../entities/User';
import TextareaEditor from '../Editor';
import { getOsKeyChar } from '../helpers/os';
import UserInfo from '../userInfo';

interface NewCommentProps {
  creator: User;
  user: User;
  onCancel: ( () => void );
  onSubmit: ( (text: string) => Promise<IPostRes> );
}

const NewComment = ({
  creator,
  user,
  onCancel,
  onSubmit,
}: NewCommentProps) => {
  // Post to display in this component
  const [content, setContent] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSaveError, setShowSaveError] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null!)

  const handleSavePost = async () => {
    setSubmitLoading(true);
    await onSubmit(content);
  }

  const handleCancel = () => {
    setContent('');
    setErrorMessage('');
    setShowSaveError(false);
    onCancel();
  }

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    ReactTooltip.hide();
    setSubmitLoading(true);
    await onSubmit(content);
  };

  const renderPaddingWithLine = () => {
    return (
      <div className="TroveNewComment__TopPaddingImage">
        <div className="TroveNewComment__TopPaddingImage__Left">
          <div className="TroveNewComment__TopPaddingImage__Line">
            Replying to 
            <span
              className="TroveNewComment__ReplyingTo"
              style={{ color: creator.color }}
            >
              {`@${creator.username}`}
            </span>
            ...
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className='TroveNewCommentWrapper'>
      {renderPaddingWithLine()}
      <div className="TroveNewComment">
          <div className="TroveNewComment__Header">
            <UserInfo user={user} />
            <div className="TroveNewComment__Cancel" onClick={handleCancel}>
              <CloseOutlined />
            </div>
          </div>
          <div className="TroveNewComment__Editor">
            <TextareaEditor
              value={content}
              onChange={(e) => setContent(e.target.value)}
              setText={(text) => setContent(text)}
              submit={handleSavePost}
              placeholder="Add your reply"
              autoFocus={true}
              outsideRef={editorRef}
            />
          </div>
          <button
            className="TroveTooltip__SubmitButton"
            onClick={onClickSubmit}
            data-tip={`
              <div class="TroveHint__Content">
                <p class="TroveHint__Content__PrimaryText">Submit</p>
                <p class="TroveHint__Content__SecondaryText">(${getOsKeyChar()}+Enter)</p>
              </div>
            `}
          />
          <ReactTooltip
            className="TroveTooltip__Hint"
            effect="solid"
            arrowColor="transparent"
            html={true}
            delayShow={250}
          />
        </div>
    </div>
  )
};

export default NewComment;
