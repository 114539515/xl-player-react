import React, { useRef, useEffect } from 'react'
import VideoEvent from './event'
import { getVideoType, createFlvPlayer, createHlsPlayer } from './util'
import ContrallerBar from './contraller_bar'
import ContrallerEvent from './event/contrallerEvent'
import VideoMessage, { NoSource } from './message'
import TimeLine from './time_line'
import ErrorEvent from './event/errorEvent'
import DragEvent from './event/dragEvent'
import Api from './api'
import LiveHeart from './live_heart'
import PropTypes from 'prop-types'
import './style/index.less'

function SinglePlayer({ type, file, className, autoPlay, muted, poster, playsinline, loop, preload, onInitPlayer, ...props }) {
  const playContainerRef = useRef(null)
  const [playerObj, setPlayerObj] = useRef({})
  useEffect(() => {
    if (!file) {
      return
    }
    const playerObject = {
      playContainer: playContainerRef.current,
      video: playContainerRef.current.querySelector('video')
    }
    const formartType = getVideoType(file)
    if (formartType === 'flv' || type === 'flv') {
      playerObject.flv = createFlvPlayer(playerObject.video, props)
      return
    }
    if (formartType === 'm3u8' || type === 'hls') {
      playerObject.hls = createHlsPlayer(playerObject.video, file)
      return
    }
    playerObject.video.src = file
    playerObj.event = new VideoEvent(playerObject.video)
    playerObj.api = new Api(playerObject)
    setPlayerObj(playerObj)

    if (onInitPlayer) {
      onInitPlayer(Object.assign({}, playerObj.api.getApi(), playerObj.event.getApi()))
    }
  }, [file])

  return (
    <div className={`lm-player-container ${className}`} ref={playContainerRef}>
      <div className="player-mask-layout">
        <video autoPlay={autoPlay} preload={preload} muted={muted} poster={poster} controls={false} playsInline={playsinline} loop={loop} />
      </div>
      <VideoTools
        playerObj={playerObj}
        isLive={props.isLive}
        hideContrallerBar={props.hideContrallerBar}
        scale={props.scale}
        snapshot={props.snapshot}
        leftExtContents={props.leftExtContents}
        leftMidExtContents={props.leftMidExtContents}
        rightExtContents={props.rightExtContents}
        rightMidExtContents={props.rightMidExtContents}
        draggable={props.draggable}
      />
      {this.props.children}
    </div>
  )
}

function VideoTools({ playerObj, draggable, isLive, hideContrallerBar, scale, snapshot, leftExtContents, leftMidExtContents, rightExtContents, rightMidExtContents }) {
  if (!playerObj) {
    return <NoSource />
  }
  return (
    <>
      <VideoMessage api={playerObj.api} event={playerObj.event} />
      {draggable && <DragEvent playContainer={playerObj.playContainer} api={playerObj.api} />}
      {!hideContrallerBar && (
        <ContrallerEvent event={playerObj.event} playContainer={playerObj.playContainer}>
          <ContrallerBar
            api={playerObj.api}
            event={playerObj.event}
            playContainer={playerObj.playContainer}
            video={playerObj.video}
            snapshot={snapshot}
            rightExtContents={rightExtContents}
            rightMidExtContents={rightMidExtContents}
            scale={scale}
            isHistory={false}
            isLive={isLive}
            leftExtContents={leftExtContents}
            leftMidExtContents={leftMidExtContents}
          />
          {!isLive && <TimeLine />}
        </ContrallerEvent>
      )}
      <ErrorEvent flvPlayer={this.flv} hlsPlayer={this.hls} />
      {isLive && <LiveHeart key={this.props.file} />}
    </>
  )
}

SinglePlayer.propTypes = {
  file: PropTypes.string.isRequired, //播放地址 必填
  isLive: PropTypes.bool, //是否实时视频
  errorReloadTimer: PropTypes.number, //视频错误重连次数
  type: PropTypes.oneOf(['flv', 'hls', 'native']), //强制视频流类型
  onInitPlayer: PropTypes.func,
  draggable: PropTypes.bool,
  hideContrallerBar: PropTypes.bool,
  scale: PropTypes.bool,
  muted: PropTypes.string,
  autoPlay: PropTypes.bool,
  playsInline: PropTypes.bool,
  preload: PropTypes.string,
  poster: PropTypes.string,
  loop: PropTypes.bool,
  snapshot: PropTypes.func,
  className: PropTypes.string,
  playsinline: PropTypes.bool,
  children: PropTypes.any
}
SinglePlayer.defaultProps = {
  isLive: true,
  draggable: true,
  scale: true,
  errorReloadTimer: 5,
  muted: 'muted',
  autoPlay: true,
  playsInline: false,
  preload: 'auto',
  loop: false,
  hideContrallerBar: false
}

export default SinglePlayer
