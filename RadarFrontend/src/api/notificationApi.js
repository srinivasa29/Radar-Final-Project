import api from './api';

export const fetchNotifications = async () => {
    try {
<<<<<<< HEAD
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
=======
        const response = await api.get('/notifications/user');
        return response.data.data; // data.data is our array from controller
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    }
};

export const markNotificationsRead = async () => {
    try {
<<<<<<< HEAD
        const response = await api.post('/notifications/read');
        return response.data;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
=======
        const response = await api.patch('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

export const markSingleNotificationRead = async (id) => {
    try {
        const response = await api.patch(`/notifications/read/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error marking single notification as read:', error);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
        throw error;
    }
};