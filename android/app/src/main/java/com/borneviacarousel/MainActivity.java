package com.borneviacarousel;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
  private static MainActivity instance;
  private WindowInsetsControllerCompat insetsController;

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

    // Default: dark icons for light background (slide 1)
    if (insetsController != null) {
      insetsController.setAppearanceLightNavigationBars(true);
    }
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

