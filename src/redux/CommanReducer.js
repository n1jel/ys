import { createSlice } from "@reduxjs/toolkit";
import { GetCollectionDetail, getuserclientdetail, getuserstylistdetail } from "../apimanager/httpServices";
import { ClientCollection, FollowCollection, LikeCollection, MediaCollection, StylistCollection } from "../schema/ClientCollection";
import { ClientLikeCollection, CollectionData } from "../schema/ClientLikeCollection";
import { DisplayTo, SFollowCollection, SLikeCollection, SMediaCollection, StylistData, StylistFeedCollection } from "../schema/StylistCollection";
import firestore from '@react-native-firebase/firestore';

import { setLoading } from "./load";
import { getCollectionDetail } from "../apimanager/brandServices";
const initialState = {
  productdetail: {},
  connected: true,
  activeimagedata: {},
  feedclient: [],
  feedStylist: [],
  clientLikelist: [],
  fcmtoken: '',
  notifications: '0',
  // unreadsChat: 0,
  collectionData: {}
};

export const CommanReducer = createSlice({
  name: "CommanReducer",
  initialState: initialState,
  reducers: {
    setProductDetail: (state, actions) => {
      state.productdetail = actions.payload;
    },
    setConnected: (state, actions) => {
      state.connected = actions.payload;
    },
    setActiveImageData: (state, actions) => {
      state.activeimagedata = actions.payload;
    },
    setFeedClient: (state, actions) => {
      state.feedclient = actions.payload
    },
    setFeedStylist: (state, actions) => {
      state.feedStylist = actions.payload
    },
    setClientlikelist: (state, actions) => {
      state.clientLikelist = actions.payload
    },
    setfcmtoken: (state, actions) => {
      state.fcmtoken = actions.payload
    },
    setNotification: (state, actions) => {
      state.notifications = actions.payload
    },
    // setUnreadChats: (state, actions) => {
    //   state.unreadsChat = actions.payload
    // },
    setCollectionData: (state, actions) => {
      state.collectionData = actions.payload
    }
  },
});

// Action creators are generated for each case reducer function
export const { setProductDetail, setCollectionData, setConnected, setActiveImageData, setFeedClient, setClientlikelist, setFeedStylist, setfcmtoken, setNotification,
  // setUnreadChats
} = CommanReducer.actions;

// export const getChatUnreadCount = (id) => {
//   return async (dispatch) => {
//     firestore().collection("chats").where("userIds", "array-contains", id ?? "").onSnapshot((querySnapshot) => {
//       let totalUnreadCount = 0
//       for (let snaps of querySnapshot.docs) {
//         let data = snaps.data()
//         if (data?.type != "group") {
//           let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
//           totalUnreadCount += unreadCount
//         }
//       }
//       dispatch(setUnreadChats(totalUnreadCount))
//     })
//   }
// }
export const Productdetail = (id) => {
  return async (dispatch) => {
    if (!id) {
      return
    }
    let res = await GetCollectionDetail(id)
    console.log(res, 'getting collection offline')
    try {
      if (res?.data?.status) {
        dispatch(setProductDetail(res.data.data))
        // showToast(res?.data?.message);
      } else {
        dispatch(setProductDetail({}))
        // showToast(res?.data?.message);
      }
    } catch (e) {
    } finally {
      dispatch(setLoading(false))
    }
  }
}
export const ProductdetailBrands = (id) => {
  return async (dispatch) => {
    if (!id) {
      return
    }
    let res = await getCollectionDetail(id)
    console.log(res, 'getting collection offline')
    try {
      if (res?.data?.status) {
        dispatch(setProductDetail(res.data.data))
      } else {
        dispatch(setProductDetail({}))
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false))
    }
  }
}
export const StylistDetails = () => {
  return async (dispatch) => {
    let res = await getuserstylistdetail()
    try {
      if (res?.data?.status) {

        if (res?.data?.other) {
          dispatch(setNotification(res.data.other.new_notification))
        }


      } else {


      }
    } catch (e) {
    } finally {

    }
  }
}
export const ClientDetails = () => {
  return async (dispatch) => {
    let res = await getuserclientdetail()
    try {
      if (res?.data?.status) {

        if (res?.data?.other) {
          dispatch(setNotification(res.data.other.new_notification))
        }


      } else {


      }
    } catch (e) {
    } finally {

    }
  }
}

export const FeedClientReducer = () => {

  return async function (dispatch, getState) {

    let realm = await Realm.open({ schema: [ClientCollection, StylistCollection, FollowCollection, MediaCollection, LikeCollection], path: 'ClientCollection.realm' })
    let data = realm.objects('ClientCollection')
    if (data && data.length > 0) {
      dispatch(setFeedClient(data))
      // realm.close()
    }

  };
}
export const FeedStylistReducer = () => {
  return async function (dispatch, getState) {
    let realm = await Realm.open({ schema: [StylistFeedCollection, StylistData, SFollowCollection, SMediaCollection, SLikeCollection], path: 'StylistFeedCollection.realm' })
    let data = realm.objects('StylistFeedCollection')
    if (data && data.length > 0) {
      dispatch(setFeedStylist(data))
    }
  };
}
export const LikeClientReducer = () => {

  return async function (dispatch, getState) {

    let realm = await Realm.open({ schema: [ClientLikeCollection], path: 'ClientLikeCollection.realm' })
    let data = realm.objects('ClientLikeCollection')
    if (data && data.length > 0) {
      dispatch(setClientlikelist(data))
      // realm.close()
    }

  };
}

export const SaveFeedClientReducer = (element) => {

  return async function (dispatch, getState) {
    // Realm.deleteFile({schema: [ClientCollection,StylistCollection,FollowCollection,MediaCollection,LikeCollection]})
    await Realm.open({ schema: [ClientCollection, StylistCollection, FollowCollection, MediaCollection, LikeCollection], deleteRealmIfMigrationNeeded: true, path: 'ClientCollection.realm' })
      .then(realm => {
        realm.write(() => {

          realm.create('ClientCollection', {
            _id: element?._id,
            created_at: element?.created_at,
            description: element?.description,
            display_type: element?.display_type,
            stylist_data: element.stylist_data,
            name: element.name,
            stylist_id: element.stylist_id,
            display_to: JSON.stringify(element.display_to),
            follow_data: element.follow_data,
            like_data: element.like_data,
            media_data: element.media_data,

          }, true)
        })
        let data = realm.objects('ClientCollection')

      })



  };

}
export const SaveFeedStylistReducer = (element) => {
  return async function (dispatch, getState) {
    // Realm.deleteFile({schema: [ClientCollection,StylistCollection,FollowCollection,MediaCollection,LikeCollection]})
    let realm = await Realm.open({ schema: [StylistFeedCollection, StylistData, SFollowCollection, SMediaCollection, SLikeCollection, DisplayTo], path: 'StylistFeedCollection.realm' })
      .then(realm => {
        realm.write(() => {
          realm.create('StylistFeedCollection', {
            _id: element?._id,
            created_at: element?.created_at,
            description: element?.description,
            display_type: element?.display_type,
            stylist_data: element.stylist_data,
            name: element.name,
            stylist_id: element.stylist_id,
            display_to: JSON.stringify(element.display_to),
            like_data: element.like_data,
            media_data: element.media_data,
            status: element.status,
            updated_at: element?.updated_at
            // follow_data: element.follow_data,
          }, true)
        })
        // let data = realm.objects('StylistFeedCollection')
      })



  };

}

export const SaveClientLikeReducer = (element) => {

  return async function (dispatch, getState) {
    // Realm.deleteFile({schema: [ClientCollection,StylistCollection,FollowCollection,MediaCollection,LikeCollection]})
    await Realm.open({ schema: [ClientLikeCollection], deleteRealmIfMigrationNeeded: true, path: 'ClientLikeCollection.realm' })
      .then(realm => {
        realm.write(() => {


          realm.create('ClientLikeCollection', {
            _id: element?._id,
            collection_data: JSON.stringify(element.collection_data),

          })
        })
        let data = realm.objects('ClientLikeCollection')


        // realm.close()
      })



  };

}
export default CommanReducer.reducer;
