const AGORADETAIL = {
    appID: "d37a7e30ee424f61ba2de4118892554e",
    appCertificate: "2278ab9893064be0a1f87b156015e95d"
}

const getAuthToken = async (uid, channelName) => {
    return new Promise(async function (resolve, reject) {
        // var formdata = new FormData();
        // formdata.append("appCertificate", "264d2aa2aad445869db92b16ef202a0c");
        // formdata.append("appID", "8d9e61117d034592b0c2d6a28d123575");
        // formdata.append("uid", "0");
        // formdata.append("channelName", channelName);
        console.log(channelName, "channelNamechannelNamechannelName");
        var requestOptions = { method: 'GET', redirect: 'follow' };

        // fetch(`http://solidappmaker.in/projects/php/agora_server_token/?appID=8d9e61117d034592b0c2d6a28d123575&appCertificate=264d2aa2aad445869db92b16ef202a0c&channelName=${channelName}&uid=0`, requestOptions)
        fetch(`https://solidappmaker.in/projects/php/agora_server_token?appID=${AGORADETAIL?.appID}&appCertificate=${AGORADETAIL?.appCertificate}&channelName=${channelName}&uid=0`, requestOptions)
            .then(response => response.json())
            .then(async response => {
                console.log("GENERATING CALL TOKEN =-=-=-", response);
                resolve({ ...response, channelName: channelName, uid: channelName })
            })
            .catch(error => {
                console.log('Token Generation error', error)
                reject(error)
            });
    })
}

export default getAuthToken;