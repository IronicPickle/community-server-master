import React, { Component } from "react";
import { Paper, Typography, Theme, withStyles, Toolbar, IconButton, Tooltip, Slider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import ReplayIcon from "@material-ui/icons/Replay";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import FullscreenIcon from "@material-ui/icons/Fullscreen";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(1),
    height: 50,
    padding: 0
  }, toolbar: {
    minHeight: 50,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1)
  }, button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }, seekSlider: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }, volumeSlider: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    maxWidth: 100
  }, trackPosition: {
    whiteSpace: "nowrap" as "nowrap",
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }, volumePosition: {
    whiteSpace: "nowrap" as "nowrap",
    width: 40,
    textAlign: "center" as "center",
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
  parent: any;
}

class ControlsContainer extends Component<PropsI> {
  static contextType = GlobalContext;

  constructor(props: Readonly<PropsI>) {
    super(props);

    this.onSkip = this.onSkip.bind(this);
    this.onRestart = this.onRestart.bind(this);
    this.onSeek = this.onSeek.bind(this);
    this.onVolume = this.onVolume.bind(this);
    this.onToggleVolume = this.onToggleVolume.bind(this);
    this.onPlayerFullscreen = this.onPlayerFullscreen.bind(this);

    this.onSeekChange = this.onSeekChange.bind(this);
    this.onVolumeChange = this.onVolumeChange.bind(this);
  }

  onSkip() {
    const parent = this.props.parent;

    parent.pushUpdate("skip", {});
  }

  onRestart() {
    const parent = this.props.parent;

    parent.pushUpdate("restart", {});
  }

  onSeek() {
    const parent = this.props.parent;

    parent.seekMoving = false;
    const currentTrack = parent.state.selectedInstanceData.currentTrack;
    if(currentTrack) {
      parent.pushUpdate("seek", { position: parent.state.trackPosition });
    }
  }

  onVolume() {
    const parent = this.props.parent;

    parent.volumeMoving = false;
    parent.pushUpdate("vol", { position: parent.state.volumePosition });
  }

  onToggleVolume() {
    const parent = this.props.parent;

    if(parent.state.selectedInstanceData.isMuted) {
      parent.pushUpdate("unmute", {});
    } else {
      parent.pushUpdate("mute", {});
    }
  }

  onSeekChange(event: React.ChangeEvent<{}>, value: number | number[]) {
    const parent = this.props.parent;

    parent.seekMoving = true;
    const currentTrack = parent.state.selectedInstanceData.currentTrack;
    if(currentTrack) {
      if(typeof value == "number") parent.setState({ trackPosition: value * (currentTrack.duration / 100) })
    }
  }

  onVolumeChange(event: React.ChangeEvent<{}>, value: number | number[]) {
    const parent = this.props.parent;

    parent.volumeMoving = true;
    if(typeof value == "number") parent.setState({ volumePosition: value })
  }

  onPlayerFullscreen(event: React.MouseEvent) {
    const element = document.getElementById("playerContainer");
    if(element) element.requestFullscreen();
  }

  render() {
    const { classes, parent } = this.props;
    const { selectedInstanceData, player, trackPosition, volumePosition } = parent.state;

    const currentTrack = parent.getCurrentTrack();

    return (
      <div>
        {(selectedInstanceData.isPlaying) ?
          <Paper className={classes.mainContainer}>
            <Toolbar className={classes.toolbar}>
              <IconButton onClick={this.onSkip} size="small" color="secondary" aria-label="skip" className={classes.button} disabled={!this.context.loggedIn}>
                {
                  (selectedInstanceData.isPlaying) ?
                    <Tooltip title={"Skip"} placement="top" PopperProps={{ disablePortal: true }}>
                      <SkipNextIcon color="secondary" />
                    </Tooltip>
                  :
                    <></>
                }
              </IconButton>
              <IconButton onClick={this.onRestart} size="small" color="secondary" aria-label="restart" className={classes.button} disabled={!this.context.loggedIn}>
                <Tooltip title={"Restart"} placement="top" PopperProps={{ disablePortal: true }}>
                  <ReplayIcon color="secondary" />
                </Tooltip>
              </IconButton>
              <Slider
                className={classes.seekSlider}
                value={trackPosition / (currentTrack.duration / 100)}
                aria-labelledby="label"
                onChange={this.onSeekChange}
                onChangeCommitted={this.onSeek}
                color="secondary"
                disabled={!this.context.loggedIn}
              />
              <Typography
                variant="subtitle2"
                component="p"
                className={classes.trackPosition}
              >
                {
                  (player &&selectedInstanceData.isPlaying) ?
                  formatTime(trackPosition) + " / " + formatTime(currentTrack.duration)
                  :
                    "00:00"
                }
              </Typography>
              <IconButton onClick={this.onToggleVolume} size="small" color="secondary" aria-label="toggle sound" className={classes.button} disabled={!this.context.loggedIn}>
                {
                  (selectedInstanceData.isMuted) ?
                    <Tooltip title={"Unmute"} placement="top" PopperProps={{ disablePortal: true }}>
                      <VolumeOffIcon color="secondary" />
                    </Tooltip>
                  :
                    <Tooltip title={"Mute"} placement="top" PopperProps={{ disablePortal: true }}>
                      {
                        (volumePosition >= 50) ?
                          <VolumeUpIcon color="secondary" />
                        :
                          (volumePosition === 0) ?
                            <VolumeMuteIcon color="secondary" />
                          :
                            <VolumeDownIcon color="secondary" />
                      }
                    </Tooltip>
                }
              </IconButton>
              <Slider
                className={classes.volumeSlider}
                value={volumePosition}
                aria-labelledby="label"
                onChange={this.onVolumeChange}
                onChangeCommitted={this.onVolume}
                color="secondary"
                disabled={!this.context.loggedIn}
              />
              <Typography
                variant="subtitle2"
                component="p"
                className={classes.volumePosition}
              >
                {
                  volumePosition
                }
              </Typography>
              <IconButton onClick={this.onPlayerFullscreen} size="small" color="secondary" aria-label="skip" className={classes.button}>
                <Tooltip title={"Fullscreen"} placement="top" PopperProps={{ disablePortal: true }}>
                  <FullscreenIcon color="secondary" />
                </Tooltip>
              </IconButton>
            </Toolbar>
          </Paper>
        : <></>}
      </div>
    )
  }
}

function formatTime(ms: number) {
  var mins: string = Math.floor(ms / (1000 * 60)).toString();
  var secs: string = Math.floor((ms % (1000 * 60)) / 1000).toString();
  if(mins.length === 1) mins = "0" + mins;
  if(secs.length === 1) secs = "0" + secs;
  return `${mins}:${secs}`;
}

export default withStyles(styles, { withTheme: true })(ControlsContainer);