import IUser from '../models/User';

class UserStore {
  
  userId: string;
  displayName: string;
  username: string;
  color: string;
  
  constructor() {
    this.userId = '';
    this.displayName = '';
    this.username = '';
    this.color = '';
  }

  setup = (user: IUser) => {
    this.userId = user.id;
    this.displayName = user.displayName;
    this.username = user.username;
    this.color = user.color;
  }

  clear = () => {
    this.userId = '';
    this.displayName = '';
    this.username = '';
    this.color = '';
  }

	/**********************
	 ***** MAIN ROUTES ****
	 **********************/

}

const userStore = new UserStore()
export default userStore;
