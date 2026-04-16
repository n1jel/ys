
import Foundation

import UIKit

class ImageCacheManager {
    static let shared = ImageCacheManager() // Singleton instance

    let cache = NSCache<NSString, UIImage>()

    private init() {
        // Optional: Configure cache properties here, if needed
        // For example, setting cache limits
        // cache.countLimit = 100
    }
}
