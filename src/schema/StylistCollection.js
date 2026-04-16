
const StylistData = {
    name: "StylistData",
    primaryKey: '_id',
    properties: {
        _id: "string",
        email: 'string',
        full_name: 'string',
        profile_pic: 'string',
        stylist_type: 'string',
        user_type: 'string',
    },
}
const SFollowCollection = {
    name: "SFollowCollection",

    properties: {
        _id: "string",
        follow_by: 'string',
        follow_status: 'string'


    },
}
const SMediaCollection = {
    name: "SMediaCollection",
    primaryKey: '_id',
    properties: {
        _id: "string",
        collection_id: "string?",
        created_at: 'date',
        is_cover_image: 'int',
        media_name: "string",
        media_type: "string",
        saveToLibrary: "int",
        status: 'int',
        stylist_id: "string",
        thumbnail: "string",
        type: "string",
        updated_at: 'date',
    },
}
const SLikeCollection = {
    name: "SLikeCollection",
    properties: {
        _id: 'string?',
        total_likes: "int",
    },
}
const DisplayTo = {
    name: "DisplayTo",
    properties: {
        _id: 'string'
    },
}
const StylistFeedCollection = {
    name: "StylistFeedCollection",
    primaryKey: '_id',
    properties: {
        _id: "string",
        created_at: 'date',
        description: 'string',
        // display_to: { type: 'list', objectType: 'DisplayTo' },
        display_to: 'string',
        display_type: 'string',
        like_data: { type: 'list', objectType: 'SLikeCollection' },
        media_data: { type: 'list', objectType: 'SMediaCollection' },
        name: 'string',
        status: 'int',
        stylist_data: { type: 'list', objectType: 'StylistData' },
        stylist_id: 'string',
        updated_at: 'date',
        // follow_data: { type: 'list', objectType: 'SFollowCollection' },
    },
};

export { StylistFeedCollection, StylistData, SFollowCollection, SMediaCollection, SLikeCollection, DisplayTo };