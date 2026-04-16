
const StylistCollection = {
    name: "StylistCollection",

    properties: {
        _id: "string",
        full_name: 'string',
        profile_pic: 'string'


    },
}
const FollowCollection = {
    name: "FollowCollection",

    properties: {
        _id: "string",
        follow_by: 'string',
        follow_status: 'string'


    },
}
const MediaCollection = {
    name: "MediaCollection",

    properties: {
        _id: "string",
        collection_id: "string",
        stylist_id: "string",
        media_name: "string",
        status: 'int',
        created_at: 'date',
        updated_at: 'date',

    },
}
const LikeCollection = {
    name: "LikeCollection",

    properties: {
        _id: "string",

        like_status: "string",


    },
}
const ClientCollection = {
    name: "ClientCollection",
    primaryKey: '_id',
    properties: {
        _id: "string",
        created_at: 'date',
        description: 'string',
        display_type: 'string',
        stylist_data: { type: 'list', objectType: 'StylistCollection' },
        name: 'string',
        stylist_id: 'string',
        display_to: 'string',
        follow_data: { type: 'list', objectType: 'FollowCollection' },
        like_data: { type: 'list', objectType: 'LikeCollection' },
        media_data: { type: 'list', objectType: 'MediaCollection' },



    },
};


export { ClientCollection, StylistCollection, FollowCollection, MediaCollection, LikeCollection };