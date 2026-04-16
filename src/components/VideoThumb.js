import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef } from 'react'
import Video from 'react-native-video';
import { fileUrl } from '../apimanager/httpmanager';
import convertToProxyURL from 'react-native-video-cache';

const VideoThumb = ({ styleMain, source, onLoad, resizeMode = 'contain' }) => {
    const videoRef = useRef(null)

    // useEffect(() => {
    //     videoRef?.current?.seek(1)
    // }, [videoRef])
    const handleLoad = useCallback(() => {
        videoRef?.current?.seek(1)
        if (onLoad) onLoad()
    }, [onLoad, videoRef])

    const videoUrl = getVideoUrl(source);

    return (
        <Video
            ref={videoRef}
            paused={true}
            source={{ uri: convertToProxyURL(videoUrl) }}
            style={[{ height: "100%", width: "100%" }, styleMain]}
            controls={false}
            onLoad={handleLoad}
            resizeMode={resizeMode}
        />
    )
}

export default VideoThumb

const styles = StyleSheet.create({})

const getVideoUrl = (src) => {
    return fileUrl + src
}