import RNFetchBlob from "rn-fetch-blob";
import { api } from "./httpmanager";

//check phone exit
const checkPhoneClient = async (phone_number) => {
  return api.get(`client/check_phone_exist?phone_number=${phone_number}`);
};

//check email exit
const checkEmailClient = async (email) => {
  return api.get(`client/check_email_exist?email=${email}`);
};

//check phone exit stylist
const checkPhoneStylist = async (phone_number) => {

  return api.get(`stylist/check_phone_exist?phone_number=${phone_number}`);
};

//check email exit stylist
const checkEmailStylist = async (email) => {
  console.log(email);
  return api.get(`stylist/check_email_exist?email=${email}`);
};
//user/login
const loginClient = async (email, password, token) => {
  return api.post("client/login", {
    email: email && email.trim(),
    password: password.trim(),
    fcm_token: token,
    headers: {
      'content-type': 'multipart/form-data',
    },
  });

};

const loginStylist = async (email, password, token) => {
  return api.post("stylist/login", {
    email: email && email.trim(),
    password: password.trim(),
    fcm_token: token,
    headers: {
      'content-type': 'multipart/form-data',
    },
  });

};

//check phone exit stylist
const getuserclientdetail = async (email, password) => {

  return api.post("client/get_profile",);
};
const getuserstylistdetail = async (email, password) => {

  return api.post("stylist/get_profile",);
};

// forgotPassword
const forgotPasswordClient = async (email, country_code) => {
  return api.post("client/forgot_password", {
    phone_number: email,
    country_code: country_code
  });
};

const forgotPasswordStylist = async (email, country_code) => {
  return api.post("stylist/forgot_password", {
    phone_number: email,
    country_code: country_code
  });
};
//verify client
const VerifyClient = async (body) => {
  return api.post("client/verify_otp", body);
};

// newpass
const new_passwordclient = async (_id, password) => {
  const res = await api.post("client/reset_password", {
    _id,
    password,
  });
  return res;
};

// newpass stylist
const new_passwordstylist = async (_id, password) => {
  const res = await api.post("stylist/reset_password", {
    _id,
    password,
  });
  return res;
};
//verify stylist
const VerifyStylist = async (body) => {
  return api.post("stylist/verify_otp", body);
};
//signupa
const register = async (body) => {
  console.log(body, "body");
  // let newBody = body?.formdata?._parts
  // console.log(body,"sdf");
  return api.post("client/register", body, {
    headers: {
      'content-type': 'multipart/form-data',
    },


  });
};

//signup stylist
const registerStylist = async (body) => {
  return api.post("stylist/register", body, {
    headers: {
      'content-type': 'multipart/form-data',
    },


  });
};


// Verify OTP
const verifyOTP = async (body) => {
  return api.post("/user/otp_verification", body);
};

// contact us//
const Contactusdata = async (token, body) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  return api.post("appdata/contact_us", body, { headers: headers });
};



// UpdateuserDetails
const updateuserDetails = async (token, username) => {

  const headers = {
    Authorization: "Bearer " + token,
  };
  return api.patch("/user/update_profile", { username }, { headers: headers });
};





// Verify OTP
const VerifyOTP = async (UserId, otp) => {
  const res = await api.post("user/otp_verification", {
    UserId: UserId,
    otp: otp,
  });
  return res.data;
};

const resendOTP = async (country_code, phone_number) => {
  const res = await api.post("user/resendotp", {
    country_code,
    phone_number,
  });
  return res;
};

// changepass
const change_password = async (current_password, new_password, token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  const res = await api.post(
    "user/change_password",
    {
      current_password,
      new_password,
    },
    { headers: headers }
  );

  return res;
};



//faq
const Faqdata = async (token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  return api.get("/common/faq", {}, { headers: headers });
};

//Delete Account//
const DeletAccount = async (token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  return api.delete("user/delete_account", {}, { headers: headers });
};

//Edit Proile
const editProfileClient = async (body) => {
  return api.post("client/update_profile", body, { headers: { 'content-type': 'multipart/form-data' } });
};
const editProfileStylist = async (body) => {
  return api.post("stylist/update_profile", body, { headers: { 'content-type': 'multipart/form-data' } });
};

//change password
const changePasswordClient = async (body) => {
  return api.post("client/change_password", body);
};
const changePasswordStylist = async (body) => {
  return api.post("stylist/change_password", body);
};

// ************stylistcollection *************
const GetCollection = async (data) => {
  return api.get(`/stylist/get_my_collection?page=${data?.page}&limit=${data?.limit}`);
};
const getGalleryCover = async () => {
  return api.get("/stylist/get_gallery_cover");
}
const getHomeFeed = async (query) => {
  return api.get(`/stylist/get_home_feed${query}`)
}
const addCaption = async (data) => {
  return api.post("/stylist/add_media_caption", data);
}
const get_my_gallery = async (data) => {
  return api.get(`/stylist/get_my_gallery?page=${data?.page}&limit=${data?.limit}`,);
}
const get_my_gallery_collection = async (data) => {
  console.log(data?.cid, "collection ID.....")
  return api.get(`/stylist/get_my_gallery?page=${data?.page}&limit=${data?.limit}&collection_id=${data?.cid}`,);
}
const addToGallery = async (data) => {
  return api.post("/stylist/add_gallery_media", data);
}
const deleteGalleryData = async (data) => {
  return api.delete("/stylist/delete_gallery_media", data);
}
const CreateCollectionApi = async (data) => {////old method
  return api.post("/stylist/create_collection", data, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  });
};
const createCollectionApi = async (data) => { ///after app gallery was added
  return api.post("/stylist/create_collection", data);
};
const CreateCollectionImageApi = async (data) => {

  return api.post("/stylist/upload_collection_media", data, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  });
};
const SetCoverImage = async (data) => {

  return api.post("/stylist/set_as_cover_image", data);
};
const DeleteCollection = async (data, token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };

  return api.delete("/stylist/delete_collection?collection_id=" + data, {}, { headers: headers });
};

const GetCollectionDetail = async (data) => {
  if (typeof data == "string") {
    return api.get("/stylist/get_collection_detail?collection_id=" + data);
  }
  if (data?.collection_id) {
    return api.get(`/stylist/get_collection_detail?collection_id=${data?.collection_id}&page=${data?.page}&limit=${data?.limit}`);
  }
  return
  // else {
  //   return api.get("/stylist/get_collection_detail?collection_id=" + data, {}, { headers: headers });
  // }
};

const getBrandCollectionDetail = async (data) => {
  return api.get(`stylist/get_stylist_collection_detail_brand?collection_id=${data?.collection_id}&page=${data?.page}&limit=${data?.limit}`);
};

const UpdateCollectionApi = async (data) => {

  return api.post("/stylist/update_collection", data, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  });
};
const updateCollectionApi = async (data) => {/////for flow after gallery was added
  return api.post("/stylist/update_collection", data);
};

const DeleteCollectionMedia = async (data) => {
  return api.post("/stylist/delete_collection_image", data);
};

// **********getcompanystylist********
const GetCompanyStylist = async (token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  return api.get("/stylist/get_company_stylist", {}, { headers: headers });
};

// **********addcompanystylist********
const AddCompanyStylist = async (data) => {
  return api.post("/stylist/add_company_stylist", data);
};

// **********addcompanystylist********
const DeleteCompanyStylist = async (id) => {
  return api.delete("/stylist/delete_company_stylist?_id=" + id, {});
};

// **********stylist/get_follow_request_list********
const GetFollowRequest = async () => {
  return api.get("stylist/get_all_notification", { cache: false });
};
const GetClientFollowRequest = async () => {
  return api.get("client/get_all_notification", {});
};
// **********sdelete********
const DeleteNotStylistApi = async (id) => {
  return api.delete("/stylist/delete_notification?notification_id=" + id, {});
};
// **********sdelete********
const DeleteNotclientApi = async (id) => {
  return api.delete("/client/delete_notification?notification_id=" + id, {});
};
// **********stylist/accept_reject_follow_request********
const AcceptRejectRequest = async (data) => {
  return api.post("/stylist/accept_reject_follow_request", data);
};
const GetNotesApi = async () => {
  return api.get("/stylist/get_notes", {});
};
const CreateNoteApi = async (data) => {
  return api.post("/stylist/create_note", data);
};
const updateNoteStylist = async (data) => {
  return api.post("/stylist/update_note", data);
};
const DeleteNotes = async (id, permanent) => {
  return api.delete("/stylist/delete_note?note_id=" + id + "&is_permanent=" + permanent);
};
const GetClientNotesApi = async () => {
  return api.get("/client/get_notes", {});
};
const CreateClientNoteApi = async (data) => {
  return api.post("/client/create_note", data);
};
const updateNoteClient = async (data) => {
  return api.post("/client/update_note", data);
};
const DeleteClientNotes = async (id, permanent) => {
  return api.delete("/client/delete_note?note_id=" + id + "&is_permanent=" + permanent);
};

// **********clientgetfeed**********

const getClientFeed = async (body) => {
  return api.get(`client/get_feeds?page=${body?.page}&limit=${body?.limit}`)
}
const getConfirmedOrders = async (data) => {
  return api.get(`client/get_confirmed_orders?stylist_id=${data?.stylist_id}&page=${data?.page}&limit=${data?.limit}`)
}
const getConfirmedOrdersBrand = async (data) => {
  return api.get(`client/get_confirmed_orders_brand?brand_id=${data?.brand_id}&page=${data?.page}&limit=${data?.limit}`)
}
// ***********getstylistlist**********
export const getStylistandBrands = async (body) => {
  return api.get(`client/get_stylist_list${body}`)
}
const getClientStylist = async (body) => {
  return api.get(`client/get_stylist_list?page=${body?.page}&limit=${body?.limit}&keyword=${body.text}`)
}
const getStylistStylist = async (body) => {
  if (body?.type) {
    return api.post(`stylist/search_stylist?page=${body?.page}&limit=${body?.limit}`, { keyword: body.text, type: body?.type })
  }
  return api.post(`stylist/search_stylist?page=${body?.page}&limit=${body?.limit}`, { keyword: body.text })
}
const getBrandStylist = async (body) => {
  // if (body?.type) {
  //   return api.post(`stylist/search_stylist?page=${body?.page}&limit=${body?.limit}`, { keyword: body.text, type: body?.type })
  // }
  return api.post(`stylist/search_brand?page=${body?.page}&limit=${body?.limit}`, { keyword: body.text })
}
// ***********getstylistlist**********
const getClientFollowedStylist = async (body) => {
  return api.get(`client/get_followed_stylist_list?page=${body?.page}&limit=${body?.limit}`)
}
// ***********getstylistdetails**********
const getClientStylistDetail = async (id) => {
  return api.get(`client/get_stylist_detail?stylist_id=${id}`)
}
const getClientBrandDetail = async (id) => {
  return api.get(`client/get_brand_detail?brand_id=${id}`)
}
// ***********getstylistdetails**********
const getClientStylistCollection = async (id, type, page, limit) => {
  return api.get(`client/get_stylist_collection?stylist_id=${id}&type=${type}&page=${page}&limit=${limit}`)
}
const getClientBrandCollection = async (id, type, page, limit) => {
  return api.get(`client/get_brand_collection?brand_id=${id}&type=${type}&page=${page}&limit=${limit}`)
}
const getBrandDetailStylist = async (id) => {
  return api.get(`stylist/get_brand_detail?brand_id=${id}`)
}
// ***********sendfollowrequest**********
const SendFollowRequest = async (data) => {
  return api.post(`client/send_follow_request`, data)
}
const SendFollowRequestBrand = async (data) => {
  return api.post(`client/send_follow_request_to_brand`, data)
}
const SendFollowRequestStylist = async (data) => {
  return api.post(`stylist/send_follow_request`, data)
}
const SendFollowRequestStylistToBrand = async (data) => {
  return api.post(`stylist/send_follow_request_brand`, data)
}
// ***********sendfollowrequest**********
const LikeUnlike = async (data) => {
  return api.post(`client/like_unlike_collection`, data)
}
const LikeUnlikeBrand = async (data) => {
  return api.post(`client/like_unlike_collection_brand`, data)
}
const likeUnlikeStylist = async (data) => {
  return api.post(`stylist/like_unlike_collection_brand`, data)
}
// ***********sendfollowrequest**********
const GetLikedPost = async (data) => {
  return api.get(`client/get_liked_collection?page=${data?.page}&limit=${data?.limit}`)
}
const GetStylistCollectionDetail = async (data) => {
  return api.get(`client/get_stylist_collection_detail?stylist_id=${data?.stylist_id}&collection_id=${data?.collection_id}&page=${data?.page}&limit=${data?.limit}`)
}
const GetBrandCollectionDetail = async (data) => {
  return api.get(`client/get_brand_collection_detail?brand_id=${data?.brand_id}&collection_id=${data?.collection_id}&page=${data?.page}&limit=${data?.limit}`)
}

const searchClient = async (key) => {
  return api.get(`stylist/search_client?keyword=${key}`)
}
const GetMyClient = async (key) => {
  return api.get(`stylist/get_my_client_list`)
}
const getAllFollowData = async (type, page, limit) => {
  if (type && page && limit) {
    return api.get(`stylist/get_follower_following_list?type=${type}&page=${page}&limit=${limit}`)
  }
  if (type) {
    return api.get(`stylist/get_follower_following_list?type=${type}`)
  }
  return api.get(`stylist/get_follower_following_list`)
}
const GetStylistClientOrder = async (key, page, limit) => {
  return api.get(`stylist/get_client_confirm_order?client_id=${key}&page=${page}&limit=${limit}`)
}
const getLikedDataOfClient = async (key, page, limit) => {
  return api.get(`stylist/get_client_liked_media?client_id=${key}&page=${page}&limit=${limit}`)
}

// *************order***********
// **********stylist/accept_reject_follow_request********
const ConfirmOrderApi = async (data) => {
  return api.post("stylist/confirm_order", data);
};

const getMediaDetail = async (data) => {
  return api.get(`stylist/get_media_detail?media_id=${data}`);
};
const SendNotification = async (data) => {
  return api.post("stylist/send_payload_notification", data);
};
const LogoutStylist = async (data) => {
  return api.get("stylist/logout", {});
};
const LogoutClient = async (data) => {
  return api.get("client/logout", {});
};
const UpdateNotClient = async (data) => {
  return api.post("client/update_notification_status", data);
};
const UpdateNotStylist = async (data) => {
  return api.post("stylist/update_notification_status", data);
};
const contactusClient = async (data) => {
  return api.post("client/send_message", data);
};
const contactusStylist = async (data) => {
  return api.post("stylist/send_message", data);
};
const termsClient = async () => {
  return api.get("client/get_app_data");
};
const termsStylist = async () => {
  return api.get("stylist/get_app_data");
};
const deleteAccountStylist = async (data) => {
  return api.post("stylist/delete_acount", data);
};
const deleteAccountClient = async (data) => {
  return api.post("client/delete_acount", data);
};
const get_particular_stylist_detail = async (data) => {
  return api.get(`stylist/get_particular_stylist_detail?other_stylist_id=${data}`)
}
const get_confirm_order_list = async (data) => {
  return api.get(`stylist/get_confirm_order_list?page=${data?.page}&limit=${data?.limit}`)
}
const orderCancel = async (data) => {
  return api.post(`stylist/cancel_order`, data)
}
const clientRecentlyDeletedNotes = async () => {
  return api.get(`client/get_recent_deleted_notes`)
}
const stylistRecentlyDeletedNotes = async () => {
  return api.get(`stylist/get_recent_deleted_notes`)
}
const restore_note = async (data) => {
  return api.post(`client/restore_note`, data)
}
const restore_note_stylist = async (data) => {
  return api.post(`stylist/restore_note`, data)
}
const uploadCollections = async (data) => {
  return api.post(`stylist/upload_media_array`, data)
}
const getLikedMediaList = async (data) => {
  return api.get(`stylist/get_liked_media_list?page=${data?.page}&limit=${data?.limit}`)
}
const get_like_list = async (data) => {
  return api.get(`stylist/get_like_list?media_id=${data?.media_id || data}`)
}

export const uploadFiles = async (array, collection_id, token) => {
  let arr = [];
  for (let index = 0; index < array.length; index++) {
    const i = array[index];
    if (i?.path) {
      let obj = {
        filename: i.filename == null ? moment().unix() + "." + i?.mime?.split("/")[1] : i.filename,
        data: RNFetchBlob.wrap(i?.path),
        type: i?.mime ?? "video/mp4",
      };
      arr.push({ ...obj, name: "collection_media" });
    }
  }
  console.log(token)
  let response = await RNFetchBlob.fetch(
    "POST",
    ("http://192.168.0.111:5068/api/v1/stylist/upload_media_array"),
    {
      "Content-Type": "multipart/form-data",
      "Authorization": 'Bearer ' + token,
    },
    arr
  ).then(i => {
    console.log(i.data)
    return i.data
  })
  return JSON.parse(response)
}

export const buySubscription = async (data, token) => {

  return api.post("stylist/purchase_subscription", data, {
    // headers: {
    //   Authorization: "Bearer " + token,
    // },
  });

}

export const clientCloset = async (query) => { return api.get(`client/closet${query}`) }

export const uploadCloset = async (data) => { return api.post("client/closet", data) }

export const deleteCloset = async (data) => { return api.post("client/delete_closet", data) }

export const updateCloset = async (data) => { return api.patch("client/closet", data) }

export const fetchClientDetail = async (id) => { return api.get(`stylist/client_detail?client_id=${id}`) }

export const updateClientMeasurement = async (body) => { return api.post(`stylist/updateClient_measurment`, body) }

export {
  get_like_list,
  getLikedMediaList,
  restore_note,
  restore_note_stylist,
  uploadCollections,
  clientRecentlyDeletedNotes,
  stylistRecentlyDeletedNotes,
  deleteAccountStylist,
  deleteAccountClient,
  contactusClient,
  contactusStylist,
  termsStylist,
  termsClient,
  DeleteNotclientApi,
  DeleteNotStylistApi,
  GetClientNotesApi,
  CreateClientNoteApi,
  updateNoteClient,
  DeleteClientNotes,
  checkPhoneClient,
  checkEmailClient,
  register,
  loginClient,
  loginStylist,
  checkPhoneStylist,
  checkEmailStylist,
  registerStylist,
  new_passwordstylist,
  VerifyClient,
  VerifyStylist,

  forgotPasswordClient,
  forgotPasswordStylist,
  verifyOTP,
  resendOTP,
  change_password,
  VerifyOTP,
  new_passwordclient,
  updateuserDetails,
  Faqdata,
  DeletAccount,
  Contactusdata,
  editProfileClient,
  editProfileStylist,
  changePasswordClient,
  changePasswordStylist,
  GetCollection,
  getGalleryCover,
  getHomeFeed,
  addCaption,
  get_my_gallery,
  get_my_gallery_collection,
  addToGallery,
  deleteGalleryData,
  CreateCollectionApi,
  createCollectionApi,
  DeleteCollection,
  GetCollectionDetail,
  getBrandCollectionDetail,
  UpdateCollectionApi,
  updateCollectionApi,
  DeleteCollectionMedia,
  GetCompanyStylist,
  AddCompanyStylist,
  getClientFeed,
  getConfirmedOrders,
  getConfirmedOrdersBrand,
  DeleteCompanyStylist,
  getClientStylist,
  getStylistStylist,
  getBrandStylist,
  getClientStylistDetail,
  getClientBrandDetail,
  SendFollowRequest,
  SendFollowRequestBrand,
  SendFollowRequestStylist,
  SendFollowRequestStylistToBrand,
  GetFollowRequest,
  AcceptRejectRequest,
  searchClient,
  getClientFollowedStylist,
  ConfirmOrderApi,
  GetMyClient,
  getAllFollowData,
  GetStylistClientOrder,
  getLikedDataOfClient,
  getClientStylistCollection,
  getClientBrandCollection,
  getBrandDetailStylist,
  LikeUnlike,
  LikeUnlikeBrand,
  likeUnlikeStylist,
  GetLikedPost,
  GetNotesApi,
  CreateNoteApi,
  updateNoteStylist,
  DeleteNotes,
  CreateCollectionImageApi,
  SetCoverImage,
  GetStylistCollectionDetail,
  GetBrandCollectionDetail,
  SendNotification,
  getMediaDetail,
  LogoutStylist,
  LogoutClient,
  UpdateNotClient,
  UpdateNotStylist,
  GetClientFollowRequest,
  getuserclientdetail,
  getuserstylistdetail,
  get_particular_stylist_detail,
  get_confirm_order_list,
  orderCancel
}
