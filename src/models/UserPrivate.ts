export default interface UserPrivate {
  id: string;
  userId: string; 
  creationDatetime: number;
  nominatorId: string;
  email?: string;
  phoneNumber?: string;
};