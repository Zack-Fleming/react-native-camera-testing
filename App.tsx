import { StyleSheet, Text, View, Button, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FaceDeteector from 'expo-face-detector';


export default function App() {

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setImage(photo.uri);
    }
  }

  const savePhoto = async () => {
    if (image) {
      const {status} = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(image);
        alert('Photo saved to camera roll');
      }
      else
      {
        alert('Permission not granted');
      }
    }
  }

  const [faces, setFaces] = useState([]);

  const detectFaces = async () => {
    const options = {
      mode: FaceDeteector.FaceDetectorMode.fast,
      detectLandmarks: FaceDeteector.FaceDetectorLandmarks.all,
      runClassifications: FaceDeteector.FaceDetectorClassifications.all,
    };

    const result = await FaceDeteector.detectFacesAsync(image, options);
    setFaces(result.faces);

    if (result.faces.length > 0) {
      alert(`Detected ${result.faces.length} faces`);
    } else {
      alert('No face detected');
    }
  }

  if (hasPermission === null) {
    return <Text>error: No camera permission</Text>;
  } else if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }


  return (
    <View style={{flex: 1}}>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.fixedRatio}
          type={type}
          ratio={'1:1'}
          ref={ref => setCamera(ref)}
        />
        </View>
        <Button title="Flip Camera" onPress={() => {
          setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          );
        }} />
        <Button title="Take Picture" onPress={takePicture} />
        {image && <Button title="Save Picture" onPress={savePhoto} />}
        {image && <Button title="Detect Faces" onPress={detectFaces} />}
        {image && <Image source={{uri: image}} style={{flex: 1}} />}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
});
