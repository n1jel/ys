//
//  photoPicker.m
//  YourSeason
//
//  Created by John on 10/01/24.
//

#import <Foundation/Foundation.h>
#import "YourSeason-Bridging-Header.h"
#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>


@interface RCT_EXTERN_MODULE(Photopicker,RCTEventEmitter)

RCT_EXTERN_METHOD(pickImageWithCompletion)
RCT_EXTERN_METHOD(sendDataToJS)
RCT_EXTERN_METHOD(video)
RCT_EXTERN_METHOD(fireEvent)
RCT_EXTERN_METHOD(status)
//RCT_EXTERN_METHOD(openPicker:(NSDictionary *)collectionData)
//RCT_EXTERN_METHOD(openPicker:(NSDictionary *)collectionData token:(NSString *)token)
RCT_EXTERN_METHOD(openPicker:(NSDictionary *)collectionData token:(NSString *)token additionalOptions:(NSDictionary *)additionalOptions)
RCT_EXTERN_METHOD(openVideoPicker:(NSDictionary *)collectionData token:(NSString *)token additionalOptions:(NSDictionary *)additionalOptions)

RCT_EXTERN_METHOD(openCreateLibrary:(NSDictionary *)data)
//RCT_EXTERN_METHOD(editCollectionGallery:(NSString *)collectionId)
RCT_EXTERN_METHOD(editCollectionGallery:(NSString *)collectionId token:(NSString *)token additionalOptions:(NSDictionary *)additionalOptions)
RCT_EXTERN_METHOD(openCreateLibrary:(NSDictionary *)collectionData token:(NSString *)token additionalOptions:(NSDictionary *)additionalOptions)
//RCT_EXTERN_METHOD(openVideoPicker)
RCT_EXTERN_METHOD(cancelUploading)

@end
