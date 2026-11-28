package com.borneviacarousel;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.activity.BackEventCompat;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
  private static MainActivity instance;
  private WindowInsetsControllerCompat insetsController;

  /**
   * Predictive back (Android 13+, progress on 14+). Enabled from JS only while an in-app
   * screen/sheet is open; progress is forwarded to JS so that screen can preview its exit,
   * and the final back is routed to RN's BackHandler. When disabled, the system's own
   * back-to-home animation runs.
   */
  private final OnBackPressedCallback predictiveBack = new OnBackPressedCallback(false) {
    @Override
    public void handleOnBackStarted(BackEventCompat backEvent) {
      emitBackEvent("predictiveBackStarted", backEvent);
    }

    @Override
    public void handleOnBackProgressed(BackEventCompat backEvent) {
      emitBackEvent("predictiveBackProgress", backEvent);
    }

    @Override
    public void handleOnBackCancelled() {
      emitBackEvent("predictiveBackCancelled", null);
    }

    @Override
    public void handleOnBackPressed() {
      emitBackEvent("predictiveBackInvoked", null);
      ReactInstanceManager manager = getReactNativeHost().getReactInstanceManager();
      if (manager.getCurrentReactContext() != null) {
        manager.onBackPressed(); // -> JS BackHandler ("hardwareBackPress")
      } else {
        setEnabled(false);
        getOnBackPressedDispatcher().onBackPressed();
      }
    }
  };

  @Override
  protected String getMainComponentName() {
    return "BorneviaCarousel";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    instance = this;

    // Enable edge-to-edge display
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    // Make both bars fully transparent
    getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
    getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);

    // Get the insets controller for controlling icon colors
    insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());

    getOnBackPressedDispatcher().addCallback(this, predictiveBack);

    // Default: dark icons for light background (slide 1)
    if (insetsController != null) {
      insetsController.setAppearanceLightNavigationBars(true);
    }
  }

  public void setPredictiveBackEnabled(boolean enabled) {
    // Older Android versions keep using ReactActivity.onBackPressed (no predictive animation).
    final boolean on = enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU;
    runOnUiThread(() -> predictiveBack.setEnabled(on));
  }

  @Override
  public void invokeDefaultOnBackPressed() {
    // JS did not handle back: disable our callback so the system default (finish) runs.
    predictiveBack.setEnabled(false);
    super.invokeDefaultOnBackPressed();
  }

  private void emitBackEvent(String name, BackEventCompat backEvent) {
    ReactContext context = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    if (context == null || !context.hasActiveReactInstance()) return;
    WritableMap map = Arguments.createMap();
    if (backEvent != null) {
      map.putDouble("progress", backEvent.getProgress());
      map.putInt("swipeEdge", backEvent.getSwipeEdge()); // 0 = left, 1 = right
    }
    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(name, map);
  }

  public static MainActivity getInstance() {
    return instance;
  }

  public void setNavigationBarLight(boolean isLight) {
    runOnUiThread(() -> {
      if (insetsController != null) {
        // isLight = true means light background, so we want dark icons
        insetsController.setAppearanceLightNavigationBars(isLight);
      }
    });
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        DefaultNewArchitectureEntryPoint.getFabricEnabled()
    );
  }
}

