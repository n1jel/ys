import RNFetchBlob from 'rn-fetch-blob';
import AWS from 'aws-sdk';
import { Buffer } from 'buffer';
import { setProgress } from '../redux/uploadReducer';
import { Store } from '../redux/Store';
import { Image as CompressorImage, Video as CompressorVideo } from 'react-native-compressor';
import RNFS from 'react-native-fs';
// Initialize AWS SDK with your credentials
AWS.config.update({
  accessKeyId: 'AKIAUCPUVPRTTACOV3ZR',
  secretAccessKey: 's9Z2+UXIS6R25oWMbcEVZCjrZSBXfL3xKV6XjCsB',
  region: 'us-east-1', // e.g., 'us-east-1'
  useAccelerateEndpoint: true,
});

// Bucket=yourseason
// Create a new S3 instance
const s3 = new AWS.S3();

// Function to upload a file to S3 bucket
const uploadToS3 = async (fileUri, fileName, mime_type) => {
  console.log(fileName, fileUri);
  let result
  if (mime_type?.includes("video")) {
    result = await CompressorVideo.compress(fileUri, { quality: 0.6 });
  } else {
    result = await CompressorImage.compress(fileUri, { quality: 0.6 });
  }
  const base64Data = await RNFetchBlob.fs.readFile(result.replace('file:///', ""), "base64");
  const buffer = Buffer.from(base64Data, 'base64');
  const params = {
    Bucket: "yourseason",
    Key: `${"gallery/test/"}${fileName}`,
    Body: buffer,
    ContentType: mime_type, // Set the content type of the file
  };

  return s3.upload(params).promise()

}


const uploadVideoToS3 = async (fileUri, fileName, mime_type) => {
  return
  //   const base64Data = await videoToBase64(fileUri);
  // if (base64Data) {
  //   // Do something with the base64 data
  //   console.log('Base64 data:', base64Data);
  //       const buffer = Buffer.from(base64Data, 'base64');
  //       const params = {
  //         Bucket: "yourseason",
  //         Key: `${"gallery/test/"}${fileName}`,
  //         Body: buffer,
  //         ContentType: mime_type, // Set the content type of the video
  //       };

  //       return s3.upload(params).promise()
  // } else {
  //   console.error('Error converting video to base64');
  // }

}


const videoToBase64 = async (videoUri) => {
  try {
    const videoData = await RNFS.readFile(videoUri, 'base64');
    return videoData;
  } catch (error) {
    console.error('Error converting video to base64:', error);
    return null;
  }
}

export { uploadToS3, uploadVideoToS3 }