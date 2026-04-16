//
//  Photopicker.swift
//  YourSeason
//
//  Created by John on 10/01/24.
//

import Foundation
import UIKit
import Photos
import PhotosUI
import React
import AWSMobileClient
import AWSS3

typealias PickerParameters = (collectionData: Dictionary<String, Any>, token: String, additionalOptions: Dictionary<String, Any>)


@objc(Photopicker)
class Photopicker : RCTEventEmitter, PHPickerViewControllerDelegate,UIImagePickerControllerDelegate,UINavigationControllerDelegate{
  let dispatchGroup = DispatchGroup()
  var presentingViewController: UIViewController?
  var selectedItems: Array<Dictionary<String,Any>> = [[:]]
  var resultCount = 0
  private var pickImageCompletion: (([Any]) -> Void)?
  internal let mimeTypes = [
    "md": "text/markdown",
    "html": "text/html",
    "htm": "text/html",
    "shtml": "text/html",
    "css": "text/css",
    "xml": "text/xml",
    "gif": "image/gif",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "application/javascript",
    "atom": "application/atom+xml",
    "rss": "application/rss+xml",
    "mml": "text/mathml",
    "txt": "text/plain",
    "jad": "text/vnd.sun.j2me.app-descriptor",
    "wml": "text/vnd.wap.wml",
    "htc": "text/x-component",
    "png": "image/png",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "wbmp": "image/vnd.wap.wbmp",
    "ico": "image/x-icon",
    "jng": "image/x-jng",
    "bmp": "image/x-ms-bmp",
    "svg": "image/svg+xml",
    "svgz": "image/svg+xml",
    "webp": "image/webp",
    "woff": "application/font-woff",
    "jar": "application/java-archive",
    "war": "application/java-archive",
    "ear": "application/java-archive",
    "json": "application/json",
    "hqx": "application/mac-binhex40",
    "doc": "application/msword",
    "pdf": "application/pdf",
    "ps": "application/postscript",
    "eps": "application/postscript",
    "ai": "application/postscript",
    "rtf": "application/rtf",
    "m3u8": "application/vnd.apple.mpegurl",
    "xls": "application/vnd.ms-excel",
    "eot": "application/vnd.ms-fontobject",
    "ppt": "application/vnd.ms-powerpoint",
    "wmlc": "application/vnd.wap.wmlc",
    "kml": "application/vnd.google-earth.kml+xml",
    "kmz": "application/vnd.google-earth.kmz",
    "7z": "application/x-7z-compressed",
    "cco": "application/x-cocoa",
    "jardiff": "application/x-java-archive-diff",
    "jnlp": "application/x-java-jnlp-file",
    "run": "application/x-makeself",
    "pl": "application/x-perl",
    "pm": "application/x-perl",
    "prc": "application/x-pilot",
    "pdb": "application/x-pilot",
    "rar": "application/x-rar-compressed",
    "rpm": "application/x-redhat-package-manager",
    "sea": "application/x-sea",
    "swf": "application/x-shockwave-flash",
    "sit": "application/x-stuffit",
    "tcl": "application/x-tcl",
    "tk": "application/x-tcl",
    "der": "application/x-x509-ca-cert",
    "pem": "application/x-x509-ca-cert",
    "crt": "application/x-x509-ca-cert",
    "xpi": "application/x-xpinstall",
    "xhtml": "application/xhtml+xml",
    "xspf": "application/xspf+xml",
    "zip": "application/zip",
    "bin": "application/octet-stream",
    "exe": "application/octet-stream",
    "dll": "application/octet-stream",
    "deb": "application/octet-stream",
    "dmg": "application/octet-stream",
    "iso": "application/octet-stream",
    "img": "application/octet-stream",
    "msi": "application/octet-stream",
    "msp": "application/octet-stream",
    "msm": "application/octet-stream",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "mid": "audio/midi",
    "midi": "audio/midi",
    "kar": "audio/midi",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "m4a": "audio/x-m4a",
    "ra": "audio/x-realaudio",
    "3gpp": "video/3gpp",
    "3gp": "video/3gpp",
    "ts": "video/mp2t",
    "mp4": "video/mp4",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mov": "video/quicktime",
    "webm": "video/webm",
    "flv": "video/x-flv",
    "m4v": "video/x-m4v",
    "mng": "video/x-mng",
    "asx": "video/x-ms-asf",
    "asf": "video/x-ms-asf",
    "wmv": "video/x-ms-wmv",
    "avi": "video/x-msvideo"
  ]
  
  let DEFAULT_MIME_TYPE = "application/octet-stream"
  
  override init() {
    super.init()
   
    EventEmitter.sharedInstance.registerEventEmitter(eventEmitter: self)
    NotificationCenter.default.addObserver(self, selector: #selector(handleImagesUpdated(_:)), name: NSNotification.Name("ImagesUpdated"), object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(handleVideo(_:)), name: NSNotification.Name("videos"), object: nil)
    NotificationCenter.default.addObserver(self, selector: #selector(hendleEvent(_:)), name: NSNotification.Name("fireEvent"), object: nil)
    
    NotificationCenter.default.addObserver(self, selector: #selector(status(_:)), name: NSNotification.Name("status"), object: nil)
    
  }
  
  @objc open override func supportedEvents() -> [String] {
    return EventEmitter.sharedInstance.allEvents
  }
  
     deinit {
         NotificationCenter.default.removeObserver(self)
     }

     @objc func handleImagesUpdated(_ notification: Notification) {
     
         if let userInfo = notification.userInfo, let originalImages = userInfo["originalImages"] as? Array<Dictionary<String,Any>>, let smallImages = userInfo["smallImages"] as? Array<Dictionary<String,Any>>{
             // Do something with the received images
           NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
             "name": "Notification of images is called the length of array in that Notification",
             "data": originalImages.count
           ] ]])
           self.sendDataToJS(withName: "sendDataToJS", body: [originalImages])
             print("Received images: \(originalImages)")
         }
     }
  
  
  @objc func handleVideo(_ notification: Notification) {
      if let userInfo = notification.userInfo, let videoData = userInfo["data"] as? Array<Dictionary<String,Any>>{
          // Do something with the received images
       print(videoData)
        self.video(withName: "video", body: videoData)
         
      }
  }
  
  @objc func hendleEvent(_ notification: Notification) {
      if let userInfo = notification.userInfo, let eventData = userInfo["data"] as? Array<Dictionary<String,Any>>{
        
        print("inside notification" ,eventData)
        self.fireEvent(withName: "fireEvent", body: eventData)
         
      }
    
//    print("here is dict" ,notification.userInfo?["data"])
  }
  
  @objc func status(_ notification: Notification) {
    print("in Status block")
      if let userInfo = notification.userInfo, let eventData = userInfo["data"] as? Dictionary<String,Any>{
        print("in Status block" ,eventData)
        self.status(withName: "status", body: eventData)
      }
    
//    print("here is dict" ,notification.userInfo?["data"])
  }
  
  @objc func pickImageWithCompletion()  {
    
    var configuration =   PHPickerConfiguration(photoLibrary: .shared())
    configuration.filter = .images
    configuration.selectionLimit = 100
    configuration.preferredAssetRepresentationMode = .current
    
    DispatchQueue.main.asyncAfter(deadline: .now(), execute: {
      if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
         let rootViewController = windowScene.windows.first?.rootViewController {
        let picker = PHPickerViewController(configuration: configuration)
        picker.delegate = self
        rootViewController.present(picker, animated: true, completion: nil)
      } else {
        // Handle the case where rootViewController is nil
        print("Error: Unable to access rootViewController")
      }
    })
  }
  
//  
  @objc(openPicker:token:additionalOptions:)
  func openPicker(_ collectionData:Dictionary<String,Any>,_ token:NSString,additionalOptions: Dictionary<String,Any>)  {
 
//  @objc func openPicker(_ collectionData: String){
    print(collectionData,"here is data")
    print(token,"here is data")
    print(additionalOptions,"here is data")
    let parameters: PickerParameters = (collectionData: collectionData, token: token as String, additionalOptions: additionalOptions)
    DispatchQueue.main.async {
      if let keyWindowScene = UIApplication.shared.connectedScenes
          .filter({ $0.activationState == .foregroundActive })
          .compactMap({ $0 as? UIWindowScene })
          .first {
          let storyboard = UIStoryboard(name: "Main2", bundle: nil)
          if let firstViewController = storyboard.instantiateViewController(withIdentifier: "PhotoAlbumsViewController") as? PhotoAlbumsViewController {
            firstViewController.pickerParameters = parameters
              firstViewController.modalPresentationStyle = .fullScreen // Set full
                     firstViewController.modalTransitionStyle = .coverVertical //
              let rootViewController = keyWindowScene.windows.first?.rootViewController
                        
              rootViewController?.present(firstViewController, animated: true, completion: nil)
          }
      }
    }

    
  }
  
  
 @objc func cancelUploading(){
   NotificationCenter.default.post(name: NSNotification.Name("cancel"), object: self, userInfo: ["data":[]])
  }
  
  @objc(openVideoPicker:token:additionalOptions:)
  func openVideoPicker(_ collectionData:Dictionary<String,Any>,_ token:NSString,additionalOptions: Dictionary<String,Any>)  {
//  @objc func openVideoPicker()  {
    let parameters: PickerParameters = (collectionData: collectionData, token: token as String, additionalOptions: additionalOptions)
    DispatchQueue.main.async {
      if let keyWindowScene = UIApplication.shared.connectedScenes
          .filter({ $0.activationState == .foregroundActive })
          .compactMap({ $0 as? UIWindowScene })
          .first {
          let storyboard = UIStoryboard(name: "Main2", bundle: nil)
          if let firstViewController = storyboard.instantiateViewController(withIdentifier: "VideoAlbumViewController") as? VideoAlbumViewController {
            firstViewController.pickerParameters = parameters
              firstViewController.modalPresentationStyle = .fullScreen // Set full
                     firstViewController.modalTransitionStyle = .coverVertical //
              let rootViewController = keyWindowScene.windows.first?.rootViewController
                        
              rootViewController?.present(firstViewController, animated: true, completion: nil)
          }
      }
    }

    
  }
  
//  @objc func  openCreateLibrary(_ data:Dictionary<String,Any>){
// 
//  }
  
  
  
  @objc(openCreateLibrary:token:additionalOptions:)
  func openCreateLibrary(_ collectionData:Dictionary<String,Any>,_ token:NSString,additionalOptions: Dictionary<String,Any>)  {
    
    print(additionalOptions, "opencreatelibrary")
    let parameters: PickerParameters = (collectionData: collectionData, token: token as String, additionalOptions: additionalOptions)
    debugPrint(additionalOptions, "opencreatelibraryParamerter pasing")
    DispatchQueue.main.async {
      if let keyWindowScene = UIApplication.shared.connectedScenes
          .filter({ $0.activationState == .foregroundActive })
          .compactMap({ $0 as? UIWindowScene })
          .first {
          let storyboard = UIStoryboard(name: "Main2", bundle: nil)
          if let firstViewController = storyboard.instantiateViewController(withIdentifier: "CreateCollectionLibrary") as? CreateCollectionLibrary {
            firstViewController.pickerParameters = parameters
              firstViewController.modalPresentationStyle = .fullScreen // Set full
                     firstViewController.modalTransitionStyle = .coverVertical //
              let rootViewController = keyWindowScene.windows.first?.rootViewController
                      
              rootViewController?.present(firstViewController, animated: true, completion: nil)
          }
      }
    }

    
  }
  @objc(editCollectionGallery:token:additionalOptions:)
 func editCollectionGallery(_ collectionId:String,_ token:String,_ additionalOptions: Dictionary<String,Any>){
    print(collectionId)
   print(token)
   let parameters: PickerParameters = (collectionData: [:], token: "", additionalOptions: additionalOptions)
   return
   
    DispatchQueue.main.async {
      if let keyWindowScene = UIApplication.shared.connectedScenes
          .filter({ $0.activationState == .foregroundActive })
          .compactMap({ $0 as? UIWindowScene })
          .first {
          let storyboard = UIStoryboard(name: "Main2", bundle: nil)
          if let firstViewController = storyboard.instantiateViewController(withIdentifier: "EditCollectionLibrary") as? EditCollectionLibrary {
            firstViewController.collectionID = collectionId
            firstViewController.token = token
            firstViewController.pickerParameters = parameters
              firstViewController.modalPresentationStyle = .fullScreen // Set full
                     firstViewController.modalTransitionStyle = .coverVertical //
              let rootViewController = keyWindowScene.windows.first?.rootViewController
                      
              rootViewController?.present(firstViewController, animated: true, completion: nil)
          }
      }
    }
  }
  
  
  func pickVideo() {
    let imagePickerController = UIImagePickerController()
    imagePickerController.sourceType = .photoLibrary
    imagePickerController.mediaTypes = [UTType.movie.identifier as String]
    imagePickerController.delegate = self
    
    presentingViewController?.present(imagePickerController, animated: true, completion: nil)
    dispatchGroup.notify(queue: .main) {
      print("exit function")
      
      
    }
  }
  
  func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
    guard let mediaType = info[.mediaType] as? String, mediaType == UTType.movie.identifier as String else {
      return
    }
    
    if let videoURL = info[.mediaURL] as? URL {
      handlePickedVideo(videoURL)
    }
    
    picker.dismiss(animated: true, completion: nil)
  }
  func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true, completion: nil)
  }
  
  // MARK: - Helper Methods
  
  func handlePickedVideo(_ videoURL: URL) {
    
    print("Video URL: \(videoURL)")
    
    
  }
  
  func fileSizeAtURL(_ url: URL) -> Int64 {
    do {
      let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
      if let fileSize = attributes[FileAttributeKey.size] as? Int64 {
        return fileSize
      }
    } catch {
      print("Error getting file size: \(error.localizedDescription)")
    }
    return 0
  }
  
  func videoDurationAtURL(_ url: URL) -> TimeInterval {
    let asset = AVAsset(url: url)
    return CMTimeGetSeconds(asset.duration)
  }
  
  func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
    picker.dismiss(animated: true, completion: nil)
    resultCount = results.count
    // Set up a dispatch group to wait for all tasks to complete
    
    
    if results != []{
      picker.dismiss(animated: true, completion: nil)
      print("result",results)
      let concurrentQueue = DispatchQueue(label: "concurrentQueue", attributes: .concurrent)
      
      print("resultcount\(results.count)")
      
      selectedItems = []
      dispatchGroup.enter()
      
  
      concurrentQueue.async {
        for result in results {
          autoreleasepool {
            let types = result.itemProvider.registeredTypeIdentifiers
            print("Types:", types)
            if result.itemProvider.hasItemConformingToTypeIdentifier(UTType.movie.identifier) {
              self.dealWithVideo(result)
            } else if result.itemProvider.canLoadObject(ofClass: PHLivePhoto.self) {
              self.dealWithLivePhoto(result)
            } else if result.itemProvider.canLoadObject(ofClass: UIImage.self) {
              self.dealWithImage(result)
            }else{
              print("unsoported file",types)
            }
          }

        }
        
        do { self.dispatchGroup.leave() }
      }
      dispatchGroup.notify(queue: .main) {
        
        print("exit function")
        
        
      }
    }else{
      self.sendDataToJS(withName: "sendDataToJS", body: [])
      
      print("@@@@@@@ NO IMAGE IS SELECTED @@@@@@@")
      
    }
    
  }
  
  func sendDataToJS(withName: String, body: Array<Array<Dictionary<String,Any>>>){
    EventEmitter.sharedInstance.dispatch(name: withName, body: body)
  }

  func video(withName: String, body: Array<Dictionary<String,Any>>){
    EventEmitter.sharedInstance.sendVideo(name: withName, body: body)
  }
  
  func fireEvent(withName: String, body: Array<Dictionary<String,Any>>){
    EventEmitter.sharedInstance.fireEvent(name: withName, body: body)
  }
  func status(withName: String, body: Dictionary<String,Any>){
    EventEmitter.sharedInstance.status(name: withName, body: body)
  }
  
  func dealWithVideo(_ result: PHPickerResult) {
    let prov = result.itemProvider
    
    
    prov.loadFileRepresentation(forTypeIdentifier: "public.movie") { [weak self] url, err in
      if let err =  err {
        print("DEAL WITH VIDEO ERR==> \(err.localizedDescription)")
      }
      if let url = url {
        
        let fileName = "\(Int(Date().timeIntervalSince1970)).\(url.pathExtension)"
        // create new URL
        let newUrl = URL(fileURLWithPath: NSTemporaryDirectory() + fileName)
        // copy item to APP Storage
        try? FileManager.default.copyItem(at: url, to: newUrl)
        print("videoURL==> \(newUrl.absoluteString)")
        
        DispatchQueue.main.async {
          
//          if(self?.selectedItems.count == self?.resultCount){
            if let weakSelf = self{
              print("seleceditme", weakSelf.selectedItems)
              //              self?.sendDataToJS(withName: "sendDataToJS", body: weakSelf.selectedItems)
            }
            
//          }
          
        }
      }
    }
    
    
  }
  
  func dealWithLivePhoto(_ result: PHPickerResult) {
    
    
    let prov = result.itemProvider
    
    prov.loadObject(ofClass: PHLivePhoto.self) { [weak self] livePhoto, err in
      
      
      autoreleasepool {
        
    
      if let err =  err {
        print("DEAL WITH LivePhoto ERR==> \(err.localizedDescription)")
      }
      if let weakself = self {
        if let photo = livePhoto as? PHLivePhoto{
          
          
          let resources = PHAssetResource.assetResources(for: photo)
          let photo = resources.first(where: { $0.type == .photo })!
          let imageData = NSMutableData()
          
          PHAssetResourceManager.default().requestData(for: photo, options: nil, dataReceivedHandler: { data in
            imageData.append(data)
          }, completionHandler: { error in
            let liveimg = UIImage(data: imageData as Data)!
            if let imageData = liveimg.jpegData(compressionQuality: 5.0),
               let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
              
              let fileName = "liveimage_\(Date().timeIntervalSince1970).jpg"
              let filePath = documentsDirectory.appendingPathComponent(fileName)
              
              let fileNameWithoutExtension = filePath.deletingPathExtension().lastPathComponent
              let fileExtension = filePath.pathExtension
              let mimetype = weakself.MimeType(ext: fileExtension)
              
              
              
              do {
                try imageData.write(to: filePath)
                
                
                let dict: Dictionary<String,Any> = [
                  "name": fileNameWithoutExtension,
                  "uri": filePath.absoluteString,
                  "type": mimetype
                ]
//                 Add the file path to the array
                self?.selectedItems.append(dict)
                
                
                if(self?.selectedItems.count == self?.resultCount){
                  if let weakSelf = self{
                    print("seleceditme", weakSelf.selectedItems)
//                    self?.sendDataToJS(withName: "sendDataToJS", body: weakSelf.selectedItems)
                  }
                  
                  
                }
              } catch {
                print("Error writing compressed image to file: \(error)")
              }
            }
            
          })
          
          
          DispatchQueue.main.async {
            
            
            
          }
        }
      }
      
    }
  }
    
    
  }
  
  func dealWithImage(_ result: PHPickerResult) {
    
    
    let prov = result.itemProvider
    
    prov.loadObject(ofClass: UIImage.self) { [weak self] image, err in
      autoreleasepool {
        
      
      if let err =  err {
        print("DEAL WITH Image ERR==> \(err.localizedDescription)")
      }
      if let weakself = self{
        
        if let image = image as? UIImage {
          let compressedImage = weakself.compressImage(image)
          
          // Get the document directory
          if let imageData = compressedImage?.jpegData(compressionQuality: 1.0),
             let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            
            let fileName = "compressedImage_\(Date().timeIntervalSince1970).jpg"
            let filePath = documentsDirectory.appendingPathComponent(fileName)
            
            let fileNameWithoutExtension = filePath.deletingPathExtension().lastPathComponent
            let fileExtension = filePath.pathExtension
            
            
            let mimetype = weakself.MimeType(ext: fileExtension)
            
            
            do {
              try imageData.write(to: filePath)
              
              let dict: Dictionary<String,Any> = [
                "name": fileNameWithoutExtension,
                "uri": filePath.absoluteString,
                "type": mimetype
              ]
              
              self?.selectedItems.append(dict)
              if(self?.selectedItems.count == self?.resultCount){
                if let weakSelf = self{
                  print("seleceditem", weakSelf.selectedItems)
                  
//                  self?.sendDataToJS(withName: "sendDataToJS", body: weakSelf.selectedItems)
                  
                  
                }
                
//                self?.sendDataToJS(withName: "sendDataToJS", body: weakself.selectedItems)
              }
            } catch {
              print("Error writing compressed image to file: \(error)")
            }
          }
          
          DispatchQueue.main.async {
            // Handle the image as needed
            
            
          }
        }
      }
      
    }
  }
    
    
  }
  
  func MimeType(ext: String?) -> String {
    let lowercase_ext: String = ext!.lowercased()
    if ext != nil && mimeTypes.contains(where: { $0.0 == lowercase_ext }) {
      return mimeTypes[lowercase_ext]!
    }
    return DEFAULT_MIME_TYPE
  }
  
  fileprivate func compressImage(_ image: UIImage) -> UIImage? {
    guard let imageData = image.jpegData(compressionQuality: 0.5) else {
      return nil
    }
    
    return UIImage(data: imageData)
  }
  
  
}
