
const LikeMediaCollection = {
    name: "LikeMediaCollection",

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
const CollectionData = {
    name: "CollectionData",

    properties: {
        _id: "string",
        stylist_id: "string",
        name: "string",
        description: "string",
        display_type: "string",
        media_data: { type: 'list', objectType: 'LikeMediaCollection' },

    },
}
const ClientLikeCollection = {
    name: "ClientLikeCollection",
    primaryKey: '_id',
    properties: {
        _id: "string",
        collection_data: 'string'
    },
};


export { ClientLikeCollection, LikeMediaCollection, CollectionData };