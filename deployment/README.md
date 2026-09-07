# Model Deployment Folder

Place your trained Keras SavedModel or `.keras` file in this directory with the filename:
`deployment/model.keras`

The application loads the model at runtime using:
```python
import tensorflow as tf
model = tf.keras.models.load_model("deployment/model.keras")
```

The runtime configuration in `config.json` specifies:
- `backbone_name`: "ResNet50"
- `img_size`: 224 (RGB image resized to 224x224x3, pixel values 0-255)
- `final_threshold`: 0.42 (Classification threshold for anemia screening)
- `hb_mean`: 10.8 (Baseline Hb mean for unscaling)
- `hb_std`: 2.1 (Baseline Hb standard deviation for unscaling)
- `use_hybrid`: false (If true, passes a 6-float CIELAB color feature vector [L.mean, A.mean, B.mean, L.std, A.std, B.std])
