import RNFetchBlob from "rn-fetch-blob";
import { api, baseUrl } from "./httpmanager";

// MARK:- Auth
export const emailExists = async (email) => {
    return api.get(`/brand/check_email_exist?email=${email}`);
};
export const phoneExists = async (phone) => {
    return api.get(`/brand/check_phone_exist?phone_number=${phone}`);
};
export const registerBrand = async (body) => {
    let res = await RNFetchBlob.fetch("POST", baseUrl + "brand/register", { "Content-Type": "multipart/form-data" }, body);
    return res;
};
export const signinBrand = async (body) => {
    return api.post("/brand/login", body);
};
export const forgotPassBrand = async (body) => {
    return api.post("/brand/forgot_password", body);
};
export const verifyOtpBrand = async (body) => {
    return api.post("/brand/verify_otp", body);
};
export const resetPassBrand = async (body) => {
    return api.post("/brand/reset_password", body);
};
export const updateProfileBrand = async (body, token) => {
    let res = await RNFetchBlob.fetch("POST", baseUrl + "brand/update_profile", { "Content-Type": "multipart/form-data", Authorization: "Bearer " + token }, body);
    return res;
};
export const changePassBrand = async (body) => {
    return api.post("/brand/change_password", body);
};
export const getBrandDetail = async (email, password) => {
    return api.post("brand/get_profile",);
};

//MARK:- Non Auth
export const addStylistB = async (body) => {
    return api.post("/brand/add_company_brand", body);
};
export const getBrandStylist = async (query = "") => {
    return api.get(`/brand/get_company_brand${query}`);
};
export const deleteBrandStylist = async (id) => {
    return api.delete(`/brand/delete_company_brand?_id=${id}`);
};
export const termsBrands = async () => {
    return api.get("brand/get_app_data");
};
export const deleteAccountBrand = async (data) => {
    return api.post("brand/delete_acount", data);
};
export const contactusBrand = async (data) => {
    return api.post("brand/send_message", data);
};

//MARK:- Brand Collection
export const getCollection = async (data) => {
    return api.get(`/brand/get_my_collection?page=${data?.page}&limit=${data?.limit}`);
};
export const getOtherBrandCollection = async (data) => {
    return api.get(`/brand/get_other_brand_collection?page=${data?.page}&limit=${data?.limit}&brand_id=${data?.id}`);
};
export const deleteCollection = async (data) => {
    return api.delete("/brand/delete_collection?collection_id=" + data);
};
export const getBrandFeed = async (query = "") => {
    return api.get(`/brand/get_home_feed${query}`)
};
export const createCollectionApi = async (data) => {
    return api.post("/brand/create_collection", data);
};
export const getCollectionDetail = async (data) => {
    if (typeof data == "string") {
        return api.get("/brand/get_collection_detail?collection_id=" + data);
    }
    if (data?.collection_id) {
        return api.get(`/brand/get_collection_detail?collection_id=${data?.collection_id}&page=${data?.page}&limit=${data?.limit}`);
    }
};
export const deleteCollectionMedia = async (data) => {
    return api.post("/brand/delete_collection_image", data);
};
export const setCoverImage = async (data) => {
    return api.post("/brand/set_as_cover_image", data);
};
export const addCaption = async (data) => {
    return api.post("/brand/add_media_caption", data);
};
export const updateCollectionBrands = async (data) => {
    return api.post("/brand/update_collection", data);
};
export const confirmOrders = async (data) => {
    return api.post("/brand/confirm_order", data);
};
export const searchFollowers = async (data) => {
    return api.post("/brand/search_followers", data);
};
export const likeParentPost = async (data) => {
    return api.post("/brand/like_unlike_collection_brand", data);
};

//MARK:- Notes
export const getNotesList = async () => {
    return api.get("/brand/get_notes",);
};
export const createNote = async (data) => {
    return api.post("/brand/create_note", data);
};
export const updateNote = async (data) => {
    return api.post("/brand/update_note", data);
};
export const deleteNotes = async (id, permanent) => {
    return api.delete("/brand/delete_note?note_id=" + id + "&is_permanent=" + permanent);
};
export const getRecentlyDeletedNotes = async () => {
    return api.get(`/brand/get_recent_deleted_notes`)
};
export const restore_note = async (data) => {
    return api.post(`/brand/restore_note`, data)
};

//MARK:- Gallery
export const get_my_gallery = async (data) => {
    return api.get(`/brand/get_my_gallery?page=${data?.page}&limit=${data?.limit}`,);
};
export const deleteGalleryData = async (query) => {
    return api.delete(`/brand/delete_gallery_media${query}`);
}
export const addToGallery = async (data) => {
    return api.post("/brand/add_gallery_media", data);
}

//MARK:- Notifications
export const getAllNotifications = async () => {
    return api.get("/brand/get_all_notification");
};
export const deleteNotifications = async (id) => {
    return api.delete("/brand/delete_notification?notification_id=" + id);
};
export const reqestResoponse = async (data) => {
    return api.post("/brand/accept_reject_follow_request", data);
};
export const updateNotificationStatus = async (data) => {
    return api.post("/brand/update_notification_status", data);
};

//MARK:- Followers
export const followersList = async () => {
    return api.get("/brand/get_follower_following_list");
};
export const getEmployeeProfile = async (data) => {
    return api.post(`/brand/get_brand_profile`, data);
};
export const getStylistDetail = async (id) => {
    return api.get(`/brand/get_particular_stylist_detail?stylist_id=${id}`);
};
export const getClientDetail = async (id) => {
    return api.get(`/brand/client_detail?client_id=${id}`);
};
export const getClientOrders = async (id, page, limit) => {
    return api.get(`brand/get_client_confirm_order?client_id=${id}&page=${page}&limit=${limit}`);
};
export const getClientLikedPost = async (id, page, limit) => {
    return api.get(`brand/get_client_liked_media?client_id=${id}&page=${page}&limit=${limit}`);
};
export const getStylistLikedPost = async (id, page, limit) => {
    return api.get(`brand/get_stylist_liked_media?stylist_id=${id}&page=${page}&limit=${limit}`);
};
export const getProfileDetail = async () => {
    return api.get(`brand/get_my_client_list`);
};
export const getBrandLikedMediaList = async (data) => {
    return api.get(`brand/get_liked_media_list?page=${data?.page}&limit=${data?.limit}`)
}
export const getBrandLikeList = async (data) => {
    return api.get(`brand/get_like_list?media_id=${data?.media_id || data}`)
}