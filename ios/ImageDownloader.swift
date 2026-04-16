
import Foundation
import UIKit
import AVFoundation
class ImageDownloader {
    static let shared = ImageDownloader()
    
    private let session: URLSession
    var cache: NSCache<NSString, UIImage> {
        return ImageCacheManager.shared.cache
    }
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.urlCache = nil // Disable URL cache
        session = URLSession(configuration: configuration)
        
    }
    
    func downloadImage(url: String, index: Int, handler: @escaping (UIImage?, Error?) -> Void) {
        let cacheID = NSString(string: url)
        
        if let cachedImage = cache.object(forKey: cacheID) {
            handler(cachedImage, nil)
        } else {
            guard let imageURL = URL(string: url) else {
                handler(nil, NSError(domain: "Invalid URL", code: 0, userInfo: nil))
                return
            }
            
            let task = session.dataTask(with: imageURL) { [weak self] (data, response, error) in
                guard let self = self else { return }
                
                if let data = data, let image = UIImage(data: data) {
                    self.cache.setObject(image, forKey: cacheID)
                    handler(image, nil)
                } else {
                    handler(nil, error)
                }
            }
            task.resume()
        }
    }
  
  
  func downloadImage2(url: String, index: Int, media_type:String, handler: @escaping (UIImage?, Error?) -> Void) {
    let cacheID = NSString(string: url.replacingOccurrences(of: "https://d1ibgiujerad7s.cloudfront.net/", with: ""))
    print(cacheID,"cacheid in download")
      if let cachedImage = cache.object(forKey: cacheID) {
        print("getting image from cache")
          handler(cachedImage, nil)
      } else {
        if media_type == "video"{
          guard let videoUrl = URL(string: url) else {
              handler(nil, NSError(domain: "Invalid URL", code: 0, userInfo: nil))
              return
          }
          getThumbnailFromVideoURL(url: videoUrl) { image in
            if let image = image{
              print("getting video image from download")
              self.cache.setObject(image, forKey: cacheID)
              handler(image, nil)
            }
            else {
               handler(nil, nil)
           }
          }
        }
        
        else{
          guard let imageURL = URL(string: url) else {
              handler(nil, NSError(domain: "Invalid URL", code: 0, userInfo: nil))
              return
          }
          
          let task = session.dataTask(with: imageURL) { [weak self] (data, response, error) in
              guard let self = self else { return }
              
              if let data = data, let image = UIImage(data: data) {
                print("getting image from download")
                  self.cache.setObject(image, forKey: cacheID)
                  handler(image, nil)
              } else {
                  handler(nil, error)
              }
          }
          task.resume()
        }
        
        
         
      }
  }
    
    func downloadImagesWithArray(urls: [String], completion: @escaping (Bool?, Error?) -> Void) {
       
        let group = DispatchGroup()

        for url in urls {
            let cacheID = NSString(string: url)
            group.enter()
            if let cachedImage = cache.object(forKey: cacheID) {
                defer{
                    group.leave()
                }
                print("efgrerbgvsrgtb")
             
            }else{
                print("demooooyyyy")
                guard let imageURL = URL(string: "https://d1ibgiujerad7s.cloudfront.net/\(url)") else {
                    group.leave()
                    return
                }
                let task = session.dataTask(with: imageURL) { [weak self] (data, response, error) in
                    guard let self = self else { return }
                    defer{
                        group.leave()
                    }
                    if let data = data, let image = UIImage(data: data) {
                        self.cache.setObject(image, forKey: cacheID)
                    
                    }
                }
                task.resume()
            }

        }

        group.notify(queue: .main) {
            completion(true, nil)
        }
    }
  
  func downloadImagesWithArray2(urls: [Dictionary<String,String>], completion: @escaping (Bool?, Error?) -> Void) {
     
      let group = DispatchGroup()

      for url in urls {
        let actualUrl = url["url"] ?? ""
        
          let cacheID = NSString(string: actualUrl)
          group.enter()
          if let cachedImage = cache.object(forKey: cacheID) {
              defer{
                  group.leave()
              }
              print("efgrerbgvsrgtb")
           
          }else{
            
            
            let type = url["media_Type"] ?? ""
            if type == "video"{
              guard let videoUrl = URL(string: "https://d1ibgiujerad7s.cloudfront.net/\(actualUrl)") else {
                  group.leave()
                  return
              }
              print(videoUrl,"inside video")
              getThumbnailFromVideoURL(url: videoUrl) { image in
                if let image = image{
                  
                  self.cache.setObject(image, forKey: cacheID)
                  print(videoUrl,cacheID," cache id also video obtaineed and set to cache")
                  group.leave()
                }
                else{
                  print("video not obtaineed and not set to cache")
                  group.leave()
                }
              }
              
              
            }
            else{
              print("demooooyyyy")
              guard let imageURL = URL(string: "https://d1ibgiujerad7s.cloudfront.net/\(actualUrl)") else {
                  group.leave()
                  return
              }
              let task = session.dataTask(with: imageURL) { [weak self] (data, response, error) in
                  guard let self = self else { return }
                  defer{
                      group.leave()
                  }
                  if let data = data, let image = UIImage(data: data) {
                    print(cacheID,"for image cache id is ")
                      self.cache.setObject(image, forKey: cacheID)
                  
                  }
              }
              task.resume()
            }
           
          }

      }

      group.notify(queue: .main) {
        print("completed downloading all ")
          completion(true, nil)
      }
  }

  func getThumbnailFromVideoURL(url: URL, completion: @escaping (UIImage?) -> Void) {
      let asset = AVAsset(url: url)
      let imageGenerator = AVAssetImageGenerator(asset: asset)
      imageGenerator.appliesPreferredTrackTransform = true

      let time = CMTime(seconds: 1, preferredTimescale: 60) // Adjust the time as needed

      imageGenerator.generateCGImagesAsynchronously(forTimes: [NSValue(time: time)]) { _, cgImage, _, _, _ in
          if let cgImage = cgImage {
              let thumbnail = UIImage(cgImage: cgImage)
             completion(thumbnail)
          }
        else{
          completion(nil)
        }
      }
  }
}
