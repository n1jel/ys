package com.yourseason.video;

import android.content.Context;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaCodecList;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.os.Build;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

public class VideoCompressor {

    private static final String TAG = "VideoCompressor";

    public static String compressVideo(Context context, String videoPath) {
        String compressedVideoPath = null;
        MediaExtractor extractor = new MediaExtractor();
        try {
            extractor.setDataSource(videoPath);
            int trackIndex = selectTrack(extractor);
            extractor.selectTrack(trackIndex);

            MediaFormat inputFormat = extractor.getTrackFormat(trackIndex);
            String mime = inputFormat.getString(MediaFormat.KEY_MIME);
            MediaCodec codec = MediaCodec.createEncoderByType(mime);
            MediaFormat outputFormat = MediaFormat.createVideoFormat("video/avc", 640, 480);
            outputFormat.setInteger(MediaFormat.KEY_BIT_RATE, 500000);
            outputFormat.setInteger(MediaFormat.KEY_FRAME_RATE, 24);
            outputFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
            outputFormat.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 5);
            codec.configure(outputFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            codec.start();

            ByteBuffer[] inputBuffers = codec.getInputBuffers();
            ByteBuffer[] outputBuffers = codec.getOutputBuffers();

            File cacheDir = context.getCacheDir();
            File compressedVideoFile = new File(cacheDir, "compressed_video.mp4");
            FileOutputStream outputStream = new FileOutputStream(compressedVideoFile);

            boolean inputDone = false;
            boolean outputDone = false;

            while (!outputDone) {
                if (!inputDone) {
                    int inputBufferIndex = codec.dequeueInputBuffer(-1);
                    if (inputBufferIndex >= 0) {
                        ByteBuffer inputBuffer = inputBuffers[inputBufferIndex];
                        int sampleSize = extractor.readSampleData(inputBuffer, 0);
                        if (sampleSize < 0) {
                            codec.queueInputBuffer(inputBufferIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                            inputDone = true;
                        } else {
                            long presentationTimeUs = extractor.getSampleTime();
                            codec.queueInputBuffer(inputBufferIndex, 0, sampleSize, presentationTimeUs, 0);
                            extractor.advance();
                        }
                    }
                }

                MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
                int outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, -1);
                if (outputBufferIndex >= 0) {
                    ByteBuffer outputBuffer = outputBuffers[outputBufferIndex];
                    outputBuffer.position(bufferInfo.offset);
                    outputBuffer.limit(bufferInfo.offset + bufferInfo.size);
                    byte[] chunk = new byte[bufferInfo.size];
                    outputBuffer.get(chunk);
                    outputStream.write(chunk);
                    codec.releaseOutputBuffer(outputBufferIndex, false);
                    if ((bufferInfo.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                        outputDone = true;
                    }
                }
            }

            codec.stop();
            codec.release();
            extractor.release();
            outputStream.flush();
            outputStream.close();

            compressedVideoPath = compressedVideoFile.getAbsolutePath();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return compressedVideoPath;
    }

    private static int selectTrack(MediaExtractor extractor) {
        String[] selectionArgs = {"video/mp4", "video/quicktime", "video/mpeg"};
        int numTracks = extractor.getTrackCount();
        for (int i = 0; i < numTracks; i++) {
            MediaFormat format = extractor.getTrackFormat(i);
            String mime = format.getString(MediaFormat.KEY_MIME);
            for (String selectionArg : selectionArgs) {
                if (mime != null && mime.startsWith(selectionArg)) {
                    return i;
                }
            }
        }
        return -1;
    }
}