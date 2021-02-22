import React, { Component } from "react";
import { Paper, Typography, Theme, withStyles, Fade, Collapse, Box } from "@material-ui/core";
import { GlobalContext, globalContext } from "../../../utils/contexts";
import YouTube from "react-youtube";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "relative" as "relative",
    minHeight: theme.spacing(2.5),
    marginTop: theme.spacing(1),
    padding: theme.spacing(2)
  }, wrapper: {
    position: "relative" as "relative",
    width: "100%",
    height: 0,
    padding: 0,
    paddingBottom: "56.25%"
  }, player: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  }, cover: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  }, message: {
    position: "absolute" as "absolute",
    right: 0,
    left: 0,
    textAlign: "center" as "center"
  }
});

interface Props {
  classes: ClassNameMap;
  theme: Theme;
  parent: any;
}

class PlayerContainer extends Component<Props> {
  static contextType = globalContext;

  private timeouts: number[] = [];

  constructor(props: Readonly<Props>) {
    super(props);

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.playerSyncer = this.playerSyncer.bind(this);
    this.seekUpdater = this.seekUpdater.bind(this);
    this.requestUpdate = this.requestUpdate.bind(this);

    this.timeouts = [];
  }

  onPlayerReady(event: YT.PlayerEvent) {
    console.log("[Player] Player ready!");
    const parent = this.props.parent;
    const player = event.target;

    player.mute();
    parent.socketSetup(player);
    this.seekUpdater();
    parent.setState({ playerVolumePosition: player.getVolume() });
  }

  onStateChange(data: any) {
    if(data.data === 1) this.playerSyncer();
  }

  requestUpdate() {
    const parent = this.props.parent;
    parent.requestUpdate({ global: false, uuid: parent.state.selectedInstance });
  }

  playerSyncer() {
    const { toggleNotification } = this.context as GlobalContext;
    const parent = this.props.parent;
    const ping = new Date().getTime() - parent.lastSent;
    const player = parent.state.player;
    const instanceData = parent.state.instanceData;

    for(const i in this.timeouts) {
      window.clearInterval(this.timeouts[i]);
      this.timeouts.splice(parseInt(i), 1);
    }

    if(player && instanceData.currentTrack && instanceData.isPlaying) {
      const playerTime = (player.getCurrentTime() * 1000);
      const queueTrackTime = instanceData.currentTrack.position + ping;
      let offsetTime = playerTime - queueTrackTime;
      if(isNaN(offsetTime)) return this.requestUpdate();

      if(offsetTime > 50 || offsetTime < -50) {
        console.log(`[Player] Syncing... Player offset: ${offsetTime}`);
        player.mute();
        parent.synced = true
        toggleNotification(true, { type: "info", message: "Attempting to Sync..." });
        parent.synced = false;
        if(offsetTime > 50) parent.globalOffset -= 25;
        if(offsetTime < -50) parent.globalOffset += 25;
        if(offsetTime > 100) parent.globalOffset -= 50;
        if(offsetTime < -100) parent.globalOffset += 50;

        this.requestUpdate();
      } else {
        if(!parent.synced) {
          console.log("[Player] Successfully synced!");
          if(parent.state.playerVolume) player.unMute();
          parent.synced = true;
          this.context.toggleLoader(false);
          toggleNotification(true, { type: "success", message: "Successfully synced" });
        }
      }
    }
  }

  seekUpdater() {
    const parent = this.props.parent;

    parent.intervals.push(window.setInterval(() => {
      const player = parent.state.player;
      const currentTrack = parent.state.instanceData.currentTrack;
      if(player && currentTrack && !parent.seekMoving) {
  
        parent.setState({ trackPosition: parent.state.trackPosition + 500 });
      }
    }, 500));
  }

  render() {
    const { classes, parent } = this.props;
    const { instanceData, player } = parent.state;

    const queue = parent.getQueue();
    const currentTrack = parent.getCurrentTrack();

    const opts = {
      playerVars: {
        rel: 0 as 0,
        showinfo: 0 as 0,
        controls: 0 as 0
      }
    }

    if(queue.length > 0 && player && !parent.synced) {
      player.seekTo((currentTrack.position + parent.globalOffset) / 1000, true);
      player.playVideo();
      
      this.timeouts.push(window.setTimeout(() => {
        console.log("[Player] Sync timeout, jumping...");
        this.playerSyncer();
      }, 5000));
    }

    return (
      <>
        <Paper className={classes.mainContainer} id="playerContainer">
          <Fade in={!instanceData.isPlaying}>
            <Typography
              variant="subtitle2"
              component="p"
              className={classes.message}
            >We don't have anything to display.</Typography>
          </Fade>
          <Collapse in={instanceData.isPlaying}>
            <Box className={classes.wrapper}>
              <YouTube
                videoId={currentTrack.id}
                opts={opts}
                onReady={this.onPlayerReady}
                onStateChange={this.onStateChange}
                className={classes.player}
              />
            </Box>
            <Box className={classes.cover}></Box>
          </Collapse>
        </Paper>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(PlayerContainer);