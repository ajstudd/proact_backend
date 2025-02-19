/**
 * @description returns token if exists else returns empty string
 */
export const getToken = () => {
    let token = '';
    const headerData = localStorage.getItem('token');
    if (headerData) {
        token = headerData;
    }

    return token;
};
