import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Bot, GetSpaceUsersRes, User } from '../../../../../app/notionServer/getSpaceUsers';
import { CreatedByProperty, LastEditedByProperty } from '../../../../../app/notionTypes/schema';
import { get, set } from '../../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../../utils/chrome/tabs';

interface ReadOnlyPersonPropertyProps {
  property: CreatedByProperty | LastEditedByProperty;
}

export default function ReadOnlyPersonProperty({ property }: ReadOnlyPersonPropertyProps) {
  const [loading, setLoading] = useState(true);
  const [errorGettingUser, setErrorGettingUser] = useState(false);
  const [person, setPerson] = useState<User | Bot | null>(null);

  const loadUserDetails = async (userId: string) => {
    get(['spaceUsers', 'spaceBots', 'spaceId']).then((data) => {
      const spaceMembers = (data.spaceUsers || []).concat(data.spaceBots || []);
      const person: User | Bot = spaceMembers.find((m: User | Bot) => m.id === userId);
      const spaceId = data.spaceId;
      if (!spaceId) {
        setErrorGettingUser(true);
        setLoading(false);
      }
      if (!person && spaceId) {
        sendMessageToExtension({ type: MessageType.GetNotionSpaceUsers, spaceId }).then(
          (res: GetSpaceUsersRes) => {
            if (res.success) {
              set({
                spaceUsers: res.users,
                spaceBots: res.bots,
              });
              const newPerson = (res.users as Array<User | Bot>)
                .concat(res.bots)
                .find((m: User | Bot) => m.id === userId);
              if (newPerson === undefined) {
                setErrorGettingUser(true);
                setLoading(false);
              } else setPerson(newPerson);
            } else {
              setErrorGettingUser(true);
              setLoading(false);
            }
          },
        );
      } else setPerson(person);
    });
  };

  useEffect(() => {
    sendMessageToExtension({ type: MessageType.GetNotionUserId }).then((userId: string) => {
      loadUserDetails(property.value || userId);
      setLoading(false);
    });
  }, []);

  const renderImage = (person: User | Bot) => {
    if (person.type === 'bot') return '🤖';
    else return '👋';
    // <img src={ renderImage() } className="TroveDropdown__Icon" />
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="TroveProperty--loading" style={{ color: 'rgb(55, 53, 47)' }}>
          <LoadingOutlined />
        </div>
      );
    } else if (person) {
      return (
        <div
          className="TroveProperty__PropertyValue TroveProperty__Person"
          style={{ color: 'rgb(55, 53, 47)' }}
        >
          <span className="TroveProperty__PersonIconWrapper">{renderImage(person)}</span>
          {person.type === 'user' ? (
            <span className="TroveProperty__ReadOnlyPersonName">{`${person.firstName} ${person.lastName}`}</span>
          ) : (
            <span className="TroveProperty__ReadOnlyPersonName">{person.name}</span>
          )}
        </div>
      );
    } else null;
  };

  if (errorGettingUser) return null;
  return (
    <div className="TroveProperty__Property" key={property.propertyId}>
      <div className="TroveProperty__PropertyNameWrapper">
        <div className="TroveProperty__PropertyImgWrapper">
          <img
            src={chrome.extension.getURL(`images/notion/properties/${property.type}.png`)}
            className="TroveProperty__PropertyImg"
          />
        </div>
        <div className="TroveProperty__PropertyName">{property.name}</div>
      </div>
      <div className="TroveProperty__ReadOnlyWrapper--ReadOnly">
        <div className="TroveProperty__ReadOnlyTypeWrapper">{renderBody()}</div>
      </div>
    </div>
  );
}
