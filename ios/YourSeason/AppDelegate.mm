#import "AppDelegate.h"
#import <Firebase.h>
#import "YourSeason-Bridging-Header.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <Photos/Photos.h>
//#import <AWSMobileClient/AWSMobileClient.h>
#import <AWSS3/AWSS3.h>
#import <AWSDDLog.h>
#import <AWSDDTTYLogger.h>
#import "YourSeason-Swift.h"
//#import <AWSMobileClient/AWSMobileClient.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"YourSeason";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  [self requestPhotoLibraryPermission];
 
  [AWSDDLog sharedInstance].logLevel = AWSDDLogLevelInfo;

  // Add TTY logger
  [AWSDDLog addLogger:[AWSDDTTYLogger sharedInstance]];
 [FIRApp configure];

  [self setupAWSSDK];
     
     // Ensure you handle background transfer utility setup here or in a dedicated method
     [self setupAWSS3TransferUtilityForBackgroundUpload];
//  [[AWSMobileClient sharedInstance] initializeWithConfiguration:nil completionHandler:^(AWSMobileClientUserState userState, NSError * _Nullable error) {
//      if (error) {
//          NSLog(@"Error initializing AWSMobileClient: %@", error);
//      } else {
//          // Handle the initialization result here
//          switch (userState) {
//              case AWSMobileClientUserStateSignedIn:
//                  NSLog(@"User is signed in.");
//                  break;
//              case AWSMobileClientUserStateSignedOut:
//                  NSLog(@"User is signed out.");
//                  break;
//              case AWSMobileClientUserStateUnknown:
//                  NSLog(@"User state is unknown.");
//                  break;
//              default:
//                  NSLog(@"Unhandled user state: %ld", (long)userState);
//                  break;
//          }
//      }
//  }];
  

//
//  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
//    [bridge registerModule:[PhotoPickerModule new]];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)setupAWSSDK {
    AWSEndpoint *s3Endpoint = [[AWSEndpoint alloc] initWithURLString:@"https://yourseason.s3-accelerate.amazonaws.com"];
    AWSRegionType regionType = AWSRegionUSEast1; // Specify your region
    
    // Initialize the AWS credentials provider
    AWSStaticCredentialsProvider *credentialsProvider = [[AWSStaticCredentialsProvider alloc] initWithAccessKey:@"AKIAUCPUVPRTTACOV3ZR"
                                                                                                      secretKey:@"s9Z2+UXIS6R25oWMbcEVZCjrZSBXfL3xKV6XjCsB"];
    
    AWSServiceConfiguration *s3Configuration = [[AWSServiceConfiguration alloc] initWithRegion:regionType
                                                                                      endpoint:s3Endpoint
                                                                           credentialsProvider:credentialsProvider];
  
  // Enable accelerated transfer
  s3Configuration.timeoutIntervalForRequest = 86400; // Set to 24 hours
  s3Configuration.timeoutIntervalForResource = 604800; // Set to 7 days or longer as needed
    [AWSServiceManager defaultServiceManager].defaultServiceConfiguration = s3Configuration;
}

- (void)setupAWSS3TransferUtilityForBackgroundUpload {
  AWSS3TransferUtilityConfiguration *tuConfig = [[AWSS3TransferUtilityConfiguration alloc] init];
  tuConfig.accelerateModeEnabled = YES;
  tuConfig.bucket = @"yourseason";
    // Customize the transfer utility configuration if needed
//    AWSS3TransferUtilityConfiguration *tuConfig = [AWSS3TransferUtilityConfiguration new];

    NSString *transferUtilityIdentifier = @"org.solidappmaker.YourSeason.s3transferutility.background";
    
    // Use the default service configuration for Transfer Utility
    [AWSS3TransferUtility registerS3TransferUtilityWithConfiguration:[AWSServiceManager defaultServiceManager].defaultServiceConfiguration
                                          transferUtilityConfiguration:tuConfig
                                                                forKey:transferUtilityIdentifier
                                                     completionHandler:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"Error registering Transfer Utility: %@", error);
        }
    }];
}

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)(void))completionHandler {
    // Store or directly use the completionHandler as needed
    if ([identifier isEqualToString:@"org.solidappmaker.YourSeason.s3transferutility.background"]) {
        [AWSS3TransferUtility interceptApplication:application handleEventsForBackgroundURLSession:identifier completionHandler:completionHandler];
    }
}


- (void)requestPhotoLibraryPermission {
    [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
        switch (status) {
            case PHAuthorizationStatusAuthorized:
                // Access granted, you can now fetch user albums
            NSLog(@"Access to photo Success.");
            [[PhotoAlbumManager shared] fetchPhotoAlbums];
            [[VideoAlbumManager shared] fetchPhotoAlbums];
                break;
            case PHAuthorizationStatusDenied:
            case PHAuthorizationStatusRestricted:
                // Access denied or restricted, handle accordingly
                NSLog(@"Access to photo library denied or restricted.");
                break;
            case PHAuthorizationStatusNotDetermined:
                // Authorization not determined, request again or handle accordingly
                NSLog(@"Authorization not determined.");
                break;
            default:
            NSLog(@"unable to determine");
                break;
        }
    }];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
//    [[PhotoAlbumManager shared] fetchPhotoAlbums];
  [self requestPhotoLibraryPermission];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}
- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end





