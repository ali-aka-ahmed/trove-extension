import axios from 'axios';

const api_inst = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    timeout: 2000,
    headers: {'Content-Type': 'application/json'}
});

// export const rSignup = async () => {};

export const login = () => {
    // const responseData = await api_inst.post('/login', {username, password});
    // return responseData.data;
    // return users.find(user => user.username === 'ali')
};

export const logout = async () => {
    const responseData = await api_inst.get('/logout');
    return responseData.data;
};

export const checkValidUsername = async (username: string) => {
    const responseData = await api_inst.post('/check-valid-username', {username});
    return responseData.data;
};

export const forgotPassword = async (email: string) => {
    const responseData = await api_inst.post('/forgot-password', {email});
    return responseData.data;
};

export const resetPassword = async (password: string, token: string) => {
    const responseData = await api_inst.post(`/reset/${token}`, {password});
    return responseData.data;
};
