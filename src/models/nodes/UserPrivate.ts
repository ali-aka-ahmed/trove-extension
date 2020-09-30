export interface UserPrivate {
  id: string;
  userId: string;
  creationDatetime: number;
  nominatorId: string;
  password: string;
  email?: string; // this or phoneNumber required
  passwordResetExpires?: number;
  passwordResetToken?: string;
  phoneNumber?: string; // E.164 format
}
