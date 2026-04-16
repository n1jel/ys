//
//  EventEmitter.swift
//  YourSeason
//
//  Created by John on 10/01/24.
//

import Foundation
class EventEmitter{

    /// Shared Instance.
    public static var sharedInstance = EventEmitter()

    // ReactNativeEventEmitter is instantiated by React Native with the bridge.
    private static var eventEmitter: Photopicker!

    private init() {}

    // When React Native instantiates the emitter it is registered here.
    func registerEventEmitter(eventEmitter: Photopicker) {
        EventEmitter.eventEmitter = eventEmitter
    }
  
    func dispatch(name: String, body: Array<Array<Dictionary<String,Any>>>) {
      
      EventEmitter.eventEmitter.sendEvent(withName: name, body: body)
    }
  
  func sendVideo(name: String, body: Array<Dictionary<String,Any>>) {
    
    EventEmitter.eventEmitter.sendEvent(withName: name, body: body)
  }
  func fireEvent(name: String, body: Array<Dictionary<String,Any>>) {
    
    EventEmitter.eventEmitter.sendEvent(withName: name, body: body)
  }
  
  func status(name: String, body:Dictionary<String,Any>) {
    
    EventEmitter.eventEmitter.sendEvent(withName: name, body: body)
  }

    /// All Events which must be support by React Native.
    lazy var allEvents: [String] = {
        var allEventNames: [String] = []
        allEventNames.append("sendDataToJS")
      allEventNames.append("video")
      
      allEventNames.append("fireEvent")
      allEventNames.append("status")
      
        return allEventNames
    }()
}
