package com.borneviacarousel;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

/** Exposes ProgressiveBlurView to JS as <ProgressiveBlurView>; supports all View styles. */
public class ProgressiveBlurViewManager extends ReactViewManager {
  public static final String NAME = "ProgressiveBlurView";

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  public ReactViewGroup createViewInstance(@NonNull ThemedReactContext context) {
    return new ProgressiveBlurView(context);
  }

  @ReactProp(name = "topHeight", defaultFloat = 0f)
  public void setTopHeight(ReactViewGroup view, float value) {
    ((ProgressiveBlurView) view).setTopHeight(value);
  }

  @ReactProp(name = "bottomHeight", defaultFloat = 0f)
  public void setBottomHeight(ReactViewGroup view, float value) {
    ((ProgressiveBlurView) view).setBottomHeight(value);
  }

  @ReactProp(name = "maxRadius", defaultFloat = 14f)
  public void setMaxRadius(ReactViewGroup view, float value) {
    ((ProgressiveBlurView) view).setMaxRadius(value);
  }
}
