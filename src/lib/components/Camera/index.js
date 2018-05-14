import React from 'react';
import PropTypes from 'prop-types';

import LibCameraPhoto from 'jslib-html5-camera-photo';
import CircleButton from '../CircleButton';
// import click from './data/click.base64.json';

// import StopStartButton from '../StopStartButton';

import './styles/camera.css';

/*
Inspiration : https://www.html5rocks.com/en/tutorials/getusermedia/intro/
*/
class Camera extends React.Component {
  constructor (props, context) {
    super(props, context);
    this.libCameraPhoto = null;
    this.videoRef = React.createRef();
    this.state = {
      dataUri: '',
      isShowVideo: true,
      isCameraStarted: false
    };
  }

  componentDidMount () {
    this.libCameraPhoto = new LibCameraPhoto(this.videoRef.current);
    const {idealFacingMode, idealResolution, isMaxResolution} = this.props;
    if (isMaxResolution) {
      this.startCameraMaxResolution(idealFacingMode);
    } else {
      this.startCameraIdealResolution(idealFacingMode, idealResolution);
    }
  }

  startCamera (promiseStartCamera) {
    promiseStartCamera
      .then((stream) => {
        this.setState({isCameraStarted: true});
        if (this.props.onCameraStart) {
          this.props.onCameraStart(stream);
        }
      })
      .catch((error) => {
        this.props.onCameraError(error);
      });
  }

  startCameraIdealResolution (idealFacingMode, idealResolution) {
    let promiseStartCamera =
        this.libCameraPhoto.startCamera(idealFacingMode, idealResolution);
    this.startCamera(promiseStartCamera);
  }

  startCameraMaxResolution (idealFacingMode) {
    let promiseStartCamera =
        this.libCameraPhoto.startCameraMaxResolution(idealFacingMode);
    this.startCamera(promiseStartCamera);
  }

  stopCamera () {
    this.libCameraPhoto.stopCamera()
      .then(() => {
        this.setState({isCameraStarted: false});
        if (this.props.onCameraStop) {
          this.props.onCameraStop();
        }
      })
      .catch((error) => {
        this.props.onCameraError(error);
      });
  }

  getShowHideStyle (isDisplay) {
    let displayStyle = isDisplay
      ? {display: 'inline-block'}
      : {display: 'none'};

    return displayStyle;
  }

  playClickAudio () {
    // let clickBinary = window.atob(click.base64);
    // console.log('clickBinary', clickBinary);
    // decode base64 to binary
    // pass it to Audio
    let audio = new Audio('click.mp3');
    audio.play();
  }

  takePhoto () {
    this.playClickAudio();
    let dataUri = this.libCameraPhoto.getDataUri(this.props.sizeFactor);
    this.props.onTakePhoto(dataUri);
    this.setState({
      dataUri,
      isShowVideo: false
    });
    setTimeout(() => {
      this.setState({
        isShowVideo: true
      });
    }, 900);
  }

  renderCircleButton (isVisible) {
    return (
      <CircleButton
        isClicked={!this.state.isShowVideo}
        onClick={() => this.takePhoto()}
      />
    );
  }

  renderFlashWhiteDiv (isShowVideo) {
    const flashDoTransition = isShowVideo ? '' : 'do-transition';
    const flashClasses = `${flashDoTransition} normal`;
    return (
      <div className={flashClasses}>
      </div>
    );
  }

  render () {
    let showHideVideoStyle = this.getShowHideStyle(this.state.isShowVideo);
    let showHideImgStyle = this.getShowHideStyle(!this.state.isShowVideo);

    return (
      <div className="react-html5-camera-photo">
        {this.renderFlashWhiteDiv(this.state.isShowVideo)}
        <img
          style = {showHideImgStyle}
          alt="camera"
          src={this.state.dataUri}
        />
        <video
          style = {showHideVideoStyle}
          ref={this.videoRef}
          autoPlay="true"
        />
        {this.renderCircleButton()}
      </div>
    );
  }
}

/*
<StopStartButton
  isOpen={this.state.isCameraStarted}
  onClickStart={() => {
    this.startCamera(idealFacingMode, idealResolution);
  }}

  onClickStop={() => {
    this.stopCamera();
  }}
/>
*/
export default Camera;

Camera.propTypes = {
  onTakePhoto: PropTypes.func.isRequired,
  onCameraError: PropTypes.func,
  idealFacingMode: PropTypes.string,
  idealResolution: PropTypes.object,
  isMaxResolution: PropTypes.bool,
  sizeFactor: PropTypes.number,
  onCameraStart: PropTypes.func,
  onCameraStop: PropTypes.func
};