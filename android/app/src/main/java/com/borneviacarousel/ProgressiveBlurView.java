package com.borneviacarousel;

import android.content.Context;
import android.graphics.RenderEffect;
import android.graphics.RuntimeShader;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.facebook.react.views.view.ReactViewGroup;

/**
 * A container whose own content is blurred progressively towards its top and/or bottom
 * edge (strongest at the edge, zero further in) — the "scroll edge" effect.
 *
 * Implemented as a GPU RenderEffect on this view: two chained AGSL passes (horizontal +
 * vertical) of a Gaussian whose radius depends on the pixel's distance from the edge.
 * Because only this view's content is blurred, headers / buttons drawn on top of it stay
 * sharp. Requires Android 13 (API 33, RuntimeShader); older versions render unblurred.
 */
public class ProgressiveBlurView extends ReactViewGroup {
  private static final String TAG = "ProgressiveBlurView";

  // Variable-radius 1D Gaussian. `dir` = (1,0) for the horizontal pass, (0,1) vertical.
  private static final String SHADER =
      "uniform shader content;\n"
          + "uniform float width;\n"
          + "uniform float height;\n"
          + "uniform float topH;\n"
          + "uniform float bottomH;\n"
          + "uniform float maxR;\n"
          + "uniform float2 dir;\n"
          + "float radiusAt(float y) {\n"
          + "  float t = 0.0;\n"
          + "  if (topH > 0.0 && y < topH) { t = 1.0 - y / topH; }\n"
          + "  else if (bottomH > 0.0 && y > height - bottomH) { t = (y - (height - bottomH)) / bottomH; }\n"
          + "  t = clamp(t, 0.0, 1.0);\n"
          + "  return maxR * t * t * (3.0 - 2.0 * t);\n" // smoothstep easing
          + "}\n"
          + "half4 main(float2 p) {\n"
          + "  float r = radiusAt(p.y);\n"
          + "  if (r < 0.5) { return content.eval(p); }\n"
          + "  float4 sum = float4(0.0);\n"
          + "  float wsum = 0.0;\n"
          + "  for (int i = -8; i <= 8; i++) {\n"
          + "    float fi = float(i);\n"
          + "    float w = exp(-(fi * fi) / 24.0);\n"
          + "    float2 q = p + dir * fi * (r / 8.0);\n"
          + "    q = clamp(q, float2(0.5, 0.5), float2(width - 0.5, height - 0.5));\n"
          + "    sum += float4(content.eval(q)) * w;\n"
          + "    wsum += w;\n"
          + "  }\n"
          + "  return half4(sum / wsum);\n"
          + "}\n";

  private float topDp = 0f;
  private float bottomDp = 0f;
  private float radiusDp = 14f;
  private boolean failed = false;

  public ProgressiveBlurView(Context context) {
    super(context);
  }

  public void setTopHeight(float dp) {
    topDp = dp;
    updateEffect();
  }

  public void setBottomHeight(float dp) {
    bottomDp = dp;
    updateEffect();
  }

  public void setMaxRadius(float dp) {
    radiusDp = dp;
    updateEffect();
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);
    updateEffect();
  }

  private void updateEffect() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || failed) return;
    applyEffect();
  }

  @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
  private void applyEffect() {
    int w = getWidth();
    int h = getHeight();
    if (w == 0 || h == 0) return;
    if ((topDp <= 0 && bottomDp <= 0) || radiusDp <= 0) {
      setRenderEffect(null);
      return;
    }
    try {
      float d = getResources().getDisplayMetrics().density;
      RenderEffect horizontal = RenderEffect.createRuntimeShaderEffect(makeShader(w, h, d, 1f, 0f), "content");
      RenderEffect vertical = RenderEffect.createRuntimeShaderEffect(makeShader(w, h, d, 0f, 1f), "content");
      setRenderEffect(RenderEffect.createChainEffect(vertical, horizontal));
    } catch (Throwable t) {
      // Never crash the app over a visual effect: fall back to no blur.
      failed = true;
      Log.w(TAG, "Progressive blur unavailable", t);
      setRenderEffect(null);
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
  private RuntimeShader makeShader(int w, int h, float density, float dx, float dy) {
    RuntimeShader shader = new RuntimeShader(SHADER);
    shader.setFloatUniform("width", w);
    shader.setFloatUniform("height", h);
    shader.setFloatUniform("topH", topDp * density);
    shader.setFloatUniform("bottomH", bottomDp * density);
    shader.setFloatUniform("maxR", radiusDp * density);
    shader.setFloatUniform("dir", dx, dy);
    return shader;
  }
}
