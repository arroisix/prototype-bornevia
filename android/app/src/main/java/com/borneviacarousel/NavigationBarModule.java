package com.borneviacarousel;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NavigationBarModule extends ReactContextBaseJavaModule {
    public NavigationBarModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NavigationBarModule";
    }

    @ReactMethod
    public void setLightNavigationBar(boolean isLight) {
        MainActivity activity = MainActivity.getInstance();
        if (activity != null) {
            activity.setNavigationBarLight(isLight);
        }
    }
}
