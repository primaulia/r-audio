import React from 'react';
import { render } from 'react-dom';

import RAudioContext from '../src/base/audio-context.jsx';
import RPipeline from '../src/graph/pipeline.jsx';
import RCycle from '../src/graph/cycle.jsx';

import {
  RGain,
  RDelay,
  RPanner,
  RMediaStreamSource
} from '../src/audio-nodes/index.jsx';

export default class MediaStreamSourceExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = { stream: null };

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => this.setState({ stream }))
      .catch(err => console.log('The following gUM error occured: ' + err));
  }

  render() {
    return this.state.stream ? (
      <RAudioContext debug={true}>
        <RPipeline>
          <RMediaStreamSource stream={this.state.stream} />
          <RCycle>
            <RPipeline>
              <RDelay delayTime={.3} />
              <RGain gain={0} />
            </RPipeline>
          </RCycle>
          <RPanner positionY={0} positionX={0} panningModel="HRTF"/>
        </RPipeline>
      </RAudioContext>
    ) : null;
  }
};
