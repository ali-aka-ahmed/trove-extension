/* eslint-disable camelcase */
import notionApi, { NotionErrorRes, NotionSuccessRes } from '.';

const getSpaceUsers = async (spaceId: string): Promise<GetSpaceUsersRes> => {
  // getSubscriptionData
  const data = { spaceId, version: 'v2' };
  const res: IGetSubscriptionDataRes = await notionApi.post('/getSubscriptionData', data);
  if (res.success === false) return res;
  const userIds = res.users.map((u) => u.userId);
  const botIds = res.bots.map((b) => b.botId);
  // syncRecordValues
  const userReqObjects = userIds.map((id) => ({
    id,
    table: 'notion_user',
    version: -1,
  }));
  const botReqObjects = botIds.map((id) => ({
    id,
    table: 'bot',
    version: -1,
  }));
  const sData = { requests: userReqObjects.concat(botReqObjects) };
  const sRes: ISyncRecordValues = await notionApi.post('/syncRecordValues', sData);
  if (sRes.success === false) return sRes;
  const notionUsers = Object.values(sRes.recordMap.notion_user || {});
  const notionBots = Object.values(sRes.recordMap.bot || {});
  const users = notionUsers.map(({ value }) => ({
    id: value.id,
    type: 'user' as 'user',
    firstName: value.given_name,
    lastName: value.family_name,
    profilePhoto: value.profile_photo,
  }));
  const bots = notionBots.map(({ value }) => ({
    id: value.id,
    type: 'bot' as 'bot',
    name: value.name,
  }));
  return { success: true, users, bots };
};

export default getSpaceUsers;

/**
 * Final interface
 */
export type GetSpaceUsersRes =
  | {
      success: true;
      users: Array<User>;
      bots: Array<Bot>;
    }
  | NotionErrorRes;

export type User = {
  id: string;
  type: 'user';
  firstName: string;
  lastName: string;
  profilePhoto: string;
};

export type Bot = {
  id: string;
  type: 'bot';
  name: string;
};

/**
 * Helper interfaces
 */
type IGetSubscriptionDataRes =
  | ({
      version: 'v2';
      type: string;
      users: Array<NotionUser>; // using this
      members: Array<NotionUser>; // same as above
      spaceUsers: Array<NotionUser>; // always empty
      bots: Array<BotUser>;
      joinedMemberIds: string[];
      credits: Array<Credit>;
      totalCredit: number;
      availableCredit: number;
      creditEnabled: boolean;
      timelineViewUsage: number;
      inviteLinkCode: string;
      hasPaidNonzero: boolean;
      revenueCatEnabled: boolean;
      customerData: {
        stripe: {
          // may be an optional
          isSubscribed: boolean;
          customerId: string;
          customerName: string;
          isDelinquent: boolean;
          productId: string;
          billingEmail: string;
          plan: string;
          planAmount: number;
          accountBalance: number;
          monthlyPlanAmount: number;
          yearlyPlanAmount: number;
          quantity: number;
          billing: string;
          address: {
            name: string;
            businessName: string;
            addressLine1: string;
            addressLine2: string;
            zipCode: string;
            city: string;
            state: string;
            country: string;
          };
          last4: string; // length 4
          brand: 'Visa' | 'Mastercard' | string;
          interval: 'year' | string; // other one is probably month
          created: number;
          periodEnd: number;
          nextInvoiceTime: number;
          nextInvoiceAmount: number;
          hasPaidNonzero: true;
        };
      };
    } & NotionSuccessRes)
  | NotionErrorRes;

type ISyncRecordValues =
  | ({
      recordMap: {
        notion_user?: {
          [userId: string]: {
            role: 'reader' | 'editor';
            value: NotionFullUser;
          };
        };
        bot?: {
          [botId: string]: {
            role: 'reader' | 'editor';
            value: BotFullUser;
          };
        };
      };
    } & NotionSuccessRes)
  | NotionErrorRes;

type NotionUser = {
  userId: string;
  role: 'editor' | 'none' | 'read_and_write'; // editor = admin, read_and_write = member, none = guest.
  guestPageIds?: string[]; // if role is none;
};

type BotUser = {
  botId: string;
  role: 'editor' | 'none' | 'read_and_write';
  pageIds: string[];
};

type Credit = {
  id: string;
  version: number;
  user_id: string;
  amount: number;
  activated: boolean;
  created_timestamp: string;
  type:
    | 'mobile_login'
    | 'mobile_share_sheet'
    | 'desktop_login'
    | 'web_login'
    | 'import_evernote'
    | 'browser_extension';
};

type NotionFullUser = {
  id: string;
  version: number;
  email: string;
  given_name: string;
  family_name: string;
  profile_photo: string;
  onboarding_completed?: boolean;
  mobile_onboarding_completed?: boolean;
  clipper_onboarding_completed?: boolean;
};

type BotFullUser = {
  id: string;
  version: number;
  name: string;
  parent_table: 'space' | string; // guessing others are 'collection_view' or 'page'
  parent_id: string;
  alive: boolean;
  created_at: string;
  created_by_id: string;
  created_by_table: 'notion_user' | string; // unsure of others
  type: 'guest' | string; // unsure of others
};
